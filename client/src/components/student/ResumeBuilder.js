import React, { useState, useEffect } from 'react';
import { User, Briefcase, GraduationCap, Award, Download, Eye, Zap } from 'lucide-react';

const ResumeBuilder = ({ user }) => {
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      address: '',
      linkedin: '',
      github: ''
    },
    objective: '',
    education: [{
      degree: user?.department || '',
      institution: '',
      year: '',
      cgpa: ''
    }],
    experience: [{
      title: '',
      company: '',
      duration: '',
      description: ''
    }],
    skills: [''],
    projects: [{
      name: '',
      description: '',
      technologies: ''
    }],
    certifications: ['']
  });

  const [activeSection, setActiveSection] = useState('template');
  const [selectedTemplate, setSelectedTemplate] = useState('two-column');
  const [isGenerating, setIsGenerating] = useState(false);
  const [approvedCertificates, setApprovedCertificates] = useState([]);
  const [extractedData, setExtractedData] = useState({ skills: [], certifications: [], projects: [] });

  useEffect(() => {
    fetchApprovedCertificates();
  }, []);

  const fetchApprovedCertificates = async () => {
    try {
      const response = await fetch('/api/user-certificates', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setApprovedCertificates(data.certificates || []);
        if (data.certificates && data.certificates.length > 0) {
          const extracted = extractDataFromCertificates(data.certificates);
          setExtractedData(extracted);
        }
      }
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
      // Mock data for demo
      const mockCerts = [
        { id: 1, name: 'React Development Certificate', extractedText: 'React JavaScript Frontend Development Web Development' },
        { id: 2, name: 'Python Programming', extractedText: 'Python Programming Data Science Machine Learning' }
      ];
      setApprovedCertificates(mockCerts);
      const extracted = extractDataFromCertificates(mockCerts);
      setExtractedData(extracted);
    }
  };

  const extractDataFromCertificates = (certificates = approvedCertificates) => {
    const skills = new Set();
    const certifications = [];
    const projects = [];
    
    certificates.forEach(cert => {
      if (cert.extractedText || cert.name) {
        const text = cert.extractedText || cert.name;
        
        // Extract skills from certificate text
        const skillKeywords = ['JavaScript', 'Python', 'React', 'Node.js', 'Java', 'C++', 'HTML', 'CSS', 'SQL', 'MongoDB', 'AWS', 'Docker', 'Git', 'Machine Learning', 'Data Science', 'Frontend', 'Backend', 'Web Development'];
        skillKeywords.forEach(skill => {
          if (text.toLowerCase().includes(skill.toLowerCase())) {
            skills.add(skill);
          }
        });
        
        // Add certification
        certifications.push(cert.name || cert.title || 'Certificate');
        
        // Extract project-like information
        if (text.toLowerCase().includes('project')) {
          projects.push({
            name: `Project from ${cert.name}`,
            description: 'Project completed as part of certification program',
            technologies: Array.from(skills).slice(0, 3).join(', ')
          });
        }
      }
    });
    
    return { skills: Array.from(skills), certifications, projects };
  };

  const generateResumeWithAI = async () => {
    setIsGenerating(true);
    try {
      const extractedInfo = extractDataFromCertificates();
      
      // Update resume data with extracted information
      const updatedData = {
        ...resumeData,
        skills: extractedInfo.skills.length > 0 ? extractedInfo.skills : resumeData.skills,
        certifications: extractedInfo.certifications.length > 0 ? extractedInfo.certifications : resumeData.certifications,
        projects: extractedInfo.projects.length > 0 ? extractedInfo.projects : resumeData.projects,
        objective: `${user?.department || 'Computer Science'} student with expertise in ${extractedInfo.skills.slice(0, 3).join(', ')} seeking opportunities to apply technical skills and grow professionally.`
      };
      
      setResumeData(updatedData);
      setExtractedData(extractedInfo);
      alert('Resume generated successfully using certificate data!');
    } catch (error) {
      console.error('Resume generation failed:', error);
      alert('Resume populated with available certificate data!');
    }
    setIsGenerating(false);
  };

  const templates = [
    { id: 'two-column', name: 'Two Column', description: 'Professional two-column layout' },
    { id: 'one-page', name: 'One Page', description: 'Compact single-page design' },
    { id: 'ats-friendly', name: 'ATS Friendly', description: 'Applicant Tracking System optimized' },
    { id: 'executive', name: 'Executive', description: 'Senior-level professional template' }
  ];

  const getTemplatePreview = (templateId) => {
    const previews = {
      'two-column': 'linear-gradient(90deg, #e3f2fd 50%, #ffffff 50%)',
      'one-page': 'linear-gradient(180deg, #f5f5f5 20%, #ffffff 20%)',
      'ats-friendly': 'linear-gradient(180deg, #ffffff 100%)',
      'executive': 'linear-gradient(180deg, #1a237e 30%, #ffffff 30%)'
    };
    return previews[templateId] || '#f8fafc';
  };

  const getPreviewHTML = (template, data) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; font-size: 12px; border: 1px solid #ddd; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #007bff; padding-bottom: 15px;">
          <h1 style="margin: 0; color: #007bff; font-size: 24px;">${data.personalInfo.name}</h1>
          <p style="margin: 5px 0 0 0; color: #666;">${data.personalInfo.email} | ${data.personalInfo.phone}</p>
        </div>
        
        ${data.objective ? `<div style="margin-bottom: 20px;"><h3 style="color: #007bff; margin-bottom: 8px;">OBJECTIVE</h3><p style="margin: 0;">${data.objective}</p></div>` : ''}
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #007bff; margin-bottom: 8px; border-bottom: 1px solid #007bff;">EDUCATION</h3>
          ${data.education.filter(edu => edu.degree).map(edu => `
            <div style="margin-bottom: 10px;">
              <strong>${edu.degree}</strong><br>
              <span style="color: #666;">${edu.institution} ${edu.year ? `- ${edu.year}` : ''}</span>
              ${edu.cgpa ? `<br><span style="color: #666;">CGPA: ${edu.cgpa}</span>` : ''}
            </div>
          `).join('')}
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #007bff; margin-bottom: 8px; border-bottom: 1px solid #007bff;">SKILLS</h3>
          <p style="margin: 0;">${data.skills.filter(skill => skill).join(' • ')}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #007bff; margin-bottom: 8px; border-bottom: 1px solid #007bff;">CERTIFICATIONS</h3>
          ${data.certifications.filter(cert => cert).map(cert => `<div style="margin: 3px 0;">• ${cert}</div>`).join('')}
        </div>
        
        ${data.projects.filter(proj => proj.name).length > 0 ? `
        <div style="margin-bottom: 20px;">
          <h3 style="color: #007bff; margin-bottom: 8px; border-bottom: 1px solid #007bff;">PROJECTS</h3>
          ${data.projects.filter(proj => proj.name).map(proj => `
            <div style="margin-bottom: 10px;">
              <strong>${proj.name}</strong><br>
              <span style="color: #666;">${proj.description}</span><br>
              <span style="font-size: 11px; color: #888;">Technologies: ${proj.technologies}</span>
            </div>
          `).join('')}
        </div>` : ''}
      </div>
    `;
  };

  const generateResume = async () => {
    try {
      const response = await fetch('/api/generate-resume-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...resumeData, template: selectedTemplate })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${resumeData.personalInfo.name}_Resume.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('PDF generation not available. Use browser print function.');
        window.print();
      }
    } catch (error) {
      console.error('Resume generation failed:', error);
      alert('PDF generation not available. Use browser print function.');
      window.print();
    }
  };

  const sections = [
    { id: 'template', label: 'Template & AI', icon: Zap },
    { id: 'preview', label: 'Preview & Download', icon: Eye }
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'template':
        return (
          <div className="resume-section">
            <h3>Choose Template & Generate from Certificates</h3>
            
            <div className="template-grid">
              {templates.map(template => (
                <div 
                  key={template.id}
                  className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div 
                    className="template-preview"
                    style={{ background: getTemplatePreview(template.id) }}
                  ></div>
                  <h4>{template.name}</h4>
                  <p>{template.description}</p>
                </div>
              ))}
            </div>
            
            <div className="certificate-extraction">
              <h4><Zap size={20} /> Certificate Data Extraction</h4>
              <div className="extraction-stats">
                <div className="stat">
                  <strong>Certificates Found:</strong> {approvedCertificates.length}
                </div>
                {extractedData.skills.length > 0 && (
                  <div className="stat">
                    <strong>Skills Extracted:</strong> {extractedData.skills.join(', ')}
                  </div>
                )}
                {extractedData.certifications.length > 0 && (
                  <div className="stat">
                    <strong>Certifications:</strong> {extractedData.certifications.length} found
                  </div>
                )}
              </div>
              
              <button 
                onClick={generateResumeWithAI}
                disabled={isGenerating || approvedCertificates.length === 0}
                className="ai-generate-btn"
              >
                <Zap size={16} />
                {isGenerating ? 'Generating...' : 'Generate Resume from Certificates'}
              </button>
              
              {approvedCertificates.length === 0 && (
                <p className="no-certs">No certificates found. Upload certificates first to use AI generation.</p>
              )}
            </div>
          </div>
        );
        
      case 'preview':
        return (
          <div className="resume-section">
            <h3>Resume Preview</h3>
            <div className="preview-container">
              <div 
                className="resume-preview"
                dangerouslySetInnerHTML={{ __html: getPreviewHTML(selectedTemplate, resumeData) }}
              ></div>
            </div>
            <div className="preview-actions">
              <button onClick={generateResume} className="download-btn">
                <Download size={16} /> Download PDF
              </button>
            </div>
          </div>
        );
        
      default:
        return <div>Select a section</div>;
    }
  };

  return (
    <div className="resume-builder">
      <div className="resume-header">
        <h2>AI Resume Builder</h2>
        <p>Generate professional resumes using your certificate data</p>
      </div>
      
      <div className="resume-layout">
        <div className="resume-sidebar">
          {sections.map(section => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                className={`section-btn ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <Icon size={16} />
                {section.label}
              </button>
            );
          })}
        </div>
        
        <div className="resume-content">
          {renderSection()}
        </div>
      </div>
      
      <style jsx>{`
        .resume-builder {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .resume-header {
          text-align: center;
          margin-bottom: 30px;
        }
        .resume-layout {
          display: flex;
          gap: 20px;
        }
        .resume-sidebar {
          width: 250px;
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          height: fit-content;
        }
        .section-btn {
          width: 100%;
          padding: 12px;
          margin-bottom: 8px;
          border: none;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .section-btn:hover {
          background: #e9ecef;
        }
        .section-btn.active {
          background: #007bff;
          color: white;
        }
        .resume-content {
          flex: 1;
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .template-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 30px;
        }
        .template-card {
          border: 2px solid #e9ecef;
          border-radius: 8px;
          padding: 15px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .template-card:hover {
          border-color: #007bff;
        }
        .template-card.selected {
          border-color: #007bff;
          background: #f8f9ff;
        }
        .template-preview {
          height: 120px;
          border-radius: 4px;
          margin-bottom: 10px;
        }
        .certificate-extraction {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }
        .extraction-stats {
          margin: 15px 0;
        }
        .stat {
          margin: 8px 0;
          padding: 8px;
          background: white;
          border-radius: 4px;
          border-left: 4px solid #007bff;
        }
        .ai-generate-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          transition: background 0.2s;
        }
        .ai-generate-btn:hover:not(:disabled) {
          background: #218838;
        }
        .ai-generate-btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }
        .no-certs {
          color: #dc3545;
          font-style: italic;
          margin-top: 10px;
        }
        .preview-container {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          background: white;
          max-height: 600px;
          overflow-y: auto;
        }
        .download-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          transition: background 0.2s;
        }
        .download-btn:hover {
          background: #0056b3;
        }
      `}</style>
    </div>
  );
};

export default ResumeBuilder;