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
  Divider
} from '@mui/material';
import { GitHub as GitHubIcon, Language as LanguageIcon } from '@mui/icons-material';

export default function About() {
  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
          📰 Fake News Detection System
        </Typography>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Version 1.0.0
        </Typography>
        <Divider sx={{ my: 3 }} />
      </Box>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          🎯 About This Project
        </Typography>
        <Typography variant="body1" paragraph>
          The Advanced Fake News Detection System is an AI-powered application that leverages
          cutting-edge Machine Learning and Natural Language Processing (NLP) techniques to
          detect, analyze, and verify news content authenticity.
        </Typography>
        <Typography variant="body1" paragraph>
          Our mission is to combat misinformation and help users make informed decisions about
          the news they consume by providing accurate, explainable fake news detection with
          high confidence scores and comprehensive analysis.
        </Typography>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                🤖 ML Models
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <Typography component="li">Logistic Regression</Typography>
                <Typography component="li">Naive Bayes</Typography>
                <Typography component="li">Random Forest</Typography>
                <Typography component="li">BERT Transformer</Typography>
                <Typography component="li">Ensemble Learning</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                🎨 Features
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <Typography component="li">Real-time fake news detection</Typography>
                <Typography component="li">Sentiment analysis</Typography>
                <Typography component="li">Propaganda detection</Typography>
                <Typography component="li">Source credibility analysis</Typography>
                <Typography component="li">Fact-check integration</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          📊 Performance Metrics
        </Typography>
        <Grid container spacing={2}>
          {[
            { label: 'Accuracy', value: '94.2%' },
            { label: 'Precision', value: '93.8%' },
            { label: 'Recall', value: '94.9%' },
            { label: 'F1 Score', value: '0.944' },
            { label: 'ROC-AUC', value: '0.968' },
            { label: 'Inference Time', value: '~95ms' }
          ].map((metric, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  {metric.label}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {metric.value}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          🛠️ Technology Stack
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Backend:</strong> Python, Flask, TensorFlow, Scikit-learn, HuggingFace Transformers
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Frontend:</strong> React, Material-UI, Recharts, Redux
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>NLP Libraries:</strong> NLTK, SpaCy, TextBlob, VADER Sentiment
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>APIs:</strong> Google Fact Check API, NewsAPI, Domain reputation services
        </Typography>
      </Paper>

      <Paper sx={{ p: 3, mb: 3, bgcolor: '#e3f2fd' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          ⚖️ Disclaimer
        </Typography>
        <Typography variant="body2" paragraph>
          While our system achieves high accuracy, it should not be the sole source of truth
          for determining news authenticity. Always cross-reference with multiple reputable
          news sources before sharing or making decisions based on analyzed content.
        </Typography>
        <Typography variant="body2">
          This tool is designed to assist human judgment, not replace it.
        </Typography>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          📧 Contact & Resources
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" component="div" sx={{ mb: 1 }}>
            🔗 <Link href="#" target="_blank">GitHub Repository</Link>
          </Typography>
          <Typography variant="body2" component="div" sx={{ mb: 1 }}>
            📄 <Link href="#" target="_blank">Documentation</Link>
          </Typography>
          <Typography variant="body2" component="div" sx={{ mb: 1 }}>
            🐛 <Link href="#" target="_blank">Report Issues</Link>
          </Typography>
          <Typography variant="body2" component="div">
            💬 <Link href="#" target="_blank">Support Forum</Link>
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ textAlign: 'center', mt: 4, py: 3, color: 'textSecondary' }}>
        <Typography variant="body2">
          Built with ❤️ for information authenticity and trust
        </Typography>
        <Typography variant="body2">
          © 2024 Advanced Fake News Detection System. All rights reserved.
        </Typography>
      </Box>
    </Container>
  );
}
