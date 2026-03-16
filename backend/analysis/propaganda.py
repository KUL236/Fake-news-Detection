"""
Propaganda Detection Module
Detects propaganda techniques in text
"""

from typing import Dict, List, Any
import re


class PropagandaDetector:
    """Detect propaganda techniques and manipulation tactics"""
    
    def __init__(self):
        """Initialize propaganda detector"""
        self.propaganda_techniques = self._load_propaganda_techniques()
    
    def _load_propaganda_techniques(self) -> Dict[str, List[str]]:
        """Load propaganda technique keywords"""
        return {
            'bandwagon': [
                'everyone believes', 'everybody is saying', 'join the movement',
                'all people think', 'the majority says', 'trending', 'viral'
            ],
            'appeal_to_authority': [
                'experts say', 'scientist claim', 'official stated', 'professor believes',
                'doctor says', 'study shows', 'research indicates', 'authority confirms'
            ],
            'emotional_appeal': [
                'feel', 'heart', 'heartbreaking', 'devastating', 'tragic',
                'emotional', 'touching', 'moving', 'inspiring', 'beautiful'
            ],
            'fear_appeal': [
                'danger', 'threat', 'attack', 'beware', 'warning',
                'alarming', 'terrifying', 'scared', 'afraid', 'anxious'
            ],
            'loaded_language': [
                'evil', 'corrupt', 'criminal', 'dishonest', 'deceptive',
                'liar', 'idiot', 'fool', 'fool-hardy', 'despicable'
            ],
            'hasty_generalization': [
                'all', 'always', 'never', 'everyone', 'nobody', 'clearly',
                'obviously', 'apparently', 'evidently', 'undoubtedly'
            ],
            'straw_man': [
                'they claim', 'some say', 'allegedly', 'supposedly',
                'reportedly', 'unconfirmed sources', 'rumor has it'
            ],
            'ad_hominem': [
                'opponent is', 'they are all', 'their kind', 'people like that',
                'such people', 'group X is all', 'typical behavior'
            ],
            'false_dilemma': [
                'either', 'or', 'only choice', 'no other option', 'must choose',
                'it\'s now or never', 'do or die', 'sink or swim'
            ],
            'appeal_to_tradition': [
                'always been', 'traditional values', 'the way we do things',
                'time-tested', 'proven way', 'established practice'
            ]
        }
    
    def detect(self, text: str) -> Dict[str, Any]:
        """
        Detect propaganda techniques in text
        
        Args:
            text: Text to analyze
            
        Returns:
            Dictionary with detected techniques and scores
        """
        text_lower = text.lower()
        
        detected_techniques = []
        technique_scores = {}
        
        # Detect each technique
        for technique, keywords in self.propaganda_techniques.items():
            count = sum(text_lower.count(keyword) for keyword in keywords)
            
            if count > 0:
                score = min(count / len(self.propaganda_techniques[technique]), 1.0)
                technique_scores[technique] = score
                
                detected_techniques.append({
                    'technique': technique,
                    'count': count,
                    'confidence': float(score),
                    'severity': self._get_severity(score)
                })
        
        # Calculate overall propaganda score
        overall_score = self._calculate_overall_score(technique_scores)
        
        # Get recommendations
        recommendations = self._get_recommendations(detected_techniques, overall_score)
        
        return {
            'status': 'success',
            'overall_propaganda_score': float(overall_score),
            'is_propagandistic': overall_score > 0.5,
            'techniques_detected': len(detected_techniques),
            'detected_techniques': detected_techniques,
            'technique_scores': {k: float(v) for k, v in technique_scores.items()},
            'severity_level': self._get_overall_severity(overall_score),
            'recommendations': recommendations
        }
    
    def _calculate_overall_score(self, technique_scores: Dict[str, float]) -> float:
        """Calculate overall propaganda score"""
        if not technique_scores:
            return 0.0
        
        # Average of all detected techniques
        avg_score = sum(technique_scores.values()) / len(technique_scores)
        
        # Weight by number of techniques
        num_techniques = len(technique_scores)
        diversity_factor = min(num_techniques / 5, 1.0)
        
        # Combine average and diversity
        overall = (avg_score * 0.7) + (diversity_factor * 0.3)
        
        return overall
    
    def _get_severity(self, score: float) -> str:
        """Get severity level for individual technique"""
        if score >= 0.7:
            return 'High'
        elif score >= 0.4:
            return 'Moderate'
        else:
            return 'Low'
    
    def _get_overall_severity(self, score: float) -> str:
        """Get overall severity level"""
        if score >= 0.8:
            return 'Critical'
        elif score >= 0.6:
            return 'High'
        elif score >= 0.4:
            return 'Moderate'
        else:
            return 'Low'
    
    def _get_recommendations(self, techniques: List[Dict], 
                            overall_score: float) -> List[str]:
        """Get recommendations based on detected techniques"""
        recommendations = []
        
        if overall_score >= 0.7:
            recommendations.append("⚠️ This content uses multiple propaganda techniques")
            recommendations.append("🔍 Carefully verify all claims made in this content")
            recommendations.append("❌ Do not share without independent verification")
        elif overall_score >= 0.5:
            recommendations.append("⚡ This content shows signs of propaganda")
            recommendations.append("📚 Check credible sources for corroboration")
        
        # Technique-specific recommendations
        if any(t['technique'] == 'appeal_to_authority' for t in techniques):
            recommendations.append("👨‍⚖️ Verify any 'expert' sources cited")
        
        if any(t['technique'] == 'emotional_appeal' for t in techniques):
            recommendations.append("💭 Don't let emotions override critical thinking")
        
        if any(t['technique'] == 'fear_appeal' for t in techniques):
            recommendations.append("🛡️ Question fear-based messaging")
        
        if any(t['technique'] == 'false_dilemma' for t in techniques):
            recommendations.append("🤔 Consider alternatives beyond presented options")
        
        return recommendations
