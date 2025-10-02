import React, { useState, useEffect, useMemo } from 'react';
import { useResume } from '../../context/ResumeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBrain, FaChartLine, FaBullseye, FaRocket, FaEye, 
  FaExclamationTriangle, FaCheckCircle, FaLightbulb,
  FaTrendingUp, FaTarget, FaClock, FaAward
} from 'react-icons/fa';

const SmartResumeAnalytics = () => {
  const { resumeData } = useResume();
  const [activeView, setActiveView] = useState('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [marketData, setMarketData] = useState(null);

  const analytics = useMemo(() => {
    setIsAnalyzing(true);
    const result = calculateSmartAnalytics();
    setTimeout(() => setIsAnalyzing(false), 800);
    return result;
  }, [resumeData]);

  useEffect(() => {
    // Simulate fetching real market data
    fetchMarketData();
  }, []);

  function calculateSmartAnalytics() {
    const analysis = {
      // Core Scores (0-100)
      overallScore: 0,
      atsCompatibility: 0,
      marketRelevance: 0,
      contentQuality: 0,
      
      // Key Metrics
      completeness: 0,
      wordCount: 0,
      keywordDensity: 0,
      quantifiableResults: 0,
      
      // AI Insights
      criticalActions: [],
      quickWins: [],
      longTermGoals: [],
      
      // Market Intelligence
      salaryRange: { min: 0, max: 0 },
      demandScore: 0,
      competitiveRanking: 'N/A',
      
      // Predictions
      interviewChance: 0,
      topRoleMatches: [],
      skillGaps: [],
      
      // Tracking
      sectionHealth: {},
      improvementAreas: [],
      strengths: []
    };

    // Calculate core metrics
    calculateCoreMetrics(analysis);
    calculateContentAnalysis(analysis);
    calculateMarketAlignment(analysis);
    generateAIInsights(analysis);
    calculatePredictions(analysis);

    // Overall score calculation
    analysis.overallScore = Math.round(
      (analysis.atsCompatibility * 0.3) +
      (analysis.completeness * 0.25) +
      (analysis.contentQuality * 0.25) +
      (analysis.marketRelevance * 0.2)
    );

    return analysis;
  }

  function calculateCoreMetrics(analysis) {
    const sections = ['personalInfo', 'summary', 'experience', 'education', 'skills'];
    let completedSections = 0;

    sections.forEach(section => {
      const data = getSection(section);
      const health = analyzeSectionHealth(section, data);
      analysis.sectionHealth[section] = health;
      if (health.isComplete) completedSections++;
    });

    analysis.completeness = Math.round((completedSections / sections.length) * 100);
  }

  function calculateContentAnalysis(analysis) {
    const allText = extractAllText();
    const words = allText.split(/\s+/).filter(w => w.length > 0);
    
    analysis.wordCount = words.length;
    
    // ATS Compatibility
    analysis.atsCompatibility = calculateATSScore();
    
    // Content Quality
    analysis.contentQuality = calculateContentQuality(allText);
    
    // Quantifiable results
    const numberPattern = /\d+(\.\d+)?[%$kmb]?/gi;
    analysis.quantifiableResults = (allText.match(numberPattern) || []).length;
    
    // Keyword density
    analysis.keywordDensity = calculateKeywordRelevance(allText);
  }

  function calculateMarketAlignment(analysis) {
    // Simulate market relevance calculation
    const skills = resumeData.skills || [];
    const inDemandSkills = ['React', 'Python', 'AWS', 'Machine Learning', 'Docker'];
    const matchingSkills = skills.filter(skill => 
      inDemandSkills.some(demand => skill.toLowerCase().includes(demand.toLowerCase()))
    );
    
    analysis.marketRelevance = Math.min(100, (matchingSkills.length / inDemandSkills.length) * 100);
    analysis.demandScore = Math.round(analysis.marketRelevance * 0.8);
  }

  function generateAIInsights(analysis) {
    // Critical Actions (High Impact, Quick Fix)
    if (analysis.completeness < 80) {
      analysis.criticalActions.push({
        title: 'Complete Missing Sections',
        impact: 'High',
        effort: 'Medium',
        description: 'Fill in all resume sections to maximize ATS compatibility'
      });
    }

    if (analysis.quantifiableResults < 3) {
      analysis.criticalActions.push({
        title: 'Add Quantifiable Results',
        impact: 'High', 
        effort: 'Low',
        description: 'Include numbers, percentages, and metrics in your achievements'
      });
    }

    // Quick Wins (Medium Impact, Low Effort)
    if (analysis.wordCount < 300) {
      analysis.quickWins.push({
        title: 'Expand Content',
        description: 'Add more detail to job descriptions and achievements'
      });
    }

    // Long Term Goals
    if (analysis.marketRelevance < 70) {
      analysis.longTermGoals.push({
        title: 'Skill Development',
        description: 'Learn in-demand skills for your target role'
      });
    }

    // Identify strengths
    if (analysis.atsCompatibility >= 80) {
      analysis.strengths.push('Excellent ATS compatibility');
    }
    if (analysis.quantifiableResults >= 5) {
      analysis.strengths.push('Strong quantifiable achievements');
    }
  }

  function calculatePredictions(analysis) {
    // Interview chance prediction
    analysis.interviewChance = Math.min(95, Math.round(
      (analysis.overallScore * 0.6) +
      (analysis.marketRelevance * 0.4)
    ));

    // Top role matches (simulate with market data)
    analysis.topRoleMatches = [
      { title: 'Software Engineer', match: 85, salary: '$75k-$120k', demand: 'High' },
      { title: 'Full Stack Developer', match: 78, salary: '$70k-$115k', demand: 'High' },
      { title: 'Frontend Developer', match: 72, salary: '$65k-$105k', demand: 'Medium' }
    ].filter(role => role.match >= 60);

    // Skill gaps
    const currentSkills = (resumeData.skills || []).map(s => s.toLowerCase());
    const trendingSkills = ['typescript', 'kubernetes', 'graphql', 'next.js'];
    analysis.skillGaps = trendingSkills.filter(skill => 
      !currentSkills.some(current => current.includes(skill))
    );
  }

  // Helper functions
  function getSection(section) {
    switch (section) {
      case 'personalInfo': return resumeData.personalInfo || resumeData.personal;
      default: return resumeData[section];
    }
  }

  function analyzeSectionHealth(section, data) {
    const health = { isComplete: false, score: 0, issues: [] };
    
    if (!data) {
      health.issues.push('Section missing');
      return health;
    }

    switch (section) {
      case 'personalInfo':
        health.isComplete = !!(data.name && data.email && data.phone);
        health.score = (data.name ? 40 : 0) + (data.email ? 30 : 0) + (data.phone ? 30 : 0);
        break;
      case 'summary':
        const wordCount = data.split(' ').length;
        health.isComplete = wordCount >= 30;
        health.score = Math.min(100, (wordCount / 50) * 100);
        break;
      default:
        health.isComplete = Array.isArray(data) ? data.length > 0 : !!data;
        health.score = health.isComplete ? 85 : 0;
    }

    return health;
  }

  function extractAllText() {
    const texts = [];
    if (resumeData.summary) texts.push(resumeData.summary);
    if (resumeData.experience) {
      resumeData.experience.forEach(exp => {
        if (exp.description) texts.push(exp.description);
      });
    }
    return texts.join(' ');
  }

  function calculateATSScore() {
    let score = 0;
    
    // Basic completeness
    if (resumeData.personalInfo?.name) score += 20;
    if (resumeData.personalInfo?.email) score += 15;
    if (resumeData.summary) score += 20;
    if (resumeData.experience?.length > 0) score += 25;
    if (resumeData.skills?.length >= 5) score += 20;
    
    return Math.min(100, score);
  }

  function calculateContentQuality(text) {
    let score = 50; // Base score
    
    // Word count optimization
    const wordCount = text.split(' ').length;
    if (wordCount >= 300 && wordCount <= 600) score += 25;
    else if (wordCount >= 200) score += 15;
    
    // Action verbs
    const actionVerbs = ['achieved', 'developed', 'managed', 'led', 'created', 'improved'];
    const verbCount = actionVerbs.filter(verb => text.toLowerCase().includes(verb)).length;
    score += Math.min(25, verbCount * 5);
    
    return Math.min(100, score);
  }

  function calculateKeywordRelevance(text) {
    const techKeywords = ['javascript', 'python', 'react', 'node', 'aws', 'docker'];
    const matches = techKeywords.filter(keyword => text.toLowerCase().includes(keyword));
    return Math.round((matches.length / techKeywords.length) * 100);
  }

  function fetchMarketData() {
    // Simulate API call for market data
    setTimeout(() => {
      setMarketData({
        avgSalary: 85000,
        marketGrowth: 12,
        competitionLevel: 'Medium',
        topSkills: ['React', 'Python', 'AWS', 'Docker']
      });
    }, 1000);
  }

  const getScoreColor = (score) => {
    if (score >= 85) return '#10b981';
    if (score >= 70) return '#3b82f6';
    if (score >= 55) return '#f59e0b';
    return '#ef4444';
  };

  if (isAnalyzing) {
    return (
      <div className="analytics-loading">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <FaBrain size={40} color="#3b82f6" />
        </motion.div>
        <p>AI is analyzing your resume...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="smart-analytics"
    >
      <div className="analytics-header">
        <h2><FaBrain /> Smart Resume Analytics</h2>
        <div className="view-tabs">
          {['overview', 'insights', 'market'].map(view => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`tab-btn ${activeView === view ? 'active' : ''}`}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeView === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="overview-section"
          >
            {/* Main Score Circle */}
            <div className="hero-score">
              <div className="main-score-circle" style={{ '--score-color': getScoreColor(analytics.overallScore) }}>
                <span className="score-value">{analytics.overallScore}</span>
                <span className="score-label">Overall Score</span>
              </div>
              <div className="score-status">
                <h3>
                  {analytics.overallScore >= 85 ? '🚀 Excellent Resume!' :
                   analytics.overallScore >= 70 ? '👍 Good Progress' :
                   analytics.overallScore >= 55 ? '⚠️ Needs Work' :
                   '🔧 Major Improvements Needed'}
                </h3>
                <p>Interview Probability: <strong>{analytics.interviewChance}%</strong></p>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="metrics-grid">
              <div className="metric-card">
                <FaBullseye className="metric-icon" />
                <div className="metric-info">
                  <span className="metric-value">{analytics.atsCompatibility}</span>
                  <span className="metric-label">ATS Score</span>
                </div>
              </div>
              <div className="metric-card">
                <FaTrendingUp className="metric-icon" />
                <div className="metric-info">
                  <span className="metric-value">{analytics.marketRelevance}</span>
                  <span className="metric-label">Market Fit</span>
                </div>
              </div>
              <div className="metric-card">
                <FaEye className="metric-icon" />
                <div className="metric-info">
                  <span className="metric-value">{analytics.contentQuality}</span>
                  <span className="metric-label">Content</span>
                </div>
              </div>
              <div className="metric-card">
                <FaTarget className="metric-icon" />
                <div className="metric-info">
                  <span className="metric-value">{analytics.completeness}%</span>
                  <span className="metric-label">Complete</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="quick-stats">
              <div className="stat-item">
                <span className="stat-value">{analytics.wordCount}</span>
                <span className="stat-label">Words</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{analytics.quantifiableResults}</span>
                <span className="stat-label">Metrics</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{analytics.keywordDensity}%</span>
                <span className="stat-label">Keywords</span>
              </div>
            </div>
          </motion.div>
        )}

        {activeView === 'insights' && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="insights-section"
          >
            {/* Critical Actions */}
            {analytics.criticalActions.length > 0 && (
              <div className="action-section critical">
                <h3><FaExclamationTriangle /> Critical Actions</h3>
                {analytics.criticalActions.map((action, index) => (
                  <div key={index} className="action-card critical">
                    <div className="action-header">
                      <span className="action-title">{action.title}</span>
                      <div className="action-badges">
                        <span className={`badge impact-${action.impact.toLowerCase()}`}>{action.impact} Impact</span>
                        <span className={`badge effort-${action.effort.toLowerCase()}`}>{action.effort} Effort</span>
                      </div>
                    </div>
                    <p className="action-description">{action.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Wins */}
            {analytics.quickWins.length > 0 && (
              <div className="action-section quick-wins">
                <h3><FaRocket /> Quick Wins</h3>
                {analytics.quickWins.map((win, index) => (
                  <div key={index} className="action-card quick-win">
                    <div className="action-title">{win.title}</div>
                    <p className="action-description">{win.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Strengths */}
            {analytics.strengths.length > 0 && (
              <div className="strengths-section">
                <h3><FaAward /> Your Strengths</h3>
                {analytics.strengths.map((strength, index) => (
                  <div key={index} className="strength-item">
                    <FaCheckCircle color="#10b981" /> {strength}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeView === 'market' && (
          <motion.div
            key="market"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="market-section"
          >
            {/* Role Matches */}
            <div className="role-matches">
              <h3><FaTarget /> Top Role Matches</h3>
              {analytics.topRoleMatches.map((role, index) => (
                <div key={index} className="role-card">
                  <div className="role-info">
                    <div className="role-title">{role.title}</div>
                    <div className="role-details">
                      <span className="role-salary">{role.salary}</span>
                      <span className={`role-demand ${role.demand.toLowerCase()}`}>{role.demand} Demand</span>
                    </div>
                  </div>
                  <div className="role-match">
                    <div className="match-bar">
                      <div 
                        className="match-fill" 
                        style={{ 
                          width: `${role.match}%`,
                          backgroundColor: getScoreColor(role.match)
                        }}
                      ></div>
                    </div>
                    <span className="match-percentage">{role.match}%</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Skill Gaps */}
            {analytics.skillGaps.length > 0 && (
              <div className="skill-gaps">
                <h3><FaLightbulb /> Trending Skills to Learn</h3>
                <div className="skills-list">
                  {analytics.skillGaps.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Market Data */}
            {marketData && (
              <div className="market-data">
                <h3><FaChartLine /> Market Intelligence</h3>
                <div className="market-stats">
                  <div className="market-stat">
                    <span className="stat-label">Average Salary</span>
                    <span className="stat-value">${marketData.avgSalary.toLocaleString()}</span>
                  </div>
                  <div className="market-stat">
                    <span className="stat-label">Market Growth</span>
                    <span className="stat-value">+{marketData.marketGrowth}%</span>
                  </div>
                  <div className="market-stat">
                    <span className="stat-label">Competition</span>
                    <span className="stat-value">{marketData.competitionLevel}</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SmartResumeAnalytics;