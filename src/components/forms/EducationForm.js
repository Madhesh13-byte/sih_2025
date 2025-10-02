import React from 'react';
import { useResume } from '../../context/ResumeContext';

const EducationForm = () => {
  const { resumeData, updateSection } = useResume();
  const { education } = resumeData;

  const addEducation = () => {
    const newEdu = {
      degree: '',
      institution: '',
      startYear: '',
      endYear: '',
      cgpa: ''
    };
    updateSection('education', [...education, newEdu]);
  };

  const updateEducation = (index, field, value) => {
    const updated = education.map((edu, i) => 
      i === index ? { ...edu, [field]: value } : edu
    );
    updateSection('education', updated);
  };

  const removeEducation = (index) => {
    const updated = education.filter((_, i) => i !== index);
    updateSection('education', updated);
  };

  return (
    <div className="form-section">
      <h3>Education</h3>
      
      {education.map((edu, index) => (
        <div key={index} style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
          <div className="form-group">
            <label>Degree/Course</label>
            <input
              type="text"
              value={edu.degree}
              onChange={(e) => updateEducation(index, 'degree', e.target.value)}
              placeholder="Bachelor of Science in Computer Science"
            />
          </div>
          
          <div className="form-group">
            <label>Institution</label>
            <input
              type="text"
              value={edu.institution}
              onChange={(e) => updateEducation(index, 'institution', e.target.value)}
              placeholder="University Name"
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div className="form-group">
              <label>Start Year</label>
              <input
                type="text"
                value={edu.startYear}
                onChange={(e) => updateEducation(index, 'startYear', e.target.value)}
                placeholder="2018"
              />
            </div>
            <div className="form-group">
              <label>End Year</label>
              <input
                type="text"
                value={edu.endYear}
                onChange={(e) => updateEducation(index, 'endYear', e.target.value)}
                placeholder="2022"
              />
            </div>
            <div className="form-group">
              <label>CGPA/Grade</label>
              <input
                type="text"
                value={edu.cgpa}
                onChange={(e) => updateEducation(index, 'cgpa', e.target.value)}
                placeholder="3.8/4.0"
              />
            </div>
          </div>
          
          <button 
            onClick={() => removeEducation(index)}
            className="btn btn-danger"
          >
            Remove
          </button>
        </div>
      ))}
      
      <button 
        onClick={addEducation}
        className="btn btn-primary"
      >
        + Add Education
      </button>
    </div>
  );
};

export default EducationForm;