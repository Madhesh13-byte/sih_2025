import React from 'react';

const ExecutiveTemplate = ({ resumeData, colorScheme }) => {
  const colors = {
    blue: '#1e40af',
    green: '#059669',
    purple: '#7c3aed',
    red: '#dc2626',
    dark: '#1f2937'
  };

  const primaryColor = colors[colorScheme] || colors.blue;

  return (
    <div className="resume-preview" style={{ fontFamily: 'Georgia, serif', lineHeight: '1.6' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: primaryColor, 
        color: 'white', 
        padding: '40px 30px',
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <h1 style={{ 
          fontSize: '36px', 
          fontWeight: 'bold', 
          margin: '0 0 10px 0',
          letterSpacing: '2px'
        }}>
          {resumeData.personal?.name || 'Your Name'}
        </h1>
        <div style={{ fontSize: '18px', opacity: '0.9', marginBottom: '20px' }}>
          Executive Professional
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', fontSize: '14px' }}>
          <span>{resumeData.personal?.email}</span>
          <span>{resumeData.personal?.phone}</span>
          <span>{resumeData.personal?.linkedin}</span>
        </div>
      </div>

      {/* Executive Summary */}
      {resumeData.summary && (
        <div style={{ marginBottom: '30px', padding: '0 30px' }}>
          <h2 style={{ 
            fontSize: '20px', 
            color: primaryColor, 
            borderBottom: `2px solid ${primaryColor}`,
            paddingBottom: '5px',
            marginBottom: '15px'
          }}>
            EXECUTIVE SUMMARY
          </h2>
          <p style={{ fontSize: '16px', textAlign: 'justify', color: '#333' }}>
            {resumeData.summary}
          </p>
        </div>
      )}

      {/* Experience */}
      {resumeData.experience?.length > 0 && (
        <div style={{ marginBottom: '30px', padding: '0 30px' }}>
          <h2 style={{ 
            fontSize: '20px', 
            color: primaryColor, 
            borderBottom: `2px solid ${primaryColor}`,
            paddingBottom: '5px',
            marginBottom: '20px'
          }}>
            PROFESSIONAL EXPERIENCE
          </h2>
          {resumeData.experience.map((exp, index) => (
            <div key={index} style={{ marginBottom: '25px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', margin: 0 }}>
                  {exp.role}
                </h3>
                <span style={{ fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
                  {exp.startDate} - {exp.endDate}
                </span>
              </div>
              <div style={{ fontSize: '16px', color: primaryColor, fontWeight: '600', marginBottom: '10px' }}>
                {exp.company}
              </div>
              <ul style={{ paddingLeft: '20px', margin: 0 }}>
                {exp.responsibilities?.map((resp, idx) => (
                  <li key={idx} style={{ marginBottom: '5px', fontSize: '15px' }}>{resp}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Skills & Education Side by Side */}
      <div style={{ display: 'flex', gap: '40px', padding: '0 30px' }}>
        {/* Skills */}
        {resumeData.skills?.length > 0 && (
          <div style={{ flex: 1 }}>
            <h2 style={{ 
              fontSize: '20px', 
              color: primaryColor, 
              borderBottom: `2px solid ${primaryColor}`,
              paddingBottom: '5px',
              marginBottom: '15px'
            }}>
              CORE COMPETENCIES
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {resumeData.skills.map((skill, index) => (
                <div key={index} style={{ 
                  padding: '8px 12px',
                  backgroundColor: `${primaryColor}15`,
                  border: `1px solid ${primaryColor}30`,
                  borderRadius: '4px',
                  fontSize: '14px',
                  textAlign: 'center'
                }}>
                  {skill}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {resumeData.education?.length > 0 && (
          <div style={{ flex: 1 }}>
            <h2 style={{ 
              fontSize: '20px', 
              color: primaryColor, 
              borderBottom: `2px solid ${primaryColor}`,
              paddingBottom: '5px',
              marginBottom: '15px'
            }}>
              EDUCATION
            </h2>
            {resumeData.education.map((edu, index) => (
              <div key={index} style={{ marginBottom: '15px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{edu.degree}</div>
                <div style={{ color: primaryColor, fontSize: '15px' }}>{edu.institution}</div>
                <div style={{ fontSize: '14px', color: '#666' }}>{edu.year}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecutiveTemplate;