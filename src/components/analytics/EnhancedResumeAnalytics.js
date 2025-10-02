import React, { useState, useEffect } from 'react';
import { useResume } from '../../context/ResumeContext';
import { motion } from 'framer-motion';
import { FaChartLine, FaEye, FaRobot, FaExclamationTriangle, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';

const EnhancedResumeAnalytics = () => {
  const { resumeData } = useResume();
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    setAnalytics(calculateEnhancedAnalytics());
  }, [resumeData]);

  const calculateEnhancedAnalytics = () => {
    const analytics = {
      // Basic metrics
      completeness: 0,
      sections: 0,
      totalSections: 7,
      wordCount: 0,
      
      // Enhanced metrics
      atsScore: 0,
      readabilityScore: 0,
      keywordDensity: {},
      sectionAnalysis: {},
      recommendations: [],
      strengths: [],
      weaknesses: [],
      
      // Detailed counts
      skillsCount: 0,
      experienceYears: 0,
      projectsCount: 0,
      educationCount: 0,
      certificationsCount: 0,
      contactMethods: 0,
      
      // Content quality
      actionVerbsCount: 0,
      quantifiableAchievements: 0,
      industryKeywords: 0,
      
      // Format analysis
      bulletPointsUsed: 0,
      consistentFormatting: true,
      appropriateLength: true
    };

    // Section completeness analysis
    const sectionChecks = {
      personalInfo: resumeData.personalInfo?.name,
      summary: resumeData.summary,
      skills: resumeData.skills?.length > 0,
      experience: resumeData.experience?.length > 0,
      education: resumeData.education?.length > 0,
      projects: resumeData.projects?.length > 0,
      certifications: resumeData.certifications?.length > 0
    };

    Object.entries(sectionChecks).forEach(([section, isComplete]) => {
      if (isComplete) analytics.sections++;
      analytics.sectionAnalysis[section] = {
        complete: isComplete,
        quality: analyzeSection(section, resumeData[section] || resumeData.personalInfo)
      };
    });

    analytics.completeness = Math.round((analytics.sections / analytics.totalSections) * 100);

    // Detailed counts
    analytics.skillsCount = resumeData.skills?.length || 0;
    analytics.projectsCount = resumeData.projects?.length || 0;
    analytics.educationCount = resumeData.education?.length || 0;
    analytics.certificationsCount = resumeData.certifications?.length || 0;

    // Contact methods analysis
    const contact = resumeData.personalInfo || {};
    const contactFields = ['email', 'phone', 'linkedin', 'github', 'portfolio'];
    analytics.contactMethods = contactFields.filter(field => contact[field]).length;

    // Word count and content analysis
    const textFields = [
      resumeData.summary,
      ...(resumeData.experience?.map(exp => exp.description) || []),
      ...(resumeData.projects?.map(proj => proj.description) || [])
    ].filter(Boolean);

    analytics.wordCount = textFields.reduce((count, text) => {
      return count + (text?.split(' ').length || 0);
    }, 0);

    // Experience years calculation
    if (resumeData.experience?.length > 0) {
      const totalMonths = resumeData.experience.reduce((total, exp) => {
        if (exp.startDate && exp.endDate) {
          const start = new Date(exp.startDate);
          const end = exp.endDate === 'Present' ? new Date() : new Date(exp.endDate);
          const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
          return total + Math.max(0, months);
        }
        return total;
      }, 0);
      analytics.experienceYears = Math.round(totalMonths / 12 * 10) / 10;
    }

    // Content quality analysis
    const allText = textFields.join(' ').toLowerCase();
    
    // Action verbs analysis
    const actionVerbs = ['achieved', 'developed', 'managed', 'led', 'created', 'implemented', 'improved', 'increased', 'reduced', 'optimized', 'designed', 'built', 'launched', 'delivered', 'collaborated'];
    analytics.actionVerbsCount = actionVerbs.filter(verb => allText.includes(verb)).length;

    // Quantifiable achievements
    const numberPattern = /\d+(\.\d+)?[%$kmb]?/gi;
    analytics.quantifiableAchievements = (allText.match(numberPattern) || []).length;

    // Industry keywords analysis
    const techKeywords = ['javascript', 'python', 'react', 'node', 'aws', 'docker', 'kubernetes', 'agile', 'scrum', 'api', 'database', 'sql', 'git', 'ci/cd'];
    analytics.industryKeywords = techKeywords.filter(keyword => allText.includes(keyword)).length;

    // Keyword density
    const words = allText.split(' ').filter(word => word.length > 3);
    const wordFreq = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    analytics.keywordDensity = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .reduce((obj, [word, count]) => ({ ...obj, [word]: count }), {});

    // ATS Score calculation (enhanced)
    let atsScore = 0;
    if (analytics.completeness >= 90) atsScore += 25;
    else if (analytics.completeness >= 70) atsScore += 15;
    
    if (analytics.wordCount >= 300 && analytics.wordCount <= 800) atsScore += 20;
    else if (analytics.wordCount >= 200) atsScore += 10;
    
    if (analytics.skillsCount >= 8) atsScore += 15;
    else if (analytics.skillsCount >= 5) atsScore += 10;
    
    if (analytics.contactMethods >= 4) atsScore += 10;
    else if (analytics.contactMethods >= 3) atsScore += 5;
    
    if (analytics.actionVerbsCount >= 5) atsScore += 10;
    if (analytics.quantifiableAchievements >= 3) atsScore += 10;
    if (analytics.industryKeywords >= 5) atsScore += 10;
    
    analytics.atsScore = Math.min(100, atsScore);

    // Readability score (simplified)
    const avgWordsPerSentence = analytics.wordCount / Math.max(1, textFields.length);
    analytics.readabilityScore = Math.max(0, Math.min(100, 100 - (avgWordsPerSentence - 15) * 2));

    // Generate recommendations
    analytics.recommendations = generateRecommendations(analytics);
    analytics.strengths = generateStrengths(analytics);
    analytics.weaknesses = generateWeaknesses(analytics);

    return analytics;
  };

  const analyzeSection = (section, data) => {
    if (!data) return { score: 0, issues: ['Section is empty'] };
    
    const issues = [];
    let score = 50; // Base score
    
    switch (section) {
      case 'personalInfo':
        if (!data.name) issues.push('Missing name');
        if (!data.email) issues.push('Missing email');
        if (!data.phone) issues.push('Missing phone');
        if (data.linkedin) score += 10;
        if (data.github) score += 10;
        break;
      case 'summary':
        if (data.length < 100) issues.push('Summary too short');
        if (data.length > 300) issues.push('Summary too long');
        if (!/\d/.test(data)) issues.push('No quantifiable achievements');
        break;
      case 'experience':
        data.forEach((exp, index) => {
          if (!exp.description || exp.description.length < 50) {
            issues.push(`Experience ${index + 1}: Description too short`);
          }
        });
        break;
    }
    
    return { score: Math.max(0, Math.min(100, score)), issues };
  };

  const generateRecommendations = (analytics) => {
    const recommendations = [];
    
    if (analytics.completeness < 100) {
      recommendations.push({
        type: 'critical',
        title: 'Complete Missing Sections',
        description: 'Fill in all resume sections for maximum impact',
        priority: 'high'
      });
    }
    
    if (analytics.wordCount < 300) {
      recommendations.push({
        type: 'warning',
        title: 'Add More Content',
        description: 'Expand descriptions with specific achievements and responsibilities',
        priority: 'high'
      });
    }
    
    if (analytics.actionVerbsCount < 5) {
      recommendations.push({
        type: 'info',
        title: 'Use More Action Verbs',
        description: 'Start bullet points with strong action verbs like "achieved", "developed", "led"',
        priority: 'medium'
      });
    }
    
    if (analytics.quantifiableAchievements < 3) {
      recommendations.push({
        type: 'warning',
        title: 'Add Quantifiable Results',
        description: 'Include numbers, percentages, and metrics to demonstrate impact',
        priority: 'high'
      });
    }
    
    return recommendations;
  };

  const generateStrengths = (analytics) => {
    const strengths = [];
    
    if (analytics.completeness >= 90) strengths.push('Comprehensive resume with all sections');
    if (analytics.atsScore >= 80) strengths.push('High ATS compatibility');
    if (analytics.actionVerbsCount >= 5) strengths.push('Good use of action verbs');
    if (analytics.quantifiableAchievements >= 3) strengths.push('Includes quantifiable achievements');
    if (analytics.contactMethods >= 4) strengths.push('Multiple contact methods provided');
    
    return strengths;
  };

  const generateWeaknesses = (analytics) => {
    const weaknesses = [];
    
    if (analytics.completeness < 70) weaknesses.push('Missing important sections');
    if (analytics.wordCount < 200) weaknesses.push('Content too brief');
    if (analytics.skillsCount < 5) weaknesses.push('Limited skills listed');
    if (analytics.actionVerbsCount < 3) weaknesses.push('Weak action verbs usage');
    if (analytics.quantifiableAchievements < 2) weaknesses.push('Lacks quantifiable results');
    
    return weaknesses;
  };

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

  if (!analytics) return <div>Loading analytics...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="enhanced-analytics"
    >
      <div className="analytics-header">
        <h3><FaChartLine /> Enhanced Resume Analytics</h3>
        <div className="analytics-tabs">
          {['overview', 'detailed', 'recommendations'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="analytics-overview">
          <div className="score-cards">
            <div className="score-card primary">
              <div className="score-circle" style={{ '--score-color': getScoreColor(analytics.atsScore) }}>
                <span className="score-value">{analytics.atsScore}</span>
                <span className="score-label">ATS Score</span>
              </div>
            </div>
            <div className="score-card">
              <div className="score-circle" style={{ '--score-color': getScoreColor(analytics.readabilityScore) }}>
                <span className="score-value">{Math.round(analytics.readabilityScore)}</span>
                <span className="score-label">Readability</span>
              </div>
            </div>
            <div className="score-card">
              <div className="score-circle" style={{ '--score-color': getScoreColor(analytics.completeness) }}>
                <span className="score-value">{analytics.completeness}%</span>
                <span className="score-label">Complete</span>
              </div>
            </div>
          </div>

          <div className="quick-stats">
            <div className="stat-grid">
              <div className="stat-item">
                <span className="stat-value">{analytics.wordCount}</span>
                <span className="stat-label">Words</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{analytics.skillsCount}</span>
                <span className="stat-label">Skills</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{analytics.experienceYears}y</span>
                <span className="stat-label">Experience</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{analytics.actionVerbsCount}</span>
                <span className="stat-label">Action Verbs</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{analytics.quantifiableAchievements}</span>
                <span className="stat-label">Metrics</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{analytics.contactMethods}/5</span>
                <span className="stat-label">Contacts</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'detailed' && (
        <div className="detailed-analysis">
          <div className="analysis-section">
            <h4>Section Analysis</h4>
            <div className="section-grid">
              {Object.entries(analytics.sectionAnalysis).map(([section, analysis]) => (
                <div key={section} className="section-analysis-card">
                  <div className="section-header">
                    <span className="section-name">{section.charAt(0).toUpperCase() + section.slice(1)}</span>
                    <span className={`status ${analysis.complete ? 'complete' : 'incomplete'}`}>
                      {analysis.complete ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="section-score">
                    Score: {analysis.quality.score}/100
                  </div>
                  {analysis.quality.issues.length > 0 && (
                    <div className="section-issues">
                      {analysis.quality.issues.map((issue, index) => (
                        <div key={index} className="issue">{issue}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="analysis-section">
            <h4>Top Keywords</h4>
            <div className="keyword-cloud">
              {Object.entries(analytics.keywordDensity).map(([word, count]) => (
                <span key={word} className="keyword-tag" style={{ fontSize: `${Math.min(16, 10 + count)}px` }}>
                  {word} ({count})
                </span>
              ))}
            </div>
          </div>

          <div className="strengths-weaknesses">
            <div className="strengths">
              <h4>Strengths</h4>
              {analytics.strengths.map((strength, index) => (
                <div key={index} className="strength-item">
                  <FaCheckCircle color="#10b981" /> {strength}
                </div>
              ))}
            </div>
            <div className="weaknesses">
              <h4>Areas for Improvement</h4>
              {analytics.weaknesses.map((weakness, index) => (
                <div key={index} className="weakness-item">
                  <FaExclamationTriangle color="#ef4444" /> {weakness}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="recommendations-section">
          <h4>Personalized Recommendations</h4>
          <div className="recommendations-list">
            {analytics.recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`recommendation-card ${rec.type} ${rec.priority}`}
              >
                <div className="rec-header">
                  {getRecommendationIcon(rec.type)}
                  <span className="rec-title">{rec.title}</span>
                  <span className={`priority-badge ${rec.priority}`}>{rec.priority}</span>
                </div>
                <p className="rec-description">{rec.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default EnhancedResumeAnalytics;