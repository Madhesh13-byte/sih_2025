import React, { useState, useEffect } from 'react';

const SmartTextArea = ({ value, onChange, placeholder, rows = 4, field }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const commonMistakes = {
    'recieve': 'receive',
    'seperate': 'separate',
    'definately': 'definitely',
    'occured': 'occurred',
    'managment': 'management',
    'sucessful': 'successful',
    'experiance': 'experience',
    'responsibilty': 'responsibility',
    'acheivement': 'achievement',
    'developement': 'development'
  };

  const powerWords = [
    'achieved', 'improved', 'increased', 'reduced', 'managed', 'led', 'developed',
    'implemented', 'optimized', 'streamlined', 'collaborated', 'delivered',
    'executed', 'designed', 'created', 'established', 'enhanced', 'resolved'
  ];

  const checkText = (text) => {
    const words = text.toLowerCase().split(/\s+/);
    const issues = [];

    words.forEach((word, index) => {
      // Check spelling
      if (commonMistakes[word]) {
        issues.push({
          type: 'spelling',
          word: word,
          suggestion: commonMistakes[word],
          position: index
        });
      }

      // Suggest power words for experience section
      if (field === 'responsibilities' && ['did', 'made', 'worked on'].includes(word)) {
        const randomPowerWord = powerWords[Math.floor(Math.random() * powerWords.length)];
        issues.push({
          type: 'enhancement',
          word: word,
          suggestion: randomPowerWord,
          position: index
        });
      }
    });

    setSuggestions(issues);
    setShowSuggestions(issues.length > 0);
  };

  useEffect(() => {
    if (value) {
      const timer = setTimeout(() => checkText(value), 1000);
      return () => clearTimeout(timer);
    }
  }, [value, field]);

  const applySuggestion = (suggestion) => {
    const newValue = value.replace(new RegExp(`\\b${suggestion.word}\\b`, 'gi'), suggestion.suggestion);
    onChange(newValue);
    setSuggestions(suggestions.filter(s => s !== suggestion));
  };

  return (
    <div style={{ position: 'relative' }}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{
          width: '100%',
          padding: '12px',
          border: suggestions.length > 0 ? '2px solid #ffc107' : '1px solid #ddd',
          borderRadius: '6px',
          fontSize: '14px',
          fontFamily: 'inherit',
          resize: 'vertical',
          outline: 'none'
        }}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '6px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          <div style={{ padding: '10px', borderBottom: '1px solid #eee', fontSize: '12px', fontWeight: 'bold' }}>
            💡 Writing Suggestions
          </div>
          {suggestions.slice(0, 3).map((suggestion, index) => (
            <div
              key={index}
              onClick={() => applySuggestion(suggestion)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid #f8f9fa',
                fontSize: '13px'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  {suggestion.type === 'spelling' ? '📝' : '⚡'} 
                  Replace "{suggestion.word}" with "{suggestion.suggestion}"
                </span>
                <button style={{
                  padding: '2px 8px',
                  fontSize: '11px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px'
                }}>
                  Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SmartTextArea;