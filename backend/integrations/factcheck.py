"""
Fact-Check API Integration Module
Integrates with third-party fact-checking services
Supported APIs:
- Google Fact Check API
- NewsAPI
- Custom fact-check database
"""

import requests
import json
from typing import Dict, List, Any
from datetime import datetime
import os
from urllib.parse import quote
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class FactCheckAPI:
    """
    Integrates multiple fact-checking APIs for verification
    """
    
    def __init__(self, google_api_key: str = None, newsapi_key: str = None):
        """
        Initialize fact-check API integrations
        
        Args:
            google_api_key: Google Fact Check API key
            newsapi_key: NewsAPI key
        """
        self.google_api_key = google_api_key or os.getenv('GOOGLE_FACT_CHECK_API_KEY')
        self.newsapi_key = newsapi_key or os.getenv('NEWS_API_KEY')
        
        # API endpoints
        self.google_fact_check_url = "https://factchecktools.googleapis.com/v1alpha1/claims:search"
        self.newsapi_url = "https://newsapi.org/v2"
        
        # Fact-check results cache
        self.cache = {}
        
        # Known fact-check sources
        self.trusted_fact_checkers = [
            'snopes.com',
            'factcheck.org',
            'politifact.com',
            'fullfact.org',
            'truthorfiction.com',
            'factchecking.org'
        ]
    
    def verify_claim(self, claim: str) -> Dict[str, Any]:
        """
        Verify a claim using available APIs
        
        Args:
            claim: Claim text to verify
            
        Returns:
            Fact-check results
        """
        results = {
            'claim': claim,
            'google_results': self._google_fact_check(claim) if self.google_api_key else None,
            'newsapi_results': self._newsapi_search(claim) if self.newsapi_key else None,
            'verification_status': self._determine_verification_status(claim),
            'timestamp': datetime.now().isoformat()
        }
        
        return results
    
    def _google_fact_check(self, claim: str) -> Dict[str, Any]:
        """
        Use Google Fact Check API
        
        Args:
            claim: Claim to fact-check
            
        Returns:
            Results from Google Fact Check API
        """
        if not self.google_api_key:
            return {'error': 'Google API key not configured'}
        
        try:
            params = {
                'query': claim,
                'key': self.google_api_key,
                'pageSize': 5
            }
            
            response = requests.get(
                self.google_fact_check_url,
                params=params,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if 'claims' in data:
                    claims = []
                    for claim_data in data['claims'][:5]:
                        claims.append({
                            'text': claim_data.get('text', ''),
                            'claimant': claim_data.get('claimant', 'Unknown'),
                            'fact_checks': [
                                {
                                    'language': fc.get('languageCode', 'en'),
                                    'publisher': fc.get('publisher', {}).get('name', 'Unknown'),
                                    'url': fc.get('url', ''),
                                    'review_date': fc.get('reviewDate', ''),
                                    'rating': fc.get('textualRating', 'No rating')
                                }
                                for fc in claim_data.get('claimReview', [])
                            ]
                        })
                    
                    return {
                        'status': 'success',
                        'claims_found': len(claims),
                        'claims': claims
                    }
                else:
                    return {
                        'status': 'no_results',
                        'message': 'No fact-check claims found for this text'
                    }
            else:
                return {
                    'error': f'API returned status {response.status_code}',
                    'status': 'error'
                }
        
        except requests.exceptions.RequestException as e:
            logger.error(f"Google Fact Check API error: {e}")
            return {'error': str(e), 'status': 'error'}
    
    def _newsapi_search(self, query: str) -> Dict[str, Any]:
        """
        Search NewsAPI for relevant articles
        
        Args:
            query: Search query
            
        Returns:
            Articles from NewsAPI
        """
        if not self.newsapi_key:
            return {'error': 'NewsAPI key not configured'}
        
        try:
            # Search for similar claims/topics
            params = {
                'q': query,
                'sortBy': 'relevancy',
                'pageSize': 10,
                'apiKey': self.newsapi_key
            }
            
            response = requests.get(
                f'{self.newsapi_url}/everything',
                params=params,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                articles = []
                for article in data.get('articles', [])[:10]:
                    articles.append({
                        'title': article.get('title', ''),
                        'source': article.get('source', {}).get('name', 'Unknown'),
                        'url': article.get('url', ''),
                        'published_at': article.get('publishedAt', ''),
                        'content': article.get('description', '')[:200]  # Truncate
                    })
                
                return {
                    'status': 'success',
                    'total_articles': data.get('totalResults', 0),
                    'articles': articles
                }
            else:
                return {
                    'error': f'API returned status {response.status_code}',
                    'status': 'error'
                }
        
        except requests.exceptions.RequestException as e:
            logger.error(f"NewsAPI error: {e}")
            return {'error': str(e), 'status': 'error'}
    
    def _determine_verification_status(self, claim: str) -> Dict[str, Any]:
        """
        Determine verification status of a claim
        
        Args:
            claim: Claim to analyze
            
        Returns:
            Verification status
        """
        # Extract key terms from claim
        claim_lower = claim.lower()
        
        # Look for specific claims that are easy to verify
        patterns = {
            'date_claim': r'\d{4}|\d{1,2}/\d{1,2}/\d{4}',
            'number_claim': r'\d+%|\$\d+|number of',
            'person_claim': r'(said|claimed|stated|accused)',
            'location_claim': r'(in|at|from)\s+[A-Z]'
        }
        
        import re
        claim_types = []
        for claim_type, pattern in patterns.items():
            if re.search(pattern, claim):
                claim_types.append(claim_type)
        
        return {
            'is_verifiable': len(claim_types) > 0,
            'claim_types': claim_types,
            'difficulty': 'easy' if any(c in claim_types for c in ['date_claim', 'number_claim'])
                         else 'hard' if any(c in claim_types for c in ['opinion_claim'])
                         else 'medium'
        }
    
    def batch_verify(self, claims: List[str]) -> List[Dict[str, Any]]:
        """
        Verify multiple claims
        
        Args:
            claims: List of claims to verify
            
        Returns:
            List of verification results
        """
        results = []
        for claim in claims:
            result = self.verify_claim(claim)
            results.append(result)
        
        return results
    
    def extract_claims(self, text: str) -> List[str]:
        """
        Extract factual claims from text
        
        Args:
            text: Text to extract claims from
            
        Returns:
            List of detected claims
        """
        import re
        
        claims = []
        
        # Sentence-level claims
        sentences = text.split('.')
        for sentence in sentences:
            sentence = sentence.strip()
            if len(sentence) > 20:  # Only significant sentences
                # Check if it contains claim indicators
                if any(indicator in sentence.lower() for indicator in 
                       ['is', 'was', 'are', 'were', 'said', 'stated', 'claimed', 'occurred']):
                    claims.append(sentence)
        
        # Limit to 10 most important claims
        return claims[:10]
    
    def get_contradiction_check(self, text1: str, text2: str) -> Dict[str, Any]:
        """
        Check if two text passages contradict each other
        
        Args:
            text1: First text passage
            text2: Second text passage
            
        Returns:
            Contradiction analysis
        """
        # Simple contradiction detection using keyword analysis
        import re
        
        # Extract main entities and claims from both texts
        entities1 = set(re.findall(r'[A-Z][a-z]+', text1))
        entities2 = set(re.findall(r'[A-Z][a-z]+', text2))
        
        # Check for direct contradictions
        contradictions = []
        
        common_entities = entities1.intersection(entities2)
        
        # Simple pattern matching for contradictions
        patterns = [
            (r'yes|true', r'no|false'),
            (r'increase', r'decrease'),
            (r'agree', r'disagree')
        ]
        
        for text_a, text_b in [(text1, text2)]:
            for pos_pattern, neg_pattern in patterns:
                if re.search(pos_pattern, text_a.lower()) and \
                   re.search(neg_pattern, text_b.lower()):
                    contradictions.append({
                        'type': 'direct_contradiction',
                        'pattern': f'{pos_pattern} vs {neg_pattern}'
                    })
        
        return {
            'common_entities': list(common_entities),
            'contradictions_found': len(contradictions) > 0,
            'contradictions': contradictions,
            'similarity_level': 'high' if len(common_entities) > 5 else 'medium' if len(common_entities) > 2 else 'low'
        }
