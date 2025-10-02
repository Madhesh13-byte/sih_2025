import React, { useState } from 'react';
import html2pdf from 'html2pdf.js';
import { useResume } from '../../context/ResumeContext';
import toast from 'react-hot-toast';

const PDFExport = () => {
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
        filename: `${resumeData.personalInfo?.name || 'resume'}.pdf`,
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

  return (
    <div className="export-component">
      <h5>📄 PDF Export</h5>
      <p>Download your resume as a high-quality PDF file</p>
      <button 
        onClick={downloadPDF}
        disabled={isGenerating}
        className="btn btn-primary"
        style={{ width: '100%' }}
      >
        {isGenerating ? 'Generating PDF...' : '📄 Download PDF'}
      </button>
    </div>
  );
};

export default PDFExport;