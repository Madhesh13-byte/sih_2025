import React from 'react';
import { useResume } from '../context/ResumeContext';
import ProfessionalTemplate from './templates/ProfessionalTemplate';
import ModernTemplate from './templates/ModernTemplate';
import CreativeTemplate from './templates/CreativeTemplate';
import MinimalTemplate from './templates/MinimalTemplate';
import ExecutiveTemplate from './templates/ExecutiveTemplate';
import AcademicTemplate from './templates/AcademicTemplate';
import TechTemplate from './templates/TechTemplate';

const ResumePreview = () => {
  const { resumeData } = useResume();
  const { template, colorScheme } = resumeData;

  const colorMap = {
    blue: '#007bff',
    green: '#28a745',
    purple: '#6f42c1',
    red: '#dc3545',
    dark: '#343a40'
  };

  const selectedColor = colorMap[colorScheme] || '#1f2937';

  const renderTemplate = () => {
    const templateProps = { data: resumeData, color: selectedColor };
    
    switch(template) {
      case 'modern': return <ModernTemplate {...templateProps} />;
      case 'creative': return <CreativeTemplate {...templateProps} />;
      case 'minimal': return <MinimalTemplate {...templateProps} />;
      case 'professional': return <ProfessionalTemplate {...templateProps} />;
      case 'executive': return <ExecutiveTemplate resumeData={resumeData} colorScheme={colorScheme} />;
      case 'academic': return <AcademicTemplate resumeData={resumeData} colorScheme={colorScheme} />;
      case 'tech': return <TechTemplate resumeData={resumeData} colorScheme={colorScheme} />;
      default: return (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          color: '#666',
          backgroundColor: 'white',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}>
          <h3>Choose a Template</h3>
          <p>Select a template from the Template section to see your resume preview</p>
        </div>
      );
    }
  };

  return (
    <div className="resume-preview">
      {renderTemplate()}
    </div>
  );
};

export default ResumePreview;

