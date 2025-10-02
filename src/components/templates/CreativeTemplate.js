import React from 'react';

const CreativeTemplate = ({ data, color = '#f59e0b', font = 'Poppins' }) => (
  <div style={{ fontFamily: font, maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', display: 'flex' }}>
    {/* Left Sidebar */}
    <div style={{ width: '35%', backgroundColor: color, color: 'white', padding: '30px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
          {data.personal?.name?.charAt(0)}
        </div>
        <h1 style={{ margin: 0, fontSize: '24px' }}>{data.personal?.name}</h1>
      </div>

      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '5px' }}>CONTACT</h3>
        <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
          <div>📧 {data.personal?.email}</div>
          <div>📱 {data.personal?.phone}</div>
          <div>🔗 {data.personal?.linkedin}</div>
        </div>
      </div>

      {data.skills?.length > 0 && (
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '5px' }}>SKILLS</h3>
          {data.skills.map((skill, index) => (
            <div key={index} style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '14px', marginBottom: '3px' }}>{skill}</div>
              <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '2px' }}>
                <div style={{ height: '100%', backgroundColor: 'white', width: '85%', borderRadius: '2px' }}></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {data.achievements?.length > 0 && (
        <div>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '5px' }}>ACHIEVEMENTS</h3>
          <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '14px', lineHeight: '1.6' }}>
            {data.achievements.map((item, index) => (
              <li key={index} style={{ marginBottom: '5px' }}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>

    {/* Right Content */}
    <div style={{ width: '65%', padding: '30px' }}>
      {data.summary && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: color, fontSize: '20px', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            About Me
          </h2>
          <p style={{ lineHeight: '1.6', color: '#333', fontSize: '15px' }}>{data.summary}</p>
        </div>
      )}

      {data.experience?.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: color, fontSize: '20px', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Experience
          </h2>
          {data.experience.map((exp, index) => (
            <div key={index} style={{ marginBottom: '25px', position: 'relative', paddingLeft: '20px' }}>
              <div style={{ position: 'absolute', left: '0', top: '5px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: color }}></div>
              <h3 style={{ margin: '0 0 5px 0', color: '#333', fontSize: '16px' }}>{exp.role}</h3>
              <div style={{ color: color, fontWeight: 'bold', marginBottom: '5px' }}>{exp.company}</div>
              <div style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>{exp.startDate} - {exp.endDate}</div>
              <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '14px' }}>
                {exp.responsibilities?.map((item, i) => (
                  <li key={i} style={{ marginBottom: '3px' }}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {data.education?.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: color, fontSize: '20px', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Education
          </h2>
          {data.education.map((edu, index) => (
            <div key={index} style={{ marginBottom: '15px' }}>
              <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>{edu.degree}</h3>
              <div style={{ color: color, fontWeight: 'bold' }}>{edu.institution}</div>
              <div style={{ color: '#666', fontSize: '14px' }}>{edu.startYear} - {edu.endYear} | CGPA: {edu.cgpa}</div>
            </div>
          ))}
        </div>
      )}

      {data.projects?.length > 0 && (
        <div>
          <h2 style={{ color: color, fontSize: '20px', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Projects
          </h2>
          {data.projects.map((proj, index) => (
            <div key={index} style={{ marginBottom: '15px' }}>
              <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>{proj.title}</h3>
              <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>{proj.description}</p>
              <div style={{ color: color, fontSize: '13px' }}>
                <strong>Tech:</strong> {proj.techStack}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

export default CreativeTemplate;