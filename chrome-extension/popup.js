// Fake News Detector Chrome Extension - Popup Script

const API_SERVER = 'http://localhost:5000';

// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const tabName = tab.dataset.tab;
    
    // Remove active from all tabs and contents
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    // Add active to clicked tab
    tab.classList.add('active');
    document.getElementById(tabName).classList.add('active');
  });
});

// Analyze button
document.getElementById('analyzeBtn').addEventListener('click', analyzeText);
document.getElementById('analyzePageBtn').addEventListener('click', analyzePage);
document.getElementById('analyzeUrlBtn').addEventListener('click', analyzeUrl);
document.getElementById('saveSettings').addEventListener('click', saveSettings);

async function analyzeText() {
  const text = document.getElementById('newsText').value;
  
  if (!text.trim()) {
    showError('Please enter some text to analyze');
    return;
  }
  
  showLoading();
  
  try {
    const response = await fetch(`${API_SERVER}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: text })
    });
    
    if (!response.ok) throw new Error('API Error');
    
    const result = await response.json();
    displayResults(result);
  } catch (error) {
    showError(`Analysis failed: ${error.message}`);
  }
}

async function analyzePage() {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const tab = tabs[0];
    
    // Inject content script to get page text
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: getPageContent
    }, (results) => {
      if (results && results[0]) {
        document.getElementById('newsText').value = results[0].result;
        analyzeText();
      }
    });
  });
}

async function analyzeUrl() {
  const url = prompt('Enter URL to analyze:');
  if (!url) return;
  
  showLoading();
  
  try {
    const response = await fetch(`${API_SERVER}/api/analyze/url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: url })
    });
    
    if (!response.ok) throw new Error('API Error');
    
    const result = await response.json();
    displayResults(result);
  } catch (error) {
    showError(`URL analysis failed: ${error.message}`);
  }
}

function displayResults(result) {
  const container = document.getElementById('resultContainer');
  const confidence = Math.round(result.fake_confidence * 100);
  const isFake = result.is_fake;
  
  container.innerHTML = `
    <div class="results">
      <div class="result-badge ${isFake ? 'fake' : 'real'}">
        ${isFake ? '🚨 LIKELY FAKE' : '✅ LIKELY REAL'} - ${confidence}%
      </div>
      
      <div>
        <strong>Confidence:</strong>
        <div class="confidence-bar">
          <div class="confidence-fill" style="
            width: ${confidence}%;
            background: ${isFake ? '#f44336' : '#4caf50'};
          "></div>
        </div>
      </div>
      
      <p style="margin-top: 8px; font-size: 12px; color: #555;">
        <strong>Analysis:</strong> ${result.explanation}
      </p>
      
      ${result.suspicious_phrases && result.suspicious_phrases.length > 0 ? `
        <div style="margin-top: 8px;">
          <strong style="font-size: 12px;">⚠️ Suspicious Phrases (${result.suspicious_phrases.length}):</strong>
          <ul style="font-size: 11px; margin: 4px 0 0 16px;">
            ${result.suspicious_phrases.slice(0, 3).map(p => `<li>${p.phrase}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      <button class="btn-secondary" style="margin-top: 8px;" onclick="document.querySelector('.tab[data-tab=analyze]').click()">
        Analyze Another
      </button>
    </div>
  `;
  
  // Switch to results tab
  document.querySelector('.tab[data-tab=results]').click();
}

function showLoading() {
  const container = document.getElementById('resultContainer');
  container.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Analyzing...</p>
    </div>
  `;
}

function showError(message) {
  const container = document.getElementById('resultContainer');
  container.innerHTML = `<div class="error">❌ ${message}</div>`;
}

function saveSettings() {
  const settings = {
    autoAnalyze: document.getElementById('autoAnalyze').checked,
    showNotifications: document.getElementById('showNotifications').checked,
    highlightSuspicious: document.getElementById('highlightSuspicious').checked
  };
  
  chrome.storage.sync.set(settings, () => {
    alert('Settings saved!');
  });
}

// Load settings on popup open
chrome.storage.sync.get(['autoAnalyze', 'showNotifications', 'highlightSuspicious'], (result) => {
  document.getElementById('autoAnalyze').checked = result.autoAnalyze !== false;
  document.getElementById('showNotifications').checked = result.showNotifications !== false;
  document.getElementById('highlightSuspicious').checked = result.highlightSuspicious !== false;
});

// Get page content
function getPageContent() {
  return document.body.innerText.substring(0, 5000);
}
