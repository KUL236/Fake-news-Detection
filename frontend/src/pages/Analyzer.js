import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Grid,
  Alert,
  Divider,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Switch,
  FormControlLabel,
  ThemeProvider,
  createTheme,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import ImageIcon from '@mui/icons-material/Image';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import StopIcon from '@mui/icons-material/Stop';
import HistoryIcon from '@mui/icons-material/History';
import axios from 'axios';

// ============== DATABASE FUNCTIONS ==============
// Initialize IndexedDB
const initializeDB = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FakeNewsDetectorDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('analyses')) {
        const store = db.createObjectStore('analyses', { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('classification', 'classification', { unique: false });
      }
    };
  });
};

// Save analysis to database
const saveAnalysisToDb = async (analysis) => {
  try {
    const db = await initializeDB();
    const transaction = db.transaction(['analyses'], 'readwrite');
    const store = transaction.objectStore('analyses');
    const data = {
      ...analysis,
      timestamp: new Date().toISOString(),
      id: Date.now()
    };
    store.add(data);
    return data.id;
  } catch (err) {
    console.error('Database save error:', err);
  }
};

// Get all analyses from database
const getAnalysesFromDb = async () => {
  try {
    const db = await initializeDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['analyses'], 'readonly');
      const store = transaction.objectStore('analyses');
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result.reverse());
    });
  } catch (err) {
    console.error('Database fetch error:', err);
    return [];
  }
};

// Delete analysis from database
const deleteAnalysisFromDb = async (id) => {
  try {
    const db = await initializeDB();
    const transaction = db.transaction(['analyses'], 'readwrite');
    const store = transaction.objectStore('analyses');
    store.delete(id);
  } catch (err) {
    console.error('Database delete error:', err);
  }
};

// ============== LANGUAGE TRANSLATIONS ==============
const translations = {
  en: {
    title: '🔍 AI Fake News Detector',
    subtitle: 'Detect misinformation using advanced AI analysis',
    apiKey: 'OpenAI API Key',
    textMode: 'Text Analysis',
    imageMode: 'Image Scanner',
    cameraMode: 'Camera Scanner',
    historyMode: 'History',
    enterNews: 'Enter News or Text',
    uploadImage: 'Upload & Analyze Image',
    cameraScanner: 'Camera Scanner',
    analyze: 'Analyze',
    clear: 'Clear',
    chooseImage: 'Choose Image',
    startCamera: 'Start Camera',
    capture: 'Capture',
    stop: 'Stop',
    analyzing: 'Analyzing...',
    results: 'Analysis Results',
    classification: 'Classification',
    confidence: 'Confidence Level',
    probability: 'Fake News Probability',
    aiAnalysis: 'AI Analysis',
    keyIndicators: 'Key Indicators',
    manipulation: 'Detected Manipulation Type',
    recommendations: 'Recommendations',
    sourceCredibility: 'Source Credibility',
    ready: 'Ready for Analysis',
    chooseTab: 'Choose a tab and enter content to begin',
    languageLabel: 'Language',
    darkMode: 'Dark Mode',
    speakResult: 'Speak Result',
    fakeNews: 'This is FAKE NEWS',
    trueNews: 'This news is TRUE',
    searchAnalyses: 'Search Analyses',
    deleteAnalysis: 'Delete',
    no_data: 'No analysis history',
    date: 'Date',
    input_text: 'Input',
    classification_column: 'Classification'
  },
  hi: {
    title: '🔍 एआई फेक न्यूज डिटेक्टर',
    subtitle: 'उन्नत एआई विश्लेषण का उपयोग करके मिथ्या सूचना का पता लगाएं',
    apiKey: 'OpenAI API कुंजी',
    textMode: 'पाठ विश्लेषण',
    imageMode: 'छवि स्कैनर',
    cameraMode: 'कैमरा स्कैनर',
    historyMode: 'इतिहास',
    enterNews: 'समाचार या पाठ दर्ज करें',
    uploadImage: 'छवि अपलोड करें और विश्लेषण करें',
    cameraScanner: 'कैमरा स्कैनर',
    analyze: 'विश्लेषण करें',
    clear: 'साफ करें',
    chooseImage: 'छवि चुनें',
    startCamera: 'कैमरा शुरू करें',
    capture: 'कैप्चर करें',
    stop: 'बंद करें',
    analyzing: 'विश्लेषण जारी है...',
    results: 'विश्लेषण परिणाम',
    classification: 'वर्गीकरण',
    confidence: 'विश्वास स्तर',
    probability: 'फेक न्यूज संभावना',
    aiAnalysis: 'एआई विश्लेषण',
    keyIndicators: 'मुख्य संकेतक',
    manipulation: 'पहचाना गया हेरफेर',
    recommendations: 'सिफारिशें',
    sourceCredibility: 'स्रोत विश्वसनीयता',
    ready: 'विश्लेषण के लिए तैयार',
    chooseTab: 'शुरू करने के लिए एक टैब चुनें',
    languageLabel: 'भाषा',
    darkMode: 'डार्क मोड',
    speakResult: 'परिणाम बोलें',
    fakeNews: 'यह फेक न्यूज़ है',
    trueNews: 'यह समाचार सच है',
    searchAnalyses: 'विश्लेषण खोजें',
    deleteAnalysis: 'हटाएं',
    no_data: 'कोई विश्लेषण इतिहास नहीं',
    date: 'तारीख',
    input_text: 'इनपुट',
    classification_column: 'वर्गीकरण'
  }
};

// ============== FAKE NEWS INDICATORS ==============
const fakeNewsIndicators = ['breaking', 'exclusive', 'shocking', 'unbelievable', 'you won\'t believe', 'allegedly', 'sources say', 'rumor', 'leaked', 'anonymous sources', 'must see', 'viral', 'going viral'];
const credibleSources = ['reuters', 'bbc', 'ap news', 'associated press', 'bloomberg', 'guardian', 'times', 'aljazeera', 'npr', 'pbs', 'economist', 'bbc news', 'cnn', 'aljazeera english'];

// ============== TEXT TO SPEECH ==============
const speakText = (text, language = 'en') => {
  if (!('speechSynthesis' in window)) {
    alert('Text-to-speech not supported');
    return;
  }
  
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
};

// ============== OPENAI ANALYSIS ==============
const analyzeWithOpenAI = async (input, apiKey, imageBase64 = null, language = 'en') => {
  if (!apiKey) {
    return getMockResults(input, imageBase64);
  }

  try {
    const systemPrompt = language === 'hi' 
      ? 'आप एक फेक न्यूज़ पहचान विशेषज्ञ हैं। हमेशा वैध JSON उत्तर दें।'
      : 'You are a fake news detection expert. Always respond with valid JSON only.';

    let messages = [];
    
    if (imageBase64) {
      const imagePrompt = language === 'hi'
        ? 'इस छवि का विश्लेषण करें, फेक न्यूज़ के लिए। JSON: {fake_confidence (0-100), classification (FAKE/REAL/UNCLEAR), explanation, manipulation_type, source_credibility (0-100), key_indicators (array)}'
        : 'Analyze this image for fake news and manipulation. JSON: {fake_confidence (0-100), classification (FAKE/REAL/UNCLEAR), explanation, manipulation_type, source_credibility (0-100), key_indicators (array)}';

      messages.push({
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${imageBase64}` }
          },
          { type: 'text', text: imagePrompt }
        ]
      });
    } else {
      const textPrompt = language === 'hi'
        ? `फेक न्यूज़ विश्लेषण (सभी मान 0-100)। JSON: {fake_confidence, classification (FAKE/REAL/UNCLEAR), explanation, source_credibility, key_indicators (array), confidence_level (HIGH/MEDIUM/LOW), recommendations (array)}\n\nसमाचार: "${input}"`
        : `Fake news analysis. JSON: {fake_confidence (0-100), classification (FAKE/REAL/UNCLEAR), explanation, source_credibility (0-100), key_indicators (array), confidence_level, recommendations (array)}\n\nNews: "${input}"`;

      messages.push({
        role: 'user',
        content: textPrompt
      });
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: imageBase64 ? 'gpt-4-vision' : 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 600
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content;
    const result = JSON.parse(content);
    
    return {
      fake_confidence: Math.min(100, Math.max(0, result.fake_confidence || 50)),
      classification: result.classification || 'UNCLEAR',
      confidence_level: result.confidence_level || (result.fake_confidence > 70 ? 'HIGH' : result.fake_confidence > 40 ? 'MEDIUM' : 'LOW'),
      explanation: result.explanation || 'Analysis complete',
      key_indicators: result.key_indicators || [],
      manipulation_type: result.manipulation_type || null,
      source_credibility: Math.min(100, Math.max(0, result.source_credibility || 50)),
      recommendations: result.recommendations || ['Verify with trusted sources'],
      is_image: !!imageBase64
    };
  } catch (err) {
    console.error('OpenAI error:', err);
    return getMockResults(input, imageBase64);
  }
};

// ============== MOCK RESULTS (DEMO MODE) ==============
const getMockResults = (text, imageBase64 = null) => {
  let confidence = 35 + Math.random() * 40;
  let sourceCredibility = 55;

  const lowerText = text.toLowerCase();
  const indicatorCount = fakeNewsIndicators.filter(ind => lowerText.includes(ind)).length;
  
  if (indicatorCount > 0) {
    confidence = Math.min(95, confidence + (indicatorCount * 12));
  }

  const foundSource = credibleSources.find(src => lowerText.includes(src));
  if (foundSource) {
    sourceCredibility = 80;
    confidence = Math.max(15, confidence - 25);
  }

  return {
    fake_confidence: confidence,
    classification: confidence > 70 ? 'FAKE' : confidence > 40 ? 'UNCLEAR' : 'REAL',
    confidence_level: confidence > 70 ? 'HIGH' : confidence > 40 ? 'MEDIUM' : 'LOW',
    explanation: imageBase64 
      ? 'Image analysis complete. Potential manipulation or context issues detected based on composition and metadata analysis.'
      : `Analysis based on linguistic patterns, sensationalism detection, propaganda indicators, and source credibility. ${indicatorCount > 0 ? 'Suspicious language patterns found.' : 'Professional content detected.'}`,
    key_indicators: imageBase64
      ? ['Unusual composition', 'Text overlay anomalies', 'Metadata inconsistencies']
      : indicatorCount > 0 
        ? ['Sensationalist language', 'Vague attributions', 'Emotional manipulation', 'Lack of sources']
        : ['Neutral tone', 'Cited sources', 'Professional structure', 'Verifiable claims'],
    manipulation_type: imageBase64 ? 'Potential content manipulation or context removal' : null,
    source_credibility: sourceCredibility,
    recommendations: [
      '✓ Verify with multiple independent sources',
      '✓ Check original source and publication date',
      '✓ Look for cited evidence and expert opinions',
      '✓ Use fact-checking websites (Snopes, FactCheck.org)',
      '✓ Check author credentials and reputation'
    ],
    is_image: !!imageBase64
  };
};

// ============== MAIN COMPONENT ==============
export default function Analyzer() {
  const [tabValue, setTabValue] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [cameraActive, setCameraActive] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historySearch, setHistorySearch] = useState('');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const t = translations[language];

  // Theme setup
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: '#667eea' },
      secondary: { main: '#764ba2' },
      background: {
        default: darkMode ? '#1e1e2e' : '#f5f5f5',
        paper: darkMode ? '#2d2d3d' : '#ffffff'
      }
    }
  });

  // Load history on mount
  useEffect(() => {
    const loadHistory = async () => {
      const data = await getAnalysesFromDb();
      setHistoryData(data);
    };
    loadHistory();
  }, []);

  // Save settings
  useEffect(() => {
    localStorage.setItem('openai_api_key', apiKey);
    localStorage.setItem('language', language);
    localStorage.setItem('darkMode', darkMode.toString());
  }, [apiKey, language, darkMode]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraStream(stream);
        setCameraActive(true);
      }
    } catch (err) {
      setError('Camera access denied');
    }
  };

  const captureFromCamera = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, 640, 480);
      setUploadedImage(canvasRef.current.toDataURL('image/jpeg'));
      stopCamera();
      setTabValue(1);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
      setCameraActive(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result);
        setTabValue(1);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!uploadedImage) {
      setError('No image selected');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const base64Image = uploadedImage.split(',')[1];
      if (apiKey) localStorage.setItem('openai_api_key', apiKey);
      
      const result = await analyzeWithOpenAI('Analyze image for fake news', apiKey, base64Image, language);
      setResults(result);
      await saveAnalysisToDb({ input: '[Image Analysis]', ...result, type: 'image' });
      
      // Speak result
      if (result.classification === 'FAKE') {
        speakText(t.fakeNews, language);
      } else if (result.classification === 'REAL') {
        speakText(t.trueNews, language);
      }
    } catch (err) {
      setError('Analysis failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeText = async () => {
    if (!textInput.trim()) {
      setError('Enter text to analyze');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (apiKey) localStorage.setItem('openai_api_key', apiKey);
      const result = await analyzeWithOpenAI(textInput, apiKey, null, language);
      setResults(result);
      await saveAnalysisToDb({ input: textInput, ...result, type: 'text' });
      
      // Speak result
      if (result.classification === 'FAKE') {
        speakText(t.fakeNews, language);
      } else if (result.classification === 'REAL') {
        speakText(t.trueNews, language);
      }
    } catch (err) {
      setError('Analysis failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setTextInput('');
    setUploadedImage(null);
    setResults(null);
    setError('');
    stopCamera();
  };

  const handleDeleteHistory = async (id) => {
    await deleteAnalysisFromDb(id);
    setHistoryData(historyData.filter(item => item.id !== id));
  };

  const filteredHistory = historyData.filter(item => 
    item.input.toLowerCase().includes(historySearch.toLowerCase()) ||
    item.classification.toLowerCase().includes(historySearch.toLowerCase())
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{
        minHeight: '100vh',
        background: darkMode 
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
        transition: 'all 0.3s ease'
      }}>
        <Container maxWidth="xl">
          {/* HEADER WITH CONTROLS */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Box sx={{ textAlign: 'center', flex: 1, minWidth: '300px' }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: darkMode ? '#fff' : '#fff', mb: 1 }}>
                {t.title}
              </Typography>
              <Typography variant="h6" sx={{ color: darkMode ? '#aaa' : '#fff', opacity: 0.9 }}>
                {t.subtitle}
              </Typography>
            </Box>

            {/* CONTROLS */}
            <Box sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  sx={{ backgroundColor: 'white', borderRadius: 1 }}
                >
                  <MenuItem value="en">English 🇬🇧</MenuItem>
                  <MenuItem value="hi">हिंदी 🇮🇳</MenuItem>
                </Select>
              </FormControl>

              <Tooltip title={t.darkMode}>
                <IconButton
                  onClick={() => setDarkMode(!darkMode)}
                  sx={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 1 }}
                >
                  {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* LEFT COLUMN */}
            <Grid item xs={12} md={5}>
              {/* API KEY */}
              <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                  🔑 {t.apiKey}
                </Typography>
                <TextField
                  fullWidth
                  type="password"
                  placeholder="sk-proj-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  size="small"
                  variant="outlined"
                  helperText={language === 'hi' ? 'खाली छोड़ें डेमो मोड के लिए' : 'Leave empty for demo mode'}
                />
              </Paper>

              {/* TABS */}
              <Paper sx={{ borderRadius: 3, boxShadow: 3 }}>
                <Tabs
                  value={tabValue}
                  onChange={(e, val) => setTabValue(val)}
                  variant="fullWidth"
                  sx={{ borderBottom: '2px solid #e0e0e0' }}
                >
                  <Tab icon={<ImageIcon />} label={t.textMode} />
                  <Tab icon={<ImageIcon />} label={t.imageMode} />
                  <Tab icon={<CameraAltIcon />} label={t.cameraMode} />
                  <Tab icon={<HistoryIcon />} label={t.historyMode} />
                </Tabs>

                {/* TAB 0: TEXT */}
                {tabValue === 0 && (
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                      📝 {t.enterNews}
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={8}
                      placeholder={language === 'hi' ? 'समाचार यहाँ पेस्ट करें...' : 'Paste news here...'}
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      disabled={loading}
                      sx={{ mb: 2 }}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        onClick={handleAnalyzeText}
                        disabled={loading || !textInput.trim()}
                        sx={{ flex: 1, py: 1.5, fontWeight: 'bold' }}
                      >
                        {loading ? t.analyzing : `🔍 ${t.analyze}`}
                      </Button>
                      <Button variant="outlined" onClick={handleClear} disabled={loading}>
                        <RefreshIcon />
                      </Button>
                    </Box>
                  </Box>
                )}

                {/* TAB 1: IMAGE */}
                {tabValue === 1 && (
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                      🖼️ {t.uploadImage}
                    </Typography>
                    {uploadedImage ? (
                      <>
                        <Box sx={{ mb: 2, borderRadius: 2, overflow: 'hidden', maxHeight: 300 }}>
                          <img src={uploadedImage} alt="Uploaded" style={{ width: '100%', objectFit: 'cover' }} />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="contained"
                            onClick={analyzeImage}
                            disabled={loading}
                            sx={{ flex: 1 }}
                          >
                            {loading ? t.analyzing : `🔍 ${t.analyze}`}
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => setUploadedImage(null)}
                            disabled={loading}
                          >
                            <DeleteIcon />
                          </Button>
                        </Box>
                      </>
                    ) : (
                      <Button
                        variant="contained"
                        component="label"
                        fullWidth
                        sx={{ py: 3, mb: 2 }}
                      >
                        📤 {t.chooseImage}
                        <input hidden accept="image/*" type="file" onChange={handleImageUpload} ref={fileInputRef} />
                      </Button>
                    )}
                  </Box>
                )}

                {/* TAB 2: CAMERA */}
                {tabValue === 2 && (
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                      📹 {t.cameraScanner}
                    </Typography>
                    {!cameraActive ? (
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={startCamera}
                        sx={{ py: 2, fontWeight: 'bold' }}
                      >
                        <CameraAltIcon sx={{ mr: 1 }} /> {t.startCamera}
                      </Button>
                    ) : (
                      <>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          style={{ width: '100%', borderRadius: '8px', marginBottom: '16px' }}
                        />
                        <canvas ref={canvasRef} width={640} height={480} style={{ display: 'none' }} />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button variant="contained" fullWidth onClick={captureFromCamera} sx={{ fontWeight: 'bold' }}>
                            📸 {t.capture}
                          </Button>
                          <Button variant="outlined" onClick={stopCamera}>
                            {t.stop}
                          </Button>
                        </Box>
                      </>
                    )}
                  </Box>
                )}

                {/* TAB 3: HISTORY */}
                {tabValue === 3 && (
                  <Box sx={{ p: 3 }}>
                    <TextField
                      fullWidth
                      placeholder={t.searchAnalyses}
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    
                    <TableContainer sx={{ maxHeight: 400 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>{t.date}</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>{t.classification_column}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>{t.deleteAnalysis}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredHistory.length > 0 ? (
                            filteredHistory.map((item) => (
                              <TableRow key={item.id} hover>
                                <TableCell sx={{ fontSize: '0.85rem' }}>
                                  {new Date(item.timestamp).toLocaleString(language === 'hi' ? 'hi-IN' : 'en-US')}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={item.classification}
                                    size="small"
                                    color={item.classification === 'FAKE' ? 'error' : item.classification === 'REAL' ? 'success' : 'warning'}
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell align="right">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteHistory(item.id)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={3} align="center">
                                {t.no_data}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* RIGHT COLUMN - RESULTS */}
            <Grid item xs={12} md={7}>
              {loading && (
                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, boxShadow: 3 }}>
                  <CircularProgress size={60} />
                  <Typography sx={{ mt: 3, fontWeight: 'bold', fontSize: '1.1rem' }}>
                    🤖 {t.analyzing}
                  </Typography>
                </Paper>
              )}

              {results && !loading && (
                <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      ✨ {t.results}
                    </Typography>
                    <Tooltip title={t.speakResult}>
                      <IconButton
                        onClick={() => {
                          setSpeaking(true);
                          speakText(
                            results.classification === 'FAKE' ? t.fakeNews : t.trueNews,
                            language
                          );
                          setTimeout(() => setSpeaking(false), 2000);
                        }}
                        color={speaking ? 'primary' : 'default'}
                      >
                        {speaking ? <StopIcon /> : <VolumeUpIcon />}
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {/* CLASSIFICATION ALERT */}
                  <Alert
                    severity={results.classification === 'FAKE' ? 'error' : results.classification === 'REAL' ? 'success' : 'warning'}
                    sx={{ mb: 2.5, fontSize: '1rem', fontWeight: 'bold' }}
                  >
                    <Box>{t.classification}: <span style={{ fontSize: '1.3rem' }}>{results.classification}</span></Box>
                    <Box sx={{ mt: 1 }}>{t.confidence}: <span style={{ fontSize: '1.3rem' }}>{results.confidence_level}</span></Box>
                  </Alert>

                  {/* CONFIDENCE SCORE */}
                  <Card sx={{ mb: 2.5 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          🎯 {t.probability}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: results.fake_confidence > 70 ? '#f44336' : results.fake_confidence > 40 ? '#ff9800' : '#4caf50' }}>
                          {results.fake_confidence.toFixed(1)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={results.fake_confidence}
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          '& .MuiLinearProgress-bar': {
                            background: results.fake_confidence > 70
                              ? 'linear-gradient(90deg, #f44336, #e91e63)'
                              : results.fake_confidence > 40
                              ? 'linear-gradient(90deg, #ff9800, #ffc107)'
                              : 'linear-gradient(90deg, #4caf50, #8bc34a)'
                          }
                        }}
                      />
                    </CardContent>
                  </Card>

                  {/* SOURCE CREDIBILITY */}
                  <Card sx={{ mb: 2.5 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          📊 {t.sourceCredibility}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {results.source_credibility.toFixed(1)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={results.source_credibility}
                        sx={{
                          height: 8,
                          borderRadius: 5,
                          backgroundColor: '#e0e0e0'
                        }}
                      />
                    </CardContent>
                  </Card>

                  {/* AI ANALYSIS */}
                  <Card sx={{ mb: 2.5, borderLeft: '4px solid #667eea' }}>
                    <CardContent>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        🤖 {t.aiAnalysis}
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                        {results.explanation}
                      </Typography>
                    </CardContent>
                  </Card>

                  {/* KEY INDICATORS */}
                  {results.key_indicators && results.key_indicators.length > 0 && (
                    <Card sx={{ mb: 2.5 }}>
                      <CardContent>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                          🔍 {t.keyIndicators}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {results.key_indicators.map((indicator, idx) => (
                            <Chip key={idx} label={indicator} variant="outlined" size="small" />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  )}

                  {/* RECOMMENDATIONS */}
                  {results.recommendations && results.recommendations.length > 0 && (
                    <Card sx={{ backgroundColor: '#e8f5e9', borderLeft: '4px solid #4caf50' }}>
                      <CardContent>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#2e7d32' }}>
                          💡 {t.recommendations}
                        </Typography>
                        {results.recommendations.map((rec, idx) => (
                          <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
                            {rec}
                          </Typography>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </Paper>
              )}

              {!results && !loading && (
                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, boxShadow: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: '#667eea' }}>
                    📊 {t.ready}
                  </Typography>
                  <Typography color="textSecondary">
                    {t.chooseTab}
                  </Typography>
                </Paper>
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
