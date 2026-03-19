import React, { useState, useRef } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Divider,
  Stack,
  Tab,
  Tabs,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import LinkIcon from '@mui/icons-material/Link';
import ImageIcon from '@mui/icons-material/Image';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningIcon from '@mui/icons-material/Warning';
import './Analyzer.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function Analyzer() {
  const [inputMode, setInputMode] = useState(0); // 0: text, 1: url, 2: image, 3: camera
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraImage, setCameraImage] = useState(null);
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [expandedAccordion, setExpandedAccordion] = useState('classification');
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Image Upload Handler
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  // Camera Start Handler
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        setError('');
      }
    } catch (err) {
      setError(`Camera access denied: ${err.message}`);
    }
  };

  // Capture from Camera Handler
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      canvasRef.current.toBlob((blob) => {
        setImageFile(blob);
        setImagePreview(canvasRef.current.toDataURL('image/jpeg'));
      });
      stopCamera();
      setInputMode(2);
    }
  };

  // Stop Camera Handler
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  // Main Analyze Handler
  const handleAnalyze = async () => {
    setError('');
    setResult(null);

    let endpoint = '';
    let payload = new FormData();
    let hasContent = false;

    try {
      if (inputMode === 0) {
        // Text Analysis
        if (!textInput.trim()) {
          setError('Please enter some text to analyze');
          return;
        }
        endpoint = '/analyze';
        payload = { text: textInput, language };
        hasContent = true;
      } else if (inputMode === 1) {
        // URL Analysis
        if (!urlInput.trim()) {
          setError('Please enter a URL to analyze');
          return;
        }
        endpoint = '/analyze/url';
        payload = { url: urlInput, language };
        hasContent = true;
      } else if (inputMode === 2) {
        // Image Analysis
        if (!imageFile) {
          setError('Please upload an image to analyze');
          return;
        }
        endpoint = '/analyze/image';
        payload.append('image', imageFile);
        payload.append('language', language);
        hasContent = true;
      }

      if (!hasContent) {
        setError('Please provide content to analyze');
        return;
      }

      setLoading(true);

      const headers = inputMode === 2 ? {} : { 'Content-Type': 'application/json' };
      const body = inputMode === 2 ? payload : JSON.stringify(payload);

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: inputMode !== 2 ? headers : undefined,
        body
      });

      if (!response.ok) {
        let errorMessage = `API Error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setResult(data);

      let historyLabel = '';
      if (inputMode === 0) historyLabel = textInput.substring(0, 50);
      else if (inputMode === 1) historyLabel = urlInput.substring(0, 50);
      else if (inputMode === 2) historyLabel = 'Image Analysis';

      setHistory([{
        text: historyLabel,
        classification: data.classification,
        timestamp: new Date(),
        confidence: data.confidence_score
      }, ...history.slice(0, 9)]);

    } catch (err) {
      setError(`Analysis failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleAnalyze();
    }
  };

  const getRiskColor = (riskLevel) => {
    const colors = {
      'CRITICAL': '#dc2626',
      'HIGH': '#f97316',
      'MEDIUM': '#eab308',
      'LOW': '#22c55e'
    };
    return colors[riskLevel] || '#666';
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4, mt: 2 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          🔍 Advanced News Analyzer
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Detect misinformation with AI-powered analysis
        </Typography>
      </Box>

      {/* Input Section */}
      <Paper sx={{
        p: { xs: 2, md: 3 },
        mb: 3,
        background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        borderRadius: '16px'
      }}>
        {/* Mode Tabs */}
        <Tabs
          value={inputMode}
          onChange={(e, newValue) => {
            setInputMode(newValue);
            setError('');
            if (cameraActive) stopCamera();
          }}
          sx={{ mb: 3, borderBottom: '2px solid #e2e8f0' }}
        >
          <Tab label="📝 Text Input" icon={<SearchIcon />} />
          <Tab label="🔗 URL Input" icon={<LinkIcon />} />
          <Tab label="🖼️ Image Upload" icon={<ImageIcon />} />
          <Tab label="📷 Camera" icon={<PhotoCameraIcon />} />
        </Tabs>

        {/* Language Selection */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Language</InputLabel>
          <Select
            value={language}
            label="Language"
            onChange={(e) => setLanguage(e.target.value)}
          >
            <MenuItem value="en">🇬🇧 English</MenuItem>
            <MenuItem value="hi">🇮🇳 Hindi</MenuItem>
            <MenuItem value="es">🇪🇸 Spanish</MenuItem>
            <MenuItem value="fr">🇫🇷 French</MenuItem>
          </Select>
        </FormControl>

        {/* Text Input */}
        {inputMode === 0 && (
          <TextField
            fullWidth
            multiline
            rows={6}
            placeholder="Paste news text here... (Ctrl+Enter to analyze)"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyPress={handleKeyPress}
            variant="outlined"
            disabled={loading}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px'
              }
            }}
          />
        )}

        {/* URL Input */}
        {inputMode === 1 && (
          <TextField
            fullWidth
            type="url"
            placeholder="Enter article URL here..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyPress={handleKeyPress}
            variant="outlined"
            disabled={loading}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px'
              }
            }}
          />
        )}

        {/* Image Upload Input */}
        {inputMode === 2 && (
          <Box sx={{ mb: 2 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            {!imagePreview ? (
              <Button
                variant="contained"
                component="label"
                fullWidth
                sx={{
                  py: 3,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  textTransform: 'none',
                  fontSize: '1rem'
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Stack alignItems="center" gap={1}>
                  <ImageIcon sx={{ fontSize: '2rem' }} />
                  <Typography>Click to upload image or drag & drop</Typography>
                </Stack>
              </Button>
            ) : (
              <Box>
                <Box
                  component="img"
                  src={imagePreview}
                  sx={{
                    width: '100%',
                    maxHeight: '300px',
                    borderRadius: '12px',
                    mb: 2,
                    objectFit: 'contain'
                  }}
                />
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ mb: 1 }}
                >
                  Change Image
                </Button>
                <Button
                  variant="text"
                  fullWidth
                  color="error"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                >
                  Remove
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* Camera Input */}
        {inputMode === 3 && (
          <Box sx={{ mb: 2 }}>
            {!cameraActive ? (
              <Button
                variant="contained"
                fullWidth
                sx={{
                  py: 3,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  textTransform: 'none',
                  fontSize: '1rem'
                }}
                onClick={startCamera}
              >
                <Stack alignItems="center" gap={1}>
                  <PhotoCameraIcon sx={{ fontSize: '2rem' }} />
                  <Typography>Start Camera</Typography>
                </Stack>
              </Button>
            ) : (
              <Box>
                <Box
                  sx={{
                    position: 'relative',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    mb: 2,
                    bgcolor: '#000'
                  }}
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    style={{
                      width: '100%',
                      maxHeight: '400px',
                      borderRadius: '12px'
                    }}
                  />
                  <canvas
                    ref={canvasRef}
                    width={640}
                    height={480}
                    style={{ display: 'none' }}
                  />
                </Box>
                <Stack direction="row" gap={1}>
                  <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    onClick={captureImage}
                  >
                    📸 Capture
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    onClick={stopCamera}
                  >
                    Stop
                  </Button>
                </Stack>
              </Box>
            )}
            {cameraImage && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Image captured, ready to analyze
                </Typography>
                <Button
                  variant="text"
                  fullWidth
                  size="small"
                  onClick={() => {
                    setCameraImage(null);
                    setImagePreview(null);
                  }}
                >
                  Delete
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Analyze Button */}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          onClick={handleAnalyze}
          disabled={loading}
          sx={{
            py: 1.5,
            borderRadius: '12px',
            fontSize: '1.1rem',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
            '&:hover': {
              boxShadow: '0 12px 36px rgba(102, 126, 234, 0.4)',
              transform: 'translateY(-2px)'
            }
          }}
        >
          {loading ? (
            <Stack direction="row" gap={1} alignItems="center">
              <CircularProgress size={24} color="inherit" />
              Analyzing...
            </Stack>
          ) : (
            '🚀 Analyze Now'
          )}
        </Button>
      </Paper>

      {/* Results Section */}
      {result && (
        <Box sx={{ mb: 4 }}>
          {/* THREAT ALERT SECTION */}
          <Alert
            severity={
              result.risk_level === 'CRITICAL' ? 'error' :
              result.risk_level === 'HIGH' ? 'warning' :
              result.risk_level === 'MEDIUM' ? 'info' : 'success'
            }
            sx={{
              mb: 3,
              py: 2,
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
            icon={
              result.risk_level === 'CRITICAL' ? <CancelIcon sx={{ fontSize: '2rem' }} /> :
              result.risk_level === 'HIGH' ? <WarningIcon sx={{ fontSize: '2rem' }} /> :
              result.risk_level === 'MEDIUM' ? <WarningIcon sx={{ fontSize: '2rem' }} /> :
              <CheckCircleIcon sx={{ fontSize: '2rem' }} />
            }
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {result.risk_level === 'CRITICAL' ? '🚨 FAKE NEWS DETECTED!' :
                 result.risk_level === 'HIGH' ? '⚠️ HIGH PROBABILITY OF MISINFORMATION' :
                 result.risk_level === 'MEDIUM' ? '⚠️ POTENTIAL MISINFORMATION' :
                 '✅ LIKELY AUTHENTIC NEWS'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Classification: <strong>{result.classification}</strong> | Confidence: <strong>{result.confidence_score.toFixed(1)}%</strong>
              </Typography>
            </Box>
          </Alert>

          {/* Classification Card */}
          <Card sx={{
            mb: 3,
            borderLeft: `6px solid ${getRiskColor(result.risk_level)}`,
            background: `linear-gradient(135deg, ${getRiskColor(result.risk_level)}15 0%, white 100%)`
          }}>
            <CardContent>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <Typography color="textSecondary" sx={{ mb: 1 }} variant="body2">
                    📋 Classification
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: getRiskColor(result.risk_level) }}>
                    {result.classification}
                  </Typography>
                  <Chip
                    label={`🚨 RISK: ${result.risk_level}`}
                    sx={{
                      backgroundColor: getRiskColor(result.risk_level),
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.95rem'
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography color="textSecondary" sx={{ mb: 1 }} variant="body2">
                    📊 Confidence Score
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={result.confidence_score}
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: '#e5e7eb',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 5,
                            background: `linear-gradient(90deg, ${getRiskColor(result.risk_level)}, ${getRiskColor(result.risk_level)}80)`
                          }
                        }}
                      />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, minWidth: 70, textAlign: 'right' }}>
                      {result.confidence_score.toFixed(1)}%
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Probability Distribution */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" variant="body2" sx={{ mb: 1 }}>
                    ❌ Fake News Probability
                  </Typography>
                  <Typography variant="h3" sx={{ color: '#dc2626', fontWeight: 700, mb: 1 }}>
                    {result.probability.fake}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={result.probability.fake}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: '#fee2e2',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#dc2626',
                        borderRadius: 3
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" variant="body2" sx={{ mb: 1 }}>
                    ✅ Real News Probability
                  </Typography>
                  <Typography variant="h3" sx={{ color: '#22c55e', fontWeight: 700, mb: 1 }}>
                    {result.probability.real}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={result.probability.real}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: '#dcfce7',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#22c55e',
                        borderRadius: 3
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Detailed Analysis */}
          <Accordion
            expanded={expandedAccordion === 'analysis'}
            onChange={() => setExpandedAccordion(expandedAccordion === 'analysis' ? '' : 'analysis')}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                📊 Detailed Analysis
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ width: '100%' }}>
                {result.explanation && (
                  <Box sx={{ mb: 2, p: 2, backgroundColor: '#f1f5f9', borderLeft: '4px solid #6366f1', borderRadius: '8px' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                      Analysis Explanation
                    </Typography>
                    <Typography variant="body2">
                      {result.explanation}
                    </Typography>
                  </Box>
                )}

                {result.sentiment_analysis && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                      💭 Sentiment Analysis
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          Sentiment: <strong>{result.sentiment_analysis.sentiment}</strong>
                        </Typography>
                        <Typography variant="body2">
                          Compound: <strong>{result.sentiment_analysis.compound.toFixed(3)}</strong>
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          Emotional: {result.sentiment_analysis.is_emotionally_charged ? '⚠️ Yes' : '✓ No'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {result.recommendations && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                      💡 Recommendations
                    </Typography>
                    <List>
                      {result.recommendations.map((rec, idx) => (
                        <ListItem key={idx} disablePadding>
                          <ListItemText 
                            primary={rec}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Copy Results Button */}
          <Button
            variant="outlined"
            fullWidth
            onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))}
            sx={{ mb: 3 }}
          >
            📋 Copy Results
          </Button>
        </Box>
      )}

      {/* History Section */}
      {history.length > 0 && (
        <Paper sx={{
          p: 3,
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            📜 Recent Analysis History
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List>
            {history.map((item, idx) => (
              <ListItem
                key={idx}
                sx={{
                  borderBottom: '1px solid #e2e8f0',
                  py: 1.5,
                  '&:hover': { backgroundColor: '#f8fafc' }
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.text}
                      </Typography>
                      <Chip
                        label={item.classification}
                        color={item.classification === 'FAKE' ? 'error' : 'success'}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" color="textSecondary">
                      {item.timestamp.toLocaleTimeString()} • Confidence: {item.confidence.toFixed(1)}%
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Container>
  );
}
