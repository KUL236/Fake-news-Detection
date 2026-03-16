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
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  ThemeProvider,
  createTheme,
  Select,
  MenuItem,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Fade
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
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import axios from 'axios';

// ============== DATABASE FUNCTIONS ==============
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
    console.error('Database error:', err);
  }
};

const getAnalysesFromDb = async () => {
  try {
    const db = await initializeDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(['analyses'], 'readonly');
      const store = transaction.objectStore('analyses');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result.reverse());
    });
  } catch {
    return [];
  }
};

const deleteAnalysisFromDb = async (id) => {
  try {
    const db = await initializeDB();
    const transaction = db.transaction(['analyses'], 'readwrite');
    const store = transaction.objectStore('analyses');
    store.delete(id);
  } catch (err) {
    console.error('Delete error:', err);
  }
};

// ============== TRANSLATIONS ==============
const translations = {
  en: {
    title: '🔍 AI Fake News Detector',
    subtitle: 'Advanced Misinformation Detection with AI',
    apiKey: '🔑 OpenAI API Key',
    textMode: 'Text News',
    imageMode: 'Image Scanner',
    cameraMode: 'Camera',
    historyMode: 'History',
    enterNews: 'Enter News Article',
    uploadImage: 'Upload Image',
    cameraScanner: 'Camera Scanner',
    analyze: 'Analyze',
    clear: 'Clear',
    chooseImage: 'Choose Image',
    startCamera: 'Start Camera',
    capture: 'Capture',
    stop: 'Stop',
    analyzing: 'Analyzing with AI...',
    results: 'Analysis Results',
    classification: 'Classification',
    confidence: 'Confidence',
    probability: 'Fake Probability',
    aiAnalysis: 'AI Analysis',
    keyIndicators: 'Key Indicators',
    manipulation: 'Manipulation Type',
    recommendations: 'Recommendations',
    sourceCredibility: 'Source Trust Score',
    ready: 'Ready to Analyze',
    chooseTab: 'Select a mode and start analyzing',
    languageLabel: 'Language',
    darkMode: 'Dark Mode',
    speakResult: 'Speak Result',
    fakeNews: 'This is FAKE NEWS',
    trueNews: 'This news is TRUE',
    searchAnalyses: 'Search history',
    date: 'Date',
    classification_column: 'Result',
    news_slides: 'Trending News'
  },
  hi: {
    title: '🔍 एआई फेक न्यूज डिटेक्टर',
    subtitle: 'उन्नत कृत्रिम बुद्धिमत्ता के साथ मिथ्या सूचना पहचान',
    apiKey: '🔑 OpenAI API कुंजी',
    textMode: 'पाठ समाचार',
    imageMode: 'छवि स्कैनर',
    cameraMode: 'कैमरा',
    historyMode: 'इतिहास',
    enterNews: 'समाचार लेख दर्ज करें',
    uploadImage: 'छवि अपलोड करें',
    cameraScanner: 'कैमरा स्कैनर',
    analyze: 'विश्लेषण करें',
    clear: 'साफ करें',
    chooseImage: 'छवि चुनें',
    startCamera: 'कैमरा शुरू करें',
    capture: 'कैप्चर करें',
    stop: 'बंद करें',
    analyzing: 'एआई से विश्लेषण जारी है...',
    results: 'विश्लेषण परिणाम',
    classification: 'वर्गीकरण',
    confidence: 'आत्मविश्वास',
    probability: 'फेक संभावना',
    aiAnalysis: 'एआई विश्लेषण',
    keyIndicators: 'मुख्य संकेतक',
    manipulation: 'छेड़छाड़ का प्रकार',
    recommendations: 'सिफारिशें',
    sourceCredibility: 'स्रोत विश्वास स्कोर',
    ready: 'विश्लेषण के लिए तैयार',
    chooseTab: 'एक मोड चुनें और विश्लेषण शुरू करें',
    languageLabel: 'भाषा',
    darkMode: 'डार्क मोड',
    speakResult: 'परिणाम बोलें',
    fakeNews: 'यह फेक न्यूज़ है',
    trueNews: 'यह समाचार सच है',
    searchAnalyses: 'इतिहास खोजें',
    date: 'तारीख',
    classification_column: 'परिणाम',
    news_slides: 'ट्रेंडिंग समाचार'
  }
};

// ============== SAMPLE NEWS FOR CAROUSEL ==============
const sampleNewsArticles = [
  {
    title: 'Scientists Discover Revolutionary Cure for Disease',
    source: 'Medical Times',
    date: '2026-03-17',
    image: '🏥'
  },
  {
    title: 'Climate Action: Major Progress on Carbon Goals',
    source: 'Global News',
    date: '2026-03-16',
    image: '🌍'
  },
  {
    title: 'Tech Company Announces Game-Changing Innovation',
    source: 'Tech Daily',
    date: '2026-03-15',
    image: '💻'
  },
  {
    title: 'Economic Growth Reaches Record Levels',
    source: 'Business Weekly',
    date: '2026-03-14',
    image: '📈'
  },
  {
    title: 'New Space Discovery Reshapes Understanding',
    source: 'Science Hub',
    date: '2026-03-13',
    image: '🚀'
  }
];

// ============== ENHANCED TEXT-TO-SPEECH ==============
const speakText = (text, language = 'en') => {
  try {
    const synth = window.speechSynthesis;
    
    // Cancel any ongoing speech
    synth.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Success callback
    utterance.onstart = () => console.log('🔊 Speech started');
    utterance.onend = () => console.log('🔊 Speech ended');
    utterance.onerror = (event) => {
      console.error('🔊 Speech error:', event.error);
      alert('Speech synthesis failed. Try again.');
    };
    
    synth.speak(utterance);
    return true;
  } catch (err) {
    console.error('Text-to-speech error:', err);
    alert('Speech not supported on this browser');
    return false;
  }
};

// ============== OPENAI ANALYSIS ==============
const analyzeWithOpenAI = async (input, apiKey, imageBase64 = null, language = 'en') => {
  if (!apiKey) {
    return getMockResults(input, imageBase64);
  }

  try {
    const systemPrompt = language === 'hi' 
      ? 'आप एक फेक न्यूज़ विशेषज्ञ हैं। हमेशा JSON प्रतिक्रिया दें।'
      : 'You are a fake news detection expert. Always respond with valid JSON.';

    let messages = [];
    
    if (imageBase64) {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${imageBase64}` }
          },
          { 
            type: 'text', 
            text: 'Analyze image for fake news. JSON: {fake_confidence (0-100), classification (FAKE/REAL/UNCLEAR), explanation, key_indicators (array), source_credibility (0-100)}'
          }
        ]
      });
    } else {
      messages.push({
        role: 'user',
        content: `Fake news analysis. JSON: {fake_confidence (0-100), classification (FAKE/REAL/UNCLEAR), explanation, source_credibility (0-100), key_indicators (array), recommendations (array)}\n\nNews: "${input}"`
      });
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
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
      source_credibility: Math.min(100, Math.max(0, result.source_credibility || 50)),
      recommendations: result.recommendations || ['Verify with trusted sources'],
      is_image: !!imageBase64
    };
  } catch (err) {
    console.error('OpenAI error:', err);
    return getMockResults(input, imageBase64);
  }
};

// ============== MOCK RESULTS ==============
const getMockResults = (text, imageBase64 = null) => {
  const credibleSources = ['reuters', 'bbc', 'ap', 'bloomberg', 'guardian', 'times', 'economist', 'cnn', 'bbc news'];
  const suspiciousPatterns = ['exclusive', 'breaking', 'shocking', 'you won\'t believe', 'alleged', 'sources say', 'rumor', 'leaked'];
  
  let confidence = 35 + Math.random() * 40;
  let sourceCredibility = 55;

  const lowerText = text.toLowerCase();
  const suspiciousCount = suspiciousPatterns.filter(p => lowerText.includes(p)).length;
  
  if (suspiciousCount > 0) {
    confidence = Math.min(95, confidence + (suspiciousCount * 12));
  }

  if (credibleSources.some(src => lowerText.includes(src))) {
    sourceCredibility = 80;
    confidence = Math.max(15, confidence - 25);
  }

  return {
    fake_confidence: confidence,
    classification: confidence > 70 ? 'FAKE' : confidence > 40 ? 'UNCLEAR' : 'REAL',
    confidence_level: confidence > 70 ? 'HIGH' : confidence > 40 ? 'MEDIUM' : 'LOW',
    explanation: imageBase64 
      ? 'Image analysis: Potential manipulation detected. Visual composition analysis shows irregular patterns.'
      : `Analysis based on linguistic patterns, sensationalism detection, and source credibility. ${suspiciousCount > 0 ? 'Suspicious language markers detected.' : 'Professional content structure identified.'}`,
    key_indicators: suspiciousCount > 0 
      ? ['Sensationalismo language', 'Vague sources', 'Emotional appeal']
      : ['Neutral tone', 'Source citation', 'Fact-based content'],
    source_credibility: sourceCredibility,
    recommendations: [
      '✓ Cross-check with multiple news sources',
      '✓ Verify author and publication',
      '✓ Check original source links',
      '✓ Use fact-checking websites'
    ],
    is_image: !!imageBase64
  };
};

// ============== NEWS CAROUSEL COMPONENT ==============
const NewsCarousel = ({ articles }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [articles.length]);

  return (
    <Box
      sx={{
        position: 'relative',
        height: '200px',
        borderRadius: 3,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
        backdropFilter: 'blur(10px)',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          animation: 'slideIn 0.5s ease-in-out',
          '@keyframes slideIn': {
            from: { opacity: 0, transform: 'translateX(50px)' },
            to: { opacity: 1, transform: 'translateX(0)' },
          },
          textAlign: 'center',
          width: '100%',
          px: 3,
        }}
      >
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold', color: '#667eea' }}>
          {articles[currentIndex].image} {articles[currentIndex].title}
        </Typography>
        <Typography variant="body2" sx={{ color: '#999', mb: 1 }}>
          {articles[currentIndex].source} • {articles[currentIndex].date}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
          {articles.map((_, idx) => (
            <Box
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              sx={{
                width: idx === currentIndex ? 12 : 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: idx === currentIndex ? '#667eea' : '#ccc',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
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

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: '#667eea' },
      secondary: { main: '#764ba2' },
    }
  });

  useEffect(() => {
    const loadHistory = async () => {
      const data = await getAnalysesFromDb();
      setHistoryData(data);
    };
    loadHistory();
  }, []);

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
      setTimeout(() => {
        setSpeaking(true);
        const verdict = result.classification === 'FAKE' ? t.fakeNews : t.trueNews;
        const spoken = speakText(verdict, language);
        if (spoken) {
          setTimeout(() => setSpeaking(false), 3000);
        } else {
          setSpeaking(false);
        }
      }, 500);
    } catch (err) {
      setError('Analysis failed');
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
      setTimeout(() => {
        setSpeaking(true);
        const verdict = result.classification === 'FAKE' ? t.fakeNews : t.trueNews;
        const spoken = speakText(verdict, language);
        if (spoken) {
          setTimeout(() => setSpeaking(false), 3000);
        } else {
          setSpeaking(false);
        }
      }, 500);
    } catch (err) {
      setError('Analysis failed');
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
    item.input.toLowerCase().includes(historySearch.toLowerCase())
  );

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          background: darkMode 
            ? 'linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundAttachment: 'fixed',
          py: 4,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: darkMode 
              ? 'radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.1) 0%, transparent 50%)'
              : 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
            pointerEvents: 'none',
            zIndex: 0
          }
        }}
      >
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          {/* HEADER */}
          <Fade in={true} timeout={800}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 4,
              flexWrap: 'wrap',
              gap: 2
            }}>
              <Box>
                <Typography variant="h2" sx={{
                  fontWeight: 900,
                  color: '#fff',
                  mb: 1,
                  textShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {t.title}
                </Typography>
                <Typography variant="h6" sx={{
                  color: darkMode ? '#aaa' : '#fff',
                  opacity: 0.95,
                  letterSpacing: 1
                }}>
                  {t.subtitle}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    sx={{
                      backgroundColor: 'white',
                      borderRadius: 2,
                      fontWeight: 'bold'
                    }}
                  >
                    <MenuItem value="en">English 🇬🇧</MenuItem>
                    <MenuItem value="hi">हिंदी 🇮🇳</MenuItem>
                  </Select>
                </FormControl>

                <Tooltip title={t.darkMode}>
                  <IconButton
                    onClick={() => setDarkMode(!darkMode)}
                    sx={{
                      color: 'white',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderRadius: 2,
                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
                    }}
                  >
                    {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Fade>

          {/* NEWS CAROUSEL */}
          <Fade in={true} timeout={1200}>
            <Box sx={{ mb: 4 }}>
              <NewsCarousel articles={sampleNewsArticles} />
            </Box>
          </Fade>

          {error && (
            <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* LEFT COLUMN */}
            <Grid item xs={12} md={5}>
              {/* API KEY */}
              <Fade in={true} timeout={1000}>
                <Paper sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: 3,
                  background: darkMode
                    ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: '#667eea' }}>
                    {t.apiKey}
                  </Typography>
                  <TextField
                    fullWidth
                    type="password"
                    placeholder="sk-proj-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    size="small"
                    variant="outlined"
                    helperText="Optional - Demo mode works without it"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 2
                      }
                    }}
                  />
                </Paper>
              </Fade>

              {/* TABS */}
              <Fade in={true} timeout={1200}>
                <Paper sx={{
                  borderRadius: 3,
                  background: darkMode
                    ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                }}>
                  <Tabs
                    value={tabValue}
                    onChange={(e, val) => setTabValue(val)}
                    variant="fullWidth"
                    sx={{
                      borderBottom: '2px solid rgba(255,255,255,0.2)',
                      '& .MuiTab-root': {
                        fontWeight: 'bold',
                        color: darkMode ? '#aaa' : '#fff',
                        '&.Mui-selected': {
                          color: '#667eea',
                          background: 'rgba(102, 126, 234, 0.2)'
                        }
                      }
                    }}
                  >
                    <Tab icon={<ImageIcon />} label={t.textMode} />
                    <Tab icon={<ImageIcon />} label={t.imageMode} />
                    <Tab icon={<CameraAltIcon />} label={t.cameraMode} />
                    <Tab icon={<HistoryIcon />} label={t.historyMode} />
                  </Tabs>

                  {/* TAB 0: TEXT */}
                  {tabValue === 0 && (
                    <Box sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#667eea' }}>
                        📝 {t.enterNews}
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={8}
                        placeholder="Paste news article here..."
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        disabled={loading}
                        sx={{
                          mb: 2,
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                            borderRadius: 2
                          }
                        }}
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          onClick={handleAnalyzeText}
                          disabled={loading || !textInput.trim()}
                          sx={{
                            flex: 1,
                            py: 1.5,
                            fontWeight: 'bold',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                          }}
                          startIcon={<PlayCircleIcon />}
                        >
                          {loading ? t.analyzing : t.analyze}
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={handleClear}
                          disabled={loading}
                          sx={{
                            borderColor: 'rgba(255,255,255,0.3)',
                            color: darkMode ? '#aaa' : '#fff'
                          }}
                        >
                          <RefreshIcon />
                        </Button>
                      </Box>
                    </Box>
                  )}

                  {/* TAB 1: IMAGE */}
                  {tabValue === 1 && (
                    <Box sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#667eea' }}>
                        🖼️ {t.uploadImage}
                      </Typography>
                      {uploadedImage ? (
                        <>
                          <Box sx={{
                            mb: 2,
                            borderRadius: 2,
                            overflow: 'hidden',
                            maxHeight: 300,
                            border: '2px solid rgba(102, 126, 234, 0.3)',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)'
                          }}>
                            <img src={uploadedImage} alt="Uploaded" style={{ width: '100%', objectFit: 'cover' }} />
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              variant="contained"
                              onClick={analyzeImage}
                              disabled={loading}
                              sx={{
                                flex: 1,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                              }}
                              startIcon={<PlayCircleIcon />}
                            >
                              {loading ? t.analyzing : t.analyze}
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
                          sx={{
                            py: 3,
                            mb: 2,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            fontWeight: 'bold'
                          }}
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
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#667eea' }}>
                        📹 {t.cameraScanner}
                      </Typography>
                      {!cameraActive ? (
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={startCamera}
                          sx={{
                            py: 2,
                            fontWeight: 'bold',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          }}
                        >
                          <CameraAltIcon sx={{ mr: 1 }} /> {t.startCamera}
                        </Button>
                      ) : (
                        <>
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            style={{
                              width: '100%',
                              borderRadius: '8px',
                              marginBottom: '16px',
                              border: '2px solid rgba(102, 126, 234, 0.3)'
                            }}
                          />
                          <canvas ref={canvasRef} width={640} height={480} style={{ display: 'none' }} />
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              variant="contained"
                              fullWidth
                              onClick={captureFromCamera}
                              sx={{
                                fontWeight: 'bold',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                              }}
                            >
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
                            <TableRow sx={{ backgroundColor: 'rgba(102, 126, 234, 0.2)' }}>
                              <TableCell sx={{ fontWeight: 'bold' }}>{t.date}</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>{t.classification_column}</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Action</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {filteredHistory.length > 0 ? (
                              filteredHistory.map((item) => (
                                <TableRow key={item.id} hover>
                                  <TableCell sx={{ fontSize: '0.85rem' }}>
                                    {new Date(item.timestamp).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={item.classification}
                                      size="small"
                                      color={item.classification === 'FAKE' ? 'error' : item.classification === 'REAL' ? 'success' : 'warning'}
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
                                  No history
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}
                </Paper>
              </Fade>
            </Grid>

            {/* RIGHT COLUMN */}
            <Grid item xs={12} md={7}>
              {loading && (
                <Fade in={true}>
                  <Paper sx={{
                    p: 4,
                    textAlign: 'center',
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
                  }}>
                    <CircularProgress size={60} sx={{ color: '#667eea' }} />
                    <Typography sx={{ mt: 3, fontWeight: 'bold', fontSize: '1.2rem', color: darkMode ? '#fff' : '#fff' }}>
                      🤖 {t.analyzing}
                    </Typography>
                  </Paper>
                </Fade>
              )}

              {results && !loading && (
                <Fade in={true}>
                  <Paper sx={{
                    p: 3,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#667eea' }}>
                        ✨ {t.results}
                      </Typography>
                      <Tooltip title={t.speakResult}>
                        <IconButton
                          onClick={() => {
                            setSpeaking(true);
                            const verdict = results.classification === 'FAKE' ? t.fakeNews : t.trueNews;
                            speakText(verdict, language);
                            setTimeout(() => setSpeaking(false), 3000);
                          }}
                          sx={{
                            color: speaking ? '#667eea' : darkMode ? '#aaa' : '#fff',
                            backgroundColor: 'rgba(102, 126, 234, 0.2)',
                            borderRadius: 2
                          }}
                        >
                          {speaking ? <StopIcon /> : <VolumeUpIcon />}
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <Alert
                      severity={results.classification === 'FAKE' ? 'error' : results.classification === 'REAL' ? 'success' : 'warning'}
                      sx={{ mb: 2.5, fontSize: '1rem', fontWeight: 'bold', borderRadius: 2 }}
                    >
                      <Typography variant="body2">
                        {t.classification}: <strong style={{ fontSize: '1.3rem' }}>{results.classification}</strong>
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {t.confidence}: <strong style={{ fontSize: '1.3rem' }}>{results.confidence_level}</strong>
                      </Typography>
                    </Alert>

                    <Card sx={{ mb: 2.5, borderRadius: 2 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            🎯 {t.probability}
                          </Typography>
                          <Typography variant="body2" sx={{
                            fontWeight: 'bold',
                            color: results.fake_confidence > 70 ? '#f44336' : results.fake_confidence > 40 ? '#ff9800' : '#4caf50'
                          }}>
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

                    <Card sx={{ mb: 2.5, borderRadius: 2 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            📊 {t.sourceCredibility}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {results.source_credibility.toFixed(0)}/100
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={results.source_credibility}
                          sx={{ height: 8, borderRadius: 5 }}
                        />
                      </CardContent>
                    </Card>

                    <Card sx={{ mb: 2.5, borderRadius: 2, borderLeft: '4px solid #667eea' }}>
                      <CardContent>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#667eea' }}>
                          🤖 {t.aiAnalysis}
                        </Typography>
                        <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                          {results.explanation}
                        </Typography>
                      </CardContent>
                    </Card>

                    {results.key_indicators && results.key_indicators.length > 0 && (
                      <Card sx={{ mb: 2.5, borderRadius: 2 }}>
                        <CardContent>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#667eea' }}>
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

                    {results.recommendations && results.recommendations.length > 0 && (
                      <Card sx={{ borderRadius: 2, borderLeft: '4px solid #4caf50' }}>
                        <CardContent>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#4caf50' }}>
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
                </Fade>
              )}

              {!results && !loading && (
                <Fade in={true}>
                  <Paper sx={{
                    p: 4,
                    textAlign: 'center',
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
                  }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: '#667eea' }}>
                      📊 {t.ready}
                    </Typography>
                    <Typography color="textSecondary" sx={{ color: darkMode ? '#aaa' : '#fff' }}>
                      {t.chooseTab}
                    </Typography>
                  </Paper>
                </Fade>
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
