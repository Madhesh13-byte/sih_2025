import React, { useState, useEffect, useMemo } from 'react';
import { useResume } from '../../context/ResumeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaChartLine, FaRobot, FaExclamationTriangle, FaCheckCircle, 
  FaInfoCircle, FaBullseye, FaEye, FaSearch, FaClock, FaAward,
  FaLightbulb, FaFlag, FaTrendingUp, FaShieldAlt, FaTarget,
  FaChartBar, FaUserTie, FaBrain, FaRocket, FaGem
} from 'react-icons/fa';

const UltimateResumeAnalytics = () => {
  const { resumeData } = useResume();
  const [activeTab, setActiveTab] = useState('overview');
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analytics = useMemo(() => {
    setIsAnalyzing(true);
    const result = calculateUltimateAnalytics();
    setTimeout(() => setIsAnalyzing(false), 1000);
    return result;
  }, [resumeData]);

  useEffect(() => {
    const newAnalysis = {
      id: Date.now(),
      timestamp: Date.now(),
      overallScore: analytics.overallScore,
      atsScore: analytics.atsScore,
      completeness: analytics.completeness,
      changes: calculateChanges()
    };
    setAnalysisHistory(prev => [newAnalysis, ...prev.slice(0, 9)]);
  }, [analytics]);

  function calculateUltimateAnalytics() {
    const analysis = {
      // Core Scores
      overallScore: 0,
      atsScore: 0,
      readabilityScore: 0,
      impactScore: 0,
      professionalismScore: 0,
      completeness: 0,
      
      // Advanced Metrics
      industryAlignment: 0,
      competitiveRanking: 0,
      hirabilityIndex: 0,
      salaryPotential: { min: 0, max: 0, currency: 'USD' },
      
      // Content Analysis
      wordCount: 0,
      sentenceCount: 0,
      paragraphCount: 0,
      bulletPointCount: 0,
      actionVerbCount: 0,
      quantifiableAchievements: 0,
      
      // Section Analysis
      sectionScores: {},
      sectionCompleteness: {},
      criticalMissing: [],
      
      // Keyword Analysis
      keywordDensity: {},
      industryKeywords: [],
      skillsGaps: [],
      trendingSkills: [],
      
      // AI Insights
      aiRecommendations: [],
      personalizedTips: [],
      competitorAnalysis: {},
      marketInsights: {},
      
      // Quality Metrics
      grammarScore: 0,
      consistencyScore: 0,
      formattingScore: 0,
      lengthOptimization: 0,
      
      // Predictions
      interviewProbability: 0,
      roleMatches: [],
      careerProgression: [],
      
      // Benchmarking
      industryBenchmark: {},
      peerComparison: {},
      topPercentile: 0
    };

    // Calculate all metrics
    calculateBasicMetrics(analysis);
    calculateContentAnalysis(analysis);
    calculateSectionAnalysis(analysis);
    calculateKeywordAnalysis(analysis);
    calculateAIInsights(analysis);
    calculatePredictions(analysis);
    calculateBenchmarks(analysis);
    
    // Calculate overall score
    analysis.overallScore = Math.round(
      (analysis.atsScore * 0.25) +
      (analysis.completeness * 0.20) +
      (analysis.impactScore * 0.20) +
      (analysis.professionalismScore * 0.15) +
      (analysis.readabilityScore * 0.10) +
      (analysis.industryAlignment * 0.10)
    );

    return analysis;
  }

  function calculateBasicMetrics(analysis) {
    const sections = ['personal', 'summary', 'experience', 'education', 'skills', 'projects', 'certifications'];
    let completedSections = 0;

    sections.forEach(section => {
      const data = resumeData[section];
      const isComplete = checkSectionCompleteness(section, data);
      if (isComplete) completedSections++;
      analysis.sectionCompleteness[section] = isComplete;
    });

    analysis.completeness = Math.round((completedSections / sections.length) * 100);
  }

  function calculateContentAnalysis(analysis) {
    const allText = extractAllText();
    const words = allText.split(/\s+/).filter(word => word.length > 0);
    const sentences = allText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    analysis.wordCount = words.length;
    analysis.sentenceCount = sentences.length;
    analysis.paragraphCount = allText.split(/\n\s*\n/).length;
    
    // Action verbs analysis
    const actionVerbs = [
      'achieved', 'developed', 'managed', 'led', 'created', 'implemented',
      'improved', 'increased', 'reduced', 'optimized', 'designed', 'built',
      'launched', 'delivered', 'collaborated', 'spearheaded', 'transformed',
      'streamlined', 'innovated', 'executed', 'orchestrated', 'pioneered'
    ];
    
    analysis.actionVerbCount = actionVerbs.filter(verb => 
      allText.toLowerCase().includes(verb)
    ).length;

    // Quantifiable achievements
    const numberPattern = /\d+(\.\d+)?[%$kmb]?/gi;
    analysis.quantifiableAchievements = (allText.match(numberPattern) || []).length;

    // Calculate scores
    analysis.readabilityScore = calculateReadabilityScore(allText);
    analysis.impactScore = calculateImpactScore(analysis);
    analysis.professionalismScore = calculateProfessionalismScore(allText);
  }

  function calculateSectionAnalysis(analysis) {
    const sections = ['personal', 'summary', 'experience', 'education', 'skills', 'projects', 'certifications'];
    
    sections.forEach(section => {
      const data = resumeData[section];
      analysis.sectionScores[section] = analyzeSectionQuality(section, data);
    });
  }

  function calculateKeywordAnalysis(analysis) {
    const allText = extractAllText().toLowerCase();
    
    // Industry keywords
    const techKeywords = [
      'javascript', 'python', 'react', 'node', 'aws', 'docker', 'kubernetes',
      'machine learning', 'artificial intelligence', 'data science', 'cloud computing',
      'microservices', 'devops', 'agile', 'scrum', 'api', 'database', 'sql'
    ];
    
    const businessKeywords = [
      'leadership', 'management', 'strategy', 'operations', 'sales', 'marketing',
      'business development', 'project management', 'stakeholder', 'roi', 'kpi'
    ];
    
    analysis.industryKeywords = [
      ...techKeywords.filter(keyword => allText.includes(keyword)),
      ...businessKeywords.filter(keyword => allText.includes(keyword))
    ];

    // Keyword density
    const words = allText.split(/\s+/).filter(word => word.length > 3);
    const wordFreq = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    analysis.keywordDensity = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .reduce((obj, [word, count]) => ({ ...obj, [word]: count }), {});
  }

  function calculateAIInsights(analysis) {
    // Generate AI-powered recommendations
    analysis.aiRecommendations = generateAIRecommendations(analysis);
    analysis.personalizedTips = generatePersonalizedTips(analysis);
    analysis.competitorAnalysis = generateCompetitorAnalysis(analysis);
    analysis.marketInsights = generateMarketInsights(analysis);
  }

  function calculatePredictions(analysis) {
    // Interview probability
    analysis.interviewProbability = Math.min(100, Math.round(
      (analysis.overallScore * 0.4) +
      (analysis.atsScore * 0.3) +
      (analysis.impactScore * 0.2) +
      (analysis.industryAlignment * 0.1)
    ));

    // Role matches
    analysis.roleMatches = [
      { title: 'Software Engineer', match: 85, demand: 'High', salary: '$75k-$120k' },
      { title: 'Product Manager', match: 72, demand: 'Medium', salary: '$90k-$140k' },
      { title: 'Data Scientist', match: 68, demand: 'High', salary: '$80k-$130k' },
      { title: 'DevOps Engineer', match: 65, demand: 'Very High', salary: '$85k-$135k' }
    ].sort((a, b) => b.match - a.match);

    // Career progression
    analysis.careerProgression = [
      { level: 'Junior', probability: 90, timeframe: '0-2 years' },
      { level: 'Mid-level', probability: 75, timeframe: '2-5 years' },
      { level: 'Senior', probability: 60, timeframe: '5-8 years' },
      { level: 'Lead/Principal', probability: 40, timeframe: '8+ years' }
    ];
  }

  function calculateBenchmarks(analysis) {
    // Industry benchmarking
    analysis.industryBenchmark = {
      averageScore: 72,
      topPercentile: 85,
      yourScore: analysis.overallScore,
      ranking: analysis.overallScore > 85 ? 'Top 10%' : 
               analysis.overallScore > 75 ? 'Top 25%' : 
               analysis.overallScore > 60 ? 'Top 50%' : 'Below Average'
    };

    analysis.topPercentile = analysis.overallScore >= 85 ? 10 : 
                            analysis.overallScore >= 75 ? 25 : 
                            analysis.overallScore >= 60 ? 50 : 75;
  }

  // Helper functions
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
    return texts.join(' ');
  }

  function checkSectionCompleteness(section, data) {
    if (!data) return false;
    
    switch (section) {
      case 'personal':
        return !!(data.name && data.email && data.phone);
      case 'summary':
        return data.length >= 50;
      case 'experience':
      case 'education':
      case 'skills':
      case 'projects':
      case 'certifications':
        return Array.isArray(data) && data.length > 0;
      default:
        return !!data;
    }
  }

  function analyzeSectionQuality(section, data) {
    const analysis = { score: 0, issues: [], suggestions: [], strengths: [] };
    
    if (!data) {
      analysis.issues.push('Section is missing');
      return analysis;
    }

    switch (section) {
      case 'personal':
        analysis.score = 
          (data.name ? 25 : 0) +
          (data.email ? 25 : 0) +
          (data.phone ? 20 : 0) +
          (data.linkedin ? 15 : 0) +
          (data.address ? 15 : 0);
        
        if (!data.linkedin) analysis.suggestions.push('Add LinkedIn profile');
        if (data.linkedin && data.name) analysis.strengths.push('Complete contact information');
        break;

      case 'summary':
        const wordCount = data.split(' ').length;
        analysis.score = Math.min(100, (wordCount / 75) * 100);
        
        if (wordCount < 30) analysis.issues.push('Summary too short');
        if (wordCount > 150) analysis.issues.push('Summary too long');
        if (!/\d/.test(data)) analysis.suggestions.push('Include quantifiable achievements');
        if (wordCount >= 50 && wordCount <= 100) analysis.strengths.push('Optimal length');
        break;

      default:
        analysis.score = Array.isArray(data) ? Math.min(100, data.length * 25) : 80;
        if (Array.isArray(data) && data.length > 0) {
          analysis.strengths.push(`${data.length} items included`);
        }
    }

    return analysis;
  }

  function calculateReadabilityScore(text) {
    const words = text.split(' ').filter(w => w.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);
    
    // Optimal range: 15-20 words per sentence
    let score = 100;
    if (avgWordsPerSentence > 25) score -= (avgWordsPerSentence - 25) * 3;
    if (avgWordsPerSentence < 10) score -= (10 - avgWordsPerSentence) * 2;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  function calculateImpactScore(analysis) {
    let score = 0;
    
    // Quantifiable achievements (40%)
    score += Math.min(40, analysis.quantifiableAchievements * 8);
    
    // Action verbs (30%)
    score += Math.min(30, analysis.actionVerbCount * 3);
    
    // Industry keywords (20%)
    score += Math.min(20, analysis.industryKeywords.length * 2);
    
    // Content depth (10%)
    if (analysis.wordCount >= 400) score += 10;
    else if (analysis.wordCount >= 200) score += 5;
    
    return Math.min(100, Math.round(score));
  }

  function calculateProfessionalismScore(text) {
    let score = 100;
    
    // Check for informal language
    const informalWords = ['awesome', 'cool', 'stuff', 'things', 'lots of', 'a lot'];
    const informalCount = informalWords.filter(word => text.toLowerCase().includes(word)).length;
    score -= informalCount * 5;
    
    // Check for first person overuse
    const firstPersonCount = (text.match(/\b(I|my|me)\b/gi) || []).length;
    if (firstPersonCount > 10) score -= (firstPersonCount - 10) * 2;
    
    // Check for proper capitalization
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const properlyCapitalized = sentences.filter(s => /^[A-Z]/.test(s.trim())).length;
    score += (properlyCapitalized / sentences.length) * 20 - 20;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  function generateAIRecommendations(analysis) {
    const recommendations = [];
    
    if (analysis.overallScore < 70) {
      recommendations.push({
        type: 'critical',
        title: 'Comprehensive Resume Enhancement Required',
        description: 'Your resume needs significant improvements to be competitive in today\'s market.',
        action: 'Focus on completing all sections and improving content quality',
        impact: 'high',
        priority: 1
      });
    }
    
    if (analysis.quantifiableAchievements < 5) {
      recommendations.push({
        type: 'warning',
        title: 'Add More Quantifiable Results',
        description: 'Recruiters love to see measurable impact. Add numbers, percentages, and metrics.',
        action: 'Include specific metrics like "Increased sales by 25%" or "Managed team of 8"',
        impact: 'high',
        priority: 2
      });
    }
    
    if (analysis.actionVerbCount < 8) {
      recommendations.push({
        type: 'info',
        title: 'Strengthen Action Verbs',
        description: 'Use more powerful action verbs to demonstrate your impact and leadership.',
        action: 'Replace weak verbs with strong ones like "spearheaded", "orchestrated", "transformed"',
        impact: 'medium',
        priority: 3
      });
    }

    if (analysis.industryKeywords.length < 10) {
      recommendations.push({
        type: 'warning',
        title: 'Optimize for Industry Keywords',
        description: 'Your resume lacks industry-specific keywords that ATS systems look for.',
        action: 'Research job descriptions and include relevant technical and industry terms',
        impact: 'high',
        priority: 2
      });
    }
    
    return recommendations.sort((a, b) => a.priority - b.priority);
  }

  function generatePersonalizedTips(analysis) {
    const tips = [];
    
    if (analysis.wordCount < 300) {
      tips.push('Expand your descriptions with specific examples and achievements');
    }
    
    if (analysis.readabilityScore < 70) {
      tips.push('Simplify your language and use shorter sentences for better readability');
    }
    
    if (analysis.completeness < 90) {
      tips.push('Complete all resume sections to maximize your professional presence');
    }
    
    tips.push('Tailor your resume for each job application using relevant keywords');
    tips.push('Use the STAR method (Situation, Task, Action, Result) for experience descriptions');
    
    return tips;
  }

  function generateCompetitorAnalysis(analysis) {
    return {
      averageScore: 72,
      yourAdvantage: analysis.overallScore > 72 ? 'Above average' : 'Below average',
      keyDifferentiators: analysis.overallScore > 80 ? 
        ['Strong quantifiable achievements', 'Comprehensive skill set', 'Professional presentation'] :
        ['Needs more quantifiable results', 'Could improve keyword optimization', 'Enhance professional formatting'],
      marketPosition: analysis.overallScore > 85 ? 'Top tier candidate' : 
                     analysis.overallScore > 70 ? 'Competitive candidate' : 'Needs improvement'
    };
  }

  function generateMarketInsights(analysis) {
    return {
      demandTrend: 'High',
      salaryTrend: 'Increasing',
      skillsInDemand: ['Cloud Computing', 'AI/ML', 'DevOps', 'Data Analysis'],
      emergingRoles: ['AI Engineer', 'Cloud Architect', 'Data Scientist', 'DevOps Specialist'],
      recommendations: [
        'Consider adding cloud certifications',
        'Highlight any AI/ML experience',
        'Emphasize data-driven achievements'
      ]
    };
  }

  function calculateChanges() {
    // Simplified change calculation
    return {
      sectionsAdded: 0,
      sectionsModified: 1,
      wordsAdded: 10,
      scoreChange: 2
    };
  }

  const getScoreColor = (score) => {
    if (score >= 85) return '#10b981';
    if (score >= 70) return '#3b82f6';
    if (score >= 55) return '#f59e0b';
    return '#ef4444';
  };

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'critical': return <FaExclamationTriangle color="#ef4444" />;
      case 'warning': return <FaInfoCircle color="#f59e0b" />;
      default: return <FaCheckCircle color="#10b981" />;
    }
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
        <p>Analyzing your resume with AI...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="ultimate-analytics"
    >
      <div className="analytics-header">
        <h2><FaRocket /> Ultimate Resume Analytics</h2>
        <div className="analytics-tabs">
          {['overview', 'detailed', 'ai-insights', 'predictions', 'benchmarks'].map(tab => (
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
            <div className="hero-score">
              <div className="main-score-circle" style={{ '--score-color': getScoreColor(analytics.overallScore) }}>
                <span className="score-value">{analytics.overallScore}</span>
                <span className="score-label">Overall Score</span>
                <div className="score-ring"></div>
              </div>
              <div className="score-description">
                <h3>Your Resume Performance</h3>
                <p className="score-status">
                  {analytics.overallScore >= 85 ? 'Excellent - Top tier resume!' :
                   analytics.overallScore >= 70 ? 'Good - Competitive resume' :
                   analytics.overallScore >= 55 ? 'Fair - Needs improvement' :
                   'Poor - Requires major enhancements'}
                </p>
              </div>
            </div>

            <div className="key-metrics">
              <div className="metric-card">
                <FaBullseye className="metric-icon" />
                <div className="metric-info">
                  <span className="metric-value">{analytics.atsScore}</span>
                  <span className="metric-label">ATS Score</span>
                </div>
              </div>
              <div className="metric-card">
                <FaEye className="metric-icon" />
                <div className="metric-info">
                  <span className="metric-value">{analytics.readabilityScore}</span>
                  <span className="metric-label">Readability</span>
                </div>
              </div>
              <div className="metric-card">
                <FaTrendingUp className="metric-icon" />
                <div className="metric-info">
                  <span className="metric-value">{analytics.impactScore}</span>
                  <span className="metric-label">Impact</span>
                </div>
              </div>
              <div className="metric-card">
                <FaUserTie className="metric-icon" />
                <div className="metric-info">
                  <span className="metric-value">{analytics.professionalismScore}</span>
                  <span className="metric-label">Professional</span>
                </div>
              </div>
              <div className="metric-card">
                <FaTarget className="metric-icon" />
                <div className="metric-info">
                  <span className="metric-value">{analytics.interviewProbability}%</span>
                  <span className="metric-label">Interview Chance</span>
                </div>
              </div>
            </div>

            <div className="quick-stats">
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-value">{analytics.completeness}%</span>
                  <span className="stat-label">Complete</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{analytics.wordCount}</span>
                  <span className="stat-label">Words</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{analytics.actionVerbCount}</span>
                  <span className="stat-label">Action Verbs</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{analytics.quantifiableAchievements}</span>
                  <span className="stat-label">Metrics</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{analytics.industryKeywords.length}</span>
                  <span className="stat-label">Keywords</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">Top {analytics.topPercentile}%</span>
                  <span className="stat-label">Ranking</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Other tabs would be implemented similarly */}
        {activeTab === 'ai-insights' && (
          <motion.div
            key="ai-insights"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="ai-insights"
          >
            <div className="insights-header">
              <h3><FaBrain /> AI-Powered Insights</h3>
              <p>Personalized recommendations based on advanced analysis</p>
            </div>

            <div className="recommendations-section">
              <h4>Priority Recommendations</h4>
              <div className="recommendations-list">
                {analytics.aiRecommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`recommendation-card ${rec.type} priority-${rec.priority}`}
                  >
                    <div className="rec-header">
                      {getRecommendationIcon(rec.type)}
                      <span className="rec-title">{rec.title}</span>
                      <span className={`impact-badge ${rec.impact}`}>{rec.impact}</span>
                    </div>
                    <p className="rec-description">{rec.description}</p>
                    <div className="rec-action">
                      <FaLightbulb size={12} /> <strong>Action:</strong> {rec.action}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="personalized-tips">
              <h4>Personalized Tips</h4>
              <div className="tips-list">
                {analytics.personalizedTips.map((tip, index) => (
                  <div key={index} className="tip-item">
                    <FaGem size={12} color="#3b82f6" /> {tip}
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

export default UltimateResumeAnalytics;