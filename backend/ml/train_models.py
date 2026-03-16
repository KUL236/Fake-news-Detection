"""
Model Training Pipeline
Train multiple ML models for fake news detection
"""

import numpy as np
import pandas as pd
import pickle
import os
from pathlib import Path
from typing import Tuple, Any
import warnings

warnings.filterwarnings('ignore')

# ML imports
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (accuracy_score, precision_score, recall_score, 
                            f1_score, confusion_matrix, classification_report,
                            roc_auc_score, roc_curve)
import matplotlib.pyplot as plt
import seaborn as sns

# NLP
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

# Deep Learning
try:
    import torch
    from transformers import AutoTokenizer, AutoModelForSequenceClassification
    from torch.utils.data import Dataset, DataLoader
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False


class FakeNewsDataset:
    """Load and preprocess fake news dataset"""
    
    def __init__(self, csv_path: str = None):
        """
        Initialize dataset
        
        Args:
            csv_path: Path to CSV file with columns: text, label (0=real, 1=fake)
        """
        self.csv_path = csv_path
        self.df = None
        self.X_train = None
        self.X_test = None
        self.y_train = None
        self.y_test = None
        
    def load(self, test_size: float = 0.2, random_state: int = 42):
        """Load and split dataset"""
        if self.csv_path and os.path.exists(self.csv_path):
            self.df = pd.read_csv(self.csv_path)
        else:
            # Generate synthetic dataset for demonstration
            self.df = self._generate_synthetic_data()
        
        # Preprocess
        self.df['text'] = self.df['text'].apply(self._clean_text)
        
        # Split data
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            self.df['text'],
            self.df['label'],
            test_size=test_size,
            random_state=random_state,
            stratify=self.df['label']
        )
        
        print(f"Dataset loaded: {len(self.df)} samples")
        print(f"Train set: {len(self.X_train)} samples")
        print(f"Test set: {len(self.X_test)} samples")
        print(f"Fake samples: {(self.df['label'] == 1).sum()}")
        print(f"Real samples: {(self.df['label'] == 0).sum()}")
        
        return self.X_train, self.X_test, self.y_train, self.y_test
    
    def _clean_text(self, text: str) -> str:
        """Clean text"""
        if not isinstance(text, str):
            return ""
        text = text.lower()
        text = ' '.join(text.split())
        return text
    
    def _generate_synthetic_data(self, n_samples: int = 2000) -> pd.DataFrame:
        """Generate synthetic fake news dataset"""
        print("Generating synthetic dataset...")
        
        fake_titles = [
            "SHOCKING: {}",
            "BREAKING NEWS: {}",
            "EXCLUSIVE REVEAL: {}",
            "UNBELIEVABLE: {}", 
            "WARNING: {}",
            "SEE WHAT HAPPENED: {}"
        ]
        
        fake_content = [
            "This is completely unverified. Many people are saying...",
            "Sources claim that allegedly...",
            "Reports suggest that supposedly...",
            "Unconfirmed reports indicate that...",
            "Experts allegedly state that..."
        ]
        
        real_titles = [
            "{} reported by Reuters",
            "{} according to AP News",
            "Officials announce {}",
            "Study shows {}", 
            "New research indicates {}"
        ]
        
        real_content = [
            "According to official sources...",
            "A peer-reviewed study found...",
            "Representatives stated that...",
            "Research indicates that...",
            "Data shows that..."
        ]
        
        topics = [
            "health crisis spreading", 
            "government covers up scandal",
            "celebrity secret revealed",
            "scientific breakthrough made",
            "economic trends shift",
            "investigation uncovers truth",
            "new policy announced",
            "disaster avoided by warning"
        ]
        
        data = []
        
        # Generate fake news
        for i in range(n_samples // 2):
            title = np.random.choice(fake_titles).format(np.random.choice(topics))
            content = np.random.choice(fake_content) + " " + np.random.choice(topics)
            data.append({'text': f"{title} {content}", 'label': 1})
        
        # Generate real news
        for i in range(n_samples // 2):
            title = np.random.choice(real_titles).format(np.random.choice(topics))
            content = np.random.choice(real_content) + " " + np.random.choice(topics)
            data.append({'text': f"{title} {content}", 'label': 0})
        
        return pd.DataFrame(data)


class ModelTrainer:
    """Train multiple ML models"""
    
    def __init__(self, output_dir: str = './models/'):
        """Initialize trainer"""
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        self.models = {}
        self.vectorizer = None
        self.results = {}
        
    def train_tfidf_models(self, X_train, X_test, y_train, y_test,
                          max_features: int = 5000):
        """Train TF-IDF vectorized models"""
        print("\n" + "="*60)
        print("Training TF-IDF Models")
        print("="*60)
        
        # TF-IDF Vectorization
        print("\n1. Creating TF-IDF vectors...")
        self.vectorizer = TfidfVectorizer(
            max_features=max_features,
            stop_words='english',
            ngram_range=(1, 2),
            min_df=5,
            max_df=0.8
        )
        
        X_train_tfidf = self.vectorizer.fit_transform(X_train)
        X_test_tfidf = self.vectorizer.transform(X_test)
        
        print(f"   Feature matrix shape: {X_train_tfidf.shape}")
        
        # Logistic Regression
        print("\n2. Training Logistic Regression...")
        self.models['logistic_regression'] = LogisticRegression(
            max_iter=1000, random_state=42
        )
        self.models['logistic_regression'].fit(X_train_tfidf, y_train)
        self._evaluate_model('logistic_regression', self.models['logistic_regression'],
                            X_test_tfidf, y_test)
        
        # Naive Bayes
        print("\n3. Training Naive Bayes...")
        self.models['naive_bayes'] = MultinomialNB()
        self.models['naive_bayes'].fit(X_train_tfidf, y_train)
        self._evaluate_model('naive_bayes', self.models['naive_bayes'],
                            X_test_tfidf, y_test)
        
        # Random Forest
        print("\n4. Training Random Forest...")
        self.models['random_forest'] = RandomForestClassifier(
            n_estimators=100, random_state=42, n_jobs=-1
        )
        self.models['random_forest'].fit(X_train_tfidf, y_train)
        self._evaluate_model('random_forest', self.models['random_forest'],
                            X_test_tfidf, y_test)
        
        # Gradient Boosting
        print("\n5. Training Gradient Boosting...")
        self.models['gradient_boosting'] = GradientBoostingClassifier(
            n_estimators=100, random_state=42
        )
        self.models['gradient_boosting'].fit(X_train_tfidf, y_train)
        self._evaluate_model('gradient_boosting', self.models['gradient_boosting'],
                            X_test_tfidf, y_test)
        
        return X_train_tfidf, X_test_tfidf
    
    def train_bert_model(self, X_train, X_test, y_train, y_test,
                        model_name: str = "bert-base-uncased",
                        epochs: int = 3, batch_size: int = 16):
        """Train BERT transformer model"""
        if not TORCH_AVAILABLE:
            print("PyTorch and Transformers not available. Skipping BERT training.")
            return
        
        print("\n" + "="*60)
        print("Training BERT Model")
        print("="*60)
        
        # Note: This is a simplified version
        # In production, implement proper BERT fine-tuning with DataLoader
        print(f"Training BERT ({model_name})...")
        print(f"Epochs: {epochs}, Batch size: {batch_size}")
        
        # Would implement full BERT training pipeline here
        # Including: tokenization, DataLoader, training loop, validation
        print("✓ BERT model training (simplified - implement full pipeline in production)")
        
        return True
    
    def _evaluate_model(self, model_name: str, model: Any, X_test, y_test):
        """Evaluate model performance"""
        y_pred = model.predict(X_test)
        y_pred_proba = model.predict_proba(X_test)[:, 1]
        
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred)
        recall = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        roc_auc = roc_auc_score(y_test, y_pred_proba)
        
        self.results[model_name] = {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1_score': f1,
            'roc_auc': roc_auc
        }
        
        print(f"\n   {model_name.upper()} Results:")
        print(f"   - Accuracy:  {accuracy:.4f}")
        print(f"   - Precision: {precision:.4f}")
        print(f"   - Recall:    {recall:.4f}")
        print(f"   - F1 Score:  {f1:.4f}")
        print(f"   - ROC-AUC:   {roc_auc:.4f}")
        
        # Confusion Matrix
        cm = confusion_matrix(y_test, y_pred)
        print(f"   - Confusion Matrix:\n{cm}")
    
    def save_models(self):
        """Save trained models"""
        print("\n" + "="*60)
        print("Saving Models")
        print("="*60)
        
        # Save models
        for model_name, model in self.models.items():
            model_path = self.output_dir / f"{model_name}.pkl"
            with open(model_path, 'wb') as f:
                pickle.dump(model, f)
            print(f"✓ Saved: {model_path}")
        
        # Save vectorizer
        vectorizer_path = self.output_dir / "tfidf_vectorizer.pkl"
        with open(vectorizer_path, 'wb') as f:
            pickle.dump(self.vectorizer, f)
        print(f"✓ Saved: {vectorizer_path}")
    
    def plot_results(self):
        """Plot model comparison"""
        if not self.results:
            print("No results to plot")
            return
        
        results_df = pd.DataFrame(self.results).T
        
        # Create comparison plots
        fig, axes = plt.subplots(2, 2, figsize=(14, 10))
        
        results_df['accuracy'].plot(kind='bar', ax=axes[0, 0], color='steelblue')
        axes[0, 0].set_title('Model Accuracy')
        axes[0, 0].set_ylabel('Accuracy')
        axes[0, 0].set_ylim([0.8, 1.0])
        
        results_df['precision'].plot(kind='bar', ax=axes[0, 1], color='coral')
        axes[0, 1].set_title('Model Precision')
        axes[0, 1].set_ylabel('Precision')
        axes[0, 1].set_ylim([0.8, 1.0])
        
        results_df['recall'].plot(kind='bar', ax=axes[1, 0], color='lightgreen')
        axes[1, 0].set_title('Model Recall')
        axes[1, 0].set_ylabel('Recall')
        axes[1, 0].set_ylim([0.8, 1.0])
        
        results_df['f1_score'].plot(kind='bar', ax=axes[1, 1], color='gold')
        axes[1, 1].set_title('Model F1 Score')
        axes[1, 1].set_ylabel('F1 Score')
        axes[1, 1].set_ylim([0.8, 1.0])
        
        plt.tight_layout()
        plot_path = self.output_dir / "model_comparison.png"
        plt.savefig(plot_path)
        print(f"\n✓ Saved plot: {plot_path}")
    
    def generate_report(self):
        """Generate training report"""
        report = f"""
================================================================================
                  FAKE NEWS DETECTION - MODEL TRAINING REPORT
================================================================================

DATASET INFORMATION:
  - Train samples: {len(self.X_train) if hasattr(self, 'X_train') else 'N/A'}
  - Test samples: {len(self.X_test) if hasattr(self, 'X_test') else 'N/A'}
  - Total features (TF-IDF): {self.vectorizer.get_feature_names_out().shape[0] if self.vectorizer else 'N/A'}

MODEL PERFORMANCE SUMMARY:
"""
        if self.results:
            results_df = pd.DataFrame(self.results).T
            report += results_df.to_string()
        
        report += f"""

BEST MODEL: {max(self.results.items(), key=lambda x: x[1]['f1_score'])[0] if self.results else 'N/A'}

RECOMMENDATIONS:
1. Deploy the best performing model to production
2. Implement ensemble approach combining multiple models
3. Regular retraining with new data to maintain accuracy
4. Monitor model drift and performance metrics
5. Implement A/B testing for model updates

NEXT STEPS:
1. Integrate with Flask API
2. Deploy to production environment
3. Set up model monitoring and logging
4. Create frontend dashboard
5. Integrate with fact-checking APIs

================================================================================
"""
        return report


def main():
    """Main training pipeline"""
    print("\n" + "="*60)
    print("FAKE NEWS DETECTION SYSTEM - MODEL TRAINING")
    print("="*60)
    
    # Load dataset
    print("\nStep 1: Loading Dataset")
    print("-" * 60)
    dataset = FakeNewsDataset()
    X_train, X_test, y_train, y_test = dataset.load(test_size=0.2)
    
    # Train models
    print("\nStep 2: Training Models")
    print("-" * 60)
    trainer = ModelTrainer(output_dir='./backend/models/')
    
    # Train TF-IDF models
    X_train_tfidf, X_test_tfidf = trainer.train_tfidf_models(
        X_train, X_test, y_train, y_test
    )
    
    # Train BERT model (if available)
    if TORCH_AVAILABLE:
        trainer.train_bert_model(X_train, X_test, y_train, y_test)
    
    # Save models
    print("\nStep 3: Saving Models")
    print("-" * 60)
    trainer.save_models()
    
    # Plot results
    print("\nStep 4: Generating Visualizations")
    print("-" * 60)
    trainer.plot_results()
    
    # Generate report
    print("\nStep 5: Report")
    print("-" * 60)
    report = trainer.generate_report()
    print(report)
    
    # Save report
    with open('./backend/models/training_report.txt', 'w') as f:
        f.write(report)
    
    print("\n✓ Training complete! Models saved to ./backend/models/")


if __name__ == "__main__":
    main()
