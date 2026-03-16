"""
Sentiment Analysis Module
"""

from typing import Dict, Any
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from textblob import TextBlob
import re


class SentimentAnalyzer:
    """Analyze sentiment and emotional content of text"""
    
    def __init__(self):
        """Initialize sentiment analyzer"""
        self.vader_analyzer = SentimentIntensityAnalyzer()
    
    def analyze(self, text: str) -> Dict[str, Any]:
        """
        Comprehensive sentiment analysis
        
        Args:
            text: Text to analyze
            
        Returns:
            Dictionary with sentiment metrics
        """
        # VADER Sentiment Analysis
        vader_scores = self.vader_analyzer.polarity_scores(text)
        
        # TextBlob Sentiment
        blob = TextBlob(text)
        polarity = blob.sentiment.polarity
        subjectivity = blob.sentiment.subjectivity
        
        # Emotional intensity
        emotional_words = self._detect_emotional_words(text)
        
        # Fake news indicators
        fake_indicators = self._detect_fake_indicators(text)
        
        return {
            'status': 'success',
            'sentiment': {
                'compound': float(vader_scores['compound']),
                'positive': float(vader_scores['pos']),
                'negative': float(vader_scores['neg']),
                'neutral': float(vader_scores['neu']),
                'label': self._get_sentiment_label(vader_scores['compound'])
            },
            'polarity': float(polarity),
            'subjectivity': float(subjectivity),
            'emotional_words': emotional_words,
            'emotional_intensity': self._calculate_emotional_intensity(text),
            'fake_news_indicators': fake_indicators,
            'is_emotionally_charged': abs(vader_scores['compound']) > 0.5,
            'is_highly_subjective': subjectivity > 0.7
        }
    
    def _get_sentiment_label(self, compound: float) -> str:
        """Convert compound score to label"""
        if compound >= 0.05:
            return 'positive'
        elif compound <= -0.05:
            return 'negative'
        else:
            return 'neutral'
    
    def _detect_emotional_words(self, text: str) -> Dict[str, int]:
        """Detect emotional words in text"""
        keywords = {
            'positive': ['amazing', 'wonderful', 'excellent', 'great', 'love', 'beautiful'],
            'negative': ['horrible', 'terrible', 'awful', 'hate', 'disgusting', 'bad'],
            'fear': ['fear', 'scared', 'terror', 'danger', 'threat', 'anxious'],
            'anger': ['angry', 'furious', 'rage', 'outrage', 'infuriated'],
            'surprise': ['shocked', 'stunned', 'amazed', 'astonished', 'wow']
        }
        
        text_lower = text.lower()
        results = {}
        
        for emotion, words in keywords.items():
            count = sum(text_lower.count(word) for word in words)
            results[emotion] = count
        
        return results
    
    def _calculate_emotional_intensity(self, text: str) -> float:
        """Calculate overall emotional intensity (0-1)"""
        # Factors: caps, exclamation marks, repetition
        intensity = 0.0
        
        # Uppercase ratio
        caps_ratio = sum(1 for c in text if c.isupper()) / len(text) if text else 0
        intensity += min(caps_ratio * 10, 0.3)
        
        # Exclamation marks
        exclaim_ratio = text.count('!') / len(text.split()) if text else 0
        intensity += min(exclaim_ratio * 10, 0.3)
        
        # Repetition
        repeated_chars = len(re.findall(r'([a-z])\1{2,}', text.lower()))
        intensity += min(repeated_chars / 10, 0.4)
        
        return min(intensity, 1.0)
    
    def _detect_fake_indicators(self, text: str) -> Dict[str, bool]:
        """Detect indicators of fake news"""
        indicators = {
            'all_caps_text': sum(1 for c in text if c.isupper()) / len(text) > 0.2 if text else False,
            'excessive_punctuation': text.count('!') + text.count('?') > len(text.split()) * 0.1,
            'vague_language': self._has_vague_language(text),
            'emotional_manipulation': self._has_emotional_content(text),
            'sensationalism': self._is_sensational(text)
        }
        return indicators
    
    def _has_vague_language(self, text: str) -> bool:
        """Check for vague language"""
        vague_words = ['some', 'many', 'most', 'allegedly', 'reportedly', 'supposedly']
        return sum(text.lower().count(word) for word in vague_words) > 3
    
    def _has_emotional_content(self, text: str) -> bool:
        """Check for emotional content"""
        emotional_words = ['feel', 'emotion', 'fear', 'hate', 'love', 'angry', 'sad']
        return sum(text.lower().count(word) for word in emotional_words) > 2
    
    def _is_sensational(self, text: str) -> bool:
        """Check for sensationalism"""
        sensational = ['breaking', 'exclusive', 'shocking', 'unbelievable', 'exposed']
        return any(word in text.lower() for word in sensational)
