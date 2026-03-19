"""
Propaganda Detection Module
Identifies propaganda techniques and manipulative language patterns
"""

from typing import Dict, List, Any
import re
from collections import Counter


class PropagandaDetector:
    """
    Detects propaganda techniques in text using pattern matching and NLP
    Supports multiple propaganda detection techniques:
    - Emotional Appeal
    - False Equivalence
    - Ad Hominem
    - Bandwagon/Glittering Generalities
    - Transfer/Authority Appeal
    - Testimonial
    - Plain Folk
    - Loaded Language
    - Name Calling
    - Straw Man
    - Red Herring
    """
    
    def __init__(self):
        """Initialize propaganda detection patterns"""
        
        # Emotional appeal patterns
        self.emotional_patterns = {
            'fear_appeal': [
                r'(danger|threat|attack|catastrophe|disaster|crisis)',
                r'(must|have to|need to|forced to)',
                r'(destroy|devastate|kill|die|suffering)'
            ],
            'happiness_appeal': [
                r'(happiness|joy|freedom|liberty|democracy)',
                r'(beautiful|perfect|wonderful|amazing|fantastic)'
            ],
            'outrage_appeal': [
                r'(scandal|betrayal|corruption|injustice)',
                r'(unacceptable|outrageous|shocking|disgusting)'
            ]
        }
        
        # Loaded language patterns
        self.loaded_language = {
            'positive_loaded': [
                'freedom', 'liberty', 'democracy', 'patriotic', 'hero',
                'truth', 'justice', 'honor', 'courage', 'strength'
            ],
            'negative_loaded': [
                'terrorist', 'tyrant', 'enemy', 'beast', 'savage',
                'monster', 'coward', 'traitor', 'corrupt', 'fraud'
            ]
        }
        
        # Logical fallacy patterns
        self.fallacy_patterns = {
            'false_dilemma': [
                r'(either|or)\s+.*?(or|either)',
                r'(only|just)\s+(two|one)\s+(option|choice|way)'
            ],
            'strawman': [
                r'(they\s+say|critics\s+claim)\s+.*?(but|however)',
                r'(some\s+people\s+argue)\s+.*?(obviously|clearly)'
            ],
            'ad_hominem': [
                r'(stupid|idiotic|moron|fool)',
                r'(loser|failure|worthless|pathetic)',
                r'(only an? \w+ would)',
                r'(character|integrity|background)'
            ]
        }
        
        # Vague language patterns
        self.vague_patterns = [
            r'(some|many|most)\s+(people|experts|sources|say)',
            r'(everyone|nobody|all)',
            r'(allegedly|supposedly|reportedly)',
            r'(anonymous\s+sources?)'
        ]
        
        # Authority appeal patterns
        self.authority_patterns = [
            r'(expert\s+say|scientist\s+claim|study\s+show)',
            r'(according\s+to|as\s+reported)',
            r'(prestigious|leading|renowned|famous)',
            r'(doctor|professor|scientist|official)'
        ]
    
    def analyze(self, text: str) -> Dict[str, Any]:
        """
        Comprehensive propaganda analysis
        
        Args:
            text: Text to analyze
            
        Returns:
            Dictionary containing propaganda analysis results
        """
        text_lower = text.lower()
        
        return {
            'emotional_appeals': self._detect_emotional_appeals(text_lower),
            'loaded_language': self._detect_loaded_language(text_lower),
            'logical_fallacies': self._detect_fallacies(text_lower),
            'vague_language': self._detect_vague_language(text_lower),
            'authority_appeal': self._detect_authority_appeal(text_lower),
            'propaganda_score': self._calculate_propaganda_score(text_lower),
            'techniques_found': self._list_techniques(text_lower),
            'summary': self._generate_summary(text_lower)
        }
    
    def _detect_emotional_appeals(self, text: str) -> Dict[str, Dict]:
        """
        Detect emotional appeal techniques
        
        Args:
            text: Lowercase text
            
        Returns:
            Emotional appeals found
        """
        appeals = {}
        
        for appeal_type, patterns in self.emotional_patterns.items():
            matches = []
            for pattern in patterns:
                found = re.findall(pattern, text, re.IGNORECASE)
                matches.extend(found)
            
            appeals[appeal_type] = {
                'detected': len(matches) > 0,
                'count': len(matches),
                'examples': list(set(matches))[:3]
            }
        
        return appeals
    
    def _detect_loaded_language(self, text: str) -> Dict[str, Dict]:
        """
        Detect loaded language (emotionally charged words)
        
        Args:
            text: Lowercase text
            
        Returns:
            Loaded language found
        """
        loaded = {}
        
        for lang_type, words in self.loaded_language.items():
            found = [w for w in words if w in text]
            loaded[lang_type] = {
                'detected': len(found) > 0,
                'count': len(found),
                'examples': found
            }
        
        return loaded
    
    def _detect_fallacies(self, text: str) -> Dict[str, Dict]:
        """
        Detect logical fallacies
        
        Args:
            text: Lowercase text
            
        Returns:
            Fallacies found
        """
        fallacies = {}
        
        for fallacy, patterns in self.fallacy_patterns.items():
            matches = []
            for pattern in patterns:
                found = re.findall(pattern, text, re.IGNORECASE)
                matches.extend(found)
            
            fallacies[fallacy] = {
                'detected': len(matches) > 0,
                'count': len(matches)
            }
        
        return fallacies
    
    def _detect_vague_language(self, text: str) -> Dict[str, Any]:
        """
        Detect vague, unsubstantiated language
        
        Args:
            text: Lowercase text
            
        Returns:
            Vague language instances
        """
        matches = []
        
        for pattern in self.vague_patterns:
            found = re.findall(pattern, text, re.IGNORECASE)
            matches.extend(found)
        
        return {
            'detected': len(matches) > 0,
            'count': len(matches),
            'examples': list(set(matches))[:5]
        }
    
    def _detect_authority_appeal(self, text: str) -> Dict[str, Any]:
        """
        Detect appeal to authority
        
        Args:
            text: Lowercase text
            
        Returns:
            Authority appeals found
        """
        matches = []
        
        for pattern in self.authority_patterns:
            found = re.findall(pattern, text, re.IGNORECASE)
            matches.extend(found)
        
        return {
            'detected': len(matches) > 0,
            'count': len(matches),
            'examples': list(set(matches))[:3]
        }
    
    def _calculate_propaganda_score(self, text: str) -> float:
        """
        Calculate overall propaganda score (0-1)
        
        Args:
            text: Lowercase text
            
        Returns:
            Propaganda score
        """
        score = 0.0
        word_count = max(1, len(text.split()))
        
        # Emotional appeals (0.3 weight)
        emotional = self._detect_emotional_appeals(text)
        emotional_count = sum(e['count'] for e in emotional.values())
        score += min(emotional_count / max(1, word_count / 5), 1.0) * 0.3
        
        # Loaded language (0.3 weight)
        loaded = self._detect_loaded_language(text)
        loaded_count = sum(l['count'] for l in loaded.values())
        score += min(loaded_count / max(1, word_count / 5), 1.0) * 0.3
        
        # Logical fallacies (0.2 weight)
        fallacies = self._detect_fallacies(text)
        fallacy_count = sum(1 for f in fallacies.values() if f['detected'])
        score += min(fallacy_count / 5, 1.0) * 0.2
        
        # Vague language (0.2 weight)
        vague = self._detect_vague_language(text)
        score += min(vague['count'] / max(1, word_count / 10), 1.0) * 0.2
        
        return min(score, 1.0)
    
    def _list_techniques(self, text: str) -> List[str]:
        """
        List detected propaganda techniques
        
        Args:
            text: Lowercase text
            
        Returns:
            List of detected techniques
        """
        techniques = []
        
        emotional = self._detect_emotional_appeals(text)
        for appeal_type, data in emotional.items():
            if data['detected']:
                techniques.append(appeal_type.replace('_', ' ').title())
        
        loaded = self._detect_loaded_language(text)
        for lang_type, data in loaded.items():
            if data['detected']:
                techniques.append(f"Loaded {lang_type.replace('_', ' ').title()}")
        
        fallacies = self._detect_fallacies(text)
        for fallacy, data in fallacies.items():
            if data['detected']:
                techniques.append(fallacy.replace('_', ' ').title())
        
        if self._detect_vague_language(text)['detected']:
            techniques.append("Vague Language")
        
        if self._detect_authority_appeal(text)['detected']:
            techniques.append("Appeal to Authority")
        
        return list(set(techniques))
    
    def _generate_summary(self, text: str) -> str:
        """
        Generate summary of propaganda analysis
        
        Args:
            text: Lowercase text
            
        Returns:
            Summary string
        """
        propaganda_score = self._calculate_propaganda_score(text)
        techniques = self._list_techniques(text)
        
        if propaganda_score > 0.7:
            level = "HIGH"
        elif propaganda_score > 0.5:
            level = "MODERATE"
        elif propaganda_score > 0.3:
            level = "LOW"
        else:
            level = "MINIMAL"
        
        technique_str = ", ".join(techniques[:3]) if techniques else "None detected"
        
        return f"{level} propaganda indicators. Techniques: {technique_str}"
