import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Info } from '@mui/icons-material';

export default function SentimentChart({ sentiment = {} }) {
  if (!sentiment || sentiment.status === 'vader_not_available') {
    return (
      <Alert severity="info" icon={<Info />}>
        Sentiment analysis not available
      </Alert>
    );
  }

  const sentimentData = [
    { name: 'Positive', value: Math.round(sentiment.positive * 100) },
    { name: 'Neutral', value: Math.round(sentiment.neutral * 100) },
    { name: 'Negative', value: Math.round(sentiment.negative * 100) }
  ];

  const COLORS = ['#4caf50', '#2196f3', '#f44336'];

  const emotionalIndicators = [
    { label: 'Is Emotionally Charged', value: sentiment.is_emotionally_charged ? '✅ Yes' : '❌ No' },
    { label: 'Highly Subjective', value: sentiment.is_highly_subjective ? '⚠️ Yes' : '✅ No' }
  ];

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        Sentiment analysis reveals emotional tone and bias indicators that may suggest fake news
      </Alert>

      <Grid container spacing={3}>
        {/* Overall Sentiment */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Overall Sentiment
              </Typography>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {sentiment.sentiment?.toUpperCase()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Compound Score: {sentiment.compound_score?.toFixed(2)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" gutterBottom>
                  Polarity: {(sentiment.polarity?.toFixed(2) || 0)} (Positive: 1, Negative: -1)
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(sentiment.polarity + 1) * 50}
                  sx={{ mb: 2 }}
                />

                <Typography variant="body2" gutterBottom>
                  Subjectivity: {(sentiment.subjectivity?.toFixed(2) || 0)} (Objective: 0, Subjective: 1)
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={sentiment.subjectivity * 100}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sentiment Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Sentiment Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Emotional Words */}
        {sentiment.emotional_words && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  🎭 Emotional Words Detected
                </Typography>
                <Grid container spacing={1}>
                  {Object.entries(sentiment.emotional_words).map(([emotion, count]) => (
                    <Grid item xs={12} sm={6} md={4} key={emotion}>
                      <Card variant="outlined">
                        <CardContent sx={{ py: 1.5 }}>
                          <Typography variant="body2" color="textSecondary" sx={{ textTransform: 'capitalize' }}>
                            {emotion}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {count} occurrences
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Fake News Indicators */}
        {sentiment.fake_news_indicators && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  ⚠️ Fake News Sentiment Indicators
                </Typography>

                <Grid container spacing={2}>
                  {Object.entries(sentiment.fake_news_indicators).map(([indicator, value]) => (
                    <Grid item xs={12} sm={6} md={4} key={indicator}>
                      <Box
                        sx={{
                          p: 1.5,
                          bgcolor: value ? '#ffebee' : '#e8f5e9',
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: value ? '#f44336' : '#4caf50'
                        }}
                      >
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {indicator.replace(/_/g, ' ')}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                          {value ? '🚩 Detected' : '✅ Not detected'}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Key Insights */}
        <Grid item xs={12}>
          <Card sx={{ bgcolor: '#f3e5f5' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                💡 Sentiment Insights
              </Typography>
              <Typography variant="body2" paragraph>
                {sentiment.is_emotionally_charged
                  ? '🚩 This content is highly emotionally charged, which is a common characteristic of fake news '
                  : '✅ This content maintains a balanced emotional tone, which is typical of real news. '}
              </Typography>
              <Typography variant="body2">
                {sentiment.is_highly_subjective
                  ? '⚠️ The language is very subjective, which may indicate bias or manipulation. '
                  : '✅ The language is relatively objective, suggesting balanced reporting. '}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
