"""
Fake News Detection Model Training Script
Trains ML models using Kaggle's Fake and Real News Dataset
Downloads and processes training data, trains ensemble models
"""

import os
import sys
import json
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from sklearn.feature_extraction.text import TfidfVectorizer
import warnings
from datetime import datetime
import pickle

warnings.filterwarnings('ignore')

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))


class ModelTrainer:
    """
    Trains fake news detection models
    """
    
    def __init__(self, data_dir: str = 'data', model_dir: str = 'backend/models'):
        """
        Initialize model trainer
        
        Args:
            data_dir: Directory for training data
            model_dir: Directory to save trained models
        """
        self.data_dir = Path(data_dir)
        self.model_dir = Path(model_dir)
        self.data_dir.mkdir(exist_ok=True)
        self.model_dir.mkdir(exist_ok=True)
        
        self.results = {}
    
    def load_training_data(self, sample: bool = True):
        """
        Load training data from CSV files or generate sample data
        
        Args:
            sample: If True, create sample data for testing
            
        Returns:
            Loaded dataframe with texts and labels
        """
        if sample:
            print("Generating sample training data...")
            return self._generate_sample_data()
        
        # Try to load from Kaggle dataset
        fake_path = self.data_dir / 'Fake.csv'
        real_path = self.data_dir / 'True.csv'
        
        if not fake_path.exists() or not real_path.exists():
            print(f"Dataset files not found in {self.data_dir}")
            print("Generating sample data for demonstration...")
            return self._generate_sample_data()
        
        print(f"Loading training data from {self.data_dir}...")
        
        # Load fake news
        fake_df = pd.read_csv(fake_path)
        fake_df['label'] = 0  # 0 for fake
        
        # Load real news
        real_df = pd.read_csv(real_path)
        real_df['label'] = 1  # 1 for real
        
        # Combine and prepare data
        df = pd.concat([fake_df, real_df], ignore_index=True)
        
        # Use text field (or title + text)
        if 'text' in df.columns:
            df['combined_text'] = df['text'].fillna('')
        elif 'title' in df.columns and 'text' in df.columns:
            df['combined_text'] = df['title'].fillna('') + ' ' + df['text'].fillna('')
        else:
            df['combined_text'] = df.iloc[:, 1].fillna('')  # Use second column
        
        print(f"✓ Loaded {len(fake_df)} fake news and {len(real_df)} real news articles")
        
        return df
    
    def _generate_sample_data(self, num_samples: int = 200):
        """
        Generate sample training data for demonstration
        
        Args:
            num_samples: Number of samples to generate
            
        Returns:
            Generated dataframe
        """
        # Sample fake news patterns
        fake_samples = [
            "BREAKING: Celebrity caught in major scandal",
            "Anonymous sources reveal shocking truth",
            "Doctors hate this one weird trick",
            "Government suppresses evidence of",
            "You won't believe what happened next",
            "Shocking claims about",
            "Unconfirmed reports suggest",
            "Conspiracy theory finally exposed",
            "This will blow your mind",
            "Scientists discover miracle cure for"
        ]
        
        # Sample real news patterns
        real_samples = [
            "According to published research",
            "The study shows that",
            "Reuters reports that",
            "Official statement released on",
            "Researchers found evidence that",
            "Data indicates an increase in",
            "Interview with lead investigator",
            "Analysis of recent findings",
            "Verified sources confirm that",
            "Statistics released by government"
        ]
        
        texts = []
        labels = []
        
        # Generate fake samples
        for i in range(num_samples // 2):
            text = fake_samples[i % len(fake_samples)]
            for j in range(np.random.randint(5, 20)):
                text += " " + fake_samples[np.random.randint(0, len(fake_samples))]
            texts.append(text)
            labels.append(0)
        
        # Generate real samples
        for i in range(num_samples // 2):
            text = real_samples[i % len(real_samples)]
            for j in range(np.random.randint(5, 20)):
                text += " " + real_samples[np.random.randint(0, len(real_samples))]
            texts.append(text)
            labels.append(1)
        
        df = pd.DataFrame({
            'combined_text': texts,
            'label': labels
        })
        
        print(f"✓ Generated {len(df)} sample training articles")
        return df
    
    def prepare_data(self, df: pd.DataFrame, test_size: float = 0.2):
        """
        Prepare data for training
        
        Args:
            df: Input dataframe
            test_size: Test set size ratio
            
        Returns:
            Train and test data
        """
        print("Preparing data...")
        
        # Remove any null values
        df = df.dropna()
        
        # Limit data size for faster training
        if len(df) > 5000:
            print(f"Limiting dataset to 5000 samples (was {len(df)})")
            df = df.sample(5000, random_state=42)
        
        print(f"Total samples: {len(df)}")
        print(f"Fake news: {(df['label'] == 0).sum()}")
        print(f"Real news: {(df['label'] == 1).sum()}")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            df['combined_text'],
            df['label'],
            test_size=test_size,
            random_state=42,
            stratify=df['label']
        )
        
        print(f"\nTrain set: {len(X_train)} samples")
        print(f"Test set: {len(X_test)} samples")
        
        return X_train, X_test, y_train, y_test
    
    def train_models(self, X_train, X_test, y_train, y_test):
        """
        Train all ML models
        
        Args:
            X_train: Training texts
            X_test: Test texts
            y_train: Training labels
            y_test: Test labels
        """
        print("\n" + "="*70)
        print("TRAINING ML MODELS")
        print("="*70)
        
        # Vectorize text
        print("\nVectorizing text using TF-IDF...")
        vectorizer = TfidfVectorizer(
            max_features=5000,
            ngram_range=(1, 2),
            min_df=2,
            max_df=0.95,
            lowercase=True,
            stop_words='english'
        )
        
        X_train_vec = vectorizer.fit_transform(X_train)
        X_test_vec = vectorizer.transform(X_test)
        
        print(f"✓ Vectorized to {X_train_vec.shape[1]} features")
        
        # Train models
        models = {
            'logistic_regression': LogisticRegression(
                max_iter=1000,
                random_state=42,
                class_weight='balanced',
                n_jobs=-1
            ),
            'naive_bayes': MultinomialNB(alpha=0.1),
            'random_forest': RandomForestClassifier(
                n_estimators=100,
                max_depth=20,
                random_state=42,
                n_jobs=-1
            )
        }
        
        for model_name, model in models.items():
            print(f"\nTraining {model_name.replace('_', ' ').title()}...")
            
            # Train
            model.fit(X_train_vec, y_train)
            
            # Predict
            y_pred = model.predict(X_test_vec)
            
            # Evaluate
            accuracy = accuracy_score(y_test, y_pred)
            precision = precision_score(y_test, y_pred)
            recall = recall_score(y_test, y_pred)
            f1 = f1_score(y_test, y_pred)
            
            self.results[model_name] = {
                'accuracy': float(accuracy),
                'precision': float(precision),
                'recall': float(recall),
                'f1': float(f1)
            }
            
            print(f"  Accuracy:  {accuracy:.4f}")
            print(f"  Precision: {precision:.4f}")
            print(f"  Recall:    {recall:.4f}")
            print(f"  F1 Score:  {f1:.4f}")
        
        # Save vectorizer and models
        self._save_models(vectorizer, models)
    
    def _save_models(self, vectorizer, models):
        """
        Save trained models to disk
        
        Args:
            vectorizer: TfidfVectorizer object
            models: Trained model dictionary
        """
        print("\n" + "="*70)
        print("SAVING MODELS")
        print("="*70)
        
        # Save vectorizer
        vectorizer_path = self.model_dir / 'vectorizer.pkl'
        with open(vectorizer_path, 'wb') as f:
            pickle.dump(vectorizer, f)
        print(f"✓ Saved vectorizer to {vectorizer_path}")
        
        # Save models
        for model_name, model in models.items():
            model_path = self.model_dir / f'{model_name}.pkl'
            
            with open(model_path, 'wb') as f:
                pickle.dump(model, f)
            print(f"✓ Saved {model_name} to {model_path}")
    
    def generate_report(self):
        """
        Generate training report
        """
        print("\n" + "="*70)
        print("TRAINING REPORT")
        print("="*70)
        
        report = {
            'timestamp': datetime.now().isoformat(),
            'models': self.results
        }
        
        # Print summary
        print("\nModel Performance Summary:")
        print("-" * 70)
        print(f"{'Model':<20} {'Accuracy':<12} {'Precision':<12} {'Recall':<12} {'F1':<12}")
        print("-" * 70)
        
        best_accuracy = 0
        best_model = None
        
        for model_name, metrics in self.results.items():
            acc = metrics['accuracy']
            prec = metrics['precision']
            rec = metrics['recall']
            f1 = metrics['f1']
            
            display_name = model_name.replace('_', ' ').title()
            print(f"{display_name:<20} {acc:<12.4f} {prec:<12.4f} {rec:<12.4f} {f1:<12.4f}")
            
            if acc > best_accuracy:
                best_accuracy = acc
                best_model = display_name
        
        print("-" * 70)
        print(f"\n✓ Best model: {best_model} (Accuracy: {best_accuracy:.4f})")
        
        # Save report
        report_path = self.model_dir / 'training_report.json'
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        print(f"✓ Report saved to {report_path}")
        
        return report


def main():
    """Main training function"""
    print("""
    ╔════════════════════════════════════════════════════════════════╗
    ║   Fake News Detection System - Model Training Script           ║
    ║   Version 1.0.0                                                ║
    ╚════════════════════════════════════════════════════════════════╝
    """)
    
    # Initialize trainer
    trainer = ModelTrainer()
    
    # Load data (use sample data if real data not available)
    df = trainer.load_training_data(sample=True)
    
    # Prepare data
    X_train, X_test, y_train, y_test = trainer.prepare_data(df)
    
    # Train models
    trainer.train_models(X_train, X_test, y_train, y_test)
    
    # Generate report
    trainer.generate_report()
    
    print("\n" + "="*70)
    print("✓ Training completed successfully!")
    print("="*70)
    print("\nModels are ready for use in the Flask API.")
    print("To use the API, run: python -m flask run")


if __name__ == '__main__':
    main()
