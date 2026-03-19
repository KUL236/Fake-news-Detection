#!/usr/bin/env python3
"""
Test script for Fake News Detector API
Run this to verify all endpoints work correctly
"""

import requests
import json
from datetime import datetime

API_URL = "http://localhost:5000/api"

def print_result(name, success, data=None):
    """Pretty print test results"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"\n{status} - {name}")
    if data:
        print(f"  {data}")

def test_health():
    """Test health check endpoint"""
    try:
        response = requests.get(f"{API_URL}/health", timeout=5)
        data = response.json()
        success = response.status_code == 200 and data.get('status') == 'healthy'
        print_result("Health Check", success, json.dumps(data, indent=2))
        return success
    except Exception as e:
        print_result("Health Check", False, str(e))
        return False

def test_text_analysis():
    """Test text analysis endpoint"""
    try:
        payload = {
            "text": "This is definitely fake news that needs verification",
            "language": "en"
        }
        response = requests.post(f"{API_URL}/analyze", json=payload, timeout=10)
        success = response.status_code == 200
        data = response.json() if success else response.text
        
        if success:
            classification = data.get('classification')
            confidence = data.get('confidence_score')
            result = f"Classification: {classification}, Confidence: {confidence}%"
            print_result("Text Analysis", True, result)
        else:
            print_result("Text Analysis", False, f"Status {response.status_code}: {data}")
        
        return success
    except Exception as e:
        print_result("Text Analysis", False, str(e))
        return False

def test_url_analysis():
    """Test URL analysis endpoint"""
    try:
        payload = {
            "url": "https://example.com"
        }
        response = requests.post(f"{API_URL}/analyze/url", json=payload, timeout=10)
        # This might fail due to network/URL, but should return proper HTTP status
        success = response.status_code in [200, 400, 404]
        data = response.json() if response.status_code == 200 else response.text
        
        print_result("URL Analysis", success, f"Status {response.status_code}")
        return success
    except Exception as e:
        print_result("URL Analysis", False, str(e))
        return False

def test_sentiment_analysis():
    """Test sentiment analysis endpoint"""
    try:
        payload = {
            "text": "This is amazing and wonderful! I love it so much!"
        }
        response = requests.post(f"{API_URL}/sentiment", json=payload, timeout=10)
        success = response.status_code == 200
        data = response.json() if success else response.text
        
        if success:
            sentiment = data.get('sentiment')
            result = f"Sentiment: {sentiment}"
            print_result("Sentiment Analysis", True, result)
        else:
            print_result("Sentiment Analysis", False, f"Status {response.status_code}: {data}")
        
        return success
    except Exception as e:
        print_result("Sentiment Analysis", False, str(e))
        return False

def test_propaganda_detection():
    """Test propaganda detection endpoint"""
    try:
        payload = {
            "text": "You MUST believe this or you're stupid! Everyone knows the truth!"
        }
        response = requests.post(f"{API_URL}/propaganda", json=payload, timeout=10)
        success = response.status_code == 200
        data = response.json() if success else response.text
        
        if success:
            score = data.get('propaganda_score', 'N/A')
            result = f"Propaganda Score: {score}"
            print_result("Propaganda Detection", True, result)
        else:
            print_result("Propaganda Detection", False, f"Status {response.status_code}: {data}")
        
        return success
    except Exception as e:
        print_result("Propaganda Detection", False, str(e))
        return False

def test_cors_headers():
    """Test CORS headers"""
    try:
        response = requests.options(f"{API_URL}/analyze", timeout=5)
        cors_header = response.headers.get('Access-Control-Allow-Origin', 'NOT SET')
        success = cors_header != 'NOT SET'
        print_result("CORS Headers", success, f"Access-Control-Allow-Origin: {cors_header}")
        return success
    except Exception as e:
        print_result("CORS Headers", False, str(e))
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("🧪 FAKE NEWS DETECTOR API TEST SUITE")
    print("=" * 60)
    print(f"Testing: {API_URL}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    results = {
        "Health Check": test_health(),
        "CORS Headers": test_cors_headers(),
        "Text Analysis": test_text_analysis(),
        "Sentiment Analysis": test_sentiment_analysis(),
        "Propaganda Detection": test_propaganda_detection(),
        "URL Analysis": test_url_analysis(),
    }
    
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅" if result else "❌"
        print(f"{status} {test_name}")
    
    print("=" * 60)
    print(f"Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("✅ ALL TESTS PASSED - API is working correctly!")
    else:
        print(f"⚠️  {total - passed} test(s) failed - see details above")
    
    print("=" * 60)

if __name__ == "__main__":
    main()
