import React from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Link,
  Divider,
  Chip,
  Stack,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { GitHub as GitHubIcon } from '@mui/icons-material/';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SchoolIcon from '@mui/icons-material/School';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import PublicIcon from '@mui/icons-material/Public';
import './About.css';

export default function About() {
  const features = [
    { icon: <AutoAwesomeIcon />, title: 'AI-Powered', desc: '4 ML models for accurate detection' },
    { icon: <SecurityIcon />, title: 'Secure', desc: 'Your data is protected and private' },
    { icon: <SpeedIcon />, title: 'Fast', desc: 'Analysis in <100ms' },
    { icon: <PublicIcon />, title: 'Multi-Language', desc: 'Support for 5+ languages' }
  ];

  const timeline = [
    { year: '2024', title: 'Project Started', desc: 'Development of FakeNews Detector begins' },
    { year: '2025', title: 'ML Pipeline Build', desc: 'Training and deployment of ensemble models' },
    { year: '2026', title: 'Public Release', desc: 'Launch of web and Chrome extension' }
  ];

  const teamMembers = [
    { name: 'AI Team', role: 'Machine Learning Engineers', icon: '🤖' },
    { name: 'Web Team', role: 'Frontend/Backend Developers', icon: '💻' },
    { name: 'DevOps', role: 'Infrastructure & Deployment', icon: '🚀' }
  ];

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box
        sx={{
          mt: 2,
          mb: 6,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          p: { xs: 3, md: 5 },
          color: 'white',
          boxShadow: '0 20px 60px rgba(102, 126, 234, 0.2)'
        }}
      >
        <Typography variant="h2" sx={{ fontWeight: 700, mb: 2 }}>
          📰 About FakeNews Detector
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.95, maxWidth: '600px', mx: 'auto' }}>
          Advanced AI-powered system to detect misinformation and fake news in real-time using state-of-the-art machine learning models
        </Typography>
      </Box>

      {/* Mission Section */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, borderRadius: '16px', background: 'linear-gradient(135deg, #667eea15 0%, white 100%)' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              🎯 Our Mission
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ lineHeight: 1.8 }}>
              To combat misinformation and fake news by providing accessible, accurate, and fast detection tools powered by cutting-edge artificial intelligence. We believe in the power of technology to create a more informed and truthful digital landscape.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, borderRadius: '16px', background: 'linear-gradient(135deg, #f5576c15 0%, white 100%)' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              ✨ Our Vision
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ lineHeight: 1.8 }}>
              To build a world where information is verified, truth is valued, and misinformation is immediately identified and stopped before it spreads. We envision a digital ecosystem where people have the tools to make informed decisions.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Key Features */}
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
        💪 Key Capabilities
      </Typography>
      <Grid container spacing={2} sx={{ mb: 6 }}>
        {features.map((feature, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card
              sx={{
                height: '100%',
                borderRadius: '16px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ fontSize: '2.5rem', mb: 1, color: '#667eea' }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {feature.desc}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Technology Stack */}
      <Paper sx={{ p: 4, mb: 6, borderRadius: '16px', background: 'linear-gradient(135deg, #f8fafc 0%, white 100%)' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          🛠️ Technology Stack
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
              Backend
            </Typography>
            <Stack spacing={1}>
              <Chip label="Python 3.14" />
              <Chip label="Flask" />
              <Chip label="scikit-learn" />
              <Chip label="NLTK" />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
              ML Models
            </Typography>
            <Stack spacing={1}>
              <Chip label="BERT" />
              <Chip label="Logistic Regression" />
              <Chip label="Random Forest" />
              <Chip label="Naive Bayes" />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
              Frontend
            </Typography>
            <Stack spacing={1}>
              <Chip label="React 18" />
              <Chip label="Material-UI" />
              <Chip label="Axios" />
              <Chip label="Recharts" />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
              Infrastructure
            </Typography>
            <Stack spacing={1}>
              <Chip label="Docker" />
              <Chip label="Kubernetes" />
              <Chip label="MongoDB" />
              <Chip label="AWS/GCP" />
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Timeline */}
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        📅 Project Timeline
      </Typography>
      <Box sx={{ mb: 6, pl: { xs: 2, md: 4 }, borderLeft: '3px solid #667eea' }}>
        {timeline.map((item, idx) => (
          <Box key={idx} sx={{ mb: 4, position: 'relative' }}>
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: '#667eea',
                position: 'absolute',
                left: { xs: '-30px', md: '-50px' },
                top: 0,
                border: '3px solid white',
                boxShadow: '0 0 0 3px #667eea'
              }}
            />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#667eea', mb: 0.5 }}>
              {item.year}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
              {item.title}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {item.desc}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {[
          { icon: '✅', label: 'Models', value: '4' },
          { icon: '🎯', label: 'Accuracy', value: '94%' },
          { icon: '⚡', label: 'Speed', value: '<100ms' },
          { icon: '🌍', label: 'Languages', value: '5+' }
        ].map((stat, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card sx={{ textAlign: 'center', p: 3, borderRadius: '16px' }}>
              <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>
                {stat.icon}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#667eea' }}>
                {stat.value}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {stat.label}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Team */}
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        👥 Our Team
      </Typography>
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {teamMembers.map((member, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Card sx={{ borderRadius: '16px', textAlign: 'center', p: 3 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  margin: '0 auto 16px',
                  fontSize: '2rem',
                  backgroundColor: '#667eea'
                }}
              >
                {member.icon}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                {member.name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {member.role}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* FAQ */}
      <Paper sx={{ p: 4, borderRadius: '16px', mb: 4, background: 'linear-gradient(135deg, #f8fafc 0%, white 100%)' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          ❓ Frequently Asked Questions
        </Typography>
        <Stack spacing={2}>
          {[
            { q: 'How accurate is the detection?', a: 'Our ensemble model achieves 94%+ accuracy using 4 different ML algorithms.' },
            { q: 'Is my data private?', a: 'Yes, we do not store any submitted content. All analysis happens server-side and is deleted immediately.' },
            { q: 'What languages are supported?', a: 'Currently English, Hindi, Spanish, French, and Mandarin Chinese.' },
            { q: 'How fast is the analysis?', a: 'Most analyses complete in less than 100 milliseconds.' }
          ].map((faq, idx) => (
            <Box key={idx}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#667eea' }}>
                {faq.q}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                {faq.a}
              </Typography>
              {idx < 3 && <Divider />}
            </Box>
          ))}
        </Stack>
      </Paper>

      {/* Links */}
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          🔗 Connect With Us
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Link href="#github" sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', color: '#667eea', textDecoration: 'none', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}>
            <GitHubIcon /> GitHub
          </Link>
          <Link href="#twitter" sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', color: '#667eea', textDecoration: 'none', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}>
            🐦 Twitter
          </Link>
          <Link href="#email" sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', color: '#667eea', textDecoration: 'none', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}>
            ✉️ Email
          </Link>
        </Stack>
      </Box>
    </Container>
  );
}
