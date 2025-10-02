import React from 'react';
import { useResume } from '../../context/ResumeContext';
import toast from 'react-hot-toast';

const HTMLExport = () => {
  const { resumeData } = useResume();

  const downloadHTML = () => {
    const element = document.querySelector('.resume-preview');
    if (!element) {
      toast.error('Resume preview not found');
      return;
    }
    
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${resumeData.personalInfo?.name || 'Resume'}</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      margin: 20px; 
      line-height: 1.6;
      color: #333;
    }
    .resume-preview { 
      max-width: 800px; 
      margin: 0 auto; 
      background: white;
      padding: 20px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    @media print {
      body { margin: 0; }
      .resume-preview { box-shadow: none; }
    }
  </style>
</head>
<body>
  ${element.outerHTML}
</body>
</html>`;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resumeData.personalInfo?.name || 'resume'}.html`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('HTML exported successfully!');
  };

  return (
    <div className="export-component">
      <h5>🌐 HTML Export</h5>
      <p>Export as a standalone HTML file for web sharing</p>
      <button 
        onClick={downloadHTML}
        className="btn btn-secondary"
        style={{ width: '100%' }}
      >
        🌐 Export HTML
      </button>
    </div>
  );
};

export default HTMLExport;