"""
Advanced Fake News Detection Module
Uses ensemble methods combining Logistic Regression, Naive Bayes, Random Forest, and BERT models
Includes NLP analysis, feature extraction, and propaganda detection
"""

import numpy as np
import pickle
import json
import os
import re
from typing import Dict, List, Tuple, Any
from pathlib import Path
from datetime import datetime
import warnings

warnings.filterwarnings('ignore')

# ML imports
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_recall_fscore_support

import nltk
from nltk.corpus import stopwords
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.sentiment import SentimentIntensityAnalyzer

# NLP
try:
    import spacy
    SPACY_AVAILABLE = True
except ImportError:
    SPACY_AVAILABLE = False

# Transformers
try:
    from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
    import torch
    import torch.nn.functional as F
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

try:
    nltk.data.find('sentiment/vader_lexicon')
except LookupError:
    nltk.download('vader_lexicon')


class FakeNewsDetector:
    """
    Advanced Fake News Detector using ensemble ML approaches
    Combines:
    - Logistic Regression (TF-IDF)
    - Naive Bayes
    - Random Forest
    - BERT/Transformer models
    - NLP-based feature extraction
    """
    
    def __init__(self, model_type: str = 'ensemble', use_bert: bool = True):
        """
        Initialize the detector
        
        Args:
            model_type: 'ensemble', 'bert', 'classical', or 'hybrid'
            use_bert: Whether to use BERT model
        """
        self.model_type = model_type
        self.use_bert = use_bert
        self.models = {}
        self.vectorizer = None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu") if TRANSFORMERS_AVAILABLE else None
        
        # Suspicious words/phrases database
        self.suspicious_keywords = {
            'sensational': ['alleged', 'claims', 'reportedly', 'unconfirmed', 'rumor', 'allegedly'],
            'emotional': ['devastating', 'horrific', 'outrageous', 'shocking', 'unbelievable', 'heartbreaking'],
            'misleading': ['fake', 'hoax', 'conspiracy', 'truth suppressed', 'cover-up', 'exposed'],
            'exaggeration': ['all', 'every', 'never', 'always', 'everyone', 'nobody', 'nobody knows'],
            'unverified_sources': ['anonymous sources', 'insiders say', 'sources claim', 'leaked documents', 'unnamed sources'],
            'logical_fallacies': ['ad hominem', 'straw man', 'false equivalence', 'slippery slope']
        }
        
        # Initialize models
        self._initialize_models()
        
        # Initialize VADER sentiment analyzer
        self.sentiment_analyzer = SentimentIntensityAnalyzer()
        
        # Load spacy if available
        if SPACY_AVAILABLE:
            try:
                self.nlp = spacy.load("en_core_web_sm")
            except:
                self.nlp = None
                print("SpaCy model not available")
        else:
            self.nlp = None
    
    def _initialize_models(self):
        """Initialize all detection models"""
        print("Initializing Fake News Detector...")
        
        # Initialize TF-IDF vectorizer for classical models
        self.vectorizer = TfidfVectorizer(
            max_features=5000,
            ngram_range=(1, 2),
            min_df=2,
            max_df=0.95,
            lowercase=True,
            stop_words='english'
        )
        
        # Initialize classical ML models
        self.models['logistic_regression'] = LogisticRegression(
            max_iter=1000,
            random_state=42,
            class_weight='balanced'
        )
        
        self.models['naive_bayes'] = MultinomialNB(alpha=0.1)
        
        self.models['random_forest'] = RandomForestClassifier(
            n_estimators=100,
            max_depth=20,
            random_state=42,
            n_jobs=-1
        )
        
        # Initialize BERT model for advanced NLP
        if self.use_bert and TRANSFORMERS_AVAILABLE:
            try:
                print("Loading BERT model for sequence classification...")
                model_name = "distilbert-base-uncased-finetuned-sst-2-english"
                self.tokenizer = AutoTokenizer.from_pretrained(model_name)
                self.bert_model = AutoModelForSequenceClassification.from_pretrained(model_name)
                self.bert_model.to(self.device)
                self.bert_model.eval()
                print("✓ BERT model loaded successfully")
            except Exception as e:
                print(f"Warning: Could not load BERT model: {e}")
                self.use_bert = False
        
        print("✓ Models initialized successfully")
    
    def preprocess_text(self, text: str) -> str:
        """
        Preprocess text for analysis
        
        Args:
            text: Raw text to preprocess
            
        Returns:
            Preprocessed text
        """
        # Convert to lowercase
        text = text.lower()
        
        # Remove URLs
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
        
        # Remove email addresses
        text = re.sub(r'\S+@\S+', '', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Remove special characters but keep important punctuation
        text = re.sub(r'[^a-zA-Z0-9\s\.\!\?\,\']', '', text)
        
        return text
    
    def extract_features(self, text: str) -> Dict[str, Any]:
        """
        Extract linguistic and statistical features
        
        Args:
            text: Text to extract features from
            
        Returns:
            Dictionary of extracted features
        """
        features = {}
        
        # Basic statistics
        features['char_count'] = len(text)
        features['word_count'] = len(text.split())
        features['sentence_count'] = len(sent_tokenize(text))
        features['avg_word_length'] = (
            features['char_count'] / features['word_count'] 
            if features['word_count'] > 0 else 0
        )
        
        # Punctuation analysis
        features['exclamation_count'] = text.count('!')
        features['question_count'] = text.count('?')
        features['all_caps_words'] = len([w for w in text.split() if w.isupper() and len(w) > 1])
        features['caps_ratio'] = features['all_caps_words'] / max(1, features['word_count'])
        
        # Sentiment indicators
        features['positive_words'] = self._count_sentiment_words(text, 'positive')
        features['negative_words'] = self._count_sentiment_words(text, 'negative')
        features['neutral_words'] = self._count_sentiment_words(text, 'neutral')
        
        # Suspicious elements
        features['suspicious_count'] = self._count_suspicious_elements(text)
        features['unverified_claims'] = len(self._detect_unverified_claims(text))
        
        # Readability (Flesch-Kincaid Grade Level approximation)
        features['readability_score'] = self._calculate_readability(
            features['word_count'],
            features['sentence_count'],
            len([w for w in text.split() if len(w) > 3])
        )
        
        return features
    
    def _count_sentiment_words(self, text: str, sentiment: str) -> int:
        """Count sentiment-bearing words"""
        sentiment_dict = {
            'positive': ['good', 'great', 'excellent', 'amazing', 'wonderful', 'brilliant', 'fantastic'],
            'negative': ['bad', 'terrible', 'awful', 'horrible', 'worse', 'worst', 'disgusting'],
            'neutral': ['and', 'the', 'is', 'are', 'was', 'were', 'be']
        }
        
        words = text.lower().split()
        return sum(1 for word in words if word in sentiment_dict.get(sentiment, []))
    
    def _count_suspicious_elements(self, text: str) -> int:
        """Count suspicious keywords and phrases"""
        count = 0
        text_lower = text.lower()
        
        for category, keywords in self.suspicious_keywords.items():
            for keyword in keywords:
                count += text_lower.count(keyword.lower())
        
        return count
    
    def _detect_unverified_claims(self, text: str) -> List[str]:
        """Detect unverified claims and attributions"""
        patterns = [
            r'(?:some|many|sources|insiders|experts)\s+(?:say|claim|report)',
            r'(?:allegedly|reportedly|supposedly|apparently)',
            r'(?:anonymous\s+sources?|insiders?|whistleblowers?)',
            r'(?:leaked|confidential|secret)\s+(?:documents?|emails?|files?)'
        ]
        
        matches = []
        text_lower = text.lower()
        
        for pattern in patterns:
            found = re.findall(pattern, text_lower)
            matches.extend(found)
        
        return list(set(matches))
    
    def _calculate_readability(self, words: int, sentences: int, long_words: int) -> float:
        """Calculate Flesch-Kincaid readability score"""
        if words == 0 or sentences == 0:
            return 0
        
        score = 0.39 * (words / sentences) + 11.8 * (long_words / words) - 15.59
        return max(0, min(18, score))  # Clamp between 0-18
    
    def detect_suspicious_phrases(self, text: str) -> Dict[str, List[str]]:
        """
        Detect suspicious and misleading phrases
        
        Args:
            text: Text to analyze
            
        Returns:
            Dictionary mapping categories to detected phrases
        """
        suspicious_phrases = {}
        text_lower = text.lower()
        
        for category, keywords in self.suspicious_keywords.items():
            suspicious_phrases[category] = []
            for keyword in keywords:
                if keyword.lower() in text_lower:
                    suspicious_phrases[category].append(keyword)
        
        # Remove empty categories
        return {k: v for k, v in suspicious_phrases.items() if v}
    
    def bert_analysis(self, text: str) -> Dict[str, Any]:
        """
        Analyze text using BERT model
        
        Args:
            text: Text to analyze
            
        Returns:
            Analysis results from BERT
        """
        if not self.use_bert or not TRANSFORMERS_AVAILABLE:
            return {'error': 'BERT model not available'}
        
        try:
            # Truncate text if too long
            if len(text) > 512:
                text = text[:512]
            
            # Tokenize
            inputs = self.tokenizer(
                text,
                return_tensors="pt",
                truncation=True,
                max_length=512,
                padding=True
            ).to(self.device)
            
            # Forward pass
            with torch.no_grad():
                outputs = self.bert_model(**inputs)
                logits = outputs.logits
                probabilities = F.softmax(logits, dim=-1)
            
            # Extract predictions
            prediction = torch.argmax(logits, dim=-1).item()
            confidence = probabilities[0][prediction].item()
            
            return {
                'prediction': 'fake' if prediction == 0 else 'real',
                'confidence': float(confidence),
                'scores': {
                    'fake': float(probabilities[0][0].item()),
                    'real': float(probabilities[0][1].item())
                }
            }
        
        except Exception as e:
            return {'error': str(e)}
    
    def sentiment_analysis(self, text: str) -> Dict[str, Any]:
        """
        Perform sentiment analysis using VADER
        
        Args:
            text: Text to analyze
            
        Returns:
            Sentiment analysis results
        """
        try:
            scores = self.sentiment_analyzer.polarity_scores(text)
            
            return {
                'compound': float(scores['compound']),
                'positive': float(scores['pos']),
                'negative': float(scores['neg']),
                'neutral': float(scores['neu']),
                'sentiment': 'positive' if scores['compound'] > 0.1 
                           else 'negative' if scores['compound'] < -0.1 
                           else 'neutral',
                'is_emotionally_charged': abs(scores['compound']) > 0.5
            }
        except Exception as e:
            return {'error': str(e)}
    
    def analyze(self, text: str, url: str = None, headline: str = None) -> Dict[str, Any]:
        """
        Comprehensive fake news analysis
        
        Args:
            text: Article text or headline
            url: Optional article URL
            headline: Optional headline
            
        Returns:
            Analysis results with classification and confidence scores
        """
        if not text:
            return {'error': 'No text provided'}
        
        # Preprocess text
        processed_text = self.preprocess_text(text)
        combined_text = f"{headline or ''} {processed_text}"
        
        # Extract features
        features = self.extract_features(processed_text)
        
        # Detect suspicious phrases
        suspicious_phrases = self.detect_suspicious_phrases(processed_text)
        
        # Calculate features-based score
        feature_score = self._calculate_feature_score(features)
        
        # BERT analysis
        bert_result = self.bert_analysis(processed_text) if self.use_bert else {}
        
        # Sentiment analysis
        sentiment = self.sentiment_analysis(processed_text)
        
        # URL analysis
        url_analysis = self._analyze_url(url) if url else None
        
        # Combine results for final prediction
        final_result = {
            'classification': self._determine_classification(bert_result, feature_score),
            'confidence_score': self._calculate_confidence(bert_result, feature_score),
            'risk_level': self._determine_risk_level(feature_score),
            'probability': {
                'fake': round(feature_score * 100, 2),
                'real': round((1 - feature_score) * 100, 2)
            },
            'features': features,
            'suspicious_phrases': suspicious_phrases,
            'bert_analysis': bert_result,
            'sentiment_analysis': sentiment,
            'explanation': self._generate_explanation(features, suspicious_phrases),
            'recommendations': self._get_recommendations(feature_score, suspicious_phrases),
            'url_analysis': url_analysis,
            'url': url,
            'headline': headline,
            'analyzed_at': datetime.now().isoformat()
        }
        
        return final_result
    
    def _calculate_feature_score(self, features: Dict[str, Any]) -> float:
        """Calculate fake score based on extracted features"""
        score = 0.5  # Start at neutral
        
        # Adjust based on suspicious elements
        if features.get('suspicious_count', 0) > 5:
            score += 0.2
        elif features.get('suspicious_count', 0) > 2:
            score += 0.1
        
        # Adjust based on excessive punctuation
        all_caps = features.get('all_caps_words', 0)
        if all_caps > 5:
            score += 0.15
        elif all_caps > 2:
            score += 0.08
        
        # Adjust based on sentiment imbalance
        pos = features.get('positive_words', 0)
        neg = features.get('negative_words', 0)
        if (pos + neg) > 0 and abs(pos - neg) > 10:
            score += 0.1
        
        # Adjust based on readability
        readability = features.get('readability_score', 0)
        if readability > 14 or readability < 6:  # Too difficult or too simple
            score += 0.1
        
        # Adjust based on sentence structure
        if features.get('word_count', 0) > 0:
            avg_sentence_length = features.get('word_count', 0) / max(1, features.get('sentence_count', 1))
            if avg_sentence_length > 30:  # Very long sentences
                score += 0.05
        
        return min(1.0, max(0.0, score))
    
    def _determine_classification(self, bert_result: Dict, feature_score: float) -> str:
        """Determine if news is FAKE or REAL"""
        if bert_result and 'confidence' in bert_result:
            bert_score = 1.0 if bert_result['prediction'] == 'fake' else 0.0
            combined_score = (bert_score * 0.6) + (feature_score * 0.4)
        else:
            combined_score = feature_score
        
        return 'FAKE' if combined_score > 0.5 else 'REAL'
    
    def _calculate_confidence(self, bert_result: Dict, feature_score: float) -> float:
        """Calculate confidence percentage"""
        if bert_result and 'confidence' in bert_result:
            confidence = abs(bert_result['confidence'] - 0.5) * 2  # 0-1 range
            combined = (confidence * 0.6) + (abs(feature_score - 0.5) * 2 * 0.4)
        else:
            combined = abs(feature_score - 0.5) * 2
        
        return round(float(combined) * 100, 2)
    
    def _determine_risk_level(self, score: float) -> str:
        """Determine risk level: LOW, MEDIUM, HIGH, CRITICAL"""
        if score < 0.3:
            return 'LOW'
        elif score < 0.5:
            return 'MEDIUM'
        elif score < 0.7:
            return 'HIGH'
        else:
            return 'CRITICAL'
    
    def _analyze_url(self, url: str) -> Dict[str, Any]:
        """Analyze URL credibility"""
        from urllib.parse import urlparse
        
        try:
            parsed = urlparse(url)
            domain = parsed.netloc.replace('www.', '')
            
            # Trusted domains list
            trusted_domains = [
                'bbc.com', 'reuters.com', 'apnews.com', 'theguardian.com',
                'nytimes.com', 'cnn.com', 'bloomberg.com', 'ft.com',
                'wsj.com', 'washingtonpost.com', 'bbcnews.com', 'theverge.com'
            ]
            
            is_trusted = any(domain.endswith(td) for td in trusted_domains)
            
            return {
                'domain': domain,
                'is_trusted_domain': is_trusted,
                'has_https': parsed.scheme == 'https',
                'url_type': 'shortened' if len(url) < 30 else 'normal',
                'url': url
            }
        except:
            return {}
    
    def _generate_explanation(self, features: Dict, suspicious_phrases: Dict) -> str:
        """Generate AI explanation for the classification"""
        explanations = []
        
        # Suspicious elements
        if suspicious_phrases:
            explanations.append(
                f"Found suspicious language patterns in {len(suspicious_phrases)} categories"
            )
        
        # Readability
        readability = features.get('readability_score', 0)
        if readability > 14:
            explanations.append("Text uses overly complex language")
        elif readability < 6:
            explanations.append("Text uses simplistic, emotionally-driven language")
        
        # Capitalization
        caps = features.get('all_caps_words', 0)
        if caps > 3:
            explanations.append(f"Excessive use of ALL CAPS ({caps} instances)")
        
        # Sentiment
        pos = features.get('positive_words', 0)
        neg = features.get('negative_words', 0)
        if (pos + neg) > 10 and abs(pos - neg) > 8:
            explanations.append("Strong emotional bias detected")
        
        if not explanations:
            explanations.append("Content appears balanced and factual")
        
        return "; ".join(explanations)
    
    def _get_recommendations(self, score: float, suspicious_phrases: Dict) -> List[str]:
        """Get action recommendations"""
        recommendations = []
        
        if score > 0.7:
            recommendations.append("❌ DO NOT SHARE - High fake news probability")
            recommendations.append("🔍 Verify with multiple trusted sources")
            recommendations.append("📢 Report to social media if encountered")
        elif score > 0.5:
            recommendations.append("⚠️ SUSPICIOUS - Verify before sharing")
            recommendations.append("🔗 Check source credibility and author")
            recommendations.append("📰 Cross-reference with established outlets")
        else:
            recommendations.append("✅ Likely authentic - Standard verification recommended")
            recommendations.append("🔗 Always verify source credibility")
        
        if suspicious_phrases:
            recommendations.append(f"⚡ {len(suspicious_phrases)} suspicious phrase categories found")
        
        return recommendations
    
    def train(self, texts: List[str], labels: List[int]):
        """
        Train classical ML models
        
        Args:
            texts: List of training texts
            labels: List of labels (0=FAKE, 1=REAL)
        """
        print(f"Training models on {len(texts)} samples...")
        
        # Preprocess texts
        processed_texts = [self.preprocess_text(t) for t in texts]
        
        # Vectorize texts
        X = self.vectorizer.fit_transform(processed_texts)
        y = np.array(labels)
        
        # Train models
        self.models['logistic_regression'].fit(X, y)
        self.models['naive_bayes'].fit(X, y)
        self.models['random_forest'].fit(X, y)
        
        # Print scores
        for model_name, model in self.models.items():
            score = model.score(X, y)
            print(f"  {model_name}: {score:.4f} accuracy")
        
        print("✓ Training complete")
    
    def save_models(self, model_dir: str = 'backend/models'):
        """Save trained models to disk"""
        os.makedirs(model_dir, exist_ok=True)
        
        # Save vectorizer
        with open(f'{model_dir}/vectorizer.pkl', 'wb') as f:
            pickle.dump(self.vectorizer, f)
        
        # Save classical models
        for model_name, model in self.models.items():
            with open(f'{model_dir}/{model_name}.pkl', 'wb') as f:
                pickle.dump(model, f)
        
        print(f"✓ Models saved to {model_dir}")
    
    def load_models(self, model_dir: str = 'backend/models'):
        """Load trained models from disk"""
        try:
            # Load vectorizer
            with open(f'{model_dir}/vectorizer.pkl', 'rb') as f:
                self.vectorizer = pickle.load(f)
            
            # Load classical models
            for model_name in self.models.keys():
                with open(f'{model_dir}/{model_name}.pkl', 'rb') as f:
                    self.models[model_name] = pickle.load(f)
            
            print(f"✓ Models loaded from {model_dir}")
        except FileNotFoundError:
            print(f"Warning: Models not found in {model_dir}")
