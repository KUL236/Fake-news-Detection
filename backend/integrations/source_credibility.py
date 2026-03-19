"""
Source Credibility Analyzer Module
Analyzes the credibility and reputation of news sources
Checks domain reputation, publication history, author credibility, etc.
"""

from typing import Dict, List, Any
from urllib.parse import urlparse
import requests
import logging
from datetime import datetime
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SourceCredibilityAnalyzer:
    """
    Analyzes source credibility based on multiple factors
    """
    
    def __init__(self):
        """Initialize source credibility analyzer"""
        
        # Trusted news sources (examples)
        self.trusted_sources = {
            'tier1': [  # Major international news agencies
                'bbc.com', 'reuters.com', 'apnews.com', 'theguardian.com',
                'nytimes.com', 'bbc.co.uk', 'dw.com', 'ft.com'
            ],
            'tier2': [  # Major regional/national outlets
                'cnn.com', 'washingtonpost.com', 'theverge.com',
                'economist.com', 'wsj.com', 'bloomberg.com',
                'huffpost.com', 'politico.com'
            ]
        }
        
        # Suspicious/unreliable sources
        self.unreliable_sources = [
            'dailystorm.ru',  # Russian state propaganda
            'rt.com',  # Russia Today
            'infowars.com',  # Conspiracy theories
            'beforeitsne.ws',  # Misinformation blog
            'naturalnews.com',  # Health misinformation
            'clickbait-news.com'
        ]
        
        # Satire/parody sites (content from these should not be taken literally)
        self.satire_sources = [
            'theonion.com',
            'babylonbee.com',
            'thelapinetruth.com'
        ]
        
        # Domain information cache
        self.domain_cache = {}
    
    def analyze(self, url: str = None, source: str = None, 
                author: str = None) -> Dict[str, Any]:
        """
        Comprehensive source credibility analysis
        
        Args:
            url: News article URL
            source: Publication name/domain
            author: Article author name
            
        Returns:
            Credibility analysis results
        """
        domain = None
        
        if url:
            parsed = urlparse(url)
            domain = parsed.netloc.replace('www.', '').lower()
        elif source:
            domain = source.lower()
        
        results = {
            'domain': domain,
            'domain_credibility': self._analyze_domain(domain) if domain else None,
            'author_credibility': self._analyze_author(author) if author else None,
            'publication_credibility': self._check_publication(domain) if domain else None,
            'overall_score': 0.0,
            'trust_level': 'unknown',
            'recommendations': []
        }
        
        # Calculate overall credibility score
        scores = []
        if results['domain_credibility']:
            scores.append(results['domain_credibility'].get('credibility_score', 0.5))
        if results['publication_credibility']:
            scores.append(results['publication_credibility'].get('score', 0.5))
        if results['author_credibility']:
            scores.append(results['author_credibility'].get('credibility_score', 0.5))
        
        if scores:
            results['overall_score'] = sum(scores) / len(scores)
            results['trust_level'] = self._determine_trust_level(results['overall_score'])
        
        results['recommendations'] = self._generate_recommendations(results)
        
        return results
    
    def _analyze_domain(self, domain: str) -> Dict[str, Any]:
        """
        Analyze domain credibility
        
        Args:
            domain: Domain name (e.g., 'bbc.com')
            
        Returns:
            Domain credibility analysis
        """
        domain = domain.lower().replace('www.', '')
        
        # Check if in cache
        if domain in self.domain_cache:
            return self.domain_cache[domain]
        
        result = {
            'domain': domain,
            'is_trusted': False,
            'trust_tier': 'unknown',
            'credibility_score': 0.5,
            'factors': {}
        }
        
        # Check trusted sources
        if domain in self.trusted_sources['tier1']:
            result['is_trusted'] = True
            result['trust_tier'] = 'tier1'
            result['credibility_score'] = 0.9
        elif domain in self.trusted_sources['tier2']:
            result['is_trusted'] = True
            result['trust_tier'] = 'tier2'
            result['credibility_score'] = 0.8
        elif domain in self.unreliable_sources:
            result['trust_tier'] = 'unreliable'
            result['credibility_score'] = 0.1
        elif domain in self.satire_sources:
            result['trust_tier'] = 'satire'
            result['credibility_score'] = 0.5
            result['note'] = 'Satire/parody site - content should not be taken literally'
        
        # Check domain characteristics
        result['factors'] = self._check_domain_characteristics(domain)
        
        # Cache result
        self.domain_cache[domain] = result
        
        return result
    
    def _check_domain_characteristics(self, domain: str) -> Dict[str, Any]:
        """
        Check various domain characteristics
        
        Args:
            domain: Domain to analyze
            
        Returns:
            Domain characteristics
        """
        factors = {
            'has_https': domain.startswith('https://'),
            'domain_length': len(domain),
            'is_suspicious_extension': domain.endswith(('.ru', '.cn', '.ir')),
            'looks_legitimate': not any(char in domain for char in ['_', '..', '--'])
        }
        
        # Adjust credibility based on factors
        suspicious_score = 0.0
        
        if factors['is_suspicious_extension']:
            suspicious_score += 0.2
        
        if not factors['looks_legitimate']:
            suspicious_score += 0.15
        
        # Very short domains can be suspicious
        if factors['domain_length'] < 4:
            suspicious_score += 0.1
        
        factors['suspicious_indicators'] = suspicious_score > 0
        factors['suspicious_score'] = min(suspicious_score, 1.0)
        
        return factors
    
    def _check_publication(self, domain: str) -> Dict[str, Any]:
        """
        Check publication credibility
        
        Args:
            domain: Publication domain
            
        Returns:
            Publication credibility info
        """
        domain = domain.lower().replace('www.', '')
        
        # Extract publication name
        parts = domain.split('.')
        pub_name = parts[0].title() if parts else 'Unknown'
        
        # This would ideally check against a publication database
        # For now, using domain analysis as proxy
        
        is_established = self._is_established_publication(domain)
        
        return {
            'publication': pub_name,
            'domain': domain,
            'is_established': is_established,
            'score': 0.8 if is_established else 0.5,
            'recommendation': 'Verify claims with cross-referencing' if not is_established else None
        }
    
    def _is_established_publication(self, domain: str) -> bool:
        """
        Check if publication appears to be established
        
        Args:
            domain: Domain to check
            
        Returns:
            True if appears to be established publication
        """
        # Heuristics for established publications
        known_established = set()
        for tier in self.trusted_sources.values():
            known_established.update(tier)
        
        if domain in known_established:
            return True
        
        # Check for known major publications
        major_publications = [
            'guardian', 'telegraph', 'independent', 'mirror', 'sun',
            'times', 'financial', 'economist', 'spectator'
        ]
        
        return any(pub in domain for pub in major_publications)
    
    def _analyze_author(self, author: str) -> Dict[str, Any]:
        """
        Analyze author credibility
        
        Args:
            author: Author name
            
        Returns:
            Author credibility analysis
        """
        if not author:
            return {
                'author': None,
                'has_author': False,
                'credibility_score': 0.5
            }
        
        # Check if author exists
        if author.lower() in ['anonymous', 'unknown', 'staff', 'editor']:
            return {
                'author': author,
                'has_author': False,
                'credibility_score': 0.4,
                'note': 'Article lacks specific author attribution'
            }
        
        # Check if author used real name format
        name_parts = author.split()
        has_first_and_last = len(name_parts) >= 2
        
        return {
            'author': author,
            'has_author': True,
            'has_proper_name': has_first_and_last,
            'credibility_score': 0.7 if has_first_and_last else 0.5,
            'recommendation': 'Verify author credentials if possible'
        }
    
    def _determine_trust_level(self, score: float) -> str:
        """
        Determine trust level based on score
        
        Args:
            score: Credibility score (0-1)
            
        Returns:
            Trust level string
        """
        if score >= 0.85:
            return 'highly_trusted'
        elif score >= 0.7:
            return 'trusted'
        elif score >= 0.5:
            return 'neutral'
        elif score >= 0.3:
            return 'questionable'
        else:
            return 'unreliable'
    
    def _generate_recommendations(self, analysis: Dict) -> List[str]:
        """
        Generate recommendations based on credibility analysis
        
        Args:
            analysis: Credibility analysis results
            
        Returns:
            List of recommendations
        """
        recommendations = []
        trust_level = analysis.get('trust_level', 'unknown')
        
        if trust_level == 'highly_trusted':
            recommendations.append("✓ Source is generally reliable")
            recommendations.append("Standard fact-checking recommended")
        elif trust_level == 'trusted':
            recommendations.append("✓ Source has good reputation")
            recommendations.append("Cross-reference important claims")
        elif trust_level == 'neutral':
            recommendations.append("⚠ Verify information from multiple sources")
            recommendations.append("Check author credibility")
        elif trust_level == 'questionable':
            recommendations.append("⚠ Be cautious with claims from this source")
            recommendations.append("Cross-reference with established news outlets")
            recommendations.append("Check for corroborating evidence")
        else:  # unreliable
            recommendations.append("❌ Source has poor reputation")
            recommendations.append("Verify all claims independently")
            recommendations.append("Look for corroboration from trusted sources")
            recommendations.append("Consider reporting if spreading misinformation")
        
        # Author-specific recommendations
        domain_analysis = analysis.get('domain_credibility', {})
        if domain_analysis and not domain_analysis.get('is_trusted'):
            author_analysis = analysis.get('author_credibility', {})
            if author_analysis and not author_analysis.get('has_author'):
                recommendations.append("Article lacks specific author attribution")
        
        return recommendations
    
    def batch_analyze(self, sources: List[str]) -> List[Dict]:
        """
        Analyze multiple sources
        
        Args:
            sources: List of source domains/URLs
            
        Returns:
            List of credibility analyses
        """
        return [self.analyze(url=source if source.startswith('http') else None, 
                           source=source if not source.startswith('http') else None) 
               for source in sources]
    
    def compare_sources(self, sources: List[str]) -> Dict[str, Any]:
        """
        Compare credibility of multiple sources
        
        Args:
            sources: List of source domains to compare
            
        Returns:
            Comparison results
        """
        analyses = self.batch_analyze(sources)
        
        # Sort by overall score
        sorted_sources = sorted(analyses, 
                               key=lambda x: x.get('overall_score', 0), 
                               reverse=True)
        
        return {
            'comparison': sorted_sources,
            'most_credible': sorted_sources[0] if sorted_sources else None,
            'least_credible': sorted_sources[-1] if sorted_sources else None,
            'average_score': sum(a.get('overall_score', 0.5) for a in analyses) / len(analyses) if analyses else 0.5
        }
