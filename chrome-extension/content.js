// Fake News Detector Chrome Extension - Content Script
// Injects into web pages to analyze content and highlight suspicious phrases

const API_SERVER = 'http://localhost:5000';
let analysisResults = null;

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeCurrentPage') {
    analyzeCurrentArticle();
    sendResponse({ status: 'analyzing' });
  } else if (request.action === 'highlightSuspicious') {
    highlightSuspiciousPhrases();
    sendResponse({ status: 'highlighted' });
  } else if (request.action === 'getAnalysis') {
    sendResponse({ analysis: analysisResults });
  }
});

/**
 * Extract article content from current page
 * Supports common news site structures
 */
async function analyzeCurrentArticle() {
  try {
    // Try to extract article text from common article containers
    const articleContent = extractArticleContent();
    
    if (!articleContent || articleContent.length < 20) {
      console.warn('Could not extract sufficient article content');
      return;
    }
    
    // Send to background script for analysis
    chrome.runtime.sendMessage({
      action: 'analyzeText',
      text: articleContent
    }, (response) => {
      if (response && response.result) {
        analysisResults = response.result;
        injectAnalysisUI(response.result);
      }
    });
    
  } catch (error) {
    console.error('Error analyzing page:', error);
  }
}

/**
 * Extract article content from page
 */
function extractArticleContent() {
  let text = '';
  
  // Common article content selectors
  const selectors = [
    'article',
    'main',
    '[role="main"]',
    '.article-body',
    '.post-content',
    '.entry-content',
    '.content',
    '.story',
    '[itemprop="articleBody"]'
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      text = element.innerText;
      if (text.length > 100) break;
    }
  }
  
  // Try to get headline if not enough text
  if (text.length < 100) {
    const headingSelectors = ['h1', '.headline', '.title', '[itemprop="headline"]'];
    for (const selector of headingSelectors) {
      const heading = document.querySelector(selector);
      if (heading) {
        text = heading.innerText + ' ' + text;
      }
    }
  }
  
  return text.trim().substring(0, 5000);
}

/**
 * Inject analysis results UI into page
 */
function injectAnalysisUI(analysis) {
  // Remove existing UI if present
  const existingUI = document.getElementById('fake-news-detector-widget');
  if (existingUI) {
    existingUI.remove();
  }
  
  const widget = document.createElement('div');
  widget.id = 'fake-news-detector-widget';
  widget.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 320px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    overflow: hidden;
    animation: slideIn 0.3s ease-out;
  `;
  
  const confidence = Math.round(analysis.confidence_score * 100);
  const isFake = analysis.classification === 'FAKE';
  const riskLevel = analysis.risk_level || 'medium';
  
  const header = document.createElement('div');
  header.style.cssText = `
    background: ${isFake ? '#f44336' : '#4caf50'};
    color: white;
    padding: 16px;
    text-align: center;
  `;
  header.innerHTML = `
    <div style="font-size: 14px; font-weight: bold;">
      ${isFake ? '⚠️ LIKELY FAKE' : '✅ LIKELY REAL'}
    </div>
    <div style="font-size: 12px; opacity: 0.9; margin-top: 4px;">
      Confidence: ${confidence}%
    </div>
  `;
  
  const body = document.createElement('div');
  body.style.cssText = `
    padding: 16px;
    font-size: 13px;
    color: #333;
  `;
  
  let bodyHTML = `
    <div style="margin-bottom: 12px;">
      <strong>Risk Level:</strong> <span style="color: ${getRiskColor(riskLevel)}">${riskLevel.toUpperCase()}</span>
    </div>
    <div style="margin-bottom: 12px;">
      <strong>Explanation:</strong>
      <p style="margin-top: 6px; font-size: 12px; color: #666; line-height: 1.4;">
        ${analysis.explanation || 'Analysis complete'}
      </p>
    </div>
  `;
  
  // Add suspicious phrases if available
  if (analysis.suspicious_phrases && analysis.suspicious_phrases.length > 0) {
    bodyHTML += `
      <div style="margin-bottom: 12px;">
        <strong>⚠️ Suspicious Phrases (${analysis.suspicious_phrases.length.toString().slice(0, 3)}):</strong>
        <ul style="margin: 6px 0 0 16px; font-size: 11px; color: #f44336;">
          ${analysis.suspicious_phrases.slice(0, 5).map(p => 
            `<li title="${p.category || 'suspicious'}">${p.phrase}</li>`
          ).join('')}
        </ul>
      </div>
    `;
  }
  
  // Add sentiment if available
  if (analysis.sentiment_analysis) {
    const sentiment = analysis.sentiment_analysis;
    const sentimentScore = sentiment.vader_sentiment?.compound || 0;
    bodyHTML += `
      <div style="margin-bottom: 12px; padding: 8px; background: #f5f5f5; border-radius: 4px;">
        <strong>Sentiment:</strong>
        <div style="font-size: 12px; margin-top: 4px;">
          ${sentimentScore > 0.1 ? '😊 Positive' : sentimentScore < -0.1 ? '😞 Negative' : '😐 Neutral'}
          ${sentiment.emotional_intensity ? ` (Intensity: ${Math.round(sentiment.emotional_intensity * 100)}%)` : ''}
        </div>
      </div>
    `;
  }
  
  bodyHTML += `
    <div style="display: flex; gap: 8px; margin-top: 12px;">
      <button id="fake-news-highlight-btn" style="
        flex: 1; padding: 8px; background: #1976d2; color: white;
        border: none; border-radius: 4px; cursor: pointer; font-size: 12px;
        font-weight: bold;
      ">Highlight</button>
      <button id="fake-news-close-btn" style="
        flex: 1; padding: 8px; background: #f0f0f0; color: #333;
        border: none; border-radius: 4px; cursor: pointer; font-size: 12px;
      ">Close</button>
    </div>
  `;
  
  body.innerHTML = bodyHTML;
  
  widget.appendChild(header);
  widget.appendChild(body);
  document.body.appendChild(widget);
  
  // Inject animation style
  if (!document.getElementById('fake-news-detector-styles')) {
    const style = document.createElement('style');
    style.id = 'fake-news-detector-styles';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      .fake-news-highlight {
        background-color: #fff3cd !important;
        border-bottom: 3px solid #ffc107 !important;
        cursor: pointer;
      }
      
      .fake-news-highlight:hover {
        background-color: #ffe69c !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Event handlers
  document.getElementById('fake-news-highlight-btn').addEventListener('click', 
    () => highlightSuspiciousPhrases(analysis));
  document.getElementById('fake-news-close-btn').addEventListener('click', 
    () => widget.remove());
}

/**
 * Highlight suspicious phrases in page content
 */
function highlightSuspiciousPhrases(analysis) {
  if (!analysis || !analysis.suspicious_phrases) return;
  
  const phrases = analysis.suspicious_phrases;
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  const nodesToReplace = [];
  let currentNode;
  
  while (currentNode = walker.nextNode()) {
    const text = currentNode.textContent;
    let modified = false;
    
    for (const phrase of phrases.slice(0, 20)) {
      if (text.toLowerCase().includes(phrase.phrase.toLowerCase())) {
        modified = true;
        break;
      }
    }
    
    if (modified) {
      nodesToReplace.push(currentNode);
    }
  }
  
  // Replace text nodes with highlighted versions
  nodesToReplace.forEach(node => {
    let html = node.textContent;
    
    // Sort phrases by length (longest first) to avoid nested replacements
    const sortedPhrases = phrases.slice().sort((a, b) => 
      b.phrase.length - a.phrase.length
    );
    
    for (const phrase of sortedPhrases.slice(0, 20)) {
      const regex = new RegExp(`\\b${phrase.phrase}\\b`, 'gi');
      html = html.replace(regex, 
        `<span class="fake-news-highlight" title="Suspicious: ${phrase.category}">${phrase.phrase}</span>`
      );
    }
    
    const span = document.createElement('span');
    span.innerHTML = html;
    node.parentNode.replaceChild(span, node);
  });
  
  console.log(`Highlighted ${nodesToReplace.length} text nodes with suspicious phrases`);
}

/**
 * Get color based on risk level
 */
function getRiskColor(riskLevel) {
  switch (riskLevel?.toLowerCase()) {
    case 'critical':
      return '#d32f2f';
    case 'high':
      return '#f44336';
    case 'medium':
      return '#ff9800';
    case 'low':
      return '#fbc02d';
    default:
      return '#1976d2';
  }
}

// Auto-analyze on page load if enabled
window.addEventListener('load', () => {
  chrome.storage.sync.get(['autoAnalyze'], (result) => {
    if (result.autoAnalyze !== false) {
      // Wait a moment for page to fully render
      setTimeout(analyzeCurrentArticle, 1000);
    }
  });
});

// Also provide access to analysis results
window.fakeNewsDetectorResults = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageAnalysis') {
    sendResponse({ analysis: window.fakeNewsDetectorResults });
  }
});
