import React, { useState, useEffect, useMemo } from 'react';
import { useResume } from '../../context/ResumeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCheckCircle, FaExclamationTriangle, FaLightbulb, FaEdit, 
  FaThumbsUp, FaThumbsDown, FaCopy, FaRocket, FaBrain,
  FaQuoteLeft, FaArrowRight, FaStar, FaFlag, FaEye
} from 'react-icons/fa';

const EnhancedWordingAnalytics = () => {
  const { resumeData } = useResume();
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedText, setCopiedText] = useState('');

  const analysis = useMemo(() => {
    return analyzeResumeWording();
  }, [resumeData]);

  function analyzeResumeWording() {
    const result = {
      overallScore: 0,
      strengths: [],
      weaknesses: [],
      missingSections: [],
      wordingIssues: [],
      suggestions: [],
      sectionAnalysis: {},
      keywordOptimization: {},
      impactEnhancements: []
    };

    // Analyze each section
    analyzeSectionWording('personal', resumeData.personal || resumeData.personalInfo, result);
    analyzeSectionWording('summary', resumeData.summary, result);
    analyzeSectionWording('experience', resumeData.experience, result);
    analyzeSectionWording('education', resumeData.education, result);
    analyzeSectionWording('skills', resumeData.skills, result);
    analyzeSectionWording('projects', resumeData.projects, result);
    analyzeSectionWording('certifications', resumeData.certifications, result);

    // Calculate overall score
    const completedSections = Object.keys(result.sectionAnalysis).filter(
      section => result.sectionAnalysis[section].isComplete
    ).length;
    const totalSections = 7;
    const completionScore = (completedSections / totalSections) * 40;
    const qualityScore = calculateQualityScore(result) * 60;
    result.overallScore = Math.round(completionScore + qualityScore);

    // Generate comprehensive suggestions
    generateWordingSuggestions(result);
    generateKeywordOptimization(result);
    generateImpactEnhancements(result);

    return result;
  }

  function analyzeSectionWording(sectionName, data, result) {
    const analysis = {
      isComplete: false,
      score: 0,
      wordCount: 0,
      issues: [],
      strengths: [],
      suggestions: [],
      improvedWording: []
    };

    if (!data) {
      result.missingSections.push({
        section: sectionName,
        priority: 'high',
        message: `${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)} section is missing`,
        suggestion: `Add your ${sectionName} information to make your resume complete`
      });
      result.sectionAnalysis[sectionName] = analysis;
      return;
    }

    switch (sectionName) {
      case 'personal':
        analyzePersonalSection(data, analysis);
        break;
      case 'summary':
        analyzeSummarySection(data, analysis);
        break;
      case 'experience':
        analyzeExperienceSection(data, analysis);
        break;
      case 'education':
        analyzeEducationSection(data, analysis);
        break;
      case 'skills':
        analyzeSkillsSection(data, analysis);
        break;
      case 'projects':
        analyzeProjectsSection(data, analysis);
        break;
      case 'certifications':
        analyzeCertificationsSection(data, analysis);
        break;
    }

    result.sectionAnalysis[sectionName] = analysis;
    
    // Add to overall strengths and weaknesses
    if (analysis.strengths.length > 0) {
      result.strengths.push(...analysis.strengths.map(s => ({ section: sectionName, ...s })));
    }
    if (analysis.issues.length > 0) {
      result.weaknesses.push(...analysis.issues.map(i => ({ section: sectionName, ...i })));
    }
  }

  function analyzePersonalSection(data, analysis) {
    analysis.isComplete = !!(data.name && data.email && data.phone);
    
    if (data.name) {
      analysis.strengths.push({
        type: 'complete',
        message: 'Full name provided',
        impact: 'Essential for professional identification'
      });
    } else {
      analysis.issues.push({
        type: 'missing',
        message: 'Name is missing',
        suggestion: 'Add your full professional name'
      });
    }

    if (data.email) {
      if (data.email.includes('@gmail.com') || data.email.includes('@outlook.com')) {
        analysis.strengths.push({
          type: 'good',
          message: 'Professional email provided',
          impact: 'Easy for recruiters to contact you'
        });
      }
    } else {
      analysis.issues.push({
        type: 'missing',
        message: 'Email is missing',
        suggestion: 'Add a professional email address'
      });
    }

    if (!data.linkedin) {
      analysis.suggestions.push({
        type: 'enhancement',
        message: 'Add LinkedIn profile',
        suggestion: 'Include your LinkedIn URL to showcase your professional network',
        priority: 'medium'
      });
    }

    analysis.score = (data.name ? 40 : 0) + (data.email ? 30 : 0) + (data.phone ? 20 : 0) + (data.linkedin ? 10 : 0);
  }

  function analyzeSummarySection(data, analysis) {
    if (!data || data.length < 10) {
      analysis.issues.push({
        type: 'missing',
        message: 'Professional summary is too short or missing',
        suggestion: 'Write a compelling 3-4 sentence summary highlighting your key achievements'
      });
      return;
    }

    const words = data.split(' ').filter(w => w.length > 0);
    analysis.wordCount = words.length;
    analysis.isComplete = words.length >= 30;

    // Check for weak language
    const weakPhrases = [
      { phrase: 'responsible for', replacement: 'managed', reason: 'More impactful and direct' },
      { phrase: 'worked on', replacement: 'developed/created/built', reason: 'Shows ownership and action' },
      { phrase: 'helped with', replacement: 'contributed to/supported', reason: 'More professional tone' },
      { phrase: 'familiar with', replacement: 'experienced in/proficient in', reason: 'Demonstrates competence' },
      { phrase: 'some experience', replacement: 'experience in', reason: 'More confident language' }
    ];

    weakPhrases.forEach(({ phrase, replacement, reason }) => {
      if (data.toLowerCase().includes(phrase)) {
        analysis.issues.push({
          type: 'weak_language',
          message: `Weak phrase detected: "${phrase}"`,
          suggestion: `Replace with "${replacement}" - ${reason}`,
          original: phrase,
          improved: replacement
        });
      }
    });

    // Check for quantifiable achievements
    const hasNumbers = /\d+/.test(data);
    if (!hasNumbers) {
      analysis.suggestions.push({
        type: 'enhancement',
        message: 'Add quantifiable achievements',
        suggestion: 'Include specific numbers, percentages, or metrics to demonstrate impact',
        example: 'Instead of "improved sales", write "increased sales by 25%"'
      });
    } else {
      analysis.strengths.push({
        type: 'quantified',
        message: 'Contains quantifiable achievements',
        impact: 'Numbers make your accomplishments more credible'
      });
    }

    // Check for action verbs
    const strongActionVerbs = [
      'achieved', 'developed', 'managed', 'led', 'created', 'implemented',
      'improved', 'increased', 'reduced', 'optimized', 'designed', 'built',
      'launched', 'delivered', 'spearheaded', 'transformed'
    ];

    const actionVerbCount = strongActionVerbs.filter(verb => 
      data.toLowerCase().includes(verb)
    ).length;

    if (actionVerbCount >= 2) {
      analysis.strengths.push({
        type: 'action_verbs',
        message: `Uses ${actionVerbCount} strong action verbs`,
        impact: 'Demonstrates proactive approach and leadership'
      });
    } else {
      analysis.suggestions.push({
        type: 'enhancement',
        message: 'Use more powerful action verbs',
        suggestion: 'Start sentences with strong verbs like "achieved", "developed", "led"',
        examples: strongActionVerbs.slice(0, 6)
      });
    }

    // Length optimization
    if (words.length < 30) {
      analysis.issues.push({
        type: 'too_short',
        message: 'Summary is too brief',
        suggestion: 'Expand to 50-100 words for optimal impact'
      });
    } else if (words.length > 120) {
      analysis.issues.push({
        type: 'too_long',
        message: 'Summary is too lengthy',
        suggestion: 'Condense to 50-100 words for better readability'
      });
    } else {
      analysis.strengths.push({
        type: 'optimal_length',
        message: 'Summary has optimal length',
        impact: 'Perfect length for recruiter attention span'
      });
    }

    analysis.score = Math.min(100, (words.length / 75) * 100);
  }

  function analyzeExperienceSection(data, analysis) {
    if (!Array.isArray(data) || data.length === 0) {
      analysis.issues.push({
        type: 'missing',
        message: 'Work experience section is empty',
        suggestion: 'Add your professional work experience with detailed descriptions'
      });
      return;
    }

    analysis.isComplete = true;
    let totalScore = 0;

    data.forEach((job, index) => {
      const jobAnalysis = analyzeJobDescription(job, index);
      analysis.improvedWording.push(jobAnalysis);
      totalScore += jobAnalysis.score;
    });

    analysis.score = totalScore / data.length;

    if (data.length >= 3) {
      analysis.strengths.push({
        type: 'comprehensive',
        message: `${data.length} work experiences listed`,
        impact: 'Shows career progression and diverse experience'
      });
    }
  }

  function analyzeJobDescription(job, index) {
    const jobAnalysis = {
      position: job.position || `Job ${index + 1}`,
      company: job.company || 'Unknown Company',
      score: 0,
      issues: [],
      strengths: [],
      suggestions: [],
      improvedDescriptions: []
    };

    if (!job.description || job.description.length < 50) {
      jobAnalysis.issues.push({
        type: 'insufficient_detail',
        message: 'Job description is too brief',
        suggestion: 'Expand with specific achievements and responsibilities'
      });
      return jobAnalysis;
    }

    const description = job.description;
    const sentences = description.split('.').filter(s => s.trim().length > 0);

    // Analyze each sentence for improvement opportunities
    sentences.forEach((sentence, idx) => {
      const improved = improveSentenceWording(sentence.trim());
      if (improved.hasImprovement) {
        jobAnalysis.improvedDescriptions.push({
          original: sentence.trim(),
          improved: improved.text,
          reason: improved.reason
        });
      }
    });

    // Check for bullet point format
    if (!description.includes('•') && !description.includes('-')) {
      jobAnalysis.suggestions.push({
        type: 'formatting',
        message: 'Use bullet points for better readability',
        suggestion: 'Format achievements as bullet points instead of paragraph text'
      });
    }

    jobAnalysis.score = 70 + (jobAnalysis.improvedDescriptions.length > 0 ? 20 : 0);
    return jobAnalysis;
  }

  function improveSentenceWording(sentence) {
    const improvements = [
      {
        pattern: /^responsible for/i,
        replacement: 'Managed',
        reason: 'More direct and impactful'
      },
      {
        pattern: /worked on/i,
        replacement: 'developed',
        reason: 'Shows ownership and creation'
      },
      {
        pattern: /helped to/i,
        replacement: 'contributed to',
        reason: 'More professional tone'
      },
      {
        pattern: /was involved in/i,
        replacement: 'participated in',
        reason: 'More active language'
      },
      {
        pattern: /did/i,
        replacement: 'executed',
        reason: 'More professional and specific'
      }
    ];

    for (const improvement of improvements) {
      if (improvement.pattern.test(sentence)) {
        return {
          hasImprovement: true,
          text: sentence.replace(improvement.pattern, improvement.replacement),
          reason: improvement.reason
        };
      }
    }

    return { hasImprovement: false, text: sentence };
  }

  function analyzeEducationSection(data, analysis) {
    analysis.isComplete = Array.isArray(data) && data.length > 0;
    
    if (!analysis.isComplete) {
      analysis.issues.push({
        type: 'missing',
        message: 'Education section is empty',
        suggestion: 'Add your educational background'
      });
    } else {
      analysis.strengths.push({
        type: 'complete',
        message: 'Education information provided',
        impact: 'Shows your academic foundation'
      });
    }

    analysis.score = analysis.isComplete ? 85 : 0;
  }

  function analyzeSkillsSection(data, analysis) {
    analysis.isComplete = Array.isArray(data) && data.length >= 5;
    
    if (!Array.isArray(data) || data.length === 0) {
      analysis.issues.push({
        type: 'missing',
        message: 'Skills section is empty',
        suggestion: 'Add your technical and soft skills'
      });
      return;
    }

    if (data.length < 5) {
      analysis.suggestions.push({
        type: 'enhancement',
        message: 'Add more skills',
        suggestion: 'Include at least 8-12 relevant skills for your target role'
      });
    }

    // Check for skill categorization
    const hasCategories = data.some(skill => 
      typeof skill === 'object' && skill.category
    );

    if (!hasCategories && data.length > 8) {
      analysis.suggestions.push({
        type: 'organization',
        message: 'Organize skills by category',
        suggestion: 'Group skills into categories like "Technical", "Languages", "Tools"'
      });
    }

    analysis.score = Math.min(100, (data.length / 10) * 100);
  }

  function analyzeProjectsSection(data, analysis) {
    analysis.isComplete = Array.isArray(data) && data.length > 0;
    
    if (!analysis.isComplete) {
      analysis.suggestions.push({
        type: 'enhancement',
        message: 'Add projects section',
        suggestion: 'Include 2-3 relevant projects to showcase your practical skills'
      });
    } else {
      analysis.strengths.push({
        type: 'complete',
        message: `${data.length} projects showcased`,
        impact: 'Demonstrates practical application of skills'
      });
    }

    analysis.score = analysis.isComplete ? 80 : 0;
  }

  function analyzeCertificationsSection(data, analysis) {
    analysis.isComplete = Array.isArray(data) && data.length > 0;
    
    if (analysis.isComplete) {
      analysis.strengths.push({
        type: 'complete',
        message: `${data.length} certifications listed`,
        impact: 'Shows commitment to professional development'
      });
      analysis.score = 90;
    } else {
      analysis.suggestions.push({
        type: 'enhancement',
        message: 'Consider adding certifications',
        suggestion: 'Include relevant professional certifications or courses'
      });
      analysis.score = 0;
    }
  }

  function calculateQualityScore(result) {
    const sections = Object.values(result.sectionAnalysis);
    const avgScore = sections.reduce((sum, section) => sum + section.score, 0) / sections.length;
    return avgScore / 100;
  }

  function generateWordingSuggestions(result) {
    // High-impact wording improvements
    result.suggestions.push({
      category: 'Power Words',
      title: 'Use More Impactful Action Verbs',
      items: [
        { weak: 'Responsible for', strong: 'Managed, Oversaw, Directed', context: 'Leadership roles' },
        { weak: 'Worked on', strong: 'Developed, Created, Built, Designed', context: 'Project work' },
        { weak: 'Helped with', strong: 'Contributed to, Supported, Facilitated', context: 'Team collaboration' },
        { weak: 'Did', strong: 'Executed, Implemented, Delivered', context: 'Task completion' }
      ]
    });

    result.suggestions.push({
      category: 'Quantification',
      title: 'Add Specific Numbers and Metrics',
      items: [
        { example: 'Increased sales by 25% over 6 months', tip: 'Always include percentages when possible' },
        { example: 'Managed a team of 8 developers', tip: 'Specify team sizes and scope' },
        { example: 'Reduced processing time from 2 hours to 30 minutes', tip: 'Show before/after improvements' },
        { example: 'Generated $50K in additional revenue', tip: 'Include dollar amounts for business impact' }
      ]
    });
  }

  function generateKeywordOptimization(result) {
    result.keywordOptimization = {
      missing: [
        'Leadership', 'Project Management', 'Problem Solving', 'Communication',
        'Team Collaboration', 'Strategic Planning', 'Process Improvement'
      ],
      suggestions: [
        'Include industry-specific keywords from job descriptions',
        'Add soft skills that are commonly requested',
        'Use technical terms relevant to your field',
        'Include action-oriented keywords that show results'
      ]
    };
  }

  function generateImpactEnhancements(result) {
    result.impactEnhancements = [
      {
        section: 'Summary',
        current: 'Experienced software developer with knowledge of various technologies',
        improved: 'Results-driven software developer with 5+ years building scalable applications that serve 10K+ users daily',
        improvement: 'Added specific experience duration and quantifiable impact'
      },
      {
        section: 'Experience',
        current: 'Worked on improving the website performance',
        improved: 'Optimized website performance, reducing page load time by 40% and increasing user engagement by 25%',
        improvement: 'Quantified the improvement and added business impact'
      },
      {
        section: 'Projects',
        current: 'Built a mobile app for task management',
        improved: 'Developed a React Native task management app with 500+ downloads, featuring real-time sync and offline capabilities',
        improvement: 'Added download metrics and specific technical features'
      }
    ];
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const getScoreColor = (score) => {
    if (score >= 85) return '#10b981';
    if (score >= 70) return '#3b82f6';
    if (score >= 55) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="enhanced-wording-analytics"
      style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}
    >
      <div className="analytics-header" style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '28px', color: '#1f2937' }}>
          <FaBrain /> Resume Wording Analytics
        </h2>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>Get specific suggestions to enhance your resume wording and impact</p>
        
        <div className="tab-navigation" style={{ display: 'flex', justifyContent: 'center', gap: '5px', background: '#f3f4f6', padding: '5px', borderRadius: '12px', width: 'fit-content', margin: '20px auto 0' }}>
          {['overview', 'wording', 'suggestions', 'examples'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 20px',
                border: 'none',
                background: activeTab === tab ? 'white' : 'transparent',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                color: activeTab === tab ? '#3b82f6' : '#6b7280',
                boxShadow: activeTab === tab ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
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
          >
            {/* Overall Score */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px', padding: '40px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '20px', color: 'white', marginBottom: '30px' }}>
              <div style={{ position: 'relative', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '4px solid rgba(255,255,255,0.3)' }}>
                <span style={{ fontSize: '48px', fontWeight: 'bold' }}>{analysis.overallScore}</span>
                <span style={{ fontSize: '14px', opacity: '0.9' }}>Overall Score</span>
              </div>
              <div>
                <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>
                  {analysis.overallScore >= 85 ? '🚀 Excellent Wording!' :
                   analysis.overallScore >= 70 ? '👍 Good Progress' :
                   analysis.overallScore >= 55 ? '⚠️ Needs Enhancement' :
                   '🔧 Major Improvements Needed'}
                </h3>
                <p style={{ fontSize: '16px', opacity: '0.9' }}>
                  {analysis.strengths.length} strengths identified, {analysis.weaknesses.length} areas for improvement
                </p>
              </div>
            </div>

            {/* Quick Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              {/* Strengths */}
              <div style={{ background: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: '4px solid #10b981' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1f2937', marginBottom: '15px' }}>
                  <FaThumbsUp color="#10b981" /> What's Good ({analysis.strengths.length})
                </h3>
                {analysis.strengths.slice(0, 3).map((strength, index) => (
                  <div key={index} style={{ marginBottom: '10px', padding: '10px', background: '#f0fdf4', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '600', color: '#16a34a', marginBottom: '5px' }}>{strength.message}</div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>{strength.impact}</div>
                  </div>
                ))}
              </div>

              {/* Issues */}
              <div style={{ background: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: '4px solid #ef4444' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1f2937', marginBottom: '15px' }}>
                  <FaThumbsDown color="#ef4444" /> Needs Work ({analysis.weaknesses.length})
                </h3>
                {analysis.weaknesses.slice(0, 3).map((weakness, index) => (
                  <div key={index} style={{ marginBottom: '10px', padding: '10px', background: '#fef2f2', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '600', color: '#dc2626', marginBottom: '5px' }}>{weakness.message}</div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>{weakness.suggestion}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Sections */}
            {analysis.missingSections.length > 0 && (
              <div style={{ background: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: '4px solid #f59e0b', marginBottom: '20px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1f2937', marginBottom: '15px' }}>
                  <FaFlag color="#f59e0b" /> Missing Sections
                </h3>
                {analysis.missingSections.map((missing, index) => (
                  <div key={index} style={{ marginBottom: '10px', padding: '10px', background: '#fffbeb', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '600', color: '#d97706', marginBottom: '5px' }}>{missing.message}</div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>{missing.suggestion}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'wording' && (
          <motion.div
            key="wording"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <h3 style={{ marginBottom: '20px', color: '#1f2937' }}>Section-by-Section Wording Analysis</h3>
            
            {Object.entries(analysis.sectionAnalysis).map(([sectionName, sectionData]) => (
              <div key={sectionName} style={{ background: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h4 style={{ color: '#1f2937', textTransform: 'capitalize' }}>{sectionName}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', background: sectionData.isComplete ? '#dcfce7' : '#fef2f2', color: sectionData.isComplete ? '#16a34a' : '#dc2626' }}>
                      {sectionData.isComplete ? 'Complete' : 'Incomplete'}
                    </span>
                    <span style={{ fontWeight: 'bold', color: getScoreColor(sectionData.score) }}>
                      {sectionData.score}/100
                    </span>
                  </div>
                </div>

                {/* Issues */}
                {sectionData.issues.length > 0 && (
                  <div style={{ marginBottom: '15px' }}>
                    <h5 style={{ color: '#dc2626', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <FaExclamationTriangle size={14} /> Issues Found
                    </h5>
                    {sectionData.issues.map((issue, index) => (
                      <div key={index} style={{ padding: '10px', background: '#fef2f2', borderRadius: '8px', marginBottom: '8px' }}>
                        <div style={{ fontWeight: '600', color: '#dc2626', marginBottom: '5px' }}>{issue.message}</div>
                        <div style={{ fontSize: '14px', color: '#6b7280' }}>{issue.suggestion}</div>
                        {issue.original && issue.improved && (
                          <div style={{ marginTop: '8px', padding: '8px', background: 'white', borderRadius: '6px', border: '1px solid #fecaca' }}>
                            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Suggested improvement:</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ textDecoration: 'line-through', color: '#dc2626' }}>"{issue.original}"</span>
                              <FaArrowRight size={12} color="#6b7280" />
                              <span style={{ color: '#16a34a', fontWeight: '500' }}>"{issue.improved}"</span>
                              <button
                                onClick={() => copyToClipboard(issue.improved)}
                                style={{ padding: '4px 8px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                              >
                                <FaCopy size={10} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Improved Wording for Experience */}
                {sectionName === 'experience' && sectionData.improvedWording && (
                  <div>
                    <h5 style={{ color: '#3b82f6', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <FaEdit size={14} /> Wording Improvements
                    </h5>
                    {sectionData.improvedWording.map((job, jobIndex) => (
                      <div key={jobIndex} style={{ marginBottom: '15px', padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
                        <h6 style={{ color: '#1f2937', marginBottom: '10px' }}>{job.position} at {job.company}</h6>
                        {job.improvedDescriptions.map((desc, descIndex) => (
                          <div key={descIndex} style={{ marginBottom: '10px', padding: '10px', background: 'white', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>Original:</div>
                            <div style={{ color: '#dc2626', marginBottom: '8px', fontSize: '14px' }}>"{desc.original}"</div>
                            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>Improved:</div>
                            <div style={{ color: '#16a34a', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>"{desc.improved}"</div>
                            <div style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>Reason: {desc.reason}</div>
                            <button
                              onClick={() => copyToClipboard(desc.improved)}
                              style={{ marginTop: '8px', padding: '4px 8px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                            >
                              <FaCopy size={10} /> Copy Improved Version
                            </button>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {/* Strengths */}
                {sectionData.strengths.length > 0 && (
                  <div>
                    <h5 style={{ color: '#16a34a', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <FaCheckCircle size={14} /> Strengths
                    </h5>
                    {sectionData.strengths.map((strength, index) => (
                      <div key={index} style={{ padding: '10px', background: '#f0fdf4', borderRadius: '8px', marginBottom: '8px' }}>
                        <div style={{ fontWeight: '600', color: '#16a34a', marginBottom: '5px' }}>{strength.message}</div>
                        <div style={{ fontSize: '14px', color: '#6b7280' }}>{strength.impact}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'suggestions' && (
          <motion.div
            key="suggestions"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <h3 style={{ marginBottom: '20px', color: '#1f2937' }}>Wording Enhancement Suggestions</h3>
            
            {analysis.suggestions.map((suggestion, index) => (
              <div key={index} style={{ background: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
                <h4 style={{ color: '#3b82f6', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FaLightbulb /> {suggestion.title}
                </h4>
                <div style={{ color: '#6b7280', marginBottom: '15px' }}>Category: {suggestion.category}</div>
                
                {suggestion.items.map((item, itemIndex) => (
                  <div key={itemIndex} style={{ padding: '15px', background: '#f8fafc', borderRadius: '8px', marginBottom: '10px' }}>
                    {item.weak && item.strong ? (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                          <span style={{ color: '#dc2626', textDecoration: 'line-through' }}>❌ {item.weak}</span>
                          <FaArrowRight size={12} color="#6b7280" />
                          <span style={{ color: '#16a34a', fontWeight: '500' }}>✅ {item.strong}</span>
                        </div>
                        <div style={{ fontSize: '14px', color: '#6b7280', fontStyle: 'italic' }}>Context: {item.context}</div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontWeight: '500', color: '#1f2937', marginBottom: '5px' }}>{item.example}</div>
                        <div style={{ fontSize: '14px', color: '#6b7280' }}>{item.tip}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}

            {/* Keyword Optimization */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
              <h4 style={{ color: '#3b82f6', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaRocket /> Keyword Optimization
              </h4>
              
              <div style={{ marginBottom: '15px' }}>
                <h5 style={{ color: '#1f2937', marginBottom: '10px' }}>Missing Important Keywords:</h5>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {analysis.keywordOptimization.missing.map((keyword, index) => (
                    <span key={index} style={{ padding: '6px 12px', background: '#fef3c7', color: '#d97706', borderRadius: '16px', fontSize: '14px' }}>
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h5 style={{ color: '#1f2937', marginBottom: '10px' }}>Optimization Tips:</h5>
                {analysis.keywordOptimization.suggestions.map((tip, index) => (
                  <div key={index} style={{ padding: '10px', background: '#eff6ff', borderRadius: '8px', marginBottom: '8px', color: '#1f2937' }}>
                    • {tip}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'examples' && (
          <motion.div
            key="examples"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <h3 style={{ marginBottom: '20px', color: '#1f2937' }}>Before & After Examples</h3>
            
            {analysis.impactEnhancements.map((example, index) => (
              <div key={index} style={{ background: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
                <h4 style={{ color: '#3b82f6', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FaStar /> {example.section} Enhancement
                </h4>
                
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <FaQuoteLeft size={12} /> Before (Weak):
                  </div>
                  <div style={{ padding: '15px', background: '#fef2f2', borderRadius: '8px', color: '#dc2626', border: '1px solid #fecaca' }}>
                    {example.current}
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <FaEye size={12} /> After (Strong):
                  </div>
                  <div style={{ padding: '15px', background: '#f0fdf4', borderRadius: '8px', color: '#16a34a', border: '1px solid #bbf7d0', position: 'relative' }}>
                    {example.improved}
                    <button
                      onClick={() => copyToClipboard(example.improved)}
                      style={{ position: 'absolute', top: '10px', right: '10px', padding: '6px 10px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      <FaCopy size={10} /> Copy
                    </button>
                  </div>
                </div>

                <div style={{ padding: '12px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fed7aa' }}>
                  <div style={{ fontSize: '14px', color: '#92400e', fontWeight: '500' }}>
                    💡 Why this works: {example.improvement}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {copiedText && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: '#10b981',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: 1000
          }}
        >
          ✅ Copied to clipboard!
        </motion.div>
      )}
    </motion.div>
  );
};

export default EnhancedWordingAnalytics;