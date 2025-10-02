import React from 'react';

const MinimalTemplate = ({ data, color = '#000000', font = 'Arial' }) => (
  <div style={{ fontFamily: font, maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', padding: '40px', lineHeight: '1.5' }}>
    {/* Header */}
    <div style={{ marginBottom: '40px' }}>
      <h1 style={{ margin: '0 0 5px 0', fontSize: '28px', color: color, fontWeight: '300' }}>
        {data.personal?.name}
      </h1>
      <div style={{ fontSize: '14px', color: '#666' }}>
        {data.personal?.email} • {data.personal?.phone} • {data.personal?.linkedin}
      </div>
    </div>

    {/* Summary */}
    {data.summary && (
      <div style={{ marginBottom: '30px' }}>
        <p style={{ margin: 0, fontSize: '15px', color: '#333' }}>{data.summary}</p>
      </div>
    )}

    {/* Experience */}
    {data.experience?.length > 0 && (
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: color, marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Experience
        </h2>
        {data.experience.map((exp, index) => (
          <div key={index} style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '5px' }}>
              <span style={{ fontWeight: '600', fontSize: '15px' }}>{exp.role}</span>
              <span style={{ margin: '0 8px', color: '#666' }}>•</span>
              <span style={{ fontSize: '15px' }}>{exp.company}</span>
              <span style={{ float: 'right', fontSize: '14px', color: '#666' }}>
                {exp.startDate} - {exp.endDate}
              </span>
            </div>
            {exp.responsibilities?.map((item, i) => (
              <div key={i} style={{ fontSize: '14px', color: '#555', marginBottom: '3px' }}>
                • {item}
              </div>
            ))}
          </div>
        ))}
      </div>
    )}

    {/* Education */}
    {data.education?.length > 0 && (
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: color, marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Education
        </h2>
        {data.education.map((edu, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '15px', fontWeight: '600' }}>{edu.degree}</div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              {edu.institution} • {edu.startYear} - {edu.endYear} • CGPA: {edu.cgpa}
            </div>
          </div>
        ))}
      </div>
    )}

    {/* Skills */}
    {data.skills?.length > 0 && (
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: color, marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Skills
        </h2>
        <div style={{ fontSize: '14px', color: '#555' }}>
          {data.skills.join(' • ')}
        </div>
      </div>
    )}

    {/* Projects */}
    {data.projects?.length > 0 && (
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: color, marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Projects
        </h2>
        {data.projects.map((proj, index) => (
          <div key={index} style={{ marginBottom: '15px' }}>
            <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '3px' }}>{proj.title}</div>
            <div style={{ fontSize: '14px', color: '#555', marginBottom: '3px' }}>{proj.description}</div>
            <div style={{ fontSize: '13px', color: '#666' }}>
              <strong>Tech:</strong> {proj.techStack}
            </div>
          </div>
        ))}
      </div>
    )}

    {/* Achievements */}
    {data.achievements?.length > 0 && (
      <div>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: color, marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Achievements
        </h2>
        {data.achievements.map((item, index) => (
          <div key={index} style={{ fontSize: '14px', color: '#555', marginBottom: '3px' }}>
            • {item}
          </div>
        ))}
      </div>
    )}
  </div>
);

export default MinimalTemplate;