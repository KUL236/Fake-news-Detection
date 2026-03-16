import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Chip,
  Card,
  CardContent,
  Grid,
  Alert
} from '@mui/material';
import { CheckCircle, Error as ErrorIcon, Warning } from '@mui/icons-material';

export default function AnalysisResults({ data, detailed = false }) {
  if (!data) return null;

  const { fake_confidence, is_fake, classification, explanation, recommendations, linguistic_features } = data;
  const confidence = Math.round(fake_confidence * 100);

  return (
    <Box>
      {/* Classification Alert */}
      <Alert
        severity={is_fake ? 'error' : 'success'}
        icon={is_fake ? <ErrorIcon /> : <CheckCircle />}
        sx={{ mb: 2 }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {classification} - {confidence}% Confidence
        </Typography>
      </Alert>

      {/* Confidence Meter */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            Fake News Probability
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {confidence}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={confidence}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: '#f0f0f0',
            '& .MuiLinearProgress-bar': {
              backgroundColor: confidence > 70 ? '#f44336' : confidence > 40 ? '#ff9800' : '#4caf50',
              borderRadius: 4
            }
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption" color="textSecondary">
            0% (Definitely Real)
          </Typography>
          <Typography variant="caption" color="textSecondary">
            100% (Definitely Fake)
          </Typography>
        </Box>
      </Box>

      {/* Explanation */}
      <Card sx={{ mb: 2, bgcolor: '#fafafa' }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            📝 Analysis Explanation
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
            {explanation}
          </Typography>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            💡 Recommendations
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {recommendations.map((rec, idx) => (
              <Typography key={idx} variant="body2" sx={{ pl: 1, borderLeft: '3px solid #2196f3' }}>
                {rec}
              </Typography>
            ))}
          </Box>
        </Box>
      )}

      {/* Detailed Analysis */}
      {detailed && linguistic_features && (
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
              📊 Linguistic Features
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="body2" color="textSecondary">
                  Text Length
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {linguistic_features.text_length} characters
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="body2" color="textSecondary">
                  Word Count
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {linguistic_features.word_count} words
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="body2" color="textSecondary">
                  Sentence Count
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {linguistic_features.sentence_count} sentences
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="body2" color="textSecondary">
                  Suspicious Words
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {linguistic_features.suspicious_word_count}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
