# 📚 API Documentation - Fake News Detection System

Complete REST API reference for the Fake News Detection System.

## Base URL

```
http://localhost:5000/api
```

## Authentication

All requests should include the API key in headers (for production):

```bash
-H "X-API-Key: your-api-key"
```

---

## Table of Contents

1. [Core Analysis Endpoints](#core-analysis-endpoints)
2. [Advanced Analysis](#advanced-analysis)
3. [Analytics & Dashboard](#analytics--dashboard)
4. [User Operations](#user-operations)
5. [System Endpoints](#system-endpoints)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)
8. [Examples](#examples)

---

## Core Analysis Endpoints

### 1. Analyze Single Article

**Endpoint**: `POST /api/analyze`

Analyze a single news article or headline for fake news.

**Request**:
```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Your news article text here",
    "headline": "Optional headline",
    "url": "https://source-url.com/article"
  }'
```

**Request Body**:
```json
{
  "text": "Full article text (required, min 10 chars)",
  "headline": "Article headline (optional)",
  "url": "Source URL (optional)"
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "fake_confidence": 0.87,
  "is_fake": true,
  "classification": "FAKE",
  "confidence_level": "High",
  "probability": {
    "fake": 0.87,
    "real": 0.13
  },
  "explanation": "Multiple indicators suggest this is likely fake news. Found suspicious words suggesting emotional manipulation...",
  "suspicious_phrases": [
    {
      "phrase": "unverified sources claim",
      "severity": 3,
      "severity_level": "high"
    },
    {
      "phrase": "allegedly revealed",
      "severity": 2,
      "severity_level": "medium"
    }
  ],
  "sentiment_analysis": {
    "sentiment": "negative",
    "compound_score": -0.65,
    "positive": 0.12,
    "negative": 0.88,
    "neutral": 0.0,
    "is_emotionally_charged": true,
    "is_highly_subjective": true
  },
  "propaganda_score": 0.72,
  "recommendations": [
    "❌ DO NOT SHARE - High fake news probability",
    "🔍 Verify with multiple trusted news sources",
    "📢 Report to social media platform"
  ],
  "url_analysis": {
    "domain": "example.com",
    "is_trusted_domain": false,
    "has_https": true,
    "url_type": "normal"
  },
  "timestamp": "2024-03-16T10:30:00Z"
}
```

**Status Codes**:
- `200 OK` - Analysis successful
- `400 Bad Request` - Invalid input
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Detectors not loaded

---

### 2. Batch Analysis

**Endpoint**: `POST /api/analyze/batch`

Analyze multiple texts at once.

**Request**:
```bash
curl -X POST http://localhost:5000/api/analyze/batch \
  -H "Content-Type: application/json" \
  -d '{
    "texts": [
      "First article text",
      "Second article text",
      "Third article text"
    ]
  }'
```

**Request Body**:
```json
{
  "texts": ["text1", "text2", "text3"]
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "total_analyzed": 3,
  "results": [
    { /* analysis result 1 */ },
    { /* analysis result 2 */ },
    { /* analysis result 3 */ }
  ]
}
```

**Limitations**:
- Maximum 100 texts per batch
- Each text max 50KB

---

### 3. Analyze from URL

**Endpoint**: `POST /api/analyze/url`

Fetch and analyze article from URL.

**Request**:
```bash
curl -X POST http://localhost:5000/api/analyze/url \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/news/article"
  }'
```

**Response** (200 OK):
```json
{
  "status": "success",
  "url": "https://example.com/news/article",
  "fake_confidence": 0.45,
  "is_fake": false,
  "classification": "REAL",
  /* ... rest of analysis ... */
}
```

**Errors**:
- `400 Bad Request` - No URL provided
- `400 Bad Request` - Failed to fetch URL
- `500 Internal Server Error` - Analysis failed

---

## Advanced Analysis

### 1. Sentiment Analysis

**Endpoint**: `POST /api/sentiment`

Analyze sentiment and emotional content.

**Request**:
```bash
curl -X POST http://localhost:5000/api/sentiment \
  -H "Content-Type: application/json" \
  -d '{"text": "Your text here"}'
```

**Response** (200 OK):
```json
{
  "sentiment": {
    "compound": -0.65,
    "positive": 0.12,
    "negative": 0.88,
    "neutral": 0.0,
    "label": "negative"
  },
  "polarity": -0.75,
  "subjectivity": 0.85,
  "emotional_words": {
    "positive": 0,
    "negative": 5,
    "fear": 2,
    "anger": 1,
    "surprise": 0
  },
  "emotional_intensity": 0.75,
  "is_emotionally_charged": true,
  "is_highly_subjective": true,
  "timestamp": "2024-03-16T10:30:00Z"
}
```

---

### 2. Propaganda Detection

**Endpoint**: `POST /api/propaganda`

Detect propaganda techniques in text.

**Request**:
```bash
curl -X POST http://localhost:5000/api/propaganda \
  -H "Content-Type: application/json" \
  -d '{"text": "Your text here"}'
```

**Response** (200 OK):
```json
{
  "overall_propaganda_score": 0.68,
  "is_propagandistic": true,
  "techniques_detected": 3,
  "detected_techniques": [
    {
      "technique": "emotional_appeal",
      "count": 4,
      "confidence": 0.8,
      "severity": "High"
    },
    {
      "technique": "bandwagon",
      "count": 2,
      "confidence": 0.6,
      "severity": "Moderate"
    }
  ],
  "severity_level": "High",
  "recommendations": [
    "⚠️ This content uses multiple propaganda techniques",
    "🔍 Carefully verify all claims made in this content"
  ]
}
```

**Detected Techniques**:
- `bandwagon` - Appeal to common belief
- `appeal_to_authority` - Citation of authority
- `emotional_appeal` - Emotional manipulation
- `fear_appeal` - Fear-based messaging
- `loaded_language` - Biased language
- `hasty_generalization` - Overgeneralization
- `straw_man` - Misrepresentation of argument
- `ad_hominem` - Personal attacks
- `false_dilemma` - False choice presentation
- `appeal_to_tradition` - Traditional values appeal

---

### 3. Fact-Checking

**Endpoint**: `POST /api/factcheck`

Check claims against fact-checking databases.

**Request**:
```bash
curl -X POST http://localhost:5000/api/factcheck \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Main claim to verify",
    "claims": ["supporting claim 1", "supporting claim 2"]
  }'
```

**Response** (200 OK):
```json
{
  "claim": "Main claim",
  "verification_status": "verified",
  "fact_checks": [
    {
      "source": "Google Fact Check",
      "claim": "Verified claim",
      "claimant": "John Doe",
      "rating": "False",
      "url": "https://factcheck.org/...",
      "date": "2024-01-15"
    }
  ],
  "overall_rating": "False"
}
```

---

### 4. Source Credibility Analysis

**Endpoint**: `POST /api/source-credibility`

Analyze credibility of news source.

**Request**:
```bash
curl -X POST http://localhost:5000/api/source-credibility \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

**Response** (200 OK):
```json
{
  "domain": "example.com",
  "credibility_score": 85,
  "credibility_level": "Credible",
  "is_trusted": true,
  "trust_status": "trusted",
  "reason": "Well-established, reputable news organization",
  "factors": {
    "domain_reputation": 0.85,
    "https_secure": true,
    "domain_age": "2005",
    "content_quality": "high",
    "source_bias": "moderate"
  },
  "recommendations": [
    "✅ Can generally be trusted",
    "📰 Still recommended to cross-check with other sources"
  ]
}
```

---

## Analytics & Dashboard

### 1. Analytics Overview

**Endpoint**: `GET /api/analytics/overview`

Get overall analytics dashboard data.

**Response** (200 OK):
```json
{
  "timestamp": "2024-03-16T10:30:00Z",
  "metrics": {
    "total_analyzed": 2847,
    "fake_detected": 1256,
    "real_detected": 1591,
    "accuracy_rate": 0.942,
    "avg_confidence": 0.87
  },
  "top_trends": [
    {
      "topic": "Health misinformation",
      "count": 15
    }
  ]
}
```

---

### 2. Trending Topics

**Endpoint**: `GET /api/analytics/trend`

Get trending fake news topics.

**Response** (200 OK):
```json
{
  "timestamp": "2024-03-16T10:30:00Z",
  "trends": [
    {
      "topic": "Health misinformation",
      "occurrences": 15,
      "confidence_avg": 0.89
    }
  ]
}
```

---

### 3. User Reports

**Endpoint**: `GET /api/analytics/reports`

Get user-submitted fake news reports.

**Response** (200 OK):
```json
{
  "timestamp": "2024-03-16T10:30:00Z",
  "total_reports": 126,
  "reports": [
    {
      "id": 1,
      "headline": "Sample fake news",
      "reports": 5,
      "confidence": 0.92,
      "createdAt": "2024-03-10"
    }
  ]
}
```

---

## User Operations

### 1. Report Fake News

**Endpoint**: `POST /api/report/fake-news`

Submit a fake news report.

**Request**:
```bash
curl -X POST http://localhost:5000/api/report/fake-news \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://fake-news-source.com/article",
    "reason": "Contains false claims about COVID-19",
    "headline": "Optional article headline"
  }'
```

**Response** (201 Created):
```json
{
  "status": "success",
  "message": "Report submitted successfully",
  "report_id": 12345,
  "timestamp": "2024-03-16T10:30:00Z"
}
```

---

## System Endpoints

### 1. Health Check

**Endpoint**: `GET /api/health`

Check system health and service availability.

**Response** (200 OK):
```json
{
  "status": "healthy",
  "timestamp": "2024-03-16T10:30:00Z",
  "services": {
    "detector": true,
    "sentiment": true,
    "propaganda": true,
    "factcheck": true,
    "source_analyzer": true
  }
}
```

---

### 2. Available Models

**Endpoint**: `GET /api/models`

Get list of available ML models.

**Response** (200 OK):
```json
{
  "available_models": [
    {
      "name": "Logistic Regression",
      "type": "sklearn",
      "accuracy": 0.94,
      "enabled": true
    }
  ]
}
```

---

### 3. Configuration

**Endpoint**: `GET /api/config`

Get system configuration.

**Response** (200 OK):
```json
{
  "version": "1.0.0",
  "features": {
    "sentiment_analysis": true,
    "propaganda_detection": true,
    "fact_checking": true
  }
}
```

---

## Error Handling

### Error Response Format

All errors return JSON with status code:

```json
{
  "status": "error",
  "error": "Error description",
  "message": "Detailed error message",
  "timestamp": "2024-03-16T10:30:00Z"
}
```

### Common Error Codes

| Code | Error | Description |
|------|-------|-------------|
| 400 | Bad Request | Invalid input or missing required fields |
| 401 | Unauthorized | Missing or invalid API key |
| 403 | Forbidden | Access denied |
| 404 | Not Found | Endpoint not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 503 | Service Unavailable | Detector or service not available |
| 500 | Internal Error | Server error |

---

## Rate Limiting

- **Limit**: 60 requests per minute per API key
- **Header**: `X-RateLimit-Remaining`, `X-RateLimit-Reset`

```bash
# Check rate limit
curl -I http://localhost:5000/api/analyze
# Look for X-RateLimit-* headers
```

---

## Examples

### Example 1: Full Article Analysis

```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Breaking News: Scientists discover new treatment for disease. Unverified sources claim the cure was hidden by pharmaceutical companies. Many people say they have been cured. Join the movement today!",
    "headline": "EXCLUSIVE: Cure Hidden By Big Pharma"
  }' | jq .
```

Expected output: High fake confidence (>70%) due to suspicious phrases and propaganda.

### Example 2: Source Verification

```bash
curl -X POST http://localhost:5000/api/source-credibility \
  -H "Content-Type: application/json" \
  -d '{"url": "https://reuters.com"}' | jq .
```

Expected output: High credibility score (>90%) for established news source.

### Example 3: Batch Analysis

```bash
curl -X POST http://localhost:5000/api/analyze/batch \
  -H "Content-Type: application/json" \
  -d '{
    "texts": [
      "Article 1 text here",
      "Article 2 text here",
      "Article 3 text here"
    ]
  }' | jq .
```

---

## SDK Examples

### Python

```python
import requests

API_URL = "http://localhost:5000/api"

def analyze_news(text, headline=""):
    response = requests.post(
        f"{API_URL}/analyze",
        json={"text": text, "headline": headline}
    )
    return response.json()

result = analyze_news("Your news text")
print(f"Confidence: {result['fake_confidence']:.0%}")
```

### JavaScript

```javascript
const API_URL = "http://localhost:5000/api";

async function analyzeNews(text, headline = "") {
  const response = await fetch(`${API_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, headline })
  });
  return response.json();
}

const result = await analyzeNews("Your news text");
console.log(`Confidence: ${(result.fake_confidence * 100).toFixed(0)}%`);
```

### cURL

```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "Your news text"}' \
  | python -m json.tool
```

---

## Changelog

### v1.0.0 (2024-03-16)
- Initial release
- Core fake news detection
- Sentiment analysis
- Propaganda detection
- Source credibility analysis
- Fact-checking integration
- Analytics dashboard
- REST API

---

## Support

For API support:
- **GitHub Issues**: https://github.com/yourusername/fake-news-detector/issues
- **Email**: support@example.com
- **Documentation**: https://github.com/yourusername/fake-news-detector/wiki

---

**Last Updated**: March 2024
