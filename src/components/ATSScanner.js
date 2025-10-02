import React, { useState, useEffect } from 'react';
import { useResume } from '../context/ResumeContext';
import { motion } from 'framer-motion';
import { FaRobot, FaCheckCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const ATSScanner = () => {
  const { resumeData } = useResume();
  const [atsScore, setAtsScore] = useState(0);
  const [issues, setIssues] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    scanForATSIssues();
  }, [resumeData]);

  const scanForATSIssues = () => {
    const newIssues = [];
    const newRecommendations = [];
    let score = 100;

    // Check for common ATS issues
    if (!resumeData.personal?.name) {
      newIssues.push({ type: 'error', message: 'Missing name' });
      score -= 20;
    }

    if (!resumeData.personal?.email) {
      newIssues.push({ type: 'error', message: 'Missing email address' });
      score -= 15;
    }

    if (!resumeData.personal?.phone) {
      newIssues.push({ type: 'warning', message: 'Missing phone number' });
      score -= 10;
    }

    // Check skills section
    if (resumeData.skills?.length < 5) {
      newIssues.push({ type: 'warning', message: 'Add more relevant skills (5-10 recommended)' });
      score -= 10;
    }

    // Check experience section
    if (resumeData.experience?.length === 0) {
      newIssues.push({ type: 'error', message: 'No work experience listed' });
      score -= 25;
    } else {
      resumeData.experience.forEach((exp, index) => {
        if (!exp.role) {
          newIssues.push({ type: 'error', message: `Experience ${index + 1}: Missing job title` });
          score -= 5;
        }
        if (!exp.company) {
          newIssues.push({ type: 'error', message: `Experience ${index + 1}: Missing company name` });
          score -= 5;
        }
        if (!exp.responsibilities || exp.responsibilities.length === 0) {
          newIssues.push({ type: 'warning', message: `Experience ${index + 1}: Add job responsibilities` });
          score -= 5;
        }
      });
    }

    // Generate recommendations
    if (resumeData.skills?.length > 0) {
      const techSkills = resumeData.skills.filter(skill => 
        ['javascript', 'python', 'react', 'node', 'sql', 'aws', 'docker'].some(tech => 
          skill.toLowerCase().includes(tech)
        )
      );
      if (techSkills.length > 0) {
        newRecommendations.push('Great! You have relevant technical skills listed.');
      }
    }

    if (resumeData.summary && resumeData.summary.length > 50) {
      newRecommendations.push('Professional summary is present and detailed.');
    } else {
      newRecommendations.push('Add a compelling professional summary (50+ words).');
    }

    setAtsScore(Math.max(0, score));
    setIssues(newIssues);
    setRecommendations(newRecommendations);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#ffc107';
    return '#dc3545';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="form-section"
    >
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <FaRobot style={{ color: '#007bff' }} />
        ATS Optimization Scanner
      </h3>
      
      {/* ATS Score */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '20px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <div style={{
          fontSize: '36px',
          fontWeight: 'bold',
          color: getScoreColor(atsScore),
          marginBottom: '5px'
        }}>
          {atsScore}%
        </div>
        <div style={{ fontSize: '14px', color: '#666' }}>ATS Compatibility Score</div>
      </div>

      {/* Issues */}
      {issues.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '16px', marginBottom: '10px', color: '#dc3545' }}>Issues Found</h4>
          {issues.map((issue, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 12px',
              marginBottom: '5px',
              backgroundColor: issue.type === 'error' ? '#f8d7da' : '#fff3cd',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              {issue.type === 'error' ? 
                <FaTimes style={{ color: '#dc3545', marginRight: '8px' }} /> :
                <FaExclamationTriangle style={{ color: '#ffc107', marginRight: '8px' }} />
              }
              {issue.message}
            </div>
          ))}
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <h4 style={{ fontSize: '16px', marginBottom: '10px', color: '#28a745' }}>Recommendations</h4>
          {recommendations.map((rec, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 12px',
              marginBottom: '5px',
              backgroundColor: '#d4edda',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              <FaCheckCircle style={{ color: '#28a745', marginRight: '8px' }} />
              {rec}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ATSScanner;