import React, { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  FormControlLabel,
  Switch,
  FormGroup,
  Divider,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent
} from '@mui/material';

export default function Settings() {
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    autoAnalysis: false,
    language: 'en',
    confidenceThreshold: 70,
    apiKey: '****-****-****-****'
  });

  const handleSettingChange = (key) => (event) => {
    setSettings({
      ...settings,
      [key]: event.target.checked === undefined ? event.target.value : event.target.checked
    });
  };

  const handleSave = () => {
    console.log('Settings saved:', settings);
    alert('Settings saved successfully!');
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          ⚙️ Settings
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Configure the Fake News Detection System
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          🎨 Display Settings
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={<Switch checked={settings.darkMode} onChange={handleSettingChange('darkMode')} />}
            label="Dark Mode"
          />
          <FormControlLabel
            control={<Switch checked={settings.notifications} onChange={handleSettingChange('notifications')} />}
            label="Enable Notifications"
          />
        </FormGroup>

        <Box sx={{ mt: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Language</InputLabel>
            <Select
              value={settings.language}
              label="Language"
              onChange={handleSettingChange('language')}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="hi">Hindi</MenuItem>
              <MenuItem value="es">Spanish</MenuItem>
              <MenuItem value="fr">French</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          🔧 Analysis Settings
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            Confidence Threshold: {settings.confidenceThreshold}%
          </Typography>
          <Box sx={{ px: 2 }}>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.confidenceThreshold}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  confidenceThreshold: parseInt(e.target.value)
                })
              }
              style={{ width: '100%' }}
            />
          </Box>
        </Box>

        <FormGroup>
          <FormControlLabel
            control={<Switch checked={settings.autoAnalysis} onChange={handleSettingChange('autoAnalysis')} />}
            label="Auto-Analysis (for URL/Clipboard)"
          />
        </FormGroup>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          🔐 API Settings
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            API Key
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <input
              type="password"
              value={settings.apiKey}
              readOnly
              style={{
                flex: 1,
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
            <Button variant="outlined">Reset</Button>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          📊 Available Models
        </Typography>
        <Grid container spacing={2}>
          {[
            { name: 'Logistic Regression', accuracy: '94%', enabled: true },
            { name: 'Naive Bayes', accuracy: '91%', enabled: true },
            { name: 'Random Forest', accuracy: '95%', enabled: true },
            { name: 'BERT Transformer', accuracy: '96%', enabled: false }
          ].map((model, idx) => (
            <Grid item xs={12} sm={6} key={idx}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {model.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Accuracy: {model.accuracy}
                      </Typography>
                    </Box>
                    <Switch checked={model.enabled} disabled />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button variant="contained" color="primary" onClick={handleSave}>
          💾 Save Settings
        </Button>
        <Button variant="outlined">Reset to Default</Button>
      </Box>
    </Container>
  );
}
