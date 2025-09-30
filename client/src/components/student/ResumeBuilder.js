import React, { useState, useEffect } from 'react';
import { User, Briefcase, GraduationCap, Award, Download, Eye } from 'lucide-react';

const ResumeBuilder = ({ user }) => {
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      name: user?.name || '',
      email: '',
      phone: '',
      address: '',
      linkedin: '',
      github: ''
    },
    objective: '',
    education: [{
      degree: '',
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

  const [activeSection, setActiveSection] = useState('personal');
  const [selectedTemplate, setSelectedTemplate] = useState('two-column');
  const [externalTemplates, setExternalTemplates] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [approvedCertificates, setApprovedCertificates] = useState([]);

  // Fetch templates from external API (example)
  const fetchExternalTemplates = async () => {
    try {
      // Example API call - replace with actual template API
      const response = await fetch('https://api.jsonresume.org/themes');
      if (response.ok) {
        const themes = await response.json();
        setExternalTemplates(themes.slice(0, 4)); // Limit to 4 templates
      }
    } catch (error) {
      console.log('External templates not available, using built-in templates');
    }
  };

  useEffect(() => {
    fetchExternalTemplates();
    fetchApprovedCertificates();
  }, []);

  const fetchApprovedCertificates = async () => {
    try {
      const response = await fetch('/api/student/approved-certificates', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setApprovedCertificates(data.certificates || []);
      }
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
    }
  };

  const generateResumeWithAI = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-ai-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userInfo: {
            name: user?.name,
            department: user?.department,
            registerNo: user?.register_no
          },
          certificates: approvedCertificates,
          template: selectedTemplate
        })
      });
      
      if (response.ok) {
        const aiGeneratedData = await response.json();
        setResumeData(aiGeneratedData.resumeData);
        alert('Resume generated successfully using AI!');
      }
    } catch (error) {
      console.error('AI resume generation failed:', error);
      alert('AI generation failed. Please fill manually.');
    }
    setIsGenerating(false);
  };

  const templates = [
    { id: 'two-column', name: 'Two Column', description: 'Professional two-column layout' },
    { id: 'one-page', name: 'One Page', description: 'Compact single-page design' },
    { id: 'ats-friendly', name: 'ATS Friendly', description: 'Applicant Tracking System optimized' },
    { id: 'executive', name: 'Executive', description: 'Senior-level professional template' },
    { id: 'creative', name: 'Creative', description: 'Design-focused layout' },
    { id: 'tech', name: 'Tech Resume', description: 'Developer/Engineer focused' }
  ];

  const updateField = (section, field, value, index = null) => {
    setResumeData(prev => {
      if (index !== null) {
        const newArray = [...prev[section]];
        newArray[index] = { ...newArray[index], [field]: value };
        return { ...prev, [section]: newArray };
      } else if (section === 'personalInfo') {
        return { ...prev, personalInfo: { ...prev.personalInfo, [field]: value } };
      } else {
        return { ...prev, [field]: value };
      }
    });
  };

  const addArrayItem = (section) => {
    const templates = {
      education: { degree: '', institution: '', year: '', cgpa: '' },
      experience: { title: '', company: '', duration: '', description: '' },
      projects: { name: '', description: '', technologies: '' },
      skills: '',
      certifications: ''
    };
    
    setResumeData(prev => ({
      ...prev,
      [section]: [...prev[section], templates[section]]
    }));
  };

  const removeArrayItem = (section, index) => {
    setResumeData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
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
      }
    } catch (error) {
      console.error('Resume generation failed:', error);
    }
  };

  const sections = [
    { id: 'template', label: 'Choose Template', icon: Eye },
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'skills', label: 'Skills & Projects', icon: Award },
    { id: 'preview', label: 'Preview', icon: Eye }
  ];

  const getTemplatePreview = (templateId) => {
    const previews = {
      'two-column': 'linear-gradient(90deg, #e3f2fd 50%, #ffffff 50%)',
      'one-page': 'linear-gradient(180deg, #f5f5f5 20%, #ffffff 20%)',
      'ats-friendly': 'linear-gradient(180deg, #ffffff 100%)',
      'executive': 'linear-gradient(180deg, #1a237e 30%, #ffffff 30%)',
      'creative': 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
      'tech': 'linear-gradient(135deg, #667eea, #764ba2)'
    };
    return previews[templateId] || '#f8fafc';
  };

  const getPreviewHTML = (template, data) => {
    const styles = {
      'two-column': { headerBg: '#2196f3', accent: '#1976d2', layout: 'two-column' },
      'one-page': { headerBg: '#424242', accent: '#616161', layout: 'compact' },
      'ats-friendly': { headerBg: '#ffffff', accent: '#000000', layout: 'simple' },
      'executive': { headerBg: '#1a237e', accent: '#3f51b5', layout: 'executive' },
      'creative': { headerBg: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)', accent: '#ff6b6b', layout: 'creative' },
      'tech': { headerBg: 'linear-gradient(135deg, #667eea, #764ba2)', accent: '#667eea', layout: 'tech' }
    };
    
    const style = styles[template] || styles.modern;
    
    if (style.layout === 'two-column') {
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; font-size: 11px; display: flex; gap: 15px;">
          <div style="width: 35%; background: #f8f9fa; padding: 15px;">
            <h2 style="color: ${style.accent}; margin: 0 0 10px 0; font-size: 16px;">${data.personalInfo.name}</h2>
            <p style="margin: 0 0 15px 0; font-size: 10px;">${data.personalInfo.email}<br>${data.personalInfo.phone}</p>
            <h4 style="color: ${style.accent}; margin: 15px 0 5px 0;">SKILLS</h4>
            ${data.skills.filter(skill => skill).map(skill => `<div style="margin: 3px 0;">${skill}</div>`).join('')}
          </div>
          <div style="width: 65%; padding: 15px;">
            <h4 style="color: ${style.accent}; border-bottom: 1px solid ${style.accent};">EXPERIENCE</h4>
            ${data.experience.filter(exp => exp.title).map(exp => `
              <div style="margin-bottom: 10px;">
                <strong>${exp.title}</strong><br>
                <span style="color: #666;">${exp.company}</span>
              </div>
            `).join('')}
            <h4 style="color: ${style.accent}; border-bottom: 1px solid ${style.accent};">EDUCATION</h4>
            ${data.education.map(edu => `<div><strong>${edu.degree}</strong><br><span style="color: #666;">${edu.institution}</span></div>`).join('')}
          </div>
        </div>
      `;
    }
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; font-size: 12px;">
        <div style="background: ${style.headerBg}; color: ${style.layout === 'ats-friendly' ? '#000' : 'white'}; padding: 20px; text-align: center; margin-bottom: 15px;">
          <h1 style="margin: 0; font-size: 20px;">${data.personalInfo.name}</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">${data.personalInfo.email} | ${data.personalInfo.phone}</p>
        </div>
        
        ${data.objective ? `
        <div style="margin-bottom: 15px;">
          <h3 style="color: ${style.accent}; border-bottom: 1px solid ${style.accent}; padding-bottom: 3px;">OBJECTIVE</h3>
          <p style="margin: 5px 0;">${data.objective}</p>
        </div>
        ` : ''}
        
        <div style="margin-bottom: 15px;">
          <h3 style="color: ${style.accent}; border-bottom: 1px solid ${style.accent}; padding-bottom: 3px;">EDUCATION</h3>
          ${data.education.map(edu => `
            <div style="margin-bottom: 8px;">
              <strong>${edu.degree}</strong><br>
              <span style="color: #666;">${edu.institution} | ${edu.year}</span>
            </div>
          `).join('')}
        </div>
        
        ${data.experience.some(exp => exp.title) ? `
        <div style="margin-bottom: 15px;">
          <h3 style="color: ${style.accent}; border-bottom: 1px solid ${style.accent}; padding-bottom: 3px;">EXPERIENCE</h3>
          ${data.experience.filter(exp => exp.title).map(exp => `
            <div style="margin-bottom: 8px;">
              <strong>${exp.title}</strong><br>
              <span style="color: #666;">${exp.company} | ${exp.duration}</span>
              ${exp.description ? `<p style="margin: 3px 0;">${exp.description}</p>` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}
        
        ${data.skills.filter(skill => skill).length > 0 ? `
        <div>
          <h3 style="color: ${style.accent}; border-bottom: 1px solid ${style.accent}; padding-bottom: 3px;">SKILLS</h3>
          <p>${data.skills.filter(skill => skill).join(', ')}</p>
        </div>
        ` : ''}
      </div>
    `;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#0f172a',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          Resume Builder
        </h1>

        <div style={{ display: 'flex', gap: '20px' }}>
          {/* Sidebar */}
          <div style={{
            width: '250px',
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            height: 'fit-content'
          }}>
            {sections.map(section => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px',
                    marginBottom: '8px',
                    border: 'none',
                    borderRadius: '8px',
                    background: activeSection === section.id ? '#0ea5e9' : 'transparent',
                    color: activeSection === section.id ? 'white' : '#64748b',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  <Icon size={18} />
                  {section.label}
                </button>
              );
            })}
            
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={generateResumeWithAI}
                disabled={isGenerating}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  background: isGenerating ? '#94a3b8' : '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isGenerating ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '10px'
                }}
              >
                {isGenerating ? 'Generating...' : '🤖 AI Generate'}
              </button>
              <button
                onClick={() => setActiveSection('preview')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  background: '#0ea5e9',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '10px'
                }}
              >
                <Eye size={16} />
                Preview
              </button>
              <button
                onClick={generateResume}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                <Download size={16} />
                Download PDF
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div style={{
            flex: 1,
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            {activeSection === 'template' && (
              <div>
                <h2 style={{ marginBottom: '20px', color: '#0f172a' }}>Choose Resume Template</h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '20px'
                }}>
                  {templates.map(template => (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      style={{
                        border: selectedTemplate === template.id ? '3px solid #0ea5e9' : '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '15px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{
                        width: '100%',
                        height: '200px',
                        background: getTemplatePreview(template.id),
                        borderRadius: '6px',
                        marginBottom: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        color: '#64748b',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.9)', padding: '10px', borderRadius: '4px' }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{template.name}</div>
                          <div style={{ fontSize: '9px' }}>{template.description}</div>
                        </div>
                      </div>
                      <h3 style={{
                        margin: 0,
                        fontSize: '16px',
                        color: selectedTemplate === template.id ? '#0ea5e9' : '#374151'
                      }}>
                        {template.name}
                      </h3>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeSection === 'personal' && (
              <div>
                <h2 style={{ marginBottom: '20px', color: '#0f172a' }}>Personal Information</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                  <input
                    placeholder="Full Name"
                    value={resumeData.personalInfo.name}
                    onChange={(e) => updateField('personalInfo', 'name', e.target.value)}
                    style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                  />
                  <input
                    placeholder="Email"
                    value={resumeData.personalInfo.email}
                    onChange={(e) => updateField('personalInfo', 'email', e.target.value)}
                    style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                  />
                  <input
                    placeholder="Phone"
                    value={resumeData.personalInfo.phone}
                    onChange={(e) => updateField('personalInfo', 'phone', e.target.value)}
                    style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                  />
                  <input
                    placeholder="Address"
                    value={resumeData.personalInfo.address}
                    onChange={(e) => updateField('personalInfo', 'address', e.target.value)}
                    style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                  />
                  <input
                    placeholder="LinkedIn URL"
                    value={resumeData.personalInfo.linkedin}
                    onChange={(e) => updateField('personalInfo', 'linkedin', e.target.value)}
                    style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                  />
                  <input
                    placeholder="GitHub URL"
                    value={resumeData.personalInfo.github}
                    onChange={(e) => updateField('personalInfo', 'github', e.target.value)}
                    style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                  />
                </div>
                <div style={{ marginTop: '20px' }}>
                  <textarea
                    placeholder="Career Objective"
                    value={resumeData.objective}
                    onChange={(e) => updateField(null, 'objective', e.target.value)}
                    style={{
                      width: '100%',
                      height: '100px',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>
            )}

            {activeSection === 'education' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ color: '#0f172a' }}>Education</h2>
                  <button
                    onClick={() => addArrayItem('education')}
                    style={{
                      padding: '8px 16px',
                      background: '#0ea5e9',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Add Education
                  </button>
                </div>
                {resumeData.education.map((edu, index) => (
                  <div key={index} style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '15px',
                    marginBottom: '15px'
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                      <input
                        placeholder="Degree"
                        value={edu.degree}
                        onChange={(e) => updateField('education', 'degree', e.target.value, index)}
                        style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                      />
                      <input
                        placeholder="Institution"
                        value={edu.institution}
                        onChange={(e) => updateField('education', 'institution', e.target.value, index)}
                        style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                      />
                      <input
                        placeholder="Year"
                        value={edu.year}
                        onChange={(e) => updateField('education', 'year', e.target.value, index)}
                        style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                      />
                      <input
                        placeholder="CGPA/Percentage"
                        value={edu.cgpa}
                        onChange={(e) => updateField('education', 'cgpa', e.target.value, index)}
                        style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                      />
                    </div>
                    {resumeData.education.length > 1 && (
                      <button
                        onClick={() => removeArrayItem('education', index)}
                        style={{
                          marginTop: '10px',
                          padding: '4px 8px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'experience' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ color: '#0f172a' }}>Experience</h2>
                  <button
                    onClick={() => addArrayItem('experience')}
                    style={{
                      padding: '8px 16px',
                      background: '#0ea5e9',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Add Experience
                  </button>
                </div>
                {resumeData.experience.map((exp, index) => (
                  <div key={index} style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '15px',
                    marginBottom: '15px'
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '10px' }}>
                      <input
                        placeholder="Job Title"
                        value={exp.title}
                        onChange={(e) => updateField('experience', 'title', e.target.value, index)}
                        style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                      />
                      <input
                        placeholder="Company"
                        value={exp.company}
                        onChange={(e) => updateField('experience', 'company', e.target.value, index)}
                        style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                      />
                    </div>
                    <input
                      placeholder="Duration (e.g., Jan 2023 - Present)"
                      value={exp.duration}
                      onChange={(e) => updateField('experience', 'duration', e.target.value, index)}
                      style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', marginBottom: '10px' }}
                    />
                    <textarea
                      placeholder="Job Description"
                      value={exp.description}
                      onChange={(e) => updateField('experience', 'description', e.target.value, index)}
                      style={{
                        width: '100%',
                        height: '80px',
                        padding: '8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        resize: 'vertical'
                      }}
                    />
                    {resumeData.experience.length > 1 && (
                      <button
                        onClick={() => removeArrayItem('experience', index)}
                        style={{
                          marginTop: '10px',
                          padding: '4px 8px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'skills' && (
              <div>
                <h2 style={{ marginBottom: '20px', color: '#0f172a' }}>Skills & Projects</h2>
                
                <div style={{ marginBottom: '30px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ color: '#374151' }}>Skills</h3>
                    <button
                      onClick={() => addArrayItem('skills')}
                      style={{
                        padding: '6px 12px',
                        background: '#0ea5e9',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Add Skill
                    </button>
                  </div>
                  {resumeData.skills.map((skill, index) => (
                    <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                      <input
                        placeholder="Skill"
                        value={skill}
                        onChange={(e) => {
                          const newSkills = [...resumeData.skills];
                          newSkills[index] = e.target.value;
                          setResumeData(prev => ({ ...prev, skills: newSkills }));
                        }}
                        style={{ flex: 1, padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                      />
                      {resumeData.skills.length > 1 && (
                        <button
                          onClick={() => removeArrayItem('skills', index)}
                          style={{
                            padding: '8px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ color: '#374151' }}>Projects</h3>
                    <button
                      onClick={() => addArrayItem('projects')}
                      style={{
                        padding: '6px 12px',
                        background: '#0ea5e9',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Add Project
                    </button>
                  </div>
                  {resumeData.projects.map((project, index) => (
                    <div key={index} style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '15px',
                      marginBottom: '15px'
                    }}>
                      <input
                        placeholder="Project Name"
                        value={project.name}
                        onChange={(e) => updateField('projects', 'name', e.target.value, index)}
                        style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', marginBottom: '10px' }}
                      />
                      <textarea
                        placeholder="Project Description"
                        value={project.description}
                        onChange={(e) => updateField('projects', 'description', e.target.value, index)}
                        style={{
                          width: '100%',
                          height: '60px',
                          padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          marginBottom: '10px',
                          resize: 'vertical'
                        }}
                      />
                      <input
                        placeholder="Technologies Used"
                        value={project.technologies}
                        onChange={(e) => updateField('projects', 'technologies', e.target.value, index)}
                        style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                      />
                      {resumeData.projects.length > 1 && (
                        <button
                          onClick={() => removeArrayItem('projects', index)}
                          style={{
                            marginTop: '10px',
                            padding: '4px 8px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'preview' && (
              <div>
                <h2 style={{ marginBottom: '20px', color: '#0f172a' }}>Resume Preview - {templates.find(t => t.id === selectedTemplate)?.name} Template</h2>
                <div style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '20px',
                  background: 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  maxHeight: '600px',
                  overflow: 'auto'
                }}>
                  <div dangerouslySetInnerHTML={{ __html: getPreviewHTML(selectedTemplate, resumeData) }} />
                </div>
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                  <button
                    onClick={generateResume}
                    style={{
                      padding: '12px 24px',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: '600'
                    }}
                  >
                    Download This Resume
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;