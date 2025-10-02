import React, { useState } from 'react';
import PersonalInfoForm from '../components/forms/PersonalInfoForm';
import SummaryForm from '../components/forms/SummaryForm';
import ExperienceForm from '../components/forms/ExperienceForm';
import EducationForm from '../components/forms/EducationForm';
import SkillsForm from '../components/forms/SkillsForm';
import ProjectsForm from '../components/forms/ProjectsForm';
import CertificationsForm from '../components/forms/CertificationsForm';
import TemplateSelector from '../components/TemplateSelector';
import ResumePreview from '../components/ResumePreview';
import ExportButtons from '../components/ExportButtons';
import ResumeAnalytics from '../components/ResumeAnalytics';
import VersionHistory from '../components/VersionHistory';
import EnhancedWordingAnalytics from '../components/analytics/EnhancedWordingAnalytics';
import { useResume } from '../context/ResumeContext';

const ResumeBuilderPage = () => {
  const { resumeData } = useResume();
  const [activeSection, setActiveSection] = useState('personal');

  const sections = [
    { id: 'personal', name: 'Personal Info', icon: '👤' },
    { id: 'summary', name: 'Summary', icon: '📝' },
    { id: 'skills', name: 'Skills', icon: '🛠️' },
    { id: 'certifications', name: 'Certifications', icon: '🏆' },
    { id: 'experience', name: 'Work Experience', icon: '💼' },
    { id: 'education', name: 'Education', icon: '🎓' },
    { id: 'projects', name: 'Projects', icon: '🚀' },
    { id: 'templates', name: 'Templates', icon: '🎨' }
  ];

  const renderActiveSection = () => {
    switch(activeSection) {
      case 'personal': return <PersonalInfoForm />;
      case 'summary': return <SummaryForm />;
      case 'skills': return <SkillsForm />;
      case 'certifications': return <CertificationsForm />;
      case 'experience': return <ExperienceForm />;
      case 'education': return <EducationForm />;
      case 'projects': return <ProjectsForm />;
      case 'templates': return <TemplateSelector />;
      default: return <PersonalInfoForm />;
    }
  };

  return (
    <div className="resume-builder">
      {/* Main Content Area */}
      <div className="main-content">
        {/* Left Half - Forms and Actions */}
        <div className="left-half">
          {/* Navigation Bar */}
          <div className="form-navbar">
            <div className="app-logo">
              <span className="app-icon">📄</span>
              <h1>Resume Builder</h1>
            </div>
            <div className="nav-sections">
              {sections.map(section => (
                <button
                  key={section.id}
                  className={`nav-btn ${activeSection === section.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <span className="nav-icon">{section.icon}</span>
                  <span className="nav-text">{section.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="forms-section">
            <div className="section-content">
              {renderActiveSection()}
            </div>
          </div>
          
          <div className="actions-section">
            <div className="actions-container">
              <div className="resume-analytics-section">
                <ResumeAnalytics />
              </div>
              <div className="version-control-section">
                <VersionHistory />
              </div>
              <div className="export-section">
                <h4>Export Options</h4>
                <ExportButtons />
              </div>
            </div>
          </div>
        </div>

        {/* Right Half - Live Preview */}
        <div className="right-half">
          <h3>Live Preview</h3>
          <ResumePreview />
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilderPage;
