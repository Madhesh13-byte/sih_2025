import React, { useState } from 'react';
import html2pdf from 'html2pdf.js';
import QRCode from 'qrcode';
import { useResume } from '../context/ResumeContext';
import toast from 'react-hot-toast';

const ExportButtons = () => {
  const { resumeData } = useResume();
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadPDF = async () => {
    setIsGenerating(true);
    try {
      const element = document.querySelector('.resume-preview');
      if (!element) {
        toast.error('Resume preview not found');
        return;
      }
      
      const opt = {
        margin: 0.5,
        filename: `${resumeData.personal?.name || 'resume'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      await html2pdf().set(opt).from(element).save();
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      toast.error('Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadJSON = () => {
    const dataStr = JSON.stringify(resumeData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resumeData.personal?.name || 'resume'}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('JSON exported successfully!');
  };

  const downloadHTML = () => {
    const element = document.querySelector('.resume-preview');
    if (!element) {
      toast.error('Resume preview not found');
      return;
    }
    
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>${resumeData.personal?.name || 'Resume'}</title>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .resume-preview { max-width: 800px; margin: 0 auto; }
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
    link.download = `${resumeData.personal?.name || 'resume'}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('HTML exported successfully!');
  };

  const generateQRCode = async () => {
    try {
      const resumeUrl = resumeData.portfolioUrl || window.location.href;
      const qrDataUrl = await QRCode.toDataURL(resumeUrl, {
        width: 300,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' }
      });
      
      const link = document.createElement('a');
      link.href = qrDataUrl;
      link.download = `${resumeData.personal?.name || 'resume'}-qr.png`;
      link.click();
      toast.success('QR code generated successfully!');
    } catch (error) {
      toast.error('Failed to generate QR code');
    }
  };

  const shareResume = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${resumeData.personal?.name}'s Resume`,
          text: 'Check out my resume',
          url: resumeData.portfolioUrl || window.location.href
        });
      } catch (error) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    const url = resumeData.portfolioUrl || window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Resume link copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  };

  return (
    <div className="form-section">
      <h3>Export & Share Resume</h3>
      <div style={{ display: 'grid', gap: '10px' }}>
        <button 
          onClick={downloadPDF}
          disabled={isGenerating}
          className="btn btn-primary"
          style={{ width: '100%' }}
        >
          {isGenerating ? 'Generating...' : '📄 Download PDF'}
        </button>
        
        <button 
          onClick={downloadHTML}
          className="btn btn-secondary"
          style={{ width: '100%' }}
        >
          🌐 Export HTML
        </button>
        
        <button 
          onClick={downloadJSON}
          className="btn btn-secondary"
          style={{ width: '100%' }}
        >
          📋 Export JSON
        </button>
        
        <button 
          onClick={generateQRCode}
          className="btn btn-secondary"
          style={{ width: '100%' }}
        >
          📱 Generate QR Code
        </button>
        
        <button 
          onClick={shareResume}
          className="btn btn-outline"
          style={{ width: '100%' }}
        >
          🔗 Share Resume
        </button>
      </div>
    </div>
  );
};

export default ExportButtons;
