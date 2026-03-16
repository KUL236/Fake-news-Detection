import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Alert
} from '@mui/material';
import { Warning, Info } from '@mui/icons-material';

export default function SuspiciousPhrasesDisplay({ phrases = [] }) {
  if (!phrases || phrases.length === 0) {
    return (
      <Alert severity="success" icon={<Info />}>
        ✅ No suspicious phrases detected
      </Alert>
    );
  }

  return (
    <Box>
      <Alert severity="warning" icon={<Warning />} sx={{ mb: 2 }}>
        Found {phrases.length} suspicious phrase(s) that may indicate fake news
      </Alert>

      <Grid container spacing={2}>
        {phrases.map((item, idx) => (
          <Grid item xs={12} md={6} key={idx}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', flex: 1 }}>
                    {item.phrase}
                  </Typography>
                  <Chip
                    label={item.severity_level.toUpperCase()}
                    size="small"
                    color={
                      item.severity_level === 'high'
                        ? 'error'
                        : item.severity_level === 'medium'
                        ? 'warning'
                        : 'info'
                    }
                    variant="outlined"
                  />
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  Severity Score: {item.severity}/3
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(item.severity / 3) * 100}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 3, p: 2, bgcolor: '#fff3e0', borderRadius: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
          💭 What flagged these phrases?
        </Typography>
        <Typography variant="body2">
          These phrases are commonly associated with fake news content, including:
          unverified claims, emotional manipulation, vague language, and sensationalism.
          However, the presence of these words alone doesn't confirm fake news.
        </Typography>
      </Box>
    </Box>
  );
}
