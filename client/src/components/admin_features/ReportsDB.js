import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, FileText, Calendar } from 'lucide-react';

function ReportsDB({ setCurrentView, setMessage }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    report_type: 'academic',
    data: {}
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/reports-db', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      setMessage('Failed to fetch reports');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/reports-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setMessage('✅ Report created successfully');
        setShowForm(false);
        setFormData({ title: '', description: '', report_type: 'academic', data: {} });
        fetchReports();
      }
    } catch (error) {
      setMessage('Failed to create report');
    }
  };

  return (
    <div className="reports-db">
      <div className="reports-header">
        <button className="back-btn" onClick={() => setCurrentView('main')}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <h2>Database Reports</h2>
        <button className="add-btn" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} />
          Add Report
        </button>
      </div>

      {showForm && (
        <div className="report-form">
          <h3>Create New Report</h3>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Report Title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
            <select
              value={formData.report_type}
              onChange={(e) => setFormData({...formData, report_type: e.target.value})}
            >
              <option value="academic">Academic</option>
              <option value="enrollment">Enrollment</option>
              <option value="placement">Placement</option>
              <option value="financial">Financial</option>
            </select>
            <button type="submit">Create Report</button>
          </form>
        </div>
      )}

      <div className="reports-list">
        {loading ? (
          <p>Loading reports...</p>
        ) : (
          reports.map(report => (
            <div key={report.id} className="report-card">
              <div className="report-icon">
                <FileText size={24} />
              </div>
              <div className="report-content">
                <h4>{report.title}</h4>
                <p>{report.description}</p>
                <div className="report-meta">
                  <span className="report-type">{report.report_type}</span>
                  <span className="report-date">
                    <Calendar size={14} />
                    {new Date(report.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ReportsDB;