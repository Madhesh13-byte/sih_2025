import React, { useState } from 'react';
import { Calendar, TrendingUp, Award, Target, Upload, BarChart3 } from 'lucide-react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import './StudentDashboard.css';
function CertificatesSection({ user }) {
  const [certificates, setCertificates] = useState([]);

  const [showUpload, setShowUpload] = useState(false);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle size={16} className="status-approved" />;
      case 'pending': return <Clock size={16} className="status-pending" />;
      case 'rejected': return <AlertCircle size={16} className="status-rejected" />;
      default: return null;
    }
  };

  return (
    <div className="certificates-section">
      <div className="section-header">
        <h2>Certificates</h2>
        <button 
          className="upload-btn"
          onClick={() => setShowUpload(!showUpload)}
        >
          <Upload size={20} />
          Upload Certificate
        </button>
      </div>

      {showUpload && (
        <div className="upload-form">
          <h3>Upload New Certificate</h3>
          <form>
            <div className="form-group">
              <label>Certificate Name</label>
              <input type="text" placeholder="Enter certificate name" />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select>
                <option value="">Select Category</option>
                <option value="technical">Technical</option>
                <option value="sports">Sports</option>
                <option value="cultural">Cultural</option>
                <option value="volunteer">Volunteer</option>
              </select>
            </div>
            <div className="form-group">
              <label>Upload File</label>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" />
            </div>
            <div className="form-actions">
              <button type="submit" className="submit-btn">Upload</button>
              <button type="button" onClick={() => setShowUpload(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="certificates-grid">
        {certificates.length === 0 ? (
          <div className="empty-state">
            <Award size={48} />
            <h3>No Certificates Yet</h3>
            <p>Upload your first certificate to get started</p>
          </div>
        ) : (
          certificates.map(cert => (
            <div key={cert.id} className="certificate-card">
              <div className="cert-header">
                <h4>{cert.name}</h4>
                <div className="cert-status">
                  {getStatusIcon(cert.status)}
                  <span className={`status-text ${cert.status}`}>
                    {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="cert-details">
                <span className="cert-category">{cert.category}</span>
                <span className="cert-date">{cert.date}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
export default CertificatesSection;