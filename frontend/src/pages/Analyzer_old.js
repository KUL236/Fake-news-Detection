import React, { useState } from 'react';
import './Analyzer.css';
// Component imports

function Analyzer({ onAnalyze, result, isLoading, error }) {
  const [inputMode, setInputMode] = useState('text'); // 'text', 'url', 'file'
  const [textInput, setTextInput] = useState('');
  const [headlineInput, setHeadlineInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [language, setLanguage] = useState('en');

  const handleAnalyzeClick = () => {
    if (inputMode === 'text' && !textInput.trim()) {
      alert('Please enter some text to analyze');
      return;
    }
    if (inputMode === 'url' && !urlInput.trim()) {
      alert('Please enter a URL to analyze');
      return;
    }

    // Call parent's analyze function
    onAnalyze(textInput, headlineInput, urlInput);

    // Add to history
    const historyItem = {
      id: Date.now(),
      text: inputMode === 'text' ? textInput.substring(0, 50) : urlInput,
      timestamp: new Date().toLocaleString(),
      classification: result?.classification,
      confidence: result?.confidence_score
    };
    
    if (result) {
      setAnalysisHistory([historyItem, ...analysisHistory.slice(0, 9)]);
    }
  };

  const clearInputs = () => {
    setTextInput('');
    setHeadlineInput('');
    setUrlInput('');
  };

  const handleCopyResult = () => {
    if (result) {
      const resultText = `
Classification: ${result.classification}
Confidence: ${result.confidence_score}%
Risk Level: ${result.risk_level}

Explanation: ${result.explanation}
      `.trim();
      navigator.clipboard.writeText(resultText);
      alert('Result copied to clipboard!');
    }
  };

  return (
    <div className="analyzer-container">
      {/* Input Section */}
      <section className="input-section">
        <h2>📰 Analyze News Content</h2>
        
        <div className="mode-selector">
          <button
            className={`mode-btn ${inputMode === 'text' ? 'active' : ''}`}
            onClick={() => setInputMode('text')}
          >
            📝 Text
          </button>
          <button
            className={`mode-btn ${inputMode === 'url' ? 'active' : ''}`}
            onClick={() => setInputMode('url')}
          >
            🌐 URL
          </button>
          <button
            className={`mode-btn ${inputMode === 'file' ? 'active' : ''}`}
            onClick={() => setInputMode('file')}
            disabled
          >
            📎 File (Coming Soon)
          </button>
        </div>

        {/* Text Input Mode */}
        {inputMode === 'text' && (
          <div className="input-form">
            <div className="form-group">
              <label>📌 Headline (Optional)</label>
              <input
                type="text"
                placeholder="Enter article headline"
                value={headlineInput}
                onChange={(e) => setHeadlineInput(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>📄 Article Text</label>
              <textarea
                placeholder="Paste article text here..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="form-textarea"
                rows={8}
              />
              <div className="char-count">
                {textInput.length} characters
              </div>
            </div>
          </div>
        )}

        {/* URL Input Mode */}
        {inputMode === 'url' && (
          <div className="input-form">
            <div className="form-group">
              <label>🔗 Article URL</label>
              <input
                type="url"
                placeholder="https://example.com/article"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="form-input"
              />
            </div>
          </div>
        )}

        {/* Language Selector */}
        <div className="language-selector">
          <label>🌍 Language:</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="button-group">
          <button
            className="analyze-btn"
            onClick={handleAnalyzeClick}
            disabled={isLoading}
          >
            {isLoading ? '⏳ Analyzing...' : '🔬 Analyze'}
          </button>
          <button
            className="clear-btn"
            onClick={clearInputs}
            disabled={isLoading}
          >
            🗑️ Clear
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-message">
            ⚠️ Error: {error}
          </div>
        )}
      </section>

      {/* Results Section */}
      {result && (
        <section className="results-section">
          <h2>📊 Analysis Results</h2>
          
          {/* Main Classification Card */}
          <div className={`result-card ${result.classification}-result`}>
            <div className="classification-display">
              <div className="classification-icon">
                {result.classification === 'FAKE' ? '❌' : '✅'}
              </div>
              <div className="classification-content">
                <h3>{result.classification}</h3>
                <p>Confidence: <strong>{result.confidence_score}%</strong></p>
                <p>Risk Level: <strong>{result.risk_level}</strong></p>
              </div>
            </div>

            {/* Confidence Progress Bar */}
            <div className="progress-bar-container">
              <div className="progress-label">Fake Probability</div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${result.confidence_score}%`,
                    backgroundColor: result.confidence_score > 70 ? '#e74c3c' : 
                                     result.confidence_score > 40 ? '#f39c12' : '#27ae60'
                  }}
                />
              </div>
              <div className="progress-values">
                <span>Fake: {Math.round(result.probability?.fake || 0)}%</span>
                <span>Real: {Math.round(result.probability?.real || 0)}%</span>
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="explanation-card">
            <h4>🔍 AI Explanation</h4>
            <p>{result.explanation}</p>
          </div>

          {/* Recommendations */}
          {result.recommendations && result.recommendations.length > 0 && (
            <div className="recommendations-card">
              <h4>💡 Recommendations</h4>
              <ul>
                {result.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Suspicious Phrases */}
          {result.suspicious_phrases && Object.keys(result.suspicious_phrases).length > 0 && (
            <SuspiciousPhrasesDisplay phrases={result.suspicious_phrases} />
          )}

          {/* Sentiment Analysis */}
          {result.sentiment_analysis && (
            <SentimentChart sentiment={result.sentiment_analysis} />
          )}

          {/* Features Grid */}
          {result.features && (
            <div className="features-grid">
              <h4>📈 Text Features</h4>
              <div className="grid">
                <div className="feature-item">
                  <span>Word Count</span>
                  <strong>{result.features.word_count}</strong>
                </div>
                <div className="feature-item">
                  <span>Sentence Count</span>
                  <strong>{result.features.sentence_count}</strong>
                </div>
                <div className="feature-item">
                  <span>Avg Word Length</span>
                  <strong>{result.features.avg_word_length?.toFixed(1)}</strong>
                </div>
                <div className="feature-item">
                  <span>Capitalization Ratio</span>
                  <strong>{(result.features.caps_ratio * 100).toFixed(1)}%</strong>
                </div>
                <div className="feature-item">
                  <span>Exclamation Marks</span>
                  <strong>{result.features.exclamation_count}</strong>
                </div>
                <div className="feature-item">
                  <span>Question Marks</span>
                  <strong>{result.features.question_count}</strong>
                </div>
                <div className="feature-item">
                  <span>Suspicious Phrases</span>
                  <strong>{result.features.suspicious_count}</strong>
                </div>
                <div className="feature-item">
                  <span>Readability Score</span>
                  <strong>{result.features.readability_score?.toFixed(1)}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Copy Button */}
          <div className="action-buttons">
            <button className="copy-btn" onClick={handleCopyResult}>
              📋 Copy Result
            </button>
            <button className="share-btn">
              📤 Share Result
            </button>
          </div>
        </section>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>🔬 Analyzing content...</p>
        </div>
      )}

      {/* History Section */}
      {analysisHistory.length > 0 && (
        <section className="history-section">
          <h3>📜 Recent Analysis</h3>
          <div className="history-list">
            {analysisHistory.map((item) => (
              <div key={item.id} className="history-item">
                <div className="history-content">
                  <p className="history-text">{item.text}</p>
                  <p className="history-time">{item.timestamp}</p>
                </div>
                <div className="history-badge">
                  {item.classification === 'FAKE' ? '❌' : '✅'}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default Analyzer;
