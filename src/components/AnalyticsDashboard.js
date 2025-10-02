import React from 'react';
import { useResume } from '../context/ResumeContext';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaExclamationTriangle, FaChartLine } from 'react-icons/fa';

const AnalyticsDashboard = () => {
  const { analytics, resumeData } = useResume();
  const { score, completeness, suggestions } = analytics;

  const getScoreColor = (score) => {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#ffc107';
    return '#dc3545';
  };

  const sectionStatus = [
    { name: 'Personal Info', completed: !!resumeData.personal?.name, weight: 20 },
    { name: 'Summary', completed: !!resumeData.summary, weight: 20 },
    { name: 'Experience', completed: resumeData.experience?.length > 0, weight: 25 },
    { name: 'Education', completed: resumeData.education?.length > 0, weight: 20 },
    { name: 'Skills', completed: resumeData.skills?.length > 0, weight: 15 }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="form-section"
    >
      <h3>Resume Analytics</h3>
      
      {/* Score Circle */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          border: `8px solid ${getScoreColor(score)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 10px',
          fontSize: '24px',
          fontWeight: 'bold',
          color: getScoreColor(score)
        }}>
          {Math.round(score)}%
        </div>
        <div style={{ fontSize: '14px', color: '#666' }}>Resume Strength</div>
      </div>

      {/* Section Progress */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '16px', marginBottom: '10px' }}>Section Progress</h4>
        {sectionStatus.map((section, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '8px',
            padding: '8px',
            backgroundColor: section.completed ? '#e8f5e8' : '#fff3cd',
            borderRadius: '4px'
          }}>
            {section.completed ? 
              <FaCheckCircle style={{ color: '#28a745', marginRight: '8px' }} /> :
              <FaExclamationTriangle style={{ color: '#ffc107', marginRight: '8px' }} />
            }
            <span style={{ flex: 1, fontSize: '14px' }}>{section.name}</span>
            <span style={{ fontSize: '12px', color: '#666' }}>{section.weight}%</span>
          </div>
        ))}
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div>
          <h4 style={{ fontSize: '16px', marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
            <FaChartLine style={{ marginRight: '8px', color: '#007bff' }} />
            Improvement Suggestions
          </h4>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
            {suggestions.map((suggestion, index) => (
              <li key={index} style={{ marginBottom: '5px', color: '#666' }}>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};

export default AnalyticsDashboard;