import React from 'react';
import { useResume } from '../../context/ResumeContext';

const ExperienceForm = () => {
  const { resumeData, updateSection } = useResume();
  const { experience } = resumeData;

  const addExperience = () => {
    const newExp = {
      role: '',
      company: '',
      startDate: '',
      endDate: '',
      responsibilities: []
    };
    updateSection('experience', [...experience, newExp]);
  };

  const updateExperience = (index, field, value) => {
    const updated = experience.map((exp, i) => 
      i === index ? { ...exp, [field]: value } : exp
    );
    updateSection('experience', updated);
  };

  const updateResponsibilities = (index, value) => {
    const responsibilities = value.split('\n').filter(item => item.trim());
    updateExperience(index, 'responsibilities', responsibilities);
  };

  const removeExperience = (index) => {
    const updated = experience.filter((_, i) => i !== index);
    updateSection('experience', updated);
  };

  return (
    <div className="form-section">
      <h3>Work Experience</h3>
      
      {experience.map((exp, index) => (
        <div key={index} style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div className="form-group">
              <label>Job Title</label>
              <input
                type="text"
                value={exp.role}
                onChange={(e) => updateExperience(index, 'role', e.target.value)}
                placeholder="Software Engineer"
              />
            </div>
            <div className="form-group">
              <label>Company</label>
              <input
                type="text"
                value={exp.company}
                onChange={(e) => updateExperience(index, 'company', e.target.value)}
                placeholder="Company Name"
              />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="text"
                value={exp.startDate}
                onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                placeholder="Jan 2020"
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="text"
                value={exp.endDate}
                onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                placeholder="Present"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Key Responsibilities (one per line)</label>
            <textarea
              value={exp.responsibilities?.join('\n') || ''}
              onChange={(e) => updateResponsibilities(index, e.target.value)}
              placeholder="• Developed web applications using React\n• Led a team of 5 developers\n• Improved system performance by 40%"
              rows="4"
            />
          </div>
          
          <button 
            onClick={() => removeExperience(index)}
            className="btn btn-danger"
            style={{ marginTop: '10px' }}
          >
            Remove
          </button>
        </div>
      ))}
      
      <button 
        onClick={addExperience}
        className="btn btn-primary"
      >
        + Add Experience
      </button>
    </div>
  );
};

export default ExperienceForm;