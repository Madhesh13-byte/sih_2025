import React from 'react';
import { useResume } from '../../context/ResumeContext';
import AIContentGenerator from '../AIContentGenerator';

const SummaryForm = () => {
  const { resumeData, updateSection } = useResume();
  const { summary } = resumeData;

  const handleChange = (e) => {
    updateSection('summary', e.target.value);
  };

  const handleAISuggestion = (suggestion) => {
    updateSection('summary', suggestion);
  };

  return (
    <div className="form-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3>Professional Summary</h3>
        <AIContentGenerator section="summary" onSuggestion={handleAISuggestion} />
      </div>
      <div className="form-group">
        <textarea
          value={summary}
          onChange={handleChange}
          placeholder="Write a brief professional summary highlighting your key skills and experience..."
          rows="4"
        />
      </div>
    </div>
  );
};

export default SummaryForm;
