import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {
  ThemeProvider,
  createTheme,
  AppBar,
  Toolbar,
  Box,
  Container,
  Typography,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CssBaseline
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SearchIcon from '@mui/icons-material/Search';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import InfoIcon from '@mui/icons-material/Info';
import './App.css';

// Pages
import Analyzer from './pages/Analyzer';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import About from './pages/About';

// Beautiful theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#6366f1',
      light: '#818cf8',
      dark: '#4f46e5'
    },
    secondary: {
      main: '#ec4899',
      light: '#f472b6',
      dark: '#be185d'
    },
    success: {
      main: '#10b981',
      light: '#6ee7b7',
      dark: '#059669'
    },
    error: {
      main: '#ef4444',
      light: '#fca5a5',
      dark: '#dc2626'
    },
    warning: {
      main: '#f59e0b',
      light: '#fde68a',
      dark: '#d97706'
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff'
    }
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em'
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '-0.01em'
    },
    h3: {
      fontSize: '1.875rem',
      fontWeight: 600
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '8px',
          transition: 'all 0.3s ease'
        },
        contained: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
            transform: 'translateY(-2px)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            transform: 'translateY(-4px)'
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          backgroundColor: '#ffffff',
          backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
        }
      }
    }
  }
});

function App() {
  const [analyzeResult, setAnalyzeResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navigationItems = [
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { label: 'Analyzer', icon: <SearchIcon />, path: '/analyzer' },
    { label: 'Analytics', icon: <BarChartIcon />, path: '/analytics' },
    { label: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { label: 'About', icon: <InfoIcon />, path: '/about' }
  ];

  const handleAnalyze = async (text, headline, url) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'demo-key'
        },
        body: JSON.stringify({
          text,
          headline,
          url
        })
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      setAnalyzeResult(result);
    } catch (err) {
      setError(err.message);
      console.error('Error analyzing text:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
          {/* Header */}
          <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid #e2e8f0' }}>
            <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
              <IconButton
                color="primary"
                edge="start"
                onClick={() => setDrawerOpen(true)}
                sx={{ mr: 2, display: { sm: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
              
              <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}>
                  <Box sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                  }}>
                    🔍
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', display: { xs: 'none', sm: 'block' } }}>
                    FakeNews Detector
                  </Typography>
                </Box>
              </Box>

              {/* Desktop Navigation */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                {navigationItems.map((item) => (
                  <Button
                    key={item.path}
                    href={item.path}
                    sx={{
                      color: '#64748b',
                      textTransform: 'none',
                      fontWeight: 500,
                      '&:hover': {
                        color: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)'
                      }
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            </Toolbar>
          </AppBar>

          {/* Mobile Drawer */}
          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
          >
            <Box sx={{ width: 280, pt: 2 }}>
              <List>
                {navigationItems.map((item) => (
                  <ListItem
                    button
                    key={item.path}
                    href={item.path}
                    component="a"
                    onClick={() => setDrawerOpen(false)}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        color: '#6366f1'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Drawer>

          {/* Main Content */}
          <Container maxWidth="xl" sx={{ flex: 1, py: 4 }}>
            <Routes>
              <Route 
                path="/" 
                element={<Dashboard />}
              />
              <Route 
                path="/analyzer" 
                element={
                  <Analyzer 
                    onAnalyze={handleAnalyze}
                    result={analyzeResult}
                    isLoading={isLoading}
                    error={error}
                  />
                } 
              />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </Container>

          {/* Footer */}
          <Box
            component="footer"
            sx={{
              py: 3,
              px: 2,
              mt: 'auto',
              backgroundColor: '#ffffff',
              borderTop: '1px solid #e2e8f0',
              textAlign: 'center'
            }}
          >
            <Typography variant="body2" color="textSecondary">
              &copy; 2026 Advanced Fake News Detection System | Built with ❤️ using AI & ML
            </Typography>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
