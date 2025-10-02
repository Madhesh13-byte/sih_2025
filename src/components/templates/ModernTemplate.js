import React from 'react';

const ModernTemplate = ({ data, color = '#2563eb', font = 'Inter' }) => (
  <div style={{ fontFamily: font, maxWidth: '800px', margin: '0 auto', backgroundColor: 'white' }}>
    <div style={{ backgroundColor: color, color: 'white', padding: '40px 30px', textAlign: 'center' }}>
      <h1 style={{ margin: '0 0 10px 0', fontSize: '36px', fontWeight: 'bold' }}>{data.personal?.name}</h1>
      <div style={{ fontSize: '16px', opacity: '0.9' }}>
        {data.personal?.email} • {data.personal?.phone} • {data.personal?.linkedin}
      </div>
    </div>

    <div style={{ padding: '30px' }}>
      {data.summary && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: color, borderBottom: `2px solid ${color}`, paddingBottom: '5px', marginBottom: '15px' }}>
            PROFESSIONAL SUMMARY
          </h2>
          <p style={{ lineHeight: '1.6', color: '#333' }}>{data.summary}</p>
        </div>
      )}

      {data.experience?.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: color, borderBottom: `2px solid ${color}`, paddingBottom: '5px', marginBottom: '15px' }}>
            EXPERIENCE
          </h2>
          {data.experience.map((exp, index) => (
            <div key={index} style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <h3 style={{ margin: 0, color: '#333' }}>{exp.role}</h3>
                <span style={{ color: '#666' }}>{exp.startDate} - {exp.endDate}</span>
              </div>
              <div style={{ color: color, fontWeight: 'bold', marginBottom: '10px' }}>{exp.company}</div>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {exp.responsibilities?.map((item, i) => (
                  <li key={i} style={{ marginBottom: '5px' }}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {data.education?.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: color, borderBottom: `2px solid ${color}`, paddingBottom: '5px', marginBottom: '15px' }}>
            EDUCATION
          </h2>
          {data.education.map((edu, index) => (
            <div key={index} style={{ marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#333' }}>{edu.degree}</h3>
              <div style={{ color: color }}>{edu.institution}</div>
              <div style={{ color: '#666' }}>{edu.startYear} - {edu.endYear} | CGPA: {edu.cgpa}</div>
            </div>
          ))}
        </div>
      )}

      {data.skills?.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: color, borderBottom: `2px solid ${color}`, paddingBottom: '5px', marginBottom: '15px' }}>
            SKILLS
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {data.skills.map((skill, index) => (
              <span key={index} style={{ 
                backgroundColor: color, 
                color: 'white', 
                padding: '5px 12px', 
                borderRadius: '20px', 
                fontSize: '14px' 
              }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

export default ModernTemplate;