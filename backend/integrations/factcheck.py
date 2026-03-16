"""
Fact-Check Integration Module
Integrates with Google Fact Check API and other fact-checking services
"""

from typing import Dict, List, Any
import requests
import os
from datetime import datetime


class FactCheckAPI:
    """Fact-checking service integration"""
    
    def __init__(self):
        """Initialize fact-check API"""
        self.google_api_key = os.getenv('GOOGLE_FACTCHECK_API_KEY', 'demo-key')
        self.google_endpoint = "https://www.googleapis.com/factchecktools/v1/claims"
        self.cache = {}
    
    def check_claim(self, claim: str, context: List[str] = None) -> Dict[str, Any]:
        """
        Check claim against fact-checking databases
        
        Args:
            claim: Claim to verify
            context: Optional context/related claims
            
        Returns:
            Dictionary with verification results
        """
        if not claim:
            return {'status': 'error', 'message': 'Claim cannot be empty'}
        
        # Check cache
        if claim in self.cache:
            return self.cache[claim]
        
        results = {
            'claim': claim,
            'verification_status': 'unverified',
            'fact_checks': [],
            'overall_rating': 'Not found',
            'sources': []
        }
        
        # Try Google Fact Check API
        try:
            google_results = self._query_google_factcheck(claim)
            if google_results:
                results['fact_checks'].extend(google_results)
        except Exception as e:
            print(f"Google Fact Check error: {e}")
        
        # Try other sources
        try:
            snopes_results = self._query_snopes(claim)
            if snopes_results:
                results['fact_checks'].extend(snopes_results)
        except Exception as e:
            print(f"Snopes query error: {e}")
        
        # Determine overall rating
        if results['fact_checks']:
            results['overall_rating'] = self._determine_rating(results['fact_checks'])
            results['verification_status'] = 'verified'
        
        results['timestamp'] = datetime.now().isoformat()
        
        # Cache result
        self.cache[claim] = results
        
        return results
    
    def _query_google_factcheck(self, claim: str) -> List[Dict]:
        """Query Google Fact Check API"""
        try:
            params = {
                'query': claim,
                'key': self.google_api_key,
                'pageSize': 5
            }
            
            # Note: This requires valid API key
            response = requests.get(self.google_endpoint, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                return self._parse_google_response(data)
            
            return []
        except Exception as e:
            print(f"Google Fact Check API error: {e}")
            return []
    
    def _parse_google_response(self, response: Dict) -> List[Dict]:
        """Parse Google Fact Check API response"""
        results = []
        
        claims = response.get('claims', [])
        for claim in claims:
            result = {
                'source': 'Google Fact Check',
                'claim': claim.get('text', ''),
                'claimant': claim.get('claimant', 'Unknown'),
                'rating': claim.get('rating', {}).get('textualRating', 'Not rated'),
                'url': claim.get('claimReview', [{}])[0].get('url', ''),
                'date': claim.get('claimDate', '')
            }
            results.append(result)
        
        return results
    
    def _query_snopes(self, claim: str) -> List[Dict]:
        """Query Snopes (simulated)"""
        # In production, would scrape or use Snopes API
        # For now, returning empty list
        return []
    
    def _determine_rating(self, fact_checks: List[Dict]) -> str:
        """Determine overall rating from fact checks"""
        if not fact_checks:
            return 'Unverified'
        
        ratings = [fc.get('rating', '').lower() for fc in fact_checks]
        
        if any('false' in r for r in ratings):
            return 'False'
        elif any('true' in r for r in ratings):
            return 'True'
        elif any('mixed' in r for r in ratings):
            return 'Mixed'
        elif any('partial' in r for r in ratings):
            return 'Partially True'
        else:
            return 'Unverified'
    
    def extract_claims(self, text: str) -> List[str]:
        """Extract verifiable claims from text"""
        # Simplified claim extraction
        # In production, use more sophisticated NLP
        
        sentences = text.split('.')
        claims = []
        
        claim_indicators = ['states', 'claims', 'says', 'reports', 'shows', 
                          'proves', 'indicates', 'suggests', 'found', 'revealed']
        
        for sentence in sentences:
            sentence = sentence.strip()
            if any(indicator in sentence.lower() for indicator in claim_indicators):
                claims.append(sentence)
        
        return claims[:5]  # Return top 5 claims
