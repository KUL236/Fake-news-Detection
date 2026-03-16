"""
Fake News Detector - Main Detection Engine
Combines multiple ML models and NLP techniques
"""

import numpy as np
import pickle
import json
import re
from typing import Dict, List, Tuple, Any
from pathlib import Path
import warnings

warnings.filterwarnings('ignore')

# ML imports
from sklearn.feature_extraction.text import TfidfVectorizer
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import sent_tokenize, word_tokenize
import spacy

# Transformers
try:
    from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
    import torch
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')
    
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')


class FakeNewsDetector:
    """
    Main class for detecting fake news using multiple ML approaches
    Combines Logistic Regression, Naive Bayes, and BERT models
    """
    
    def __init__(self, model_type='ensemble'):
        """
        Initialize the detector
        
        Args:
            model_type: 'lr' (Logistic Regression), 'nb' (Naive Bayes), 
                       'bert' (Transformer), or 'ensemble' (all combined)
        """
        self.model_type = model_type
        self.models = {}
        self.vectorizer = None
        self.suspicious_words = self._load_suspicious_words()
        self.propaganda_keywords = self._load_propaganda_keywords()
        
        # Load spaCy model
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            print("SpaCy model not found. Some features may be limited.")
            self.nlp = None
        
        # Initialize transformer model if available
        if TRANSFORMERS_AVAILABLE and model_type in ['bert', 'ensemble']:
            try:
                self.bert_classifier = pipeline(
                    "text-classification",
                    model="bert-base-uncased",
                    device=0 if torch.cuda.is_available() else -1
                )
            except Exception as e:
                print(f"BERT model initialization failed: {e}")
                self.bert_classifier = None
        else:
            self.bert_classifier = None
            
    def _load_suspicious_words(self) -> Dict[str, int]:
        """Load dictionary of suspicious/misleading words with severity scores"""
        return {
            'claim': 1, 'allegedly': 2, 'reportedly': 2, 'unverified': 3,
            'exclusive': 2, 'breaking': 1, 'shocking': 2, 'scandal': 2,
            'exposed': 2, 'controversial': 1, 'conspiracy': 3, 'hoax': 3,
            'fake': 3, 'fraud': 3, 'murder': 2, 'dead': 1, 'killed': 1,
            'attack': 1, 'bomb': 3, 'terrorist': 3, 'extremist': 2,
            'immigration': 1, 'refugee': 1, 'illegal': 1, 'border': 1,
            'disease': 1, 'virus': 1, 'spread': 1, 'outbreak': 1,
            'alleged': 2, 'unconfirmed': 3, 'unsubstantiated': 3
        }
    
    def _load_propaganda_keywords(self) -> Dict[str, int]:
        """Load propaganda detection keywords"""
        return {
            # Emotional manipulation
            'feel': 1, 'emotion': 1, 'fear': 2, 'hate': 2, 'anger': 2,
            'love': 1, 'trust': 1, 'believe': 1,
            
            # Vagueness
            'some': 1, 'many': 1, 'most': 1, 'several': 1, 'numerous': 1,
            'allegedly': 2, 'reportedly': 2, 'supposedly': 2,
            
            # Authority appeal
            'expert': 1, 'study': 1, 'research': 1, 'scientist': 1,
            'doctor': 1, 'official': 1, 'government': 1,
            
            # Flag waving
            'patriot': 1, 'nation': 1, 'freedom': 1, 'heritage': 1,
            
            # Ad hominem
            'idiot': 3, 'fool': 2, 'stupid': 3, 'liar': 3,
            'corrupt': 2, 'criminal': 2, 'enemy': 2
        }
    
    def analyze(self, text: str, url: str = None, headline: str = None) -> Dict[str, Any]:
        """
        Comprehensive analysis of news article
        
        Args:
            text: Main article text
            url: Optional URL for source verification
            headline: Optional headline
            
        Returns:
            Dictionary with detection results, scores, and explanations
        """
        if not text or len(text.strip()) < 10:
            return self._invalid_input_response("Text too short for analysis")
        
        # Clean and prepare text
        cleaned_text = self._clean_text(text)
        combined_text = f"{headline or ''} {cleaned_text}"
        
        # Extract features
        features = self._extract_features(cleaned_text, headline)
        
        # Get predictions from available models
        predictions = {}
        
        if self.model_type in ['lr', 'ensemble']:
            predictions['logistic_regression'] = self._predict_lr(combined_text)
        
        if self.model_type in ['nb', 'ensemble']:
            predictions['naive_bayes'] = self._predict_nb(combined_text)
        
        if TRANSFORMERS_AVAILABLE and self.bert_classifier and self.model_type in ['bert', 'ensemble']:
            predictions['bert'] = self._predict_bert(combined_text)
        
        # Calculate final score
        final_score, explanation = self._calculate_final_score(
            predictions, features, text
        )
        
        # Get suspicious phrases
        suspicious_phrases = self._extract_suspicious_phrases(text)
        
        # Sentiment analysis
        sentiment_analysis = self._analyze_sentiment(text)
        
        # Propaganda detection
        propaganda_score = self._detect_propaganda(text)
        
        return {
            'status': 'success',
            'fake_confidence': float(final_score),
            'is_fake': final_score > 0.5,
            'classification': 'FAKE' if final_score > 0.5 else 'REAL',
            'probability': {
                'fake': float(final_score),
                'real': float(1 - final_score)
            },
            'confidence_level': self._get_confidence_level(final_score),
            'predictions': {k: float(v) if isinstance(v, (int, float)) else v 
                           for k, v in predictions.items()},
            'explanation': explanation,
            'suspicious_phrases': suspicious_phrases,
            'sentiment_analysis': sentiment_analysis,
            'propaganda_score': float(propaganda_score),
            'linguistic_features': features,
            'recommendations': self._get_recommendations(final_score, suspicious_phrases),
            'url_analysis': self._analyze_url(url) if url else None
        }
    
    def _clean_text(self, text: str) -> str:
        """Clean and preprocess text"""
        # Remove URLs
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        # Convert to lowercase
        text = text.lower()
        return text
    
    def _extract_features(self, text: str, headline: str = None) -> Dict[str, Any]:
        """Extract linguistic and statistical features"""
        features = {
            'text_length': len(text),
            'word_count': len(text.split()),
            'sentence_count': len(sent_tokenize(text)),
            'avg_word_length': np.mean([len(w) for w in text.split()]),
            'caps_ratio': sum(1 for c in text if c.isupper()) / len(text) if text else 0,
            'exclamation_ratio': text.count('!') / len(text.split()) if text else 0,
            'question_ratio': text.count('?') / len(text.split()) if text else 0,
            'has_headline': headline is not None,
            'suspicious_word_count': sum(1 for word in text.split() 
                                        if word in self.suspicious_words),
            'propaganda_score': self._detect_propaganda(text),
        }
        return features
    
    def _predict_lr(self, text: str) -> float:
        """Logistic Regression prediction"""
        # Placeholder - would use trained model
        # This is simplified; in production, load actual trained model
        return 0.5 + 0.1 * np.random.randn()
    
    def _predict_nb(self, text: str) -> float:
        """Naive Bayes prediction"""
        # Placeholder - would use trained model
        return 0.5 + 0.1 * np.random.randn()
    
    def _predict_bert(self, text: str) -> float:
        """BERT transformer prediction"""
        if not self.bert_classifier:
            return 0.5
        
        try:
            # Truncate text for BERT (max 512 tokens)
            text = text[:500]
            result = self.bert_classifier(text)
            
            # Assuming model output is [{'label': 'FAKE'/'REAL', 'score': 0.9}]
            if result[0]['label'].upper() == 'FAKE':
                return result[0]['score']
            else:
                return 1 - result[0]['score']
        except Exception as e:
            print(f"BERT prediction error: {e}")
            return 0.5
    
    def _calculate_final_score(self, predictions: Dict, features: Dict, 
                              text: str) -> Tuple[float, str]:
        """Calculate final fake news score with ensemble approach"""
        scores = []
        weights = []
        
        # Weight individual model predictions
        if 'logistic_regression' in predictions:
            scores.append(predictions['logistic_regression'])
            weights.append(0.35)
        
        if 'naive_bayes' in predictions:
            scores.append(predictions['naive_bayes'])
            weights.append(0.35)
        
        if 'bert' in predictions:
            scores.append(predictions['bert'])
            weights.append(0.3)
        
        # Add feature-based scoring
        suspicious_weight = min(features['suspicious_word_count'] / 5, 1.0)
        propaganda_weight = features['propaganda_score']
        
        # Calculate weighted average
        if scores:
            model_score = np.average(scores, weights=weights[:len(scores)])
        else:
            model_score = 0.5
        
        # Combine with feature-based score
        final_score = (model_score * 0.7 + 
                      suspicious_weight * 0.15 + 
                      propaganda_weight * 0.15)
        
        # Generate explanation
        explanation = self._generate_explanation(final_score, features, predictions)
        
        return final_score, explanation
    
    def _generate_explanation(self, score: float, features: Dict, 
                             predictions: Dict) -> str:
        """Generate human-readable explanation"""
        explanation_parts = []
        
        if score > 0.7:
            explanation_parts.append(
                f"High likelihood of fake news (Score: {score:.2%}). "
            )
        elif score > 0.5:
            explanation_parts.append(
                f"Moderate likelihood of fake news (Score: {score:.2%}). "
            )
        else:
            explanation_parts.append(
                f"Low likelihood of fake news (Score: {score:.2%}). "
            )
        
        # Feature-based explanation
        if features['suspicious_word_count'] > 5:
            explanation_parts.append(
                f"Found {features['suspicious_word_count']} suspicious words. "
            )
        
        if features['propaganda_score'] > 0.6:
            explanation_parts.append(
                "Content shows signs of propaganda techniques. "
            )
        
        if features['caps_ratio'] > 0.15:
            explanation_parts.append(
                "Excessive use of capital letters detected. "
            )
        
        if features['exclamation_ratio'] > 0.1:
            explanation_parts.append(
                "High use of exclamation marks suggests emotional manipulation. "
            )
        
        explanation_parts.append(
            "Always cross-reference with trusted news sources for verification."
        )
        
        return "".join(explanation_parts)
    
    def _extract_suspicious_phrases(self, text: str, top_n: int = 5) -> List[Dict]:
        """Extract and rank suspicious phrases"""
        text_lower = text.lower()
        phrases = nltk.ngrams(text_lower.split(), 3)  # 3-gram phrases
        
        suspicious_phrase_scores = []
        
        for phrase in phrases:
            score = sum(self.suspicious_words.get(word, 0) for word in phrase)
            if score > 0:
                suspicious_phrase_scores.append({
                    'phrase': ' '.join(phrase),
                    'severity': score,
                    'severity_level': 'high' if score >= 3 else 'medium' if score >= 2 else 'low'
                })
        
        # Sort by severity and return top N
        suspicious_phrase_scores.sort(key=lambda x: x['severity'], reverse=True)
        return suspicious_phrase_scores[:top_n]
    
    def _analyze_sentiment(self, text: str) -> Dict:
        """Analyze sentiment using VADER and TextBlob"""
        try:
            from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
            analyzer = SentimentIntensityAnalyzer()
            vader_scores = analyzer.polarity_scores(text)
            
            return {
                'sentiment': 'positive' if vader_scores['compound'] > 0.1 
                            else 'negative' if vader_scores['compound'] < -0.1 
                            else 'neutral',
                'compound_score': float(vader_scores['compound']),
                'positive': float(vader_scores['pos']),
                'negative': float(vader_scores['neg']),
                'neutral': float(vader_scores['neu']),
                'is_emotionally_charged': abs(vader_scores['compound']) > 0.5
            }
        except ImportError:
            return {'status': 'vader_not_available'}
    
    def _detect_propaganda(self, text: str) -> float:
        """Detect propaganda techniques in text"""
        text_lower = text.lower()
        words = text_lower.split()
        
        propaganda_count = sum(
            self.propaganda_keywords.get(word, 0) for word in words
        )
        
        # Normalize score
        max_possible = sum(self.propaganda_keywords.values()) * len(words) / len(self.propaganda_keywords)
        propaganda_score = min(propaganda_count / max(max_possible, 1), 1.0)
        
        return propaganda_score
    
    def _get_confidence_level(self, score: float) -> str:
        """Convert score to confidence level"""
        if score >= 0.85:
            return 'Very High'
        elif score >= 0.70:
            return 'High'
        elif score >= 0.50:
            return 'Moderate'
        elif score >= 0.30:
            return 'Low'
        else:
            return 'Very Low'
    
    def _get_recommendations(self, score: float, suspicious_phrases: List) -> List[str]:
        """Get recommendations based on analysis"""
        recommendations = []
        
        if score > 0.7:
            recommendations.append("❌ DO NOT SHARE - High fake news probability")
            recommendations.append("🔍 Verify with multiple trusted news sources")
            recommendations.append("📢 Report to social media platform")
        elif score > 0.5:
            recommendations.append("⚠️ SUSPICIOUS - Verify before sharing")
            recommendations.append("🔗 Check original source and author credibility")
            recommendations.append("📰 Compare with established news outlets")
        else:
            recommendations.append("✅ Likely authentic - Standard verification recommended")
            recommendations.append("🔗 Always check source credibility")
        
        if suspicious_phrases:
            recommendations.append(f"⚡ {len(suspicious_phrases)} suspicious phrases detected")
            recommendations.append("🎯 Fact-check the claims made")
        
        return recommendations
    
    def _analyze_url(self, url: str) -> Dict:
        """Analyze URL credibility"""
        from urllib.parse import urlparse
        
        parsed_url = urlparse(url)
        domain = parsed_url.netloc.replace('www.', '')
        
        # List of known trustworthy domains
        trusted_domains = [
            'bbc.com', 'reuters.com', 'apnews.com', 'theguardian.com',
            'nytimes.com', 'cnn.com', 'bloomberg.com', 'ft.com',
            'wsj.com', 'washingtonpost.com'
        ]
        
        is_trusted = any(domain.endswith(td) for td in trusted_domains)
        
        return {
            'domain': domain,
            'is_trusted_domain': is_trusted,
            'has_https': parsed_url.scheme == 'https',
            'url_type': 'shortened' if len(url) < 30 else 'normal'
        }
    
    def _invalid_input_response(self, reason: str) -> Dict:
        """Return error response for invalid input"""
        return {
            'status': 'error',
            'message': reason,
            'fake_confidence': None,
            'is_fake': None
        }
    
    def batch_analyze(self, texts: List[str]) -> List[Dict]:
        """Analyze multiple texts at once"""
        return [self.analyze(text) for text in texts]
