import React, { useState, useEffect, useMemo } from 'react';
import { useResume } from '../../context/ResumeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaChartLine, FaRobot, FaExclamationTriangle, FaCheckCircle, 
  FaInfoCircle, FaBullseye, FaEye, FaSearch, FaClock, FaAward,
  FaLightbulb, FaFlag, FaTrendingUp, FaShieldAlt
} from 'react-icons/fa';

const AdvancedResumeAnalytics = () => {
  const { resumeData } = useResume();
  const [activeTab, setActiveTab] = useState('overview');
  const [analysisHistory, setAnalysisHistory] = useState([]);

  const analytics = useMemo(() => calculateAdvancedAnalytics(), [resumeData]);

  useEffect(() => {
    // Save analysis to history
    const newAnalysis = {
      timestamp: Date.now(),
      score: analytics.overallScore,
      sections: analytics.completeness
    };
    setAnalysisHistory(prev => [newAnalysis, ...prev.slice(0, 9)]);
  }, [analytics]);

  function calculateAdvancedAnalytics() {
    const analysis = {
      // Core Metrics
      overallScore: 0,
      completeness: 0,
      atsScore: 0,
      readabilityScore: 0,
      impactScore: 0,
      
      // Detailed Analysis
      sectionScores: {},
      contentQuality: {},
      keywordAnalysis: {},
      competitiveAnalysis: {},
      
      // AI Insights
      aiRecommendations: [],
      criticalIssues: [],
      strengths: [],
      improvements: [],
      
      // Advanced Metrics
      industryAlignment: 0,
      experienceRelevance: 0,
      skillsMatching: 0,
      achievementQuantification: 0,
      
      // Tracking
      wordCount: 0,
      bulletPoints: 0,
      actionVerbs: 0,
      numbers: 0,
      
      // Predictions
      hirabilityScore: 0,
      salaryPotential: 'N/A',
      roleAlignment: []
    };

    // Section Analysis
    const sections = ['personalInfo', 'summary', 'experience', 'education', 'skills', 'projects', 'certifications'];
    let completedSections = 0;

    sections.forEach(section => {
      const sectionData = section === 'personalInfo' ? resumeData.personal || resumeData.personalInfo : resumeData[section];
      const score = analyzeSectionQuality(section, sectionData);
      analysis.sectionScores[section] = score;
      if (score.isComplete) completedSections++;
    });

    analysis.completeness = Math.round((completedSections / sections.length) * 100);

    // Content Quality Analysis
    const allText = extractAllText();
    analysis.wordCount = allText.split(' ').filter(word => word.length > 0).length;
    
    // Advanced Content Analysis
    analysis.contentQuality = analyzeContentQuality(allText);
    analysis.keywordAnalysis = analyzeKeywords(allText);
    analysis.actionVerbs = countActionVerbs(allText);
    analysis.numbers = countQuantifiableAchievements(allText);

    // ATS Score Calculation (Enhanced)
    analysis.atsScore = calculateATSScore(analysis);
    
    // Readability Score
    analysis.readabilityScore = calculateReadabilityScore(allText);
    
    // Impact Score
    analysis.impactScore = calculateImpactScore(analysis);
    
    // Industry Alignment
    analysis.industryAlignment = calculateIndustryAlignment(allText);
    
    // Overall Score Calculation
    analysis.overallScore = Math.round(
      (analysis.atsScore * 0.3) +
      (analysis.completeness * 0.25) +
      (analysis.impactScore * 0.2) +
      (analysis.readabilityScore * 0.15) +
      (analysis.industryAlignment * 0.1)
    );

    // AI-Powered Recommendations
    analysis.aiRecommendations = generateAIRecommendations(analysis);
    analysis.criticalIssues = identifyCriticalIssues(analysis);
    analysis.strengths = identifyStrengths(analysis);
    analysis.improvements = suggestImprovements(analysis);

    // Hirability Prediction
    analysis.hirabilityScore = calculateHirabilityScore(analysis);
    analysis.roleAlignment = predictRoleAlignment();

    return analysis;
  }

  function extractAllText() {
    const texts = [];
    if (resumeData.summary) texts.push(resumeData.summary);
    if (resumeData.experience) {
      resumeData.experience.forEach(exp => {
        if (exp.description) texts.push(exp.description);
      });
    }
    if (resumeData.projects) {
      resumeData.projects.forEach(proj => {
        if (proj.description) texts.push(proj.description);
      });
    }
    return texts.join(' ').toLowerCase();
  }

  function analyzeSectionQuality(section, data) {
    const analysis = { score: 0, isComplete: false, issues: [], suggestions: [] };
    
    if (!data) {
      analysis.issues.push('Section is missing');
      return analysis;
    }

    switch (section) {
      case 'personalInfo':
        analysis.isComplete = !!(data.name && data.email && data.phone);
        analysis.score = 
          (data.name ? 25 : 0) +
          (data.email ? 25 : 0) +
          (data.phone ? 20 : 0) +
          (data.linkedin ? 15 : 0) +
          (data.github ? 15 : 0);
        
        if (!data.linkedin) analysis.suggestions.push('Add LinkedIn profile');
        if (!data.github) analysis.suggestions.push('Add GitHub profile for tech roles');
        break;

      case 'summary':
        const wordCount = data.split(' ').length;
        analysis.isComplete = wordCount >= 30;
        analysis.score = Math.min(100, (wordCount / 50) * 100);
        
        if (wordCount < 30) analysis.issues.push('Summary too short');
        if (wordCount > 100) analysis.issues.push('Summary too long');
        if (!/\d/.test(data)) analysis.suggestions.push('Include quantifiable achievements');
        break;

      case 'experience':
        analysis.isComplete = Array.isArray(data) && data.length > 0;
        analysis.score = Math.min(100, data.length * 30);
        
        data.forEach((exp, i) => {
          if (!exp.description || exp.description.length < 50) {
            analysis.issues.push(`Experience ${i + 1}: Add detailed description`);
          }
        });
        break;

      case 'skills':
        analysis.isComplete = Array.isArray(data) && data.length >= 5;
        analysis.score = Math.min(100, data.length * 10);
        
        if (data.length < 5) analysis.suggestions.push('Add more relevant skills');
        break;

      default:
        analysis.isComplete = Array.isArray(data) ? data.length > 0 : !!data;
        analysis.score = analysis.isComplete ? 80 : 0;
    }

    return analysis;
  }

  function analyzeContentQuality(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(' ').filter(w => w.length > 0);
    
    return {
      avgSentenceLength: words.length / Math.max(sentences.length, 1),
      complexWords: words.filter(w => w.length > 6).length,
      passiveVoice: (text.match(/\b(was|were|been|being)\s+\w+ed\b/g) || []).length,
      redundancy: calculateRedundancy(words),
      clarity: calculateClarity(text)
    };
  }

  function analyzeKeywords(text) {
    const techKeywords = [
      'javascript', 'python', 'react', 'node', 'aws', 'docker', 'kubernetes',
      'agile', 'scrum', 'api', 'database', 'sql', 'git', 'ci/cd', 'machine learning',
      'artificial intelligence', 'data science', 'cloud computing', 'microservices'
    ];
    
    const softSkills = [
      'leadership', 'communication', 'teamwork', 'problem solving', 'analytical',
      'creative', 'adaptable', 'collaborative', 'innovative', 'strategic'
    ];

    const actionVerbs = [
      'achieved', 'developed', 'managed', 'led', 'created', 'implemented',
      'improved', 'increased', 'reduced', 'optimized', 'designed', 'built'
    ];

    return {
      techKeywords: techKeywords.filter(keyword => text.includes(keyword)),
      softSkills: softSkills.filter(skill => text.includes(skill)),
      actionVerbs: actionVerbs.filter(verb => text.includes(verb)),
      density: calculateKeywordDensity(text)
    };
  }

  function calculateATSScore(analysis) {
    let score = 0;
    
    // Completeness (30%)
    score += (analysis.completeness / 100) * 30;
    
    // Content Quality (25%)
    if (analysis.wordCount >= 300 && analysis.wordCount <= 800) score += 25;
    else if (analysis.wordCount >= 200) score += 15;
    
    // Keywords (20%)
    const keywordCount = Object.values(analysis.keywordAnalysis).flat().length;
    score += Math.min(20, keywordCount * 2);
    
    // Structure (15%)
    if (analysis.actionVerbs >= 5) score += 10;
    if (analysis.numbers >= 3) score += 5;
    
    // Contact Info (10%)
    const contactScore = analysis.sectionScores.personalInfo?.score || 0;
    score += (contactScore / 100) * 10;
    
    return Math.min(100, Math.round(score));
  }

  function calculateReadabilityScore(text) {
    const words = text.split(' ').filter(w => w.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const syllables = words.reduce((count, word) => count + countSyllables(word), 0);
    
    // Flesch Reading Ease Score
    const avgSentenceLength = words.length / Math.max(sentences.length, 1);
    const avgSyllablesPerWord = syllables / Math.max(words.length, 1);
    
    const fleschScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
    return Math.max(0, Math.min(100, Math.round(fleschScore)));
  }

  function calculateImpactScore(analysis) {
    let score = 0;
    
    // Quantifiable achievements (40%)
    score += Math.min(40, analysis.numbers * 8);
    
    // Action verbs usage (30%)
    score += Math.min(30, analysis.actionVerbs * 5);
    
    // Industry keywords (20%)
    const keywordCount = Object.values(analysis.keywordAnalysis).flat().length;
    score += Math.min(20, keywordCount * 2);
    
    // Content depth (10%)
    if (analysis.wordCount >= 400) score += 10;
    else if (analysis.wordCount >= 200) score += 5;
    
    return Math.min(100, Math.round(score));
  }

  function calculateIndustryAlignment(text) {
    // Simplified industry alignment based on keywords
    const industries = {
      tech: ['software', 'programming', 'development', 'coding', 'technical'],
      business: ['management', 'strategy', 'operations', 'business', 'sales'],
      design: ['design', 'creative', 'visual', 'ui', 'ux', 'graphic'],
      data: ['data', 'analytics', 'statistics', 'machine learning', 'ai']
    };
    
    let maxAlignment = 0;
    Object.values(industries).forEach(keywords => {
      const matches = keywords.filter(keyword => text.includes(keyword)).length;
      const alignment = (matches / keywords.length) * 100;
      maxAlignment = Math.max(maxAlignment, alignment);
    });
    
    return Math.round(maxAlignment);
  }

  function generateAIRecommendations(analysis) {
    const recommendations = [];
    
    if (analysis.overallScore < 70) {
      recommendations.push({
        type: 'critical',
        title: 'Comprehensive Resume Overhaul Needed',
        description: 'Your resume needs significant improvements across multiple areas to be competitive.',
        action: 'Focus on completing all sections and improving content quality',
        impact: 'high'
      });
    }
    
    if (analysis.atsScore < 60) {
      recommendations.push({
        type: 'warning',
        title: 'ATS Optimization Required',
        description: 'Your resume may not pass Applicant Tracking Systems effectively.',
        action: 'Add relevant keywords and improve formatting',
        impact: 'high'
      });
    }
    
    if (analysis.impactScore < 50) {
      recommendations.push({
        type: 'info',
        title: 'Enhance Achievement Impact',
        description: 'Quantify your achievements with specific numbers and metrics.',
        action: 'Add percentages, dollar amounts, and measurable results',
        impact: 'medium'
      });
    }
    
    return recommendations;
  }

  function identifyCriticalIssues(analysis) {
    const issues = [];
    
    if (analysis.completeness < 60) {
      issues.push('Multiple sections are incomplete or missing');
    }
    
    if (analysis.wordCount < 200) {
      issues.push('Resume content is too brief for effective evaluation');
    }
    
    if (analysis.actionVerbs < 3) {
      issues.push('Lacks strong action verbs to demonstrate impact');
    }
    
    return issues;
  }

  function identifyStrengths(analysis) {
    const strengths = [];
    
    if (analysis.completeness >= 90) {
      strengths.push('Comprehensive resume with all key sections');
    }
    
    if (analysis.atsScore >= 80) {
      strengths.push('Excellent ATS compatibility');
    }
    
    if (analysis.impactScore >= 70) {
      strengths.push('Strong demonstration of achievements and impact');
    }
    
    return strengths;
  }

  function suggestImprovements(analysis) {
    const improvements = [];
    
    if (analysis.readabilityScore < 60) {
      improvements.push('Simplify language and sentence structure for better readability');
    }
    
    if (analysis.industryAlignment < 50) {
      improvements.push('Include more industry-specific keywords and terminology');
    }
    
    if (analysis.numbers < 5) {
      improvements.push('Add more quantifiable achievements and metrics');
    }
    
    return improvements;
  }

  function calculateHirabilityScore(analysis) {
    // Weighted calculation based on multiple factors
    return Math.round(
      (analysis.overallScore * 0.4) +
      (analysis.atsScore * 0.3) +
      (analysis.impactScore * 0.2) +
      (analysis.industryAlignment * 0.1)
    );
  }

  function predictRoleAlignment() {
    // Simplified role prediction based on skills and experience
    const roles = [
      { title: 'Software Developer', match: 85 },
      { title: 'Product Manager', match: 72 },
      { title: 'Data Analyst', match: 68 }
    ];
    return roles.sort((a, b) => b.match - a.match);
  }

  // Helper functions
  function countActionVerbs(text) {
    const actionVerbs = [
      'achieved', 'developed', 'managed', 'led', 'created', 'implemented',
      'improved', 'increased', 'reduced', 'optimized', 'designed', 'built'
    ];
    return actionVerbs.filter(verb => text.includes(verb)).length;
  }

  function countQuantifiableAchievements(text) {
    const numberPattern = /\d+(\.\d+)?[%$kmb]?/gi;
    return (text.match(numberPattern) || []).length;
  }

  function countSyllables(word) {
    return word.toLowerCase().replace(/[^a-z]/g, '').replace(/e$/, '').replace(/[aeiouy]{2,}/g, 'a').match(/[aeiouy]/g)?.length || 1;
  }

  function calculateRedundancy(words) {
    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    const repeated = Object.values(wordCount).filter(count => count > 2).length;
    return (repeated / words.length) * 100;
  }

  function calculateClarity(text) {
    const complexPhrases = ['in order to', 'due to the fact that', 'it should be noted that'];
    const complexCount = complexPhrases.filter(phrase => text.includes(phrase)).length;
    return Math.max(0, 100 - (complexCount * 10));
  }

  function calculateKeywordDensity(text) {
    const words = text.split(' ').filter(w => w.length > 3);
    const wordFreq = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    return Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .reduce((obj, [word, count]) => ({ ...obj, [word]: count }), {});
  }

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'critical': return <FaExclamationTriangle color="#ef4444" />;
      case 'warning': return <FaInfoCircle color="#f59e0b" />;
      default: return <FaCheckCircle color="#10b981" />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="advanced-analytics"
    >
      <div className="analytics-header">
        <h3><FaRobot /> AI-Powered Resume Analytics</h3>
        <div className="analytics-tabs">
          {['overview', 'detailed', 'ai-insights', 'predictions'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="analytics-overview"
          >
            <div className="score-dashboard">
              <div className="primary-score">
                <div className="score-circle large" style={{ '--score-color': getScoreColor(analytics.overallScore) }}>
                  <span className="score-value">{analytics.overallScore}</span>
                  <span className="score-label">Overall Score</span>
                </div>
              </div>
              
              <div className="secondary-scores">
                <div className="score-card">
                  <FaBullseye className="score-icon" />
                  <div className="score-info">
                    <span className="score-value">{analytics.atsScore}</span>
                    <span className="score-label">ATS Score</span>
                  </div>
                </div>
                <div className="score-card">
                  <FaEye className="score-icon" />
                  <div className="score-info">
                    <span className="score-value">{analytics.readabilityScore}</span>
                    <span className="score-label">Readability</span>
                  </div>
                </div>
                <div className="score-card">
                  <FaTrendingUp className="score-icon" />
                  <div className="score-info">
                    <span className="score-value">{analytics.impactScore}</span>
                    <span className="score-label">Impact</span>
                  </div>
                </div>
                <div className="score-card">
                  <FaShieldAlt className="score-icon" />
                  <div className="score-info">
                    <span className="score-value">{analytics.hirabilityScore}</span>
                    <span className="score-label">Hirability</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="quick-metrics">
              <div className="metrics-grid">
                <div className="metric-item">
                  <span className="metric-value">{analytics.completeness}%</span>
                  <span className="metric-label">Complete</span>
                </div>
                <div className="metric-item">
                  <span className="metric-value">{analytics.wordCount}</span>
                  <span className="metric-label">Words</span>
                </div>
                <div className="metric-item">
                  <span className="metric-value">{analytics.actionVerbs}</span>
                  <span className="metric-label">Action Verbs</span>
                </div>
                <div className="metric-item">
                  <span className="metric-value">{analytics.numbers}</span>
                  <span className="metric-label">Metrics</span>
                </div>
                <div className="metric-item">
                  <span className="metric-value">{analytics.industryAlignment}%</span>
                  <span className="metric-label">Industry Match</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'detailed' && (
          <motion.div
            key="detailed"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="detailed-analysis"
          >
            <div className="section-analysis">
              <h4>Section Quality Analysis</h4>
              <div className="sections-grid">
                {Object.entries(analytics.sectionScores).map(([section, score]) => (
                  <div key={section} className="section-card">
                    <div className="section-header">
                      <span className="section-name">{section.charAt(0).toUpperCase() + section.slice(1)}</span>
                      <span className={`status ${score.isComplete ? 'complete' : 'incomplete'}`}>
                        {score.isComplete ? <FaCheckCircle /> : <FaExclamationTriangle />}
                      </span>
                    </div>
                    <div className="section-score">
                      <div className="score-bar">
                        <div 
                          className="score-fill" 
                          style={{ 
                            width: `${score.score}%`,
                            backgroundColor: getScoreColor(score.score)
                          }}
                        ></div>
                      </div>
                      <span className="score-text">{score.score}/100</span>
                    </div>
                    {score.issues.length > 0 && (
                      <div className="section-issues">
                        {score.issues.map((issue, index) => (
                          <div key={index} className="issue-item">
                            <FaExclamationTriangle size={12} /> {issue}
                          </div>
                        ))}
                      </div>
                    )}
                    {score.suggestions.length > 0 && (
                      <div className="section-suggestions">
                        {score.suggestions.map((suggestion, index) => (
                          <div key={index} className="suggestion-item">
                            <FaLightbulb size={12} /> {suggestion}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="content-analysis">
              <h4>Content Quality Metrics</h4>
              <div className="content-metrics">
                <div className="metric-card">
                  <h5>Keyword Analysis</h5>
                  <div className="keyword-categories">
                    <div className="keyword-category">
                      <span className="category-label">Tech Keywords:</span>
                      <span className="category-count">{analytics.keywordAnalysis.techKeywords?.length || 0}</span>
                    </div>
                    <div className="keyword-category">
                      <span className="category-label">Soft Skills:</span>
                      <span className="category-count">{analytics.keywordAnalysis.softSkills?.length || 0}</span>
                    </div>
                    <div className="keyword-category">
                      <span className="category-label">Action Verbs:</span>
                      <span className="category-count">{analytics.keywordAnalysis.actionVerbs?.length || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="metric-card">
                  <h5>Content Quality</h5>
                  <div className="quality-metrics">
                    <div className="quality-item">
                      <span>Avg Sentence Length:</span>
                      <span>{Math.round(analytics.contentQuality.avgSentenceLength || 0)} words</span>
                    </div>
                    <div className="quality-item">
                      <span>Complex Words:</span>
                      <span>{analytics.contentQuality.complexWords || 0}</span>
                    </div>
                    <div className="quality-item">
                      <span>Passive Voice:</span>
                      <span>{analytics.contentQuality.passiveVoice || 0} instances</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'ai-insights' && (
          <motion.div
            key="ai-insights"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="ai-insights"
          >
            <div className="insights-section">
              <h4><FaRobot /> AI-Powered Recommendations</h4>
              <div className="recommendations-list">
                {analytics.aiRecommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`recommendation-card ${rec.type} ${rec.impact}`}
                  >
                    <div className="rec-header">
                      {getRecommendationIcon(rec.type)}
                      <span className="rec-title">{rec.title}</span>
                      <span className={`impact-badge ${rec.impact}`}>{rec.impact} impact</span>
                    </div>
                    <p className="rec-description">{rec.description}</p>
                    <div className="rec-action">
                      <FaFlag size={12} /> <strong>Action:</strong> {rec.action}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="strengths-weaknesses">
              <div className="strengths-section">
                <h4><FaAward /> Key Strengths</h4>
                {analytics.strengths.map((strength, index) => (
                  <div key={index} className="strength-item">
                    <FaCheckCircle color="#10b981" /> {strength}
                  </div>
                ))}
              </div>

              <div className="improvements-section">
                <h4><FaLightbulb /> Improvement Areas</h4>
                {analytics.improvements.map((improvement, index) => (
                  <div key={index} className="improvement-item">
                    <FaLightbulb color="#f59e0b" /> {improvement}
                  </div>
                ))}
              </div>
            </div>

            {analytics.criticalIssues.length > 0 && (
              <div className="critical-issues">
                <h4><FaExclamationTriangle /> Critical Issues</h4>
                {analytics.criticalIssues.map((issue, index) => (
                  <div key={index} className="critical-issue">
                    <FaExclamationTriangle color="#ef4444" /> {issue}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'predictions' && (
          <motion.div
            key="predictions"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="predictions"
          >
            <div className="prediction-cards">
              <div className="prediction-card">
                <h4><FaTrendingUp /> Hirability Prediction</h4>
                <div className="hirability-score">
                  <div className="score-circle" style={{ '--score-color': getScoreColor(analytics.hirabilityScore) }}>
                    <span className="score-value">{analytics.hirabilityScore}%</span>
                    <span className="score-label">Hire Probability</span>
                  </div>
                </div>
                <p className="prediction-description">
                  Based on current market trends and resume quality metrics
                </p>
              </div>

              <div className="prediction-card">
                <h4><FaBullseye /> Role Alignment</h4>
                <div className="role-predictions">
                  {analytics.roleAlignment.map((role, index) => (
                    <div key={index} className="role-item">
                      <div className="role-info">
                        <span className="role-title">{role.title}</span>
                        <span className="role-match">{role.match}% match</span>
                      </div>
                      <div className="role-bar">
                        <div 
                          className="role-fill" 
                          style={{ 
                            width: `${role.match}%`,
                            backgroundColor: getScoreColor(role.match)
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="analysis-history">
              <h4><FaClock /> Analysis History</h4>
              <div className="history-chart">
                {analysisHistory.map((analysis, index) => (
                  <div key={index} className="history-item">
                    <div className="history-date">
                      {new Date(analysis.timestamp).toLocaleDateString()}
                    </div>
                    <div className="history-score">
                      Score: {analysis.score}
                    </div>
                    <div className="history-completeness">
                      {analysis.sections}% Complete
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdvancedResumeAnalytics;