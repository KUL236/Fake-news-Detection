"""
Source Credibility Analyzer Module
Analyzes news source reputation and trustworthiness
"""

from typing import Dict, Any
from urllib.parse import urlparse
import requests
from datetime import datetime


class SourceCredibilityAnalyzer:
    """Analyze credibility of news sources"""
    
    def __init__(self):
        """Initialize source credibility analyzer"""
        self.trusted_domains = self._load_trusted_domains()
        self.known_fake_sources = self._load_fake_sources()
        self.domain_ratings = {}
    
    def _load_trusted_domains(self) -> Dict[str, int]:
        """Load trusted news source domains with credibility ratings (0-100)"""
        return {
            # Major international news agencies
            'reuters.com': 95,
            'apnews.com': 94,
            'bbc.com': 93,
            'theguardian.com': 92,
            'nytimes.com': 91,
            'wsj.com': 90,
            'ft.com': 90,
            'bloomberg.com': 89,
            'cnn.com': 85,
            'bbc.co.uk': 93,
            'abc.net.au': 90,
            'dw.com': 88,
            'france24.com': 87,
            
            # News aggregators
            'google.com/news': 85,
            'news.ycombinator.com': 80,
            
            # Regional trusted sources
            'times.com': 88,
            'telegraph.co.uk': 86,
            'independent.co.uk': 85,
            'theverge.com': 82
        }
    
    def _load_fake_sources(self) -> Dict[str, int]:
        """Load known fake news sources with warning severity (0-100)"""
        return {
            'infowars.com': 95,
            'naturalnews.com': 90,
            'worldtruth.tv': 85,
            'beforeitsnews.com': 85,
            'yournewswire.com': 80,
            'newspunch.com': 80
        }
    
    def analyze(self, url: str) -> Dict[str, Any]:
        """
        Analyze source credibility
        
        Args:
            url: URL of news source
            
        Returns:
            Dictionary with credibility analysis
        """
        parsed_url = urlparse(url)
        domain = parsed_url.netloc.replace('www.', '')
        
        # Check if known fake source
        if domain in self.known_fake_sources:
            severity = self.known_fake_sources[domain]
            return self._create_response(
                url=url,
                domain=domain,
                credibility_score=max(0, 30 - severity/10),
                is_trusted=False,
                status='untrustworthy',
                reason='Known fake news source'
            )
        
        # Check if trusted source
        if domain in self.trusted_domains:
            rating = self.trusted_domains[domain]
            return self._create_response(
                url=url,
                domain=domain,
                credibility_score=rating,
                is_trusted=True,
                status='trusted',
                reason='Established, reputable news source'
            )
        
        # Analyze unknown domain
        return self._analyze_unknown_domain(url, domain)
    
    def _analyze_unknown_domain(self, url: str, domain: str) -> Dict[str, Any]:
        """Analyze credibility of unknown domain"""
        score = 50  # Start with neutral score
        
        # Domain age (check if domain looks newly created)
        if self._is_suspicious_domain_name(domain):
            score -= 15
        
        # Check for HTTPS
        parsed_url = urlparse(url)
        if parsed_url.scheme == 'https':
            score += 5
        
        # Check domain structure
        if self._has_suspicious_structure(url):
            score -= 10
        
        # Normalize score
        score = max(0, min(100, score))
        
        return self._create_response(
            url=url,
            domain=domain,
            credibility_score=score,
            is_trusted=score > 70,
            status='unknown' if score >= 50 else 'suspicious'
        )
    
    def _is_suspicious_domain_name(self, domain: str) -> bool:
        """Check if domain name appears suspicious"""
        suspicious_patterns = [
            # Misspellings of popular news sites
            'nyt', 'cnn', 'reuters', 'bbc',
            # Generic or vague names
            'news', 'truth', 'update', 'live',
            # Numbers in domain
            '24', '365', '247',
            # Unusual TLDs
            '.tk', '.ml', '.ga', '.cf'
        ]
        
        domain_lower = domain.lower()
        
        for pattern in suspicious_patterns:
            if pattern in domain_lower and domain not in self.trusted_domains:
                return True
        
        return False
    
    def _has_suspicious_structure(self, url: str) -> bool:
        """Check for suspicious URL structure"""
        parsed = urlparse(url)
        
        # Check if URL is very short (might be shortened)
        if len(url) < 30:
            return True
        
        # Check for suspicious redirects
        if 'redirect' in parsed.query.lower():
            return True
        
        # Check for unusual parameter structures
        if '?utm_source' in url or '&utm_source' in url:
            return False  # Legitimate tracking params
        
        return False
    
    def _create_response(self, url: str, domain: str, credibility_score: float,
                         is_trusted: bool, status: str, reason: str = None) -> Dict[str, Any]:
        """Create credibility analysis response"""
        return {
            'status': 'success',
            'url': url,
            'domain': domain,
            'credibility_score': float(credibility_score),
            'credibility_level': self._get_credibility_level(credibility_score),
            'is_trusted': is_trusted,
            'trust_status': status,
            'reason': reason or self._get_default_reason(credibility_score),
            'factors': {
                'domain_reputation': credibility_score / 100,
                'https_secure': url.startswith('https:'),
                'domain_age': 'unknown',
                'content_quality': 'not_analyzed',
                'source_bias': 'not_analyzed'
            },
            'recommendations': self._get_recommendations(
                credibility_score, is_trusted, status
            ),
            'timestamp': datetime.now().isoformat()
        }
    
    def _get_credibility_level(self, score: float) -> str:
        """Convert score to credibility level"""
        if score >= 85:
            return 'Highly Credible'
        elif score >= 70:
            return 'Credible'
        elif score >= 50:
            return 'Moderate'
        elif score >= 30:
            return 'Low Credibility'
        else:
            return 'Highly Unreliable'
    
    def _get_default_reason(self, score: float) -> str:
        """Get default reason for credibility score"""
        if score >= 85:
            return 'Well-established, reputable news organization'
        elif score >= 70:
            return 'Generally reliable news source'
        elif score >= 50:
            return 'Mixed reputation, requires careful verification'
        elif score >= 30:
            return 'Limited credibility, high risk of misinformation'
        else:
            return 'Known unreliable source, may publish false information'
    
    def _get_recommendations(self, score: float, is_trusted: bool, 
                            status: str) -> list:
        """Get recommendations based on credibility"""
        recommendations = []
        
        if score >= 85:
            recommendations.append("✅ Can generally be trusted")
            recommendations.append("📰 Still recommended to cross-check with other sources")
        elif score >= 70:
            recommendations.append("⚠️ Relatively credible, verify important claims")
            recommendations.append("🔍 Cross-reference with other reputable sources")
        elif score >= 50:
            recommendations.append("🤔 Approach with caution")
            recommendations.append("🔗 Verify claims with multiple trusted sources")
        elif score >= 30:
            recommendations.append("❌ Low credibility source")
            recommendations.append("🔎 Fact-check all claims independently")
            recommendations.append("⚠️ Consider reporting if spreading misinformation")
        else:
            recommendations.append("🚫 Do not trust this source")
            recommendations.append("❌ Do not share or spread content from this source")
            recommendations.append("🚨 Report if actively spreading false information")
        
        return recommendations
    
    def get_domain_reputation(self, domain: str) -> Dict[str, Any]:
        """Get reputation profile for a domain"""
        if domain in self.trusted_domains:
            return {
                'domain': domain,
                'reputation': 'trusted',
                'score': self.trusted_domains[domain],
                'known': True
            }
        elif domain in self.known_fake_sources:
            return {
                'domain': domain,
                'reputation': 'untrustworthy',
                'score': max(0, 50 - self.known_fake_sources[domain]/2),
                'known': True
            }
        else:
            return {
                'domain': domain,
                'reputation': 'unknown',
                'score': 50,
                'known': False
            }
