"""
Sentiment Analysis Module
Analyzes emotional tone, bias, and sentiment in news articles
"""

import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from textblob import TextBlob
import numpy as np
from typing import Dict, List, Any
from collections import Counter
import re

# Download required data
try:
    nltk.data.find('sentiment/vader_lexicon')
except LookupError:
    nltk.download('vader_lexicon')


class SentimentAnalyzer:
    """
    Advanced sentiment analysis for fake news detection
    Uses multiple approaches:
    - VADER (Valence Aware Dictionary and sEntiment Reasoner)
    - TextBlob polarity/subjectivity
    - Emotion detection
    - Bias detection
    """
    
    def __init__(self):
        """Initialize sentiment analyzers"""
        self.vader = SentimentIntensityAnalyzer()
        
        # Emotion keywords
        self.emotion_keywords = {
            'joy': ['happy', 'joy', 'wonderful', 'great', 'excellent', 'fantastic', 'amazing'],
            'sadness': ['sad', 'depressed', 'unhappy', 'miserable', 'heartbroken', 'devastating'],
            'anger': ['angry', 'rage', 'furious', 'outrageous', 'disgusting', 'infuriating'],
            'fear': ['afraid', 'scared', 'terrified', 'fearful', 'anxious', 'dreadful'],
            'surprise': ['surprised', 'shocked', 'astonished', 'amazed', 'astounded'],
            'disgust': ['disgusting', 'repulsive', 'abhorrent', 'revolting', 'nauseating'],
            'neutral': ['normal', 'regular', 'ordinary', 'typical', 'usual']
        }
        
        # Bias indicators
        self.bias_indicators = {
            'left_bias': [
                'progressive', 'liberal', 'woke', 'social justice', 'equality',
                'environmental', 'climate change', 'inclusive', 'diversity'
            ],
            'right_bias': [
                'conservative', 'traditional', 'patriotic', 'sovereignty',
                'nationalist', 'capitalism', 'free market', 'law and order'
            ],
            'religious_bias': [
                'god', 'faith', 'prayer', 'scripture', 'church', 'sin',
                'divine', 'blessed', 'holy', 'godless'
            ]
        }
    
    def analyze(self, text: str) -> Dict[str, Any]:
        """
        Comprehensive sentiment analysis
        
        Args:
            text: Text to analyze
            
        Returns:
            Dictionary containing sentiment analysis results
        """
        return {
            'vader': self._vader_sentiment(text),
            'textblob': self._textblob_sentiment(text),
            'emotions': self._detect_emotions(text),
            'bias': self._detect_bias(text),
            'subjectivity_level': self._assess_subjectivity(text),
            'emotional_intensity': self._calculate_emotional_intensity(text),
            'summary': self._generate_sentiment_summary(text)
        }
    
    def _vader_sentiment(self, text: str) -> Dict[str, float]:
        """
        VADER sentiment analysis
        Best for social media and informal text
        
        Args:
            text: Text to analyze
            
        Returns:
            VADER sentiment scores
        """
        scores = self.vader.polarity_scores(text)
        
        return {
            'compound': float(scores['compound']),  # -1 (most negative) to +1 (most positive)
            'positive': float(scores['pos']),
            'negative': float(scores['neg']),
            'neutral': float(scores['neu']),
            'sentiment': self._classify_vader_sentiment(scores['compound'])
        }
    
    def _classify_vader_sentiment(self, compound: float) -> str:
        """Classify sentiment based on compound score"""
        if compound >= 0.05:
            return 'positive'
        elif compound <= -0.05:
            return 'negative'
        else:
            return 'neutral'
    
    def _textblob_sentiment(self, text: str) -> Dict[str, Any]:
        """
        TextBlob sentiment analysis
        Provides polarity and subjectivity
        
        Args:
            text: Text to analyze
            
        Returns:
            TextBlob sentiment scores
        """
        try:
            blob = TextBlob(text)
            polarity = blob.sentiment.polarity  # -1 to 1
            subjectivity = blob.sentiment.subjectivity  # 0 to 1
            
            return {
                'polarity': float(polarity),
                'subjectivity': float(subjectivity),
                'is_subjective': subjectivity > 0.6,
                'is_objective': subjectivity < 0.4,
                'sentiment': 'positive' if polarity > 0.1 
                           else 'negative' if polarity < -0.1 
                           else 'neutral'
            }
        except Exception as e:
            return {'error': str(e)}
    
    def _detect_emotions(self, text: str) -> Dict[str, Dict]:
        """
        Detect emotions in text
        
        Args:
            text: Text to analyze
            
        Returns:
            Emotion detection results
        """
        text_lower = text.lower()
        emotion_scores = {}
        
        for emotion, keywords in self.emotion_keywords.items():
            count = sum(text_lower.count(keyword) for keyword in keywords)
            emotion_scores[emotion] = {
                'count': count,
                'score': min(count / max(1, len(text.split()) // 10), 1.0)
            }
        
        # Find dominant emotion
        dominant_emotion = max(emotion_scores.items(), 
                              key=lambda x: x[1]['score'])
        
        return {
            'emotions': emotion_scores,
            'dominant_emotion': dominant_emotion[0],
            'dominant_emotion_score': float(dominant_emotion[1]['score']),
            'emotion_count': sum(e['count'] for e in emotion_scores.values())
        }
    
    def _detect_bias(self, text: str) -> Dict[str, Any]:
        """
        Detect political and religious bias
        
        Args:
            text: Text to analyze
            
        Returns:
            Bias detection results
        """
        text_lower = text.lower()
        bias_scores = {}
        
        for bias_type, keywords in self.bias_indicators.items():
            count = sum(text_lower.count(keyword.lower()) for keyword in keywords)
            bias_scores[bias_type] = {
                'count': count,
                'score': min(count / max(1, len(text.split()) // 10), 1.0)
            }
        
        # Determine if text is biased
        total_bias = sum(b['score'] for b in bias_scores.values())
        is_biased = total_bias > 0.3
        
        return {
            'bias_scores': bias_scores,
            'is_biased': is_biased,
            'total_bias_score': float(total_bias),
            'bias_types': [k for k, v in bias_scores.items() if v['count'] > 0]
        }
    
    def _assess_subjectivity(self, text: str) -> Dict[str, Any]:
        """
        Assess level of subjectivity
        
        Args:
            text: Text to analyze
            
        Returns:
            Subjectivity assessment
        """
        # Opinion indicators
        opinion_words = [
            'i think', 'in my opinion', 'i believe', 'i feel',
            'it seems', 'apparently', 'allegedly', 'supposedly',
            'opinion', 'view', 'claim'
        ]
        
        # Objective indicators
        objective_words = [
            'research shows', 'study reveals', 'data indicates',
            'evidence suggests', 'statistics show', 'according to',
            'confirmed', 'verified', 'proven'
        ]
        
        text_lower = text.lower()
        opinion_count = sum(text_lower.count(word) for word in opinion_words)
        objective_count = sum(text_lower.count(word) for word in objective_words)
        
        word_count = len(text.split())
        
        return {
            'opinion_indicators': opinion_count,
            'objective_indicators': objective_count,
            'opinion_ratio': opinion_count / max(1, word_count),
            'objective_ratio': objective_count / max(1, word_count),
            'level': 'highly_subjective' if opinion_count > objective_count * 2
                    else 'balanced' if abs(opinion_count - objective_count) < 5
                    else 'objective'
        }
    
    def _calculate_emotional_intensity(self, text: str) -> Dict[str, Any]:
        """
        Calculate overall emotional intensity
        
        Args:
            text: Text to analyze
            
        Returns:
            Emotional intensity metrics
        """
        # Intensity markers
        emphatic_words = [
            'very', 'extremely', 'absolutely', 'definitely',
            'surely', 'certainly', 'totally', 'completely'
        ]
        
        # Exclamation marks and all caps
        exclamations = text.count('!')
        caps_words = len([w for w in text.split() if w.isupper() and len(w) > 1])
        emphatic_count = sum(1 for word in text.lower().split() 
                           if word in emphatic_words)
        
        # Calculate intensity score
        word_count = max(1, len(text.split()))
        intensity = min(
            (exclamations + caps_words + emphatic_count) / word_count * 10,
            1.0
        )
        
        return {
            'intensity_score': float(intensity),
            'intensity_level': 'high' if intensity > 0.6
                              else 'moderate' if intensity > 0.3
                              else 'low',
            'exclamation_marks': exclamations,
            'all_caps_words': caps_words,
            'emphatic_words': emphatic_count
        }
    
    def _generate_sentiment_summary(self, text: str) -> str:
        """
        Generate a summary of sentiment analysis
        
        Args:
            text: Text to analyze
            
        Returns:
            Summary string
        """
        vader = self._vader_sentiment(text)
        emotions = self._detect_emotions(text)
        bias = self._detect_bias(text)
        subjectivity = self._assess_subjectivity(text)
        
        summary_parts = []
        
        # Sentiment summary
        if vader['sentiment'] == 'positive':
            summary_parts.append("Positive tone with optimistic language")
        elif vader['sentiment'] == 'negative':
            summary_parts.append("Negative tone with critical/harsh language")
        else:
            summary_parts.append("Neutral tone")
        
        # Emotion summary
        if emotions['dominant_emotion_score'] > 0.5:
            summary_parts.append(f"Strong {emotions['dominant_emotion']} emotion")
        
        # Bias summary
        if bias['is_biased']:
            summary_parts.append(f"Contains {', '.join(bias['bias_types'])} indicators")
        
        # Subjectivity summary
        summary_parts.append(f"Text is {subjectivity['level']}")
        
        return " | ".join(summary_parts)
