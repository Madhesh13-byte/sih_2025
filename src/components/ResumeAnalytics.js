import React, { useState } from 'react';
import { useResume } from '../context/ResumeContext';

const ResumeAnalytics = () => {
  const { resumeData } = useResume();
  const [activeTab, setActiveTab] = useState('overview');

  const analyzeResume = () => {
    const analysis = {
      completeness: 0,
      sections: 0,
      totalSections: 7,
      wordCount: 0,
      strengths: [],
      missing: [],
      improvements: [],
      actionVerbs: 0,
      quantifiableResults: 0,
      keywords: []
    };

    // Check sections
    if (resumeData.personalInfo?.name) analysis.sections++;
    else analysis.missing.push('Personal information incomplete');
    
    if (resumeData.summary) {
      analysis.sections++;
      const summaryWords = resumeData.summary.split(' ').length;
      if (summaryWords >= 30 && summaryWords <= 80) {
        analysis.strengths.push('Professional summary has good length');
      } else if (summaryWords < 30) {
        analysis.improvements.push('Summary too short - add 10-20 more words');
      } else {
        analysis.improvements.push('Summary too long - reduce to 60-80 words');
      }
    } else {
      analysis.missing.push('Professional summary missing');
    }
    
    if (resumeData.skills?.length > 0) {
      analysis.sections++;
      if (resumeData.skills.length >= 8) {
        analysis.strengths.push(`Good variety of skills (${resumeData.skills.length})`);
      } else {
        analysis.improvements.push('Add more relevant skills (aim for 8-12)');
      }
    } else {
      analysis.missing.push('Skills section empty');
    }
    
    if (resumeData.experience?.length > 0) {
      analysis.sections++;
      analysis.strengths.push(`${resumeData.experience.length} work experience entries`);
      
      // Analyze experience descriptions
      resumeData.experience.forEach((exp, i) => {
        if (exp.description) {
          const desc = exp.description.toLowerCase();
          
          // Check for action verbs
          const actionVerbs = ['achieved', 'developed', 'managed', 'led', 'created', 'implemented', 'improved', 'increased', 'reduced', 'optimized', 'designed', 'built', 'delivered', 'collaborated', 'coordinated', 'established'];
          const foundVerbs = actionVerbs.filter(verb => desc.includes(verb));
          analysis.actionVerbs += foundVerbs.length;
          
          // Check for numbers/quantifiable results
          const numbers = desc.match(/\d+[%$kmb]?/g) || [];
          analysis.quantifiableResults += numbers.length;
          
          if (foundVerbs.length === 0) {
            analysis.improvements.push(`Experience ${i + 1}: Start bullets with action verbs`);
          }
          if (numbers.length === 0) {
            analysis.improvements.push(`Experience ${i + 1}: Add quantifiable results (%, $, numbers)`);
          }
        } else {
          analysis.missing.push(`Experience ${i + 1}: Missing description`);
        }
      });
    } else {
      analysis.missing.push('Work experience section empty');
    }
    
    if (resumeData.education?.length > 0) analysis.sections++;
    else analysis.missing.push('Education section empty');
    
    if (resumeData.projects?.length > 0) {
      analysis.sections++;
      analysis.strengths.push(`${resumeData.projects.length} project entries`);
    }
    
    if (resumeData.certifications?.length > 0) {
      analysis.sections++;
      analysis.strengths.push(`${resumeData.certifications.length} certifications`);
    }

    analysis.completeness = Math.round((analysis.sections / analysis.totalSections) * 100);

    // Calculate word count
    const textFields = [
      resumeData.summary,
      ...(resumeData.experience?.map(exp => exp.description) || []),
      ...(resumeData.projects?.map(proj => proj.description) || [])
    ].filter(Boolean);

    analysis.wordCount = textFields.reduce((count, text) => {
      return count + (text?.split(' ').length || 0);
    }, 0);

    // Word count feedback
    if (analysis.wordCount < 200) {
      analysis.improvements.push('Resume too brief - add more details (aim for 300-500 words)');
    } else if (analysis.wordCount > 600) {
      analysis.improvements.push('Resume too lengthy - condense content (aim for 300-500 words)');
    } else {
      analysis.strengths.push('Good resume length');
    }

    // Action verbs feedback
    if (analysis.actionVerbs >= 8) {
      analysis.strengths.push('Strong use of action verbs');
    } else {
      analysis.improvements.push('Use more action verbs (achieved, developed, managed, etc.)');
    }

    // Quantifiable results feedback
    if (analysis.quantifiableResults >= 5) {
      analysis.strengths.push('Good use of quantifiable achievements');
    } else {
      analysis.improvements.push('Add more numbers and percentages to show impact');
    }

    return analysis;
  };

  const analysis = analyzeResume();

  const renderOverview = () => (
    <div>
      <div className="analytics-grid">
        <div className="stat-item">
          <span className="stat-value">{analysis.completeness}%</span>
          <span className="stat-label">Complete</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{analysis.sections}/{analysis.totalSections}</span>
          <span className="stat-label">Sections</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{analysis.wordCount}</span>
          <span className="stat-label">Words</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{analysis.actionVerbs}</span>
          <span className="stat-label">Action Verbs</span>
        </div>
      </div>
    </div>
  );

  const renderStrengths = () => (
    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
      <h5 style={{ color: '#28a745', marginBottom: '10px' }}>✅ What's Good</h5>
      {analysis.strengths.length > 0 ? (
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          {analysis.strengths.map((strength, i) => (
            <li key={i} style={{ fontSize: '12px', marginBottom: '5px', color: '#28a745' }}>
              {strength}
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>Complete more sections to see strengths</p>
      )}
    </div>
  );

  const renderMissing = () => (
    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
      <h5 style={{ color: '#dc3545', marginBottom: '10px' }}>❌ What's Missing</h5>
      {analysis.missing.length > 0 ? (
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          {analysis.missing.map((item, i) => (
            <li key={i} style={{ fontSize: '12px', marginBottom: '5px', color: '#dc3545' }}>
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ fontSize: '12px', color: '#28a745', fontStyle: 'italic' }}>All sections completed! 🎉</p>
      )}
    </div>
  );

  const renderImprovements = () => (
    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
      <h5 style={{ color: '#ffc107', marginBottom: '10px' }}>💡 Improvements</h5>
      {analysis.improvements.length > 0 ? (
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          {analysis.improvements.map((improvement, i) => (
            <li key={i} style={{ fontSize: '12px', marginBottom: '5px', color: '#856404' }}>
              {improvement}
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ fontSize: '12px', color: '#28a745', fontStyle: 'italic' }}>Resume looks great! 🌟</p>
      )}
    </div>
  );

  return (
    <div className="resume-analytics">
      <h4>📊 Resume Analytics</h4>
      
      <div style={{ display: 'flex', gap: '5px', marginBottom: '15px', flexWrap: 'wrap' }}>
        {['overview', 'strengths', 'missing', 'improvements'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '5px 10px',
              border: 'none',
              borderRadius: '4px',
              fontSize: '11px',
              cursor: 'pointer',
              backgroundColor: activeTab === tab ? '#667eea' : '#e9ecef',
              color: activeTab === tab ? 'white' : '#666',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'strengths' && renderStrengths()}
      {activeTab === 'missing' && renderMissing()}
      {activeTab === 'improvements' && renderImprovements()}
    </div>
  );
};

export default ResumeAnalytics;