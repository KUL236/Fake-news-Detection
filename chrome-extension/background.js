// Fake News Detector Chrome Extension - Background Service Worker
// Handles API communication and cross-extension messaging

const API_SERVER = 'http://localhost:5000';
const CACHE_EXPIRY = 3600000; // 1 hour in milliseconds

// Cache for storing recent analysis results
let analysisCache = {};

/**
 * Listen for messages from content scripts and popup
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeText') {
    analyzeTextViaAPI(request.text, sendResponse);
    return true; // Keep channel open for async response
  } else if (request.action === 'analyzeUrl') {
    analyzeUrlViaAPI(request.url, sendResponse);
    return true;
  } else if (request.action === 'getCachedAnalysis') {
    const cached = getFromCache(request.key);
    sendResponse({ cached: cached });
  } else if (request.action === 'clearCache') {
    analysisCache = {};
    sendResponse({ status: 'cache_cleared' });
  }
  
  return false;
});

/**
 * Analyze text via Flask API
 */
async function analyzeTextViaAPI(text, sendResponse) {
  if (!text || text.trim().length === 0) {
    sendResponse({ error: 'Empty text' });
    return;
  }
  
  // Check cache first
  const cacheKey = hashText(text);
  const cached = getFromCache(cacheKey);
  if (cached) {
    sendResponse({ result: cached, fromCache: true });
    return;
  }
  
  try {
    const response = await fetch(`${API_SERVER}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        text: text,
        headline: extractHeadline(text)
      })
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    // Cache the result
    setInCache(cacheKey, result);
    
    sendResponse({ result: result, fromCache: false });
    
    // Send notification if enabled
    const settings = await chrome.storage.sync.get(['showNotifications']);
    if (settings.showNotifications !== false && result.is_fake) {
      showNotification(result);
    }
    
  } catch (error) {
    console.error('API Error:', error);
    sendResponse({ 
      error: error.message,
      details: 'Make sure the Flask API server is running at ' + API_SERVER
    });
  }
}

/**
 * Analyze URL via Flask API
 */
async function analyzeUrlViaAPI(url, sendResponse) {
  if (!url || url.trim().length === 0) {
    sendResponse({ error: 'Empty URL' });
    return;
  }
  
  // Check cache
  const cacheKey = hashText(url);
  const cached = getFromCache(cacheKey);
  if (cached) {
    sendResponse({ result: cached, fromCache: true });
    return;
  }
  
  try {
    const response = await fetch(`${API_SERVER}/api/analyze/url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        url: url
      })
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    // Cache the result
    setInCache(cacheKey, result);
    
    sendResponse({ result: result, fromCache: false });
    
    // Send notification if enabled
    const settings = await chrome.storage.sync.get(['showNotifications']);
    if (settings.showNotifications !== false && result.is_fake) {
      showNotification(result);
    }
    
  } catch (error) {
    console.error('API Error:', error);
    sendResponse({ 
      error: error.message,
      details: 'Make sure the Flask API server is running at ' + API_SERVER
    });
  }
}

/**
 * Show browser notification for fake news
 */
function showNotification(analysisResult) {
  const title = analysisResult.is_fake ? 
    '⚠️ Potential Fake News Detected' : 
    '✅ Content Appears Legitimate';
  
  const message = `Confidence: ${Math.round(analysisResult.fake_confidence * 100)}%`;
  
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'images/icon-128.png',
    title: title,
    message: message,
    priority: analysisResult.is_fake ? 2 : 1
  });
}

/**
 * Handle context menu item clicks
 */
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'analyze-selection') {
    const selectedText = info.selectionText;
    
    // Send message to content script to analyze selected text
    chrome.tabs.sendMessage(tab.id, {
      action: 'analyzeSelection',
      text: selectedText
    });
  }
});

/**
 * Initialize context menu on extension install/startup
 */
chrome.runtime.onInstalled.addListener(() => {
  // Create context menu for analyzing selected text
  chrome.contextMenus.create({
    id: 'analyze-selection',
    title: 'Analyze with Fake News Detector',
    contexts: ['selection']
  });
  
  // Set default settings
  chrome.storage.sync.get({
    autoAnalyze: true,
    showNotifications: true,
    highlightSuspicious: true,
    cacheResults: true
  }, (items) => {
    // Settings already exist or defaults are set
  });
  
  // Clear old cache
  clearExpiredCache();
});

/**
 * Cache management functions
 */
function setInCache(key, value) {
  analysisCache[key] = {
    data: value,
    timestamp: Date.now()
  };
}

function getFromCache(key) {
  const cached = analysisCache[key];
  
  if (!cached) {
    return null;
  }
  
  // Check if expired
  if (Date.now() - cached.timestamp > CACHE_EXPIRY) {
    delete analysisCache[key];
    return null;
  }
  
  return cached.data;
}

function clearExpiredCache() {
  const now = Date.now();
  for (const key in analysisCache) {
    if (now - analysisCache[key].timestamp > CACHE_EXPIRY) {
      delete analysisCache[key];
    }
  }
}

/**
 * Simple hash function for caching keys
 */
function hashText(text) {
  let hash = 0;
  const str = text.substring(0, 1000); // Only hash first 1000 chars
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return 'cache_' + Math.abs(hash).toString(36);
}

/**
 * Extract headline from text (first line or first 100 chars)
 */
function extractHeadline(text) {
  const lines = text.split('\n');
  const firstLine = lines[0].trim();
  
  if (firstLine.length < 150) {
    return firstLine;
  }
  
  return text.substring(0, 100) + '...';
}

/**
 * Listen for tab updates to auto-analyze pages if enabled
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    chrome.storage.sync.get(['autoAnalyze'], (result) => {
      if (result.autoAnalyze === true) {
        // Inject content script
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['content.js']
        }).catch(err => {
          // Silently fail if content script can't be injected
          console.log('Could not inject content script:', err);
        });
      }
    });
  }
});

/**
 * API health check
 */
async function checkAPIHealth() {
  try {
    const response = await fetch(`${API_SERVER}/api/health`, {
      method: 'GET',
      timeout: 5000
    });
    
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Update badge with analysis status
 */
function updateBadge(tabId, status) {
  chrome.action.setBadgeText({ text: status, tabId: tabId });
  
  switch (status) {
    case '✓':
      chrome.action.setBadgeBackgroundColor({ color: '#4caf50', tabId: tabId });
      break;
    case '!':
      chrome.action.setBadgeBackgroundColor({ color: '#f44336', tabId: tabId });
      break;
    case '...':
      chrome.action.setBadgeBackgroundColor({ color: '#1976d2', tabId: tabId });
      break;
  }
}

/**
 * Clear badge status
 */
function clearBadge(tabId) {
  chrome.action.setBadgeText({ text: '', tabId: tabId });
}

// Periodic cache cleanup (every 10 minutes)
setInterval(() => {
  clearExpiredCache();
}, 600000);

console.log('Fake News Detector extension background service worker loaded');
