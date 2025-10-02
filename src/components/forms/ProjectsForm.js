import React from 'react';
import { useResume } from '../../context/ResumeContext';

const ProjectsForm = () => {
  const { resumeData, updateSection } = useResume();
  const { projects } = resumeData;

  const addProject = () => {
    const newProject = {
      title: '',
      description: '',
      techStack: '',
      link: ''
    };
    updateSection('projects', [...projects, newProject]);
  };

  const updateProject = (index, field, value) => {
    const updated = projects.map((project, i) => 
      i === index ? { ...project, [field]: value } : project
    );
    updateSection('projects', updated);
  };

  const removeProject = (index) => {
    const updated = projects.filter((_, i) => i !== index);
    updateSection('projects', updated);
  };

  return (
    <div className="form-section">
      <h3>Projects</h3>
      
      {projects.map((project, index) => (
        <div key={index} style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
          <div className="form-group">
            <label>Project Title</label>
            <input
              type="text"
              value={project.title}
              onChange={(e) => updateProject(index, 'title', e.target.value)}
              placeholder="My Awesome Project"
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={project.description}
              onChange={(e) => updateProject(index, 'description', e.target.value)}
              placeholder="Describe what the project does and your role in it..."
              rows="3"
            />
          </div>
          
          <div className="form-group">
            <label>Technologies Used</label>
            <input
              type="text"
              value={project.techStack}
              onChange={(e) => updateProject(index, 'techStack', e.target.value)}
              placeholder="React, Node.js, MongoDB"
            />
          </div>
          
          <div className="form-group">
            <label>Project Link (Optional)</label>
            <input
              type="url"
              value={project.link}
              onChange={(e) => updateProject(index, 'link', e.target.value)}
              placeholder="https://github.com/username/project"
            />
          </div>
          
          <button 
            onClick={() => removeProject(index)}
            className="btn btn-danger"
          >
            Remove
          </button>
        </div>
      ))}
      
      <button 
        onClick={addProject}
        className="btn btn-primary"
      >
        + Add Project
      </button>
    </div>
  );
};

export default ProjectsForm;
