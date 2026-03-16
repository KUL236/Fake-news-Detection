import React from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  const features = [
    {
      icon: '🔍',
      title: 'News Analyzer',
      description: 'Detect fake news with AI-powered analysis and confidence scores',
      action: () => navigate('/analyzer')
    },
    {
      icon: '📊',
      title: 'Analytics',
      description: 'View trending fake news topics and statistics in real-time',
      action: () => navigate('/analytics')
    },
    {
      icon: '⚙️',
      title: 'Settings',
      description: 'Configure models, language, and detection preferences',
      action: () => navigate('/settings')
    },
    {
      icon: 'ℹ️',
      title: 'About',
      description: 'Learn about the system, models, and how it works',
      action: () => navigate('/about')
    }
  ];

  const capabilities = [
    { icon: '✅', label: 'ML Models', value: '4 Models' },
    { icon: '🎯', label: 'Accuracy', value: '94.2%' },
    { icon: '⚡', label: 'Speed', value: '<100ms' },
    { icon: '🌍', label: 'Languages', value: '2+' }
  ];

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6, mt: 2 }}>
        <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
          📰 Fake News Detection System
        </Typography>
        <Typography variant="h6" color="textSecondary" sx={{ mb: 3 }}>
          Advanced AI-powered detection of misinformation and fake news using machine learning
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => navigate('/analyzer')}
          sx={{ px: 4, py: 1.5 }}
        >
          🚀 Start Analyzing
        </Button>
      </Box>

      {/* Alert */}
      <Alert severity="info" sx={{ mb: 4 }}>
        💡 **Tip**: Paste a news article or headline to get an instant analysis with detailed explanations
      </Alert>

      {/* Features Grid */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {features.map((feature, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={feature.action}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h2" sx={{ mb: 1 }}>
                  {feature.icon}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Capabilities */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
          🎯 System Capabilities
        </Typography>
        <Grid container spacing={2}>
          {capabilities.map((cap, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Card sx={{ textAlign: 'center', bgcolor: '#f9f9f9' }}>
                <CardContent>
                  <Typography variant="h4" sx={{ mb: 1 }}>
                    {cap.icon}
                  </Typography>
                  <Typography variant="subtitle2" color="textSecondary">
                    {cap.label}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    {cap.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* How It Works */}
      <Box sx={{ mb: 6, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
          🔧 How It Works
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" paragraph>
              <strong>1. Text Input:</strong> Upload news article, headline, or paste text
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>2. Analysis:</strong> Multiple ML models analyze the content
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>3. Scoring:</strong> Get confidence score (0-100% fake probability)
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" paragraph>
              <strong>4. Explanation:</strong> AI provides detailed reasoning
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>5. Verification:</strong> Integration with fact-checking sources
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>6. Action:</strong> Get recommendations for sharing safely
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Analysis Features */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
          ✨ Advanced Analysis Features
        </Typography>
        <Grid container spacing={2}>
          {[
            { icon: '😊', title: 'Sentiment Analysis', desc: 'Emotional tone detection' },
            { icon: '🎭', title: 'Propaganda Detection', desc: 'Identify manipulation tactics' },
            { icon: '🔗', title: 'Source Analysis', desc: 'Domain credibility check' },
            { icon: '✓', title: 'Fact-Checking', desc: 'Integration with databases' },
            { icon: '🚩', title: 'Suspicious Phrases', desc: 'Highlight red flags' },
            { icon: '📋', title: 'Recommendations', desc: 'Actionable guidance' }
          ].map((feature, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Card sx={{ border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Typography variant="h4" sx={{ mb: 1 }}>
                    {feature.icon}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {feature.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Get Started */}
      <Box sx={{ textAlign: 'center', py: 4, bgcolor: '#e3f2fd', borderRadius: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
          Ready to Check News?
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Click below to start analyzing news articles and detect fake content
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => navigate('/analyzer')}
          sx={{ mr: 1 }}
        >
          📝 Analyze News
        </Button>
        <Button
          variant="outlined"
          color="primary"
          size="large"
          onClick={() => navigate('/analytics')}
        >
          📊 View Analytics
        </Button>
      </Box>
    </Container>
  );
}
