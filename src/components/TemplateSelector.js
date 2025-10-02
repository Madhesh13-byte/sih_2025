import React from 'react';
import { useResume } from '../context/ResumeContext';

const TemplateSelector = () => {
  const { resumeData, updateSection } = useResume();
  const { template, colorScheme } = resumeData;

  const templates = [
    { 
      id: 'professional', 
      name: 'Professional', 
      description: 'Clean and formal design perfect for corporate roles',
      preview: (
        <div style={{ width: '100%', height: '120px', border: '1px solid #ddd', borderRadius: '4px', padding: '8px', fontSize: '8px', backgroundColor: 'white' }}>
          <div style={{ borderBottom: '2px solid #1f2937', paddingBottom: '4px', marginBottom: '6px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '10px' }}>JOHN DOE</div>
            <div style={{ fontSize: '6px', color: '#666' }}>email@example.com | phone</div>
          </div>
          <div style={{ marginBottom: '4px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '7px', borderLeft: '2px solid #1f2937', paddingLeft: '4px' }}>EXPERIENCE</div>
            <div style={{ fontSize: '6px', marginTop: '2px' }}>Software Engineer</div>
          </div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '7px', borderLeft: '2px solid #1f2937', paddingLeft: '4px' }}>SKILLS</div>
            <div style={{ display: 'flex', gap: '2px', marginTop: '2px' }}>
              <div style={{ border: '1px solid #1f2937', padding: '1px 3px', fontSize: '5px' }}>React</div>
              <div style={{ border: '1px solid #1f2937', padding: '1px 3px', fontSize: '5px' }}>Node.js</div>
            </div>
          </div>
        </div>
      )
    },
    { 
      id: 'modern', 
      name: 'Modern', 
      description: 'Contemporary design with clean lines and modern typography',
      preview: (
        <div style={{ width: '100%', height: '120px', border: '1px solid #ddd', borderRadius: '4px', padding: '8px', fontSize: '8px', backgroundColor: 'white' }}>
          <div style={{ display: 'flex', marginBottom: '6px' }}>
            <div style={{ width: '30%', backgroundColor: '#2563eb', color: 'white', padding: '4px', borderRadius: '2px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '8px' }}>JOHN</div>
              <div style={{ fontSize: '6px' }}>DOE</div>
            </div>
            <div style={{ flex: 1, paddingLeft: '6px' }}>
              <div style={{ fontSize: '6px', color: '#666' }}>Software Engineer</div>
              <div style={{ fontSize: '5px' }}>email@example.com</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', fontSize: '6px', color: '#2563eb' }}>EXPERIENCE</div>
              <div style={{ fontSize: '5px', marginTop: '2px' }}>Senior Developer</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', fontSize: '6px', color: '#2563eb' }}>SKILLS</div>
              <div style={{ fontSize: '5px', marginTop: '2px' }}>React, Python</div>
            </div>
          </div>
        </div>
      )
    },
    { 
      id: 'creative', 
      name: 'Creative', 
      description: 'Artistic and unique design for creative professionals',
      preview: (
        <div style={{ width: '100%', height: '120px', border: '1px solid #ddd', borderRadius: '4px', padding: '8px', fontSize: '8px', backgroundColor: 'white', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '0', right: '0', width: '20px', height: '20px', backgroundColor: '#f59e0b', borderRadius: '0 4px 0 20px' }}></div>
          <div style={{ marginBottom: '6px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '10px', color: '#f59e0b' }}>John Doe</div>
            <div style={{ fontSize: '6px', fontStyle: 'italic' }}>Creative Designer</div>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', fontSize: '6px', color: '#f59e0b', transform: 'rotate(-2deg)' }}>PORTFOLIO</div>
              <div style={{ fontSize: '5px', marginTop: '2px' }}>Web Design</div>
              <div style={{ fontSize: '5px' }}>Branding</div>
            </div>
            <div style={{ width: '2px', backgroundColor: '#f59e0b', margin: '0 4px' }}></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', fontSize: '6px', color: '#f59e0b' }}>SKILLS</div>
              <div style={{ fontSize: '5px', marginTop: '2px' }}>Photoshop</div>
              <div style={{ fontSize: '5px' }}>Illustrator</div>
            </div>
          </div>
        </div>
      )
    },
    { 
      id: 'minimal', 
      name: 'Minimal', 
      description: 'Simple and elegant design focusing on content',
      preview: (
        <div style={{ width: '100%', height: '120px', border: '1px solid #ddd', borderRadius: '4px', padding: '8px', fontSize: '8px', backgroundColor: 'white' }}>
          <div style={{ textAlign: 'center', marginBottom: '8px', paddingBottom: '4px', borderBottom: '1px solid #eee' }}>
            <div style={{ fontWeight: 'bold', fontSize: '9px' }}>John Doe</div>
            <div style={{ fontSize: '6px', color: '#666' }}>Software Engineer</div>
          </div>
          <div style={{ marginBottom: '4px' }}>
            <div style={{ fontSize: '6px', fontWeight: 'bold', marginBottom: '2px' }}>Experience</div>
            <div style={{ fontSize: '5px', color: '#666' }}>Senior Developer at Tech Corp</div>
          </div>
          <div>
            <div style={{ fontSize: '6px', fontWeight: 'bold', marginBottom: '2px' }}>Skills</div>
            <div style={{ fontSize: '5px', color: '#666' }}>JavaScript, React, Node.js, Python</div>
          </div>
        </div>
      )
    },
    { 
      id: 'executive', 
      name: 'Executive', 
      description: 'Sophisticated design for senior leadership positions',
      preview: (
        <div style={{ width: '100%', height: '120px', border: '1px solid #ddd', borderRadius: '4px', padding: '0', fontSize: '8px', backgroundColor: 'white' }}>
          <div style={{ backgroundColor: '#1e40af', color: 'white', padding: '6px', textAlign: 'center', marginBottom: '4px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '8px' }}>JOHN DOE</div>
            <div style={{ fontSize: '5px' }}>Executive Professional</div>
          </div>
          <div style={{ padding: '4px' }}>
            <div style={{ marginBottom: '3px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '6px', color: '#1e40af', borderBottom: '1px solid #1e40af' }}>EXECUTIVE SUMMARY</div>
              <div style={{ fontSize: '5px', marginTop: '1px' }}>Strategic leader with 15+ years...</div>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '5px', color: '#1e40af' }}>COMPETENCIES</div>
                <div style={{ fontSize: '4px' }}>Leadership, Strategy</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '5px', color: '#1e40af' }}>EDUCATION</div>
                <div style={{ fontSize: '4px' }}>MBA, Harvard</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    { 
      id: 'academic', 
      name: 'Academic', 
      description: 'Traditional format for academic and research positions',
      preview: (
        <div style={{ width: '100%', height: '120px', border: '1px solid #ddd', borderRadius: '4px', padding: '8px', fontSize: '8px', backgroundColor: 'white' }}>
          <div style={{ textAlign: 'center', marginBottom: '6px', paddingBottom: '3px', borderBottom: '2px solid #000' }}>
            <div style={{ fontWeight: 'bold', fontSize: '8px', textTransform: 'uppercase' }}>JOHN DOE</div>
            <div style={{ fontSize: '5px' }}>email@university.edu | (555) 123-4567</div>
          </div>
          <div style={{ marginBottom: '4px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '6px', textTransform: 'uppercase', borderBottom: '1px solid #000' }}>Education</div>
            <div style={{ fontSize: '5px', marginTop: '1px' }}>Ph.D. Computer Science, MIT</div>
          </div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '6px', textTransform: 'uppercase', borderBottom: '1px solid #000' }}>Research</div>
            <div style={{ fontSize: '5px', marginTop: '1px' }}>Machine Learning, AI Ethics</div>
          </div>
        </div>
      )
    },
    { 
      id: 'tech', 
      name: 'Tech', 
      description: 'Modern tech-focused design with code-style elements',
      preview: (
        <div style={{ width: '100%', height: '120px', border: '1px solid #ddd', borderRadius: '4px', padding: '0', fontSize: '8px', backgroundColor: '#f8fafc' }}>
          <div style={{ backgroundColor: '#1e293b', color: '#e2e8f0', padding: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#0ea5e9', borderRadius: '2px', fontSize: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>J</div>
            <div>
              <div style={{ fontSize: '7px', color: '#0ea5e9' }}>John Doe</div>
              <div style={{ fontSize: '5px', color: '#94a3b8' }}>{'<'} Developer {'/>'}</div>
            </div>
          </div>
          <div style={{ padding: '4px' }}>
            <div style={{ backgroundColor: '#1e293b', color: '#e2e8f0', padding: '3px', borderRadius: '2px', marginBottom: '3px', border: '1px solid #0ea5e9' }}>
              <div style={{ fontSize: '4px', color: '#0ea5e9' }}>// About Me</div>
              <div style={{ fontSize: '4px' }}>function aboutMe() {'{'} return "Full Stack Developer"; {'}'}</div>
            </div>
            <div style={{ display: 'flex', gap: '2px' }}>
              <span style={{ padding: '1px 3px', backgroundColor: '#0ea5e9', color: 'white', borderRadius: '6px', fontSize: '4px' }}>React</span>
              <span style={{ padding: '1px 3px', backgroundColor: '#0ea5e9', color: 'white', borderRadius: '6px', fontSize: '4px' }}>Node.js</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  const colors = [
    { id: 'blue', name: 'Blue', color: '#007bff' },
    { id: 'green', name: 'Green', color: '#28a745' },
    { id: 'purple', name: 'Purple', color: '#6f42c1' },
    { id: 'red', name: 'Red', color: '#dc3545' },
    { id: 'dark', name: 'Dark', color: '#343a40' }
  ];

  return (
    <div className="form-section">
      <h3>Choose Your Resume Template</h3>
      
      <div className="form-group">
        <label style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', display: 'block' }}>Select Template Style</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          {templates.map(temp => (
            <div 
              key={temp.id}
              onClick={() => updateSection('template', temp.id)}
              style={{
                padding: '15px',
                border: template === temp.id ? '3px solid #007bff' : '2px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: template === temp.id ? '#f8f9ff' : 'white',
                transition: 'all 0.3s ease',
                boxShadow: template === temp.id ? '0 4px 12px rgba(0,123,255,0.3)' : '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ marginBottom: '10px' }}>
                {temp.preview}
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '14px' }}>{temp.name}</div>
                <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.4' }}>{temp.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {template && (
        <div className="form-group" style={{ marginTop: '25px' }}>
          <label style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', display: 'block' }}>Choose Color Scheme</label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {colors.map(color => (
              <div 
                key={color.id}
                onClick={() => updateSection('colorScheme', color.id)}
                style={{
                  padding: '12px 18px',
                  border: colorScheme === color.id ? '3px solid #333' : '2px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: color.color,
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  transform: colorScheme === color.id ? 'scale(1.05)' : 'scale(1)'
                }}
              >
                {color.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {template && colorScheme && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#e8f5e8', 
          borderRadius: '6px', 
          textAlign: 'center' 
        }}>
          <div style={{ color: '#28a745', fontWeight: 'bold' }}>✓ Template Selected!</div>
          <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
            You've chosen the {templates.find(t => t.id === template)?.name} template with {colors.find(c => c.id === colorScheme)?.name} color scheme.
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateSelector;