import React from 'react';

const ProfessionalTemplate = ({ data, color = '#1f2937', font = 'Times New Roman' }) => (
  <div style={{ fontFamily: font, maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', padding: '40px' }}>
    {/* Header */}
    <div style={{ textAlign: 'center', marginBottom: '40px', borderBottom: `3px solid ${color}`, paddingBottom: '20px' }}>
      <h1 style={{ margin: '0 0 10px 0', fontSize: '32px', color: color, fontWeight: 'bold', letterSpacing: '2px' }}>
        {data.personal?.name?.toUpperCase()}
      </h1>
      <div style={{ fontSize: '16px', color: '#666', letterSpacing: '1px' }}>
        {data.personal?.email} | {data.personal?.phone} | {data.personal?.linkedin}
      </div>
    </div>

    {/* Professional Summary */}
    {data.summary && (
      <div style={{ marginBottom: '35px' }}>
        <h2 style={{ 
          color: color, 
          fontSize: '18px', 
          fontWeight: 'bold', 
          textTransform: 'uppercase', 
          letterSpacing: '1px',
          marginBottom: '15px',
          borderLeft: `4px solid ${color}`,
          paddingLeft: '15px'
        }}>
          Professional Summary
        </h2>
        <p style={{ lineHeight: '1.8', color: '#333', fontSize: '15px', textAlign: 'justify' }}>{data.summary}</p>
      </div>
    )}

    {/* Core Competencies */}
    {data.skills?.length > 0 && (
      <div style={{ marginBottom: '35px' }}>
        <h2 style={{ 
          color: color, 
          fontSize: '18px', 
          fontWeight: 'bold', 
          textTransform: 'uppercase', 
          letterSpacing: '1px',
          marginBottom: '15px',
          borderLeft: `4px solid ${color}`,
          paddingLeft: '15px'
        }}>
          Core Competencies
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {data.skills.map((skill, index) => (
            <div key={index} style={{ 
              padding: '8px 12px', 
              border: `1px solid ${color}`, 
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {skill}
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Professional Experience */}
    {data.experience?.length > 0 && (
      <div style={{ marginBottom: '35px' }}>
        <h2 style={{ 
          color: color, 
          fontSize: '18px', 
          fontWeight: 'bold', 
          textTransform: 'uppercase', 
          letterSpacing: '1px',
          marginBottom: '15px',
          borderLeft: `4px solid ${color}`,
          paddingLeft: '15px'
        }}>
          Professional Experience
        </h2>
        {data.experience.map((exp, index) => (
          <div key={index} style={{ marginBottom: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
              <h3 style={{ margin: 0, color: color, fontSize: '16px', fontWeight: 'bold' }}>{exp.role}</h3>
              <span style={{ color: '#666', fontSize: '14px', fontStyle: 'italic' }}>
                {exp.startDate} - {exp.endDate}
              </span>
            </div>
            <div style={{ color: '#666', fontSize: '15px', marginBottom: '12px', fontWeight: '500' }}>
              {exp.company}
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {exp.responsibilities?.map((item, i) => (
                <li key={i} style={{ marginBottom: '6px', lineHeight: '1.6', fontSize: '14px' }}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    )}

    {/* Education */}
    {data.education?.length > 0 && (
      <div style={{ marginBottom: '35px' }}>
        <h2 style={{ 
          color: color, 
          fontSize: '18px', 
          fontWeight: 'bold', 
          textTransform: 'uppercase', 
          letterSpacing: '1px',
          marginBottom: '15px',
          borderLeft: `4px solid ${color}`,
          paddingLeft: '15px'
        }}>
          Education
        </h2>
        {data.education.map((edu, index) => (
          <div key={index} style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0', color: color, fontSize: '16px' }}>{edu.degree}</h3>
                <div style={{ color: '#666', fontSize: '15px' }}>{edu.institution}</div>
              </div>
              <div style={{ textAlign: 'right', color: '#666', fontSize: '14px' }}>
                <div>{edu.startYear} - {edu.endYear}</div>
                <div style={{ fontWeight: 'bold' }}>CGPA: {edu.cgpa}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

    {/* Projects */}
    {data.projects?.length > 0 && (
      <div style={{ marginBottom: '35px' }}>
        <h2 style={{ 
          color: color, 
          fontSize: '18px', 
          fontWeight: 'bold', 
          textTransform: 'uppercase', 
          letterSpacing: '1px',
          marginBottom: '15px',
          borderLeft: `4px solid ${color}`,
          paddingLeft: '15px'
        }}>
          Key Projects
        </h2>
        {data.projects.map((proj, index) => (
          <div key={index} style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 8px 0', color: color, fontSize: '16px' }}>{proj.title}</h3>
            <p style={{ margin: '0 0 8px 0', lineHeight: '1.6', fontSize: '14px' }}>{proj.description}</p>
            <div style={{ color: '#666', fontSize: '14px' }}>
              <strong>Technologies:</strong> {proj.techStack}
            </div>
          </div>
        ))}
      </div>
    )}

    {/* Achievements */}
    {data.achievements?.length > 0 && (
      <div>
        <h2 style={{ 
          color: color, 
          fontSize: '18px', 
          fontWeight: 'bold', 
          textTransform: 'uppercase', 
          letterSpacing: '1px',
          marginBottom: '15px',
          borderLeft: `4px solid ${color}`,
          paddingLeft: '15px'
        }}>
          Achievements & Recognition
        </h2>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          {data.achievements.map((item, index) => (
            <li key={index} style={{ marginBottom: '8px', lineHeight: '1.6', fontSize: '14px' }}>{item}</li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

export default ProfessionalTemplate;