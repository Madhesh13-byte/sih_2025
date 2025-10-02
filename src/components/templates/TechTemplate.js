import React from 'react';

const TechTemplate = ({ resumeData, colorScheme }) => {
  const colors = {
    blue: '#0ea5e9',
    green: '#10b981',
    purple: '#8b5cf6',
    red: '#ef4444',
    dark: '#374151'
  };

  const primaryColor = colors[colorScheme] || colors.blue;

  return (
    <div className="resume-preview" style={{ fontFamily: 'Consolas, monospace', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: '#1e293b',
        color: '#e2e8f0',
        padding: '30px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '20px',
          fontSize: '12px',
          opacity: '0.6'
        }}>
          // Developer Resume v2.0
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: primaryColor,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            fontWeight: 'bold',
            color: 'white'
          }}>
            {resumeData.personal?.name?.charAt(0) || 'U'}
          </div>
          
          <div style={{ flex: 1 }}>
            <h1 style={{ 
              fontSize: '28px', 
              margin: '0 0 5px 0',
              color: primaryColor
            }}>
              {resumeData.personal?.name || 'const developer = "Your Name"'}
            </h1>
            <div style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '10px' }}>
              {'<'} Full Stack Developer {'/>'} 
            </div>
            <div style={{ fontSize: '14px', display: 'flex', gap: '20px' }}>
              <span>📧 {resumeData.personal?.email}</span>
              <span>📱 {resumeData.personal?.phone}</span>
              <span>🔗 {resumeData.personal?.linkedin}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '30px' }}>
        {/* Code Block Summary */}
        {resumeData.summary && (
          <div style={{ marginBottom: '30px' }}>
            <div style={{
              backgroundColor: '#1e293b',
              color: '#e2e8f0',
              padding: '20px',
              borderRadius: '8px',
              border: `2px solid ${primaryColor}`,
              position: 'relative'
            }}>
              <div style={{ 
                fontSize: '12px', 
                color: primaryColor, 
                marginBottom: '10px',
                fontWeight: 'bold'
              }}>
                // About Me
              </div>
              <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                <span style={{ color: '#f59e0b' }}>function</span>{' '}
                <span style={{ color: primaryColor }}>aboutMe</span>() {'{'}<br/>
                &nbsp;&nbsp;<span style={{ color: '#10b981' }}>return</span>{' '}
                <span style={{ color: '#f472b6' }}>"{resumeData.summary}"</span>;<br/>
                {'}'}
              </div>
            </div>
          </div>
        )}

        {/* Tech Stack */}
        {resumeData.skills?.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ 
              fontSize: '20px', 
              color: '#1e293b',
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ color: primaryColor }}>⚡</span> Tech Stack
            </h2>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {resumeData.skills.map((skill, index) => (
                  <span key={index} style={{
                    padding: '6px 12px',
                    backgroundColor: primaryColor,
                    color: 'white',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Experience */}
        {resumeData.experience?.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ 
              fontSize: '20px', 
              color: '#1e293b',
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ color: primaryColor }}>💼</span> Experience
            </h2>
            {resumeData.experience.map((exp, index) => (
              <div key={index} style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                marginBottom: '15px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div>
                    <h3 style={{ 
                      fontSize: '16px', 
                      color: primaryColor, 
                      margin: '0 0 5px 0',
                      fontWeight: 'bold'
                    }}>
                      {exp.role}
                    </h3>
                    <div style={{ fontSize: '14px', color: '#64748b' }}>
                      @ {exp.company}
                    </div>
                  </div>
                  <div style={{
                    padding: '4px 8px',
                    backgroundColor: `${primaryColor}20`,
                    color: primaryColor,
                    borderRadius: '4px',
                    fontSize: '12px',
                    height: 'fit-content'
                  }}>
                    {exp.startDate} - {exp.endDate}
                  </div>
                </div>
                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                  {exp.responsibilities?.map((resp, idx) => (
                    <li key={idx} style={{ marginBottom: '5px', fontSize: '14px' }}>
                      {resp}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {resumeData.projects?.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ 
              fontSize: '20px', 
              color: '#1e293b',
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ color: primaryColor }}>🚀</span> Projects
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              {resumeData.projects.map((project, index) => (
                <div key={index} style={{
                  backgroundColor: 'white',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <h4 style={{ 
                    fontSize: '14px', 
                    color: primaryColor, 
                    margin: '0 0 8px 0',
                    fontWeight: 'bold'
                  }}>
                    {project.name}
                  </h4>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                    {project.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TechTemplate;