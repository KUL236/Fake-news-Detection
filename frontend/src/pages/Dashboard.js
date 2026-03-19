import React from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Stack,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();

  const features = [
    {
      icon: '🔍',
      title: 'Smart Analyzer',
      description: 'Detect fake news with advanced AI-powered analysis',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      action: () => navigate('/analyzer')
    },
    {
      icon: '📊',
      title: 'Live Analytics',
      description: 'Track trending topics and statistics in real-time',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      action: () => navigate('/analytics')
    },
    {
      icon: '⚙️',
      title: 'Settings',
      description: 'Configure models, language, and preferences',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      action: () => navigate('/settings')
    },
    {
      icon: 'ℹ️',
      title: 'About',
      description: 'Learn about the system and its capabilities',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      action: () => navigate('/about')
    }
  ];

  const stats = [
    { icon: '✅', label: 'ML Models', value: '4', color: '#10b981' },
    { icon: '🎯', label: 'Accuracy', value: '94%', color: '#3b82f6' },
    { icon: '⚡', label: 'Speed', value: '<100ms', color: '#f59e0b' },
    { icon: '🌍', label: 'Languages', value: '5+', color: '#8b5cf6' }
  ];

  return (
    <Container maxWidth="xl">
      {/* Hero Section */}
      <Box
        sx={{
          mb: 6,
          mt: 2,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          p: { xs: 3, md: 5 },
          color: 'white',
          boxShadow: '0 20px 60px rgba(102, 126, 234, 0.2)'
        }}
      >
        <Typography variant="h2" sx={{ fontWeight: 700, mb: 2 }}>
          🔍 Welcome to FakeNews Detector
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.95, maxWidth: '600px', mx: 'auto', mb: 3 }}>
          Advanced AI-powered system to detect misinformation and fake news in real-time
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={2} justifyContent="center">
          <Button
            variant="contained"
            size="large"
            sx={{
              backgroundColor: 'white',
              color: '#667eea',
              fontWeight: 600,
              px: 3,
              '&:hover': {
                backgroundColor: '#f8f9fa'
              }
            }}
            onClick={() => navigate('/analyzer')}
            endIcon={<ArrowForwardIcon />}
          >
            Start Analysis
          </Button>
          <Button
            variant="outlined"
            size="large"
            sx={{
              borderColor: 'white',
              color: 'white',
              fontWeight: 600,
              px: 3,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderColor: 'white'
              }
            }}
            onClick={() => navigate('/about')}
          >
            Learn More
          </Button>
        </Stack>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={2} sx={{ mb: 6 }}>
        {stats.map((stat, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card sx={{
              background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}30 100%)`,
              borderLeft: `4px solid ${stat.color}`,
              borderRadius: '12px'
            }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontSize: '2rem', mb: 0.5 }}>
                  {stat.icon}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color, mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Feature Cards */}
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
        Key Features
      </Typography>
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {features.map((feature, idx) => (
          <Grid item xs={12} sm={6} md={6} lg={3} key={idx}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 30px 60px rgba(0,0,0,0.15)'
                }
              }}
            >
              <Box
                sx={{
                  height: '120px',
                  background: feature.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem'
                }}
              >
                {feature.icon}
              </Box>
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2, flex: 1 }}>
                  {feature.description}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={feature.action}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Explore
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* How It Works */}
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: '16px', background: '#f8fafc' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
          🚀 How It Works
        </Typography>
        <Grid container spacing={3}>
          {[
            { num: '1', title: 'Submit Content', desc: 'Paste text or URL to analyze' },
            { num: '2', title: 'AI Analysis', desc: 'Multiple ML models evaluate' },
            { num: '3', title: 'Get Results', desc: 'Instant fake news detection' }
          ].map((step, idx) => (
            <Grid item xs={12} md={4} key={idx}>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    margin: '0 auto 16px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1.5rem'
                  }}
                >
                  {step.num}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {step.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {step.desc}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Capabilities */}
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          💪 Powerful Capabilities
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          {['Sentiment Analysis', 'Propaganda Detection', 'Source Credibility', 'Fact Checking', 'Multi-Language', 'Real-time Processing'].map((cap, idx) => (
            <Grid item key={idx}>
              <Chip
                label={cap}
                color="primary"
                sx={{ height: '32px', fontSize: '0.9rem', fontWeight: 600 }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}
