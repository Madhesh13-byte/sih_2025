import React, { useState } from 'react';

const AIContentSuggestions = ({ field, onSuggestionSelect }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const suggestionData = {
    summary: [
      "Results-driven software engineer with 3+ years of experience in full-stack development",
      "Innovative data scientist passionate about machine learning and predictive analytics",
      "Creative UI/UX designer with expertise in user-centered design and modern frameworks",
      "Strategic project manager with proven track record of delivering complex projects on time"
    ],
    skills: [
      ["JavaScript", "React", "Node.js", "MongoDB", "AWS"],
      ["Python", "Machine Learning", "TensorFlow", "SQL", "Docker"],
      ["Java", "Spring Boot", "MySQL", "Kubernetes", "Jenkins"],
      ["C#", ".NET", "Azure", "SQL Server", "Git"]
    ],
    responsibilities: [
      "Developed and maintained scalable web applications serving 10,000+ users",
      "Collaborated with cross-functional teams to deliver high-quality software solutions",
      "Implemented automated testing procedures, reducing bugs by 40%",
      "Mentored junior developers and conducted code reviews",
      "Optimized database queries resulting in 50% performance improvement"
    ]
  };

  const generateSuggestions = () => {
    setLoading(true);
    setTimeout(() => {
      setSuggestions(suggestionData[field] || []);
      setLoading(false);
    }, 800);
  };

  return (
    <div style={{ marginTop: '10px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#495057' }}>🤖 AI Suggestions</span>
        <button
          onClick={generateSuggestions}
          disabled={loading}
          style={{
            marginLeft: '10px',
            padding: '5px 12px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Generating...' : 'Get Suggestions'}
        </button>
      </div>
      
      {suggestions.length > 0 && (
        <div>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => onSuggestionSelect(suggestion)}
              style={{
                padding: '8px 12px',
                margin: '5px 0',
                backgroundColor: 'white',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
              {Array.isArray(suggestion) ? suggestion.join(', ') : suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIContentSuggestions;