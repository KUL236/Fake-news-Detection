# Database Setup - Fake News Detector

## MongoDB Schema and Configuration

### Collections Overview

#### 1. **users** Collection
Stores user account information and settings.

```json
{
  "_id": ObjectId,
  "username": String,
  "email": String,
  "password_hash": String,
  "created_at": Date,
  "updated_at": Date,
  "preferences": {
    "language": String,
    "theme": String,
    "notifications_enabled": Boolean,
    "auto_analyze": Boolean
  },
  "api_keys": [
    {
      "key": String,
      "created_at": Date,
      "last_used": Date
    }
  ]
}
```

#### 2. **analyses** Collection
Stores all analysis results.

```json
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "text": String,
  "headline": String,
  "url": String,
  "classification": String, // "FAKE" or "REAL"
  "confidence_score": Number,
  "risk_level": String, // critical, high, medium, low
  "suspicious_phrases": [
    {
      "phrase": String,
      "category": String,
      "frequency": Number
    }
  ],
  "sentiment_analysis": {
    "vader_compound": Number,
    "textblob_polarity": Number,
    "emotions": {
      "joy": Number,
      "sadness": Number,
      "anger": Number,
      "fear": Number,
      "surprise": Number,
      "disgust": Number,
      "neutral": Number
    },
    "emotional_intensity": Number,
    "bias_indicators": {
      "left_leaning": Number,
      "right_leaning": Number,
      "religious": Number
    }
  },
  "propaganda_analysis": {
    "propaganda_score": Number,
    "techniques": [String],
    "severity": String
  },
  "source_credibility": {
    "domain": String,
    "domain_trust_level": String,
    "credibility_score": Number,
    "author": String,
    "author_credible": Boolean,
    "https_enabled": Boolean,
    "domain_age_years": Number
  },
  "factcheck_results": [
    {
      "claim": String,
      "rating": String,
      "source": String,
      "url": String
    }
  ],
  "explanation": String,
  "recommendations": [String],
  "features": {
    "word_count": Number,
    "sentence_count": Number,
    "avg_word_length": Number,
    "caps_ratio": Number,
    "punctuation_ratio": Number,
    "readability_score": Number,
    "sentiment_ratio": Number
  },
  "processing_time_ms": Number,
  "model_used": String,
  "created_at": Date,
  "updated_at": Date,
  "is_archived": Boolean
}
```

#### 3. **user_reports** Collection
Stores user-submitted fake news reports.

```json
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "text": String,
  "headline": String,
  "url": String,
  "report_type": String, // "fake", "misleading", "other"
  "reason": String,
  "evidence_url": String,
  "status": String, // "pending", "verified", "rejected"
  "moderator_notes": String,
  "upvotes": Number,
  "downvotes": Number,
  "created_at": Date,
  "updated_at": Date
}
```

#### 4. **trending_topics** Collection
Cached trending fake news topics.

```json
{
  "_id": ObjectId,
  "topic": String,
  "fake_count": Number,
  "real_count": Number,
  "total_count": Number,
  "fake_percentage": Number,
  "confidence_avg": Number,
  "last_updated": Date,
  "period": String, // "daily", "weekly", "monthly"
  "date": Date,
  "sources": [String],
  "keywords": [String]
}
```

#### 5. **analytics** Collection
Contains aggregated statistics.

```json
{
  "_id": ObjectId,
  "metric_type": String, // "daily", "weekly", "monthly", "yearly"
  "date": Date,
  "total_analyses": Number,
  "fake_count": Number,
  "real_count": Number,
  "avg_confidence": Number,
  "models_used": {
    "logistic_regression": Number,
    "naive_bayes": Number,
    "random_forest": Number,
    "bert": Number
  },
  "sentiment_distribution": {
    "positive": Number,
    "negative": Number,
    "neutral": Number
  },
  "risk_distribution": {
    "critical": Number,
    "high": Number,
    "medium": Number,
    "low": Number
  },
  "top_domains": [
    {
      "domain": String,
      "count": Number,
      "fake_percentage": Number
    }
  ],
  "top_phrases": [String],
  "processing_stats": {
    "avg_time_ms": Number,
    "min_time_ms": Number,
    "max_time_ms": Number
  }
}
```

#### 6. **fact_checks** Collection
Cache for fact-checking API responses.

```json
{
  "_id": ObjectId,
  "claim": String,
  "claim_hash": String,
  "google_factcheck": [
    {
      "claim": String,
      "rating": String,
      "fact_checker": String,
      "url": String,
      "author": String
    }
  ],
  "newsapi_results": [
    {
      "title": String,
      "source": String,
      "url": String,
      "published_at": Date
    }
  ],
  "cached_at": Date,
  "expires_at": Date
}
```

#### 7. **source_reputation** Collection
Maintains domain reputation scores.

```json
{
  "_id": ObjectId,
  "domain": String,
  "trust_tier": String, // "tier1", "tier2", "unreliable", "satire"
  "credibility_score": Number,
  "https": Boolean,
  "domain_age_years": Number,
  "known_for_fake_news": Boolean,
  "fake_articles_count": Number,
  "real_articles_count": Number,
  "description": String,
  "categories": [String],
  "staff_found": Number,
  "last_updated": Date,
  "fact_checks_against": Number
}
```

---

## MongoDB Installation & Setup

### Docker Setup

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:6.0
    container_name: fake-news-mongodb
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: your_secure_password
    volumes:
      - mongo_data:/data/db
      - ./init-mongo.js:/docker-entrypoint-initdb.d/init-mongo.js
    networks:
      - fake-news-network
    restart: unless-stopped

volumes:
  mongo_data:

networks:
  fake-news-network:
    driver: bridge
```

### Initialization Script (init-mongo.js)

```javascript
db = new Mongo().getDB("admin");
db.auth("admin", "your_secure_password");

// Create fake_news_detector database
db = db.getSiblingDB("fake_news_detector");

// Create collections with validation
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["username", "email", "password_hash", "created_at"],
      properties: {
        _id: { bsonType: "objectId" },
        username: { bsonType: "string", minLength: 3, maxLength: 50 },
        email: { bsonType: "string", pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$" },
        password_hash: { bsonType: "string" },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" }
      }
    }
  }
});

db.createCollection("analyses");
db.createCollection("user_reports");
db.createCollection("trending_topics");
db.createCollection("analytics");
db.createCollection("fact_checks");
db.createCollection("source_reputation");

// Create indexes for performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });

db.analyses.createIndex({ "user_id": 1, "created_at": -1 });
db.analyses.createIndex({ "classification": 1 });
db.analyses.createIndex({ "created_at": -1 });

db.user_reports.createIndex({ "user_id": 1, "created_at": -1 });
db.user_reports.createIndex({ "status": 1 });

db.trending_topics.createIndex({ "topic": 1 });
db.trending_topics.createIndex({ "period": 1, "date": -1 });

db.analytics.createIndex({ "metric_type": 1, "date": -1 });

db.fact_checks.createIndex({ "claim_hash": 1 });
db.fact_checks.createIndex({ "expires_at": 1 }, { expireAfterSeconds: 0 });

db.source_reputation.createIndex({ "domain": 1 }, { unique: true });

// Create admin user
db.users.insertOne({
  "username": "admin",
  "email": "admin@example.com",
  "password_hash": "$2b$12$...", // Use bcrypt to hash passwords
  "created_at": new Date(),
  "updated_at": new Date(),
  "preferences": {
    "language": "en",
    "theme": "light",
    "notifications_enabled": true,
    "auto_analyze": true
  }
});

print("Database initialized successfully!");
```

---

## Connection Configuration

### Python Connection Pool

```python
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
import os

class MongoDBConnection:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.init_connection()
        return cls._instance
    
    def init_connection(self):
        """Initialize MongoDB connection with connection pooling"""
        mongo_uri = os.getenv('MONGODB_URI', 
            'mongodb://admin:password@localhost:27017/fake_news_detector?authSource=admin')
        
        self.client = MongoClient(
            mongo_uri,
            maxPoolSize=50,
            minPoolSize=10,
            maxIdleTimeMS=45000,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=10000,
            socketTimeoutMS=None,
            retryWrites=True,
            w='majority'
        )
        
        try:
            self.client.admin.command('ping')
            print("✓ MongoDB connection successful")
        except ConnectionFailure as e:
            print(f"✗ MongoDB connection failed: {e}")
            raise
    
    def get_database(self):
        """Get database instance"""
        return self.client['fake_news_detector']
    
    def get_collection(self, collection_name):
        """Get collection instance"""
        db = self.get_database()
        return db[collection_name]
    
    def close_connection(self):
        """Close connection pool"""
        self.client.close()
        print("MongoDB connection closed")

# Usage
db_connection = MongoDBConnection()
db = db_connection.get_database()
```

---

## Database Operations Examples

### Create Analysis Record

```python
def save_analysis(user_id, analysis_result, text, headline, url=None):
    """Save analysis result to database"""
    db = MongoDBConnection().get_database()
    
    analysis_doc = {
        "user_id": ObjectId(user_id),
        "text": text,
        "headline": headline,
        "url": url,
        "classification": analysis_result['classification'],
        "confidence_score": analysis_result['confidence_score'],
        "risk_level": analysis_result['risk_level'],
        "suspicious_phrases": analysis_result.get('suspicious_phrases', []),
        "sentiment_analysis": analysis_result.get('sentiment_analysis', {}),
        "propaganda_analysis": analysis_result.get('propaganda_analysis', {}),
        "explanation": analysis_result['explanation'],
        "recommendations": analysis_result.get('recommendations', []),
        "features": analysis_result.get('features', {}),
        "processing_time_ms": analysis_result.get('processing_time_ms', 0),
        "model_used": analysis_result.get('model_used', 'ensemble'),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "is_archived": False
    }
    
    result = db['analyses'].insert_one(analysis_doc)
    return str(result.inserted_id)
```

### Retrieve Analysis History

```python
def get_user_analyses(user_id, limit=10, skip=0):
    """Get user's analysis history"""
    db = MongoDBConnection().get_database()
    
    analyses = list(db['analyses'].find(
        {"user_id": ObjectId(user_id)},
        sort=[("created_at", -1)],
        skip=skip,
        limit=limit
    ))
    
    return analyses
```

### Update Analytics

```python
def update_daily_analytics():
    """Update daily statistics"""
    db = MongoDBConnection().get_database()
    
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    stats = list(db['analyses'].aggregate([
        {
            "$match": {
                "created_at": {
                    "$gte": today,
                    "$lt": today + timedelta(days=1)
                }
            }
        },
        {
            "$group": {
                "_id": None,
                "total_count": {"$sum": 1},
                "fake_count": {
                    "$sum": {"$cond": [{"$eq": ["$classification", "FAKE"]}, 1, 0]}
                },
                "real_count": {
                    "$sum": {"$cond": [{"$eq": ["$classification", "REAL"]}, 1, 0]}
                },
                "avg_confidence": {"$avg": "$confidence_score"}
            }
        }
    ]))
    
    if stats:
        db['analytics'].update_one(
            {"metric_type": "daily", "date": today},
            {"$set": {
                **stats[0],
                "metric_type": "daily",
                "date": today
            }},
            upsert=True
        )
```

---

## Backup & Restore

### Backup Procedures

```bash
# Full database backup
mongodump --uri "mongodb://admin:password@localhost:27017" \
          --authenticationDatabase admin \
          --out ./backups/$(date +%Y%m%d)

# Backup specific collection
mongodump --uri "mongodb://admin:password@localhost:27017" \
          --authenticationDatabase admin \
          --db fake_news_detector \
          --collection analyses \
          --out ./backups/analyses_$(date +%Y%m%d)
```

### Restore Procedures

```bash
# Full restore
mongorestore --uri "mongodb://admin:password@localhost:27017" \
             --authenticationDatabase admin \
             ./backups/20240317

# Restore specific collection
mongorestore --uri "mongodb://admin:password@localhost:27017" \
             --authenticationDatabase admin \
             --db fake_news_detector \
             --collection analyses \
             ./backups/analyses_20240317/fake_news_detector/analyses.bson
```

---

## Performance Optimization

### Connection Pooling Best Practices
- Min pool: 10 connections
- Max pool: 50 connections  
- Max idle time: 45 seconds
- Server selection timeout: 5 seconds

### Query Optimization
- Create compound indexes for frequent queries
- Use projection to limit returned fields
- Implement pagination for large datasets
- Use aggregation pipeline for complex queries

### Caching Strategy
- Cache fact-check results for 24 hours
- Cache trending topics updates every 1 hour
- Use Redis for session management
- Implement query result caching

---

## Monitoring

### Health Check Query

```python
def health_check():
    """Check MongoDB connection health"""
    try:
        db = MongoDBConnection().get_database()
        db.command('ping')
        
        stats = db.command('collStats', 'analyses')
        return {
            'status': 'healthy',
            'documents': stats.get('count', 0),
            'avg_doc_size': stats.get('avgObjSize', 0)
        }
    except Exception as e:
        return {
            'status': 'unhealthy',
            'error': str(e)
        }
```

---

## Security Best Practices

✅ **Enabled:**
- Authentication (username/password)
- Authorization (roles and permissions)
- Encryption in transit (TLS/SSL)
- Field-level encryption for sensitive data
- Database-level backups

⚠️ **Recommended:**
- Network segmentation (VPC/firewall)
- IP whitelist for connections
- Regular security audits
- Encryption at rest
- Automated backup rotation

