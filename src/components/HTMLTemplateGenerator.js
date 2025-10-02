import React from 'react';
import { htmlTemplates } from '../templates/htmlTemplates';

const HTMLTemplateGenerator = ({ resumeData, templateId = 'modern', colorScheme = 'blue' }) => {
  const generateHTML = () => {
    const template = htmlTemplates[templateId];
    if (!template) return '';
    
    return template.generate(resumeData, colorScheme);
  };

  const downloadHTML = () => {
    const html = generateHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resumeData.personal?.name || 'resume'}_${templateId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const previewHTML = () => {
    const html = generateHTML();
    const newWindow = window.open('', '_blank');
    newWindow.document.write(html);
    newWindow.document.close();
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', margin: '10px 0' }}>
      <h3>HTML Template Generator</h3>
      <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
        <button 
          onClick={downloadHTML}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Download HTML
        </button>
        <button 
          onClick={previewHTML}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Preview HTML
        </button>
      </div>
    </div>
  );
};

export default HTMLTemplateGenerator;