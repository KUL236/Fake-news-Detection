# 🚀 Quick Start Guide

Get the Fake News Detection System up and running in 5 minutes!

## Option 1: Docker (Recommended)

### Fastest Setup - One Command

```bash
# Clone the repository
git clone https://github.com/yourusername/fake-news-detector.git
cd fake-news-detector

# Copy environment file
cp .env.example .env

# Start everything with Docker Compose
docker-compose up -d

# Wait for services to start (30 seconds)
sleep 30

# Access the application
# Frontend: http://localhost:3000
# API: http://localhost:5000
# API Docs: http://localhost:5000/api/health
```

### Verify It's Running

```bash
# Check all services
docker-compose ps

# Test API
curl http://localhost:5000/api/health

# View logs
docker-compose logs -f backend
```

## Option 2: Local Development

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or: venv\Scripts\activate on Windows

# Install dependencies
pip install -r ../requirements.txt

# Run server
python app.py
# Server starts at http://localhost:5000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
# Opens at http://localhost:3000
```

## Using the System

### Web Interface

1. Open http://localhost:3000
2. Go to "Analyzer" tab
3. Paste your news article
4. Click "Analyze"
5. View detailed results with confidence scores

### API

```bash
# Analyze text
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "Your news here"}'

# Batch analysis
curl -X POST http://localhost:5000/api/analyze/batch \
  -H "Content-Type: application/json" \
  -d '{"texts": ["news1", "news2"]}'

# Analyze URL
curl -X POST http://localhost:5000/api/analyze/url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://news.com/article"}'
```

## Chrome Extension Install

### From Source

1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `chrome-extension/` folder
5. Now you can analyze any news on any webpage!

## Train Models (Optional)

```bash
cd backend/ml

# Train ML models on Kaggle dataset
python train_models.py

# Models saved to backend/models/
```

## Troubleshooting

### Port Already in Use
```bash
# Change port in docker-compose.yml or:
lsof -i :5000  # Find what's using port
kill -9 <PID>
```

### Docker Won't Start
```bash
# Check logs
docker-compose logs backend

# Rebuild
docker-compose build --no-cache backend
docker-compose up -d
```

### Frontend Blank Screen
```bash
# Clear browser cache
# Or:
docker-compose down
docker-compose up -d frontend
```

### Out of Memory
```bash
# Docker Desktop → Settings → Resources → Increase Memory to 4GB+
```

## Next Steps

- Read [API.md](./API.md) for complete API documentation
- Check [DEPLOYMENT.md](./deployment/DEPLOYMENT.md) for production setup
- Visit [README.md](./README.md) for overview
- See Examples in [docs/](./docs/) folder

## Common Commands

```bash
# View logs
docker-compose logs -f backend

# Stop everything
docker-compose down

# Restart a service
docker-compose restart backend

# Execute command
docker-compose exec backend python ml/train_models.py

# Scale backend (load balancing)
docker-compose up -d --scale backend=3

# Clean up everything
docker-compose down -v  # Also removes database
```

## System Features At A Glance

✅ **Core Features**
- Fake/Real classification with confidence scores
- Suspicious phrase highlighting
- AI explanations

✅ **Advanced Analysis**
- Sentiment analysis
- Propaganda detection
- Source credibility analysis
- Fact-check integration

✅ **Dashboard**
- Real-time statistics
- Trending topics
- User reports
- Historical analytics

✅ **Tools**
- Web interface
- REST API
- Chrome extension
- Batch processing

## Performance Tips

1. **Faster inference**: Use smaller BERT model
2. **Batch processing**: Analyze multiple texts at once
3. **Caching**: Enable Redis for faster API responses
4. **Scaling**: Run multiple backend instances

## API Rate Limits

- 60 requests/minute (test)
- 600 requests/minute (API key)
- 100 texts/batch max
- 16MB max payload

## Dataset

Using Kaggle's Fake and Real News Dataset:
- 21,417 labeled samples
- 80/20 train-test split
- Model accuracy: 94%+

## Support

- **Docs**: See README.md
- **API Docs**: See API.md
- **Issues**: GitHub Issues
- **Chat**: GitHub Discussions

## Security Notes

- Change API key in production
- Use HTTPS with SSL certificates
- Enable rate limiting
- Add firewalls to database
- Keep dependencies updated

---

**Ready to detect fake news?** 🎯

Start with Docker Compose above, then explore the web interface at http://localhost:3000!
