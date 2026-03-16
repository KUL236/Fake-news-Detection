# 🚀 Deployment Guide - Fake News Detection System

Complete deployment guide for production and development environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Development Setup](#development-setup)
3. [Docker Deployment](#docker-deployment)
4. [Cloud Deployment](#cloud-deployment)
5. [Configuration](#configuration)
6. [Monitoring & Logging](#monitoring--logging)
7. [Troubleshooting](#troubleshooting)
8. [Security](#security)

---

## Prerequisites

### System Requirements
- OS: Linux, macOS, or Windows (with WSL2)
- CPU: 2+ cores
- RAM: 4GB minimum, 8GB recommended
- Storage: 10GB free space

### Required Software
- **Docker & Docker Compose** (v20.10+)
- **Python** 3.8+ (for local development)
- **Node.js** 14+ (for frontend development)
- **Git**
- **curl** (for health checks)

### API Keys Required
- Google Fact Check API Key
- NewsAPI Key
- MongoDB credentials (if using remote)

---

## Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/fake-news-detector.git
cd fake-news-detector
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r ../requirements.txt

# Download NLTK data
python -m nltk.downloader punkt stopwords

# Download spaCy model
python -m spacy download en_core_web_sm

# Set environment variables
export FLASK_ENV=development
export FLASK_APP=app.py

# Run Flask server
python app.py
```

Server will start at: `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will start at: `http://localhost:3000`

### 4. Model Training (Optional)

```bash
# Navigate to ML directory
cd backend/ml

# Train models on dataset
python train_models.py

# Models will be saved to backend/models/
```

---

## Docker Deployment

### Quick Start with Docker Compose

```bash
# Clone repository
git clone https://github.com/yourusername/fake-news-detector.git
cd fake-news-detector

# Copy environment file
cp .env.example .env
nano .env  # Edit with your API keys

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
```

### Access Services

- **API**: http://localhost:5000
- **Frontend**: http://localhost:3000
- **MongoDB**: localhost:27017
- **Nginx**: http://localhost:80

### Useful Commands

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Rebuild images
docker-compose build --no-cache

# Run specific service
docker-compose up -d backend

# Execute command in container
docker-compose exec backend python ml/train_models.py

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Scale services (if load balancing)
docker-compose up -d --scale backend=3
```

---

## Cloud Deployment

### AWS EC2 Deployment

```bash
# 1. Launch EC2 instance
# - Ubuntu 20.04 LTS
# - t3.medium or larger
# - Security group: Allow ports 22, 80, 443

# 2. SSH into instance
ssh -i your-key.pem ubuntu@your-instance-ip

# 3. Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# 4. Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 5. Clone and setup
git clone https://github.com/yourusername/fake-news-detector.git
cd fake-news-detector
cp .env.example .env
nano .env  # Add your config

# 6. Start services
docker-compose up -d

# 7. Setup SSL with Let's Encrypt
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d your-domain.com
# Update nginx.conf with SSL certificates
```

### Heroku Deployment

```bash
# 1. Install Heroku CLI
curl https://cli.heroku.com/install.sh | sh

# 2. Log in
heroku login

# 3. Create app
heroku create your-app-name

# 4. Add buildpack
heroku buildpacks:add --index 1 heroku/python
heroku buildpacks:add --index 2 heroku/nodejs

# 5. Deploy
git push heroku main

# 6. View logs
heroku logs --tail
```

### Google Cloud Run Deployment

```bash
# 1. Authenticate
gcloud auth login
gcloud config set project your-project-id

# 2. Build image
docker build -t gcr.io/your-project-id/fake-news-detector .

# 3. Push to Container Registry
docker push gcr.io/your-project-id/fake-news-detector

# 4. Deploy to Cloud Run
gcloud run deploy fake-news-detector \
  --image gcr.io/your-project-id/fake-news-detector \
  --platform managed \
  --region us-central1 \
  --port 5000 \
  --memory 2Gi \
  --timeout 300

# 5. Set environment variables
gcloud run services update fake-news-detector \
  --update-env-vars API_KEY=your-key,MONGODB_URI=your-mongodb-uri
```

---

## Configuration

### Environment Variables

Create `.env` file in project root:

```bash
# Flask Configuration
FLASK_ENV=production
FLASK_APP=backend/app.py
SECRET_KEY=your-secret-key-here

# Database
MONGODB_URI=mongodb://admin:password@mongo:27017/fake-news-detector
DATABASE_POOL_SIZE=10

# API Keys
GOOGLE_FACTCHECK_API_KEY=your-google-api-key
NEWSAPI_KEY=your-newsapi-key
API_KEY=your-api-key

# Server Configuration
HOST=0.0.0.0
PORT=5000
DEBUG=False

# Security
MAX_CONTENT_LENGTH=16777216  # 16MB
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com

# Logging
LOG_LEVEL=INFO
LOG_FILE=/var/log/fake-news-detector.log

# ML Models
MODEL_PATH=/app/backend/models
BATCH_SIZE=32
MAX_SEQUENCE_LENGTH=512
```

### Nginx Configuration (nginx.conf)

```nginx
upstream backend {
    server backend:5000;
    keepalive 32;
}

server {
    listen 80;
    server_name your-domain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL configuration
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    client_max_body_size 16M;
    
    # API routes
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
    }
    
    # Frontend
    location / {
        root /app/frontend/build;
        try_files $uri /index.html;
    }
}
```

---

## Monitoring & Logging

### Health Check

```bash
# Check API health
curl http://localhost:5000/api/health

# Response:
{
  "status": "healthy",
  "timestamp": "2024-03-16T10:30:00Z",
  "services": {
    "detector": true,
    "sentiment": true,
    "propaganda": true,
    "factcheck": true
  }
}
```

### Logging

```bash
# View Flask logs
docker-compose logs backend

# View with timestamps
docker-compose logs --timestamps backend

# View last 100 lines
docker-compose logs --tail=100 backend

# Real-time logs
docker-compose logs -f backend
```

### Monitoring Stack (Optional)

Add Prometheus + Grafana for monitoring:

```yaml
# In docker-compose.yml
prometheus:
  image: prom/prometheus
  volumes:
    - ./deployment/prometheus.yml:/etc/prometheus/prometheus.yml
  ports:
    - "9090:9090"

grafana:
  image: grafana/grafana
  ports:
    - "3001:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=admin
```

---

## Troubleshooting

### Common Issues

#### 1. Container won't start
```bash
# Check logs
docker-compose logs backend

# Rebuild
docker-compose build --no-cache backend
docker-compose up -d backend
```

#### 2. Port already in use
```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
```

#### 3. Database connection fails
```bash
# Check MongoDB status
docker-compose logs mongo

# Recreate MongoDB
docker-compose down
docker volume rm fake-news-detector_mongo_data
docker-compose up -d mongo
```

#### 4. Out of memory
```bash
# Increase Docker memory
# Docker Desktop Settings → Resources → Memory: 4GB+

# Reduce model size
# In detector.py, use smaller models or quantization
```

#### 5. API key not working
```bash
# Verify .env file
cat .env

# Update secrets
docker-compose down
# Update .env file
docker-compose up -d

# Or use environment variables
export GOOGLE_FACTCHECK_API_KEY=your-key
docker-compose up -d
```

### Debug Mode

```bash
# Enable debug logging
export LOG_LEVEL=DEBUG
docker-compose up -d backend

# Test API endpoint
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "Test news"}'
```

---

## Security

### Best Practices

1. **Change Default Credentials**
   ```bash
   # Update MongoDB password in .env
   MONGODB_URI=mongodb://admin:STRONG_PASSWORD@mongo:27017/fake-news-detector
   ```

2. **Use HTTPS**
   - Install SSL certificate with Let's Encrypt
   - Update nginx.conf with SSL config

3. **API Key Management**
   - Use environment variables (not hardcoded)
   - Rotate keys regularly
   - Use API key validation on backend

4. **Database Security**
   - Use strong credentials
   - Enable authentication
   - Regular backups
   - MongoDB encryption at rest

5. **Input Validation**
   - Sanitize all user inputs
   - Rate limiting (10 requests/second)
   - Max payload size: 16MB

6. **Network Security**
   - Use firewall rules
   - Disable public access to MongoDB
   - Enable CORS only for trusted origins

### Running Security Scan

```bash
# Scan dependencies for vulnerabilities
npm audit
pip-audit

# Using Snyk
npm install -g snyk
snyk test
```

---

## Performance Optimization

### Backend Optimization

```python
# In app.py
app.config['JSON_SORT_KEYS'] = False  # Faster JSON serialization
from werkzeug.contrib.cache import RedisCache  # Add caching

# Use connection pooling
DATABASE_POOL_SIZE = 10
```

### Frontend Optimization

```javascript
// Code splitting
import React, { lazy, Suspense } from 'react';
const Analytics = lazy(() => import('./pages/Analytics'));

// Service workers for offline support
// Lazy load images
// Minify assets
```

### Database Optimization

```javascript
// Add indexes
db.analysis_results.createIndex({ "timestamp": 1 })
db.analysis_results.createIndex({ "user_id": 1 })

// Use pagination
// Implement query caching
```

---

## Backup & Recovery

### Backup MongoDB

```bash
# Create backup
docker-compose exec mongo mongodump --out /backup

# Copy to host
docker cp fake-news-detector-mongo:/backup ./backup

# Restore from backup
docker-compose exec mongo mongorestore /backup
```

### Backup Database

```bash
# Automated daily backup
0 2 * * * docker-compose exec mongo mongodump --out /backups/$(date +\%Y\%m\%d) >> /var/log/backup.log 2>&1
```

---

## Scaling

### Horizontal Scaling

```bash
# Scale backend services
docker-compose up -d --scale backend=3

# Use load balancer (Nginx configured above)
```

### Vertical Scaling

```bash
# Increase container resources in docker-compose.yml
services:
  backend:
    resources:
      limits:
        cpus: '2'
        memory: 4G
```

---

## Support & Resources

- **Documentation**: https://github.com/yourusername/fake-news-detector/wiki
- **Issues**: https://github.com/yourusername/fake-news-detector/issues
- **Discussions**: https://github.com/yourusername/fake-news-detector/discussions

---

**Last Updated**: March 2024
**Version**: 1.0.0
