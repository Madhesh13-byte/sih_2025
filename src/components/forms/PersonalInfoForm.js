import React from 'react';
import { useResume } from '../../context/ResumeContext';

const PersonalInfoForm = () => {
  const { resumeData, updateSection } = useResume();
  const { personal } = resumeData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateSection('personal', {
      ...personal,
      [name]: value
    });
  };

  return (
    <div className="form-section">
      <h3>Personal Information</h3>
      
      <div className="form-group">
        <label>Full Name</label>
        <input
          type="text"
          name="name"
          value={personal.name}
          onChange={handleChange}
          placeholder="Enter your full name"
        />
      </div>

      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={personal.email}
          onChange={handleChange}
          placeholder="your.email@example.com"
        />
      </div>

      <div className="form-group">
        <label>Phone</label>
        <input
          type="tel"
          name="phone"
          value={personal.phone}
          onChange={handleChange}
          placeholder="(555) 123-4567"
        />
      </div>

      <div className="form-group">
        <label>LinkedIn</label>
        <input
          type="url"
          name="linkedin"
          value={personal.linkedin}
          onChange={handleChange}
          placeholder="https://linkedin.com/in/yourprofile"
        />
      </div>

      <div className="form-group">
        <label>Address</label>
        <input
          type="text"
          name="address"
          value={personal.address}
          onChange={handleChange}
          placeholder="City, State"
        />
      </div>
    </div>
  );
};

export default PersonalInfoForm;