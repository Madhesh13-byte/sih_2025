import React, { useState } from 'react';
import { FiZap, FiRefreshCw } from 'react-icons/fi';

const AIContentGenerator = ({ section, onSuggestion }) => {
  const [loading, setLoading] = useState(false);

  const suggestions = {
    summary: [
      "Results-driven professional with 5+ years of experience in software development, specializing in full-stack solutions and team leadership.",
      "Innovative software engineer with expertise in modern web technologies and a proven track record of delivering scalable applications.",
      "Detail-oriented developer passionate about creating efficient, user-centric solutions with strong problem-solving abilities."
    ],
    skills: [
      ["JavaScript", "React", "Node.js", "Python", "SQL", "Git", "AWS", "Docker"],
      ["Java", "Spring Boot", "MongoDB", "Redis", "Kubernetes", "Jenkins", "REST APIs"],
      ["TypeScript", "Vue.js", "PostgreSQL", "GraphQL", "Microservices", "CI/CD"]
    ],
    experience: {
      title: "Senior Software Developer",
      company: "Tech Solutions Inc.",
      description: "• Led development of microservices architecture serving 100K+ users\n• Improved application performance by 40% through code optimization\n• Mentored junior developers and conducted code reviews"
    }
  };

  const generateSuggestion = () => {
    setLoading(true);
    setTimeout(() => {
      const suggestion = suggestions[section];
      if (Array.isArray(suggestion)) {
        onSuggestion(suggestion[Math.floor(Math.random() * suggestion.length)]);
      } else {
        onSuggestion(suggestion);
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <button
      onClick={generateSuggestion}
      disabled={loading}
      className="ai-suggest-btn"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500'
      }}
    >
      {loading ? <FiRefreshCw className="spin" /> : <FiZap />}
      AI Suggest
    </button>
  );
};

export default AIContentGenerator;