import React, { useMemo } from 'react';
import { useResume } from '../context/ResumeContext';

const ResumeScore = () => {
  const { resumeData } = useResume();

  const calculateScore = useMemo(() => {
    let score = 0;
    const checks = [];

    // Contact Information (20 points)
    if (resumeData.name && resumeData.email && resumeData.phone) {
      score += 20;
      checks.push({ text: 'Complete contact information', status: 'good' });
    } else {
      checks.push({ text: 'Missing contact information', status: 'bad' });
    }

    // Professional Summary (15 points)
    if (resumeData.summary && resumeData.summary.length > 50) {
      score += 15;
      checks.push({ text: 'Professional summary included', status: 'good' });
    } else {
      checks.push({ text: 'Add a professional summary', status: 'bad' });
    }

    // Work Experience (25 points)
    if (resumeData.experience && resumeData.experience.length > 0) {
      score += 15;
      if (resumeData.experience.some(exp => exp.responsibilities && exp.responsibilities.length > 2)) {
        score += 10;
        checks.push({ text: 'Detailed work experience with achievements', status: 'good' });
      } else {
        checks.push({ text: 'Add more detailed job responsibilities', status: 'warning' });
      }
    } else {
      checks.push({ text: 'Add work experience', status: 'bad' });
    }

    // Skills (15 points)
    if (resumeData.skills && resumeData.skills.length >= 5) {
      score += 15;
      checks.push({ text: 'Comprehensive skills list', status: 'good' });
    } else {
      checks.push({ text: 'Add more relevant skills', status: 'warning' });
    }

    // Education (10 points)
    if (resumeData.education && resumeData.education.length > 0) {
      score += 10;
      checks.push({ text: 'Education information included', status: 'good' });
    } else {
      checks.push({ text: 'Add education details', status: 'bad' });
    }

    // Projects (10 points)
    if (resumeData.projects && resumeData.projects.length > 0) {
      score += 10;
      checks.push({ text: 'Projects showcase included', status: 'good' });
    } else {
      checks.push({ text: 'Consider adding relevant projects', status: 'warning' });
    }

    // ATS Optimization (5 points)
    if (resumeData.template && resumeData.template !== 'creative') {
      score += 5;
      checks.push({ text: 'ATS-friendly template selected', status: 'good' });
    } else {
      checks.push({ text: 'Consider ATS-friendly template', status: 'warning' });
    }

    return { score, checks };
  }, [resumeData]);

  const getScoreColor = (score) => {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#ffc107';
    return '#dc3545';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'good': return '✅';
      case 'warning': return '⚠️';
      case 'bad': return '❌';
      default: return '';
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: 'white', 
      borderRadius: '8px', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    }}>
      <h3 style={{ marginBottom: '15px', color: '#333' }}>Resume Score</h3>
      
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: getScoreColor(calculateScore.score),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '24px',
          fontWeight: 'bold',
          marginRight: '20px'
        }}>
          {calculateScore.score}
        </div>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
            {calculateScore.score >= 80 ? 'Excellent!' : 
             calculateScore.score >= 60 ? 'Good Progress' : 'Needs Improvement'}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Your resume is {calculateScore.score}% complete
          </div>
        </div>
      </div>

      <div>
        <h4 style={{ marginBottom: '10px', color: '#333' }}>Optimization Checklist:</h4>
        {calculateScore.checks.map((check, index) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 0',
            borderBottom: '1px solid #eee'
          }}>
            <span style={{ marginRight: '10px', fontSize: '16px' }}>
              {getStatusIcon(check.status)}
            </span>
            <span style={{ 
              fontSize: '14px',
              color: check.status === 'good' ? '#28a745' : 
                     check.status === 'warning' ? '#ffc107' : '#dc3545'
            }}>
              {check.text}
            </span>
          </div>
        ))}
      </div>

      {calculateScore.score < 80 && (
        <div style={{
          marginTop: '15px',
          padding: '12px',
          backgroundColor: '#fff3cd',
          borderRadius: '6px',
          border: '1px solid #ffeaa7'
        }}>
          <strong>💡 Pro Tip:</strong> Complete all sections and add quantifiable achievements to boost your score!
        </div>
      )}
    </div>
  );
};

export default ResumeScore;