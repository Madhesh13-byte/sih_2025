import React, { useState } from 'react';
import { useResume } from '../../context/ResumeContext';
import AIContentGenerator from '../AIContentGenerator';

const SkillsForm = () => {
  const { resumeData, updateSection } = useResume();
  const { skills } = resumeData;
  const [newSkill, setNewSkill] = useState('');

  const addSkill = () => {
    if (newSkill.trim()) {
      updateSection('skills', [...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (index) => {
    const updated = skills.filter((_, i) => i !== index);
    updateSection('skills', updated);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addSkill();
    }
  };

  const handleAISuggestion = (suggestedSkills) => {
    const newSkills = [...skills, ...suggestedSkills.filter(skill => !skills.includes(skill))];
    updateSection('skills', newSkills);
  };

  return (
    <div className="form-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3>Skills</h3>
        <AIContentGenerator section="skills" onSuggestion={handleAISuggestion} />
      </div>
      
      <div className="form-group">
        <label>Add Skill</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., JavaScript, Python, React"
            style={{ flex: 1 }}
          />
          <button 
            onClick={addSkill}
            className="btn btn-primary"
          >
            Add
          </button>
        </div>
      </div>

      {skills.length > 0 && (
        <div>
          <label>Current Skills</label>
          <div className="skills-list" style={{ marginTop: '10px' }}>
            {skills.map((skill, index) => (
              <div key={index} className="skill-tag" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>{skill}</span>
                <button 
                  onClick={() => removeSkill(index)}
                  style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', marginLeft: '8px' }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsForm;
