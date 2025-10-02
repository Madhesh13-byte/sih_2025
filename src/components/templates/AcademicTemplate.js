import React from 'react';

const AcademicTemplate = ({ resumeData, colorScheme }) => {
  const colors = {
    blue: '#1d4ed8',
    green: '#047857',
    purple: '#7c2d12',
    red: '#b91c1c',
    dark: '#1f2937'
  };

  const primaryColor = colors[colorScheme] || colors.blue;

  return (
    <div className="resume-preview" style={{ fontFamily: 'Times New Roman, serif', lineHeight: '1.5' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '3px solid #000' }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          margin: '0 0 10px 0',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          {resumeData.personal?.name || 'Your Name'}
        </h1>
        <div style={{ fontSize: '14px', marginBottom: '10px' }}>
          {resumeData.personal?.address}
        </div>
        <div style={{ fontSize: '14px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <span>{resumeData.personal?.email}</span>
          <span>{resumeData.personal?.phone}</span>
        </div>
      </div>

      {/* Education */}
      {resumeData.education?.length > 0 && (
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ 
            fontSize: '16px', 
            fontWeight: 'bold',
            textTransform: 'uppercase',
            borderBottom: '1px solid #000',
            paddingBottom: '3px',
            marginBottom: '15px'
          }}>
            Education
          </h2>
          {resumeData.education.map((edu, index) => (
            <div key={index} style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                    {edu.degree}
                  </div>
                  <div style={{ fontSize: '14px', fontStyle: 'italic' }}>
                    {edu.institution}
                  </div>
                  {edu.gpa && (
                    <div style={{ fontSize: '13px' }}>
                      GPA: {edu.gpa}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: '14px', textAlign: 'right' }}>
                  {edu.year}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Research Experience */}
      {resumeData.experience?.length > 0 && (
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ 
            fontSize: '16px', 
            fontWeight: 'bold',
            textTransform: 'uppercase',
            borderBottom: '1px solid #000',
            paddingBottom: '3px',
            marginBottom: '15px'
          }}>
            Research Experience
          </h2>
          {resumeData.experience.map((exp, index) => (
            <div key={index} style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                    {exp.role}
                  </div>
                  <div style={{ fontSize: '14px', fontStyle: 'italic' }}>
                    {exp.company}
                  </div>
                </div>
                <div style={{ fontSize: '14px' }}>
                  {exp.startDate} - {exp.endDate}
                </div>
              </div>
              <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
                {exp.responsibilities?.map((resp, idx) => (
                  <li key={idx} style={{ marginBottom: '3px', fontSize: '13px' }}>
                    {resp}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Publications */}
      {resumeData.projects?.length > 0 && (
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ 
            fontSize: '16px', 
            fontWeight: 'bold',
            textTransform: 'uppercase',
            borderBottom: '1px solid #000',
            paddingBottom: '3px',
            marginBottom: '15px'
          }}>
            Publications & Research
          </h2>
          {resumeData.projects.map((project, index) => (
            <div key={index} style={{ marginBottom: '15px' }}>
              <div style={{ fontSize: '14px', marginBottom: '5px' }}>
                <span style={{ fontWeight: 'bold' }}>{project.name}</span>
                {project.year && <span style={{ fontStyle: 'italic' }}> ({project.year})</span>}
              </div>
              <div style={{ fontSize: '13px', paddingLeft: '15px', fontStyle: 'italic' }}>
                {project.description}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills & Competencies */}
      {resumeData.skills?.length > 0 && (
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ 
            fontSize: '16px', 
            fontWeight: 'bold',
            textTransform: 'uppercase',
            borderBottom: '1px solid #000',
            paddingBottom: '3px',
            marginBottom: '15px'
          }}>
            Technical Skills
          </h2>
          <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
            {resumeData.skills.join(', ')}
          </div>
        </div>
      )}

      {/* Summary/Objective */}
      {resumeData.summary && (
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ 
            fontSize: '16px', 
            fontWeight: 'bold',
            textTransform: 'uppercase',
            borderBottom: '1px solid #000',
            paddingBottom: '3px',
            marginBottom: '15px'
          }}>
            Research Interests
          </h2>
          <p style={{ fontSize: '14px', textAlign: 'justify', lineHeight: '1.6' }}>
            {resumeData.summary}
          </p>
        </div>
      )}

      {/* References */}
      <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '14px', fontStyle: 'italic' }}>
        References available upon request
      </div>
    </div>
  );
};

export default AcademicTemplate;