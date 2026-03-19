import React, { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  FormControlLabel,
  Switch,
  FormGroup,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Divider,
  Slider,
  Stack,
  Chip,
  Alert
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import './Settings.css';

export default function Settings() {
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    autoAnalysis: false,
    language: 'en',
    confidenceThreshold: 70,
    model: 'ensemble'
  });

  const [saved, setSaved] = useState(false);

  const handleSettingChange = (key) => (event) => {
    const value = event.target.checked === undefined ? event.target.value : event.target.checked;
    setSettings({ ...settings, [key]: value });
    setSaved(false);
  };

  const handleSliderChange = (key) => (event, newValue) => {
    setSettings({ ...settings, [key]: newValue });
    setSaved(false);
  };

  const handleSave = () => {
    console.log('Settings saved:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    const defaultSettings = {
      darkMode: false,
      notifications: true,
      autoAnalysis: false,
      language: 'en',
      confidenceThreshold: 70,
      model: 'ensemble'
    };
    setSettings(defaultSettings);
    localStorage.removeItem('appSettings');
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4, mt: 2 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
          ⚙️ Settings
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Configure your fake news detection preferences
        </Typography>
      </Box>

      {saved && (
        <Alert severity="success" sx={{ mb: 2 }}>
          ✓ Settings saved successfully!
        </Alert>
      )}

      {/* Display Settings */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
          border: '1px solid rgba(102, 126, 234, 0.2)'
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          🎨 Display Settings
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={<Switch checked={settings.darkMode} onChange={handleSettingChange('darkMode')} />}
            label={<Typography sx={{ fontWeight: 500 }}>Dark Mode</Typography>}
          />
          <FormControlLabel
            control={<Switch checked={settings.notifications} onChange={handleSettingChange('notifications')} />}
            label={<Typography sx={{ fontWeight: 500 }}>Enable Notifications</Typography>}
          />
        </FormGroup>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Language</InputLabel>
              <Select
                value={settings.language}
                label="Language"
                onChange={handleSettingChange('language')}
              >
                <MenuItem value="en">🇬🇧 English</MenuItem>
                <MenuItem value="hi">🇮🇳 Hindi</MenuItem>
                <MenuItem value="es">🇪🇸 Spanish</MenuItem>
                <MenuItem value="fr">🇫🇷 French</MenuItem>
                <MenuItem value="zh">🇨🇳 Chinese</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>UI Theme</InputLabel>
              <Select defaultValue="light">
                <MenuItem value="light">☀️ Light</MenuItem>
                <MenuItem value="dark">🌙 Dark</MenuItem>
                <MenuItem value="auto">🔄 Auto</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Analysis Settings */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #f093fb15 0%, #f5576c15 100%)',
          border: '1px solid rgba(245, 87, 108, 0.2)'
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          🔧 Analysis Settings
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Confidence Threshold: <strong style={{ color: '#f5576c' }}>{settings.confidenceThreshold}%</strong>
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Analysis flagged above this threshold
            </Typography>
          </Box>
          <Slider
            value={settings.confidenceThreshold}
            onChange={handleSliderChange('confidenceThreshold')}
            min={0}
            max={100}
            step={5}
            marks={[
              { value: 0, label: '0%' },
              { value: 50, label: '50%' },
              { value: 100, label: '100%' }
            ]}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        <FormGroup>
          <FormControlLabel
            control={<Switch checked={settings.autoAnalysis} onChange={handleSettingChange('autoAnalysis')} />}
            label={<Typography sx={{ fontWeight: 500 }}>Auto-analyze on paste</Typography>}
          />
        </FormGroup>

        <Box sx={{ mt: 3 }}>
          <FormControl fullWidth>
            <InputLabel>ML Model</InputLabel>
            <Select
              value={settings.model}
              label="ML Model"
              onChange={handleSettingChange('model')}
            >
              <MenuItem value="ensemble">🎯 Ensemble (Recommended)</MenuItem>
              <MenuItem value="bert">🧠 BERT</MenuItem>
              <MenuItem value="lightWeight">⚡ Lightweight</MenuItem>
              <MenuItem value="custom">⚙️ Custom</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
            Choose which ML model to use for analysis
          </Typography>
        </Box>
      </Paper>

      {/* API & Credentials */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #4facfe15 0%, #00f2fe15 100%)',
          border: '1px solid rgba(79, 172, 254, 0.2)'
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          🔐 API & Credentials
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              API Key
            </Typography>
            <Box
              sx={{
                p: 2,
                backgroundColor: '#f1f5f9',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                overflow: 'auto',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>••••••••-••••-••••-••••-••••••••••••</span>
              <Button size="small" variant="outlined">
                Reset
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Rate Limit
            </Typography>
            <Chip label="1000 requests/hour" color="success" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Usage This Month
            </Typography>
            <Chip label="2,450 / 10,000" />
          </Grid>
        </Grid>
      </Paper>

      {/* Advanced Options */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #43e97b15 0%, #38f9d715 100%)',
          border: '1px solid rgba(67, 233, 123, 0.2)'
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          🚀 Advanced Options
        </Typography>
        
        <Stack spacing={2}>
          <Box sx={{ p: 2, backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Cache Settings
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2 }}>
              Store analysis results for faster retrieval
            </Typography>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Enable result caching"
            />
          </Box>
          
          <Box sx={{ p: 2, backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Batch Processing
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2 }}>
              Analyze multiple texts in one request
            </Typography>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Enable batch mode"
            />
          </Box>
        </Stack>
      </Paper>

      {/* Action Buttons */}
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={2} justifyContent="flex-end" sx={{ mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<RestartAltIcon />}
          onClick={handleReset}
          sx={{ borderRadius: '8px', fontWeight: 600 }}
        >
          Reset to Default
        </Button>
        <Button
          variant="contained"
          endIcon={<SaveIcon />}
          onClick={handleSave}
          sx={{
            borderRadius: '8px',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        >
          Save Changes
        </Button>
      </Stack>
    </Container>
  );
}
