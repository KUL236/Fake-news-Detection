import React, { useState } from 'react';
import {
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
  AppBar,
  Toolbar,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Typography
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Import pages
import Dashboard from './pages/Dashboard';
import Analyzer from './pages/Analyzer';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import About from './pages/About';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0'
    },
    secondary: {
      main: '#dc004e',
      light: '#ff4081',
      dark: '#c2185b'
    },
    success: {
      main: '#4caf50',
      light: '#66bb6a',
      dark: '#388e3c'
    },
    error: {
      main: '#f44336',
      light: '#ef5350',
      dark: '#d32f2f'
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
      fontSize: '2.5rem'
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem'
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem'
    }
  }
});

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <HomeIcon />, path: '/' },
    { text: 'Analyzer', icon: <AssessmentIcon />, path: '/analyzer' },
    { text: 'Analytics', icon: <AssessmentIcon />, path: '/analytics' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { text: 'About', icon: <InfoIcon />, path: '/about' }
  ];

  const drawer = (
    <div>
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          📰 FakeNews Detector
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            component={Link}
            to={item.path}
            onClick={() => setMobileOpen(false)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex' }}>
          {/* App Bar */}
          <AppBar position="fixed" sx={{ zIndex: 1201 }}>
            <Toolbar>
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { sm: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                🔍 Advanced Fake News Detection System
              </Typography>
              <Typography variant="body2">v1.0.0</Typography>
            </Toolbar>
          </AppBar>

          {/* Drawer */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            sx={{
              width: 280,
              display: { xs: 'block', sm: 'none' }
            }}
          >
            {drawer}
          </Drawer>

          <Drawer
            variant="permanent"
            sx={{
              width: 280,
              flexShrink: 0,
              [`& .MuiDrawer-paper`]: {
                width: 280,
                boxSizing: 'border-box',
                marginTop: '64px'
              },
              display: { xs: 'none', sm: 'block' }
            }}
          >
            {drawer}
          </Drawer>

          {/* Main Content */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              marginTop: '64px',
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
              minHeight: '100vh'
            }}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/analyzer" element={<Analyzer />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
