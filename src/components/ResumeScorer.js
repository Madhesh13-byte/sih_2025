import React from 'react';
import { useResume } from '../context/ResumeContext';

const ResumeScorer = () => {
  const { resumeData } = useResume();
  const calculateScore = () => {
    let score = 0;
    const checks = [];

    // Personal info completeness (20 points)
    const personalFields = Object.values(resumeData.personal).filter(v => v.trim());
    if (personalFields.length >= 4) {
      score += 20;
      checks.push({ text: 'Complete contact information', status: 'good' });
    } else {
      checks.push({ text: 'Missing contact details', status: 'warning' });
    }

    // Summary (15 points)
    if (resumeData.summary && resumeData.summary.length > 50) {
      score += 15;
      checks.push({ text: 'Professional summary included', status: 'good' });
    } else {
      checks.push({ text: 'Add professional summary', status: 'error' });
    }

    // Experience (25 points)
    if (resumeData.experience.length >= 2) {
      score += 25;
      checks.push({ text: 'Sufficient work experience', status: 'good' });
    } else if (resumeData.experience.length === 1) {
      score += 15;
      checks.push({ text: 'Add more work experience', status: 'warning' });
    } else {
      checks.push({ text: 'No work experience added', status: 'error' });
    }

    // Skills (20 points)
    if (resumeData.skills.length >= 6) {
      score += 20;
      checks.push({ text: 'Good variety of skills', status: 'good' });
    } else if (resumeData.skills.length >= 3) {
      score += 10;
      checks.push({ text: 'Add more relevant skills', status: 'warning' });
    } else {
      checks.push({ text: 'Add technical skills', status: 'error' });
    }

    // Education (10 points)
    if (resumeData.education.length >= 1) {
      score += 10;
      checks.push({ text: 'Education details added', status: 'good' });
    } else {
      checks.push({ text: 'Add education background', status: 'error' });
    }

    // Projects (10 points)
    if (resumeData.projects.length >= 2) {
      score += 10;
      checks.push({ text: 'Projects showcase included', status: 'good' });
    } else {
      checks.push({ text: 'Add project examples', status: 'warning' });
    }

    return { score, checks };
  };

  const { score, checks } = calculateScore();
  const getScoreColor = () => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getIcon = (status) => {
    switch (status) {
      case 'good': return <span style={{ color: '#10b981', fontSize: '16px' }}>✓</span>;
      case 'warning': return <span style={{ color: '#f59e0b', fontSize: '16px' }}>⚠</span>;
      case 'error': return <span style={{ color: '#ef4444', fontSize: '16px' }}>✗</span>;
      default: return null;
    }
  };

  return (
    <div style={{ 
      background: 'white', 
      padding: '20px', 
      borderRadius: '12px', 
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Resume Score</h3>
        <div style={{ 
          marginLeft: 'auto',
          fontSize: '24px',
          fontWeight: 'bold',
          color: getScoreColor()
        }}>
          {score}/100
        </div>
      </div>
      
      <div style={{ 
        width: '100%', 
        height: '8px', 
        background: '#e5e7eb', 
        borderRadius: '4px',
        marginBottom: '16px'
      }}>
        <div style={{ 
          width: `${score}%`, 
          height: '100%', 
          background: getScoreColor(),
          borderRadius: '4px',
          transition: 'width 0.3s ease'
        }} />
      </div>

      <div style={{ fontSize: '14px' }}>
        {checks.map((check, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            marginBottom: '8px'
          }}>
            {getIcon(check.status)}
            <span>{check.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResumeScorer;