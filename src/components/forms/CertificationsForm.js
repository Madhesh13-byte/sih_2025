import React from 'react';
import { useResume } from '../../context/ResumeContext';

const CertificationsForm = () => {
  const { resumeData, updateSection } = useResume();
  const { certifications } = resumeData;

  const addCertification = () => {
    const newCert = {
      name: '',
      issuer: '',
      date: '',
      credentialId: ''
    };
    updateSection('certifications', [...certifications, newCert]);
  };

  const updateCertification = (index, field, value) => {
    const updated = certifications.map((cert, i) => 
      i === index ? { ...cert, [field]: value } : cert
    );
    updateSection('certifications', updated);
  };

  const removeCertification = (index) => {
    const updated = certifications.filter((_, i) => i !== index);
    updateSection('certifications', updated);
  };

  return (
    <div className="form-section">
      <h3>Certifications</h3>
      
      {certifications.map((cert, index) => (
        <div key={index} style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
          <div className="form-group">
            <label>Certification Name</label>
            <input
              type="text"
              value={cert.name}
              onChange={(e) => updateCertification(index, 'name', e.target.value)}
              placeholder="AWS Certified Solutions Architect"
            />
          </div>
          
          <div className="form-group">
            <label>Issuing Organization</label>
            <input
              type="text"
              value={cert.issuer}
              onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
              placeholder="Amazon Web Services"
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div className="form-group">
              <label>Date Obtained</label>
              <input
                type="text"
                value={cert.date}
                onChange={(e) => updateCertification(index, 'date', e.target.value)}
                placeholder="Jan 2023"
              />
            </div>
            <div className="form-group">
              <label>Credential ID (Optional)</label>
              <input
                type="text"
                value={cert.credentialId}
                onChange={(e) => updateCertification(index, 'credentialId', e.target.value)}
                placeholder="ABC123XYZ"
              />
            </div>
          </div>
          
          <button 
            onClick={() => removeCertification(index)}
            className="btn btn-danger"
          >
            Remove
          </button>
        </div>
      ))}
      
      <button 
        onClick={addCertification}
        className="btn btn-primary"
      >
        + Add Certification
      </button>
    </div>
  );
};

export default CertificationsForm;