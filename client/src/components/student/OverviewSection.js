import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Award, Target, Upload, BarChart3 } from 'lucide-react';
import './StudentDashboard.css';
function OverviewSection({ user }) {
  const [overallAttendance, setOverallAttendance] = useState(0);

  useEffect(() => {
    fetchOverallAttendance();
  }, []);

  const fetchOverallAttendance = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/student/attendance', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOverallAttendance(data.overall.percentage);
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    }
  };

  return (
    <div className="overview-section">
      <h2>Dashboard Overview</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon academic">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>--</h3>
            <p>Current GPA</p>
            <span className="stat-trend neutral">Not available yet</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon attendance">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <h3>{overallAttendance}%</h3>
            <p>Overall Attendance</p>
            <span className={`stat-trend ${overallAttendance >= 75 ? 'positive' : 'negative'}`}>
              {overallAttendance >= 75 ? 'Good standing' : 'Below required'}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon certificates">
            <Award size={24} />
          </div>
          <div className="stat-content">
            <h3>0</h3>
            <p>Certificates</p>
            <span className="stat-trend neutral">Upload your first certificate</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon rank">
            <Target size={24} />
          </div>
          <div className="stat-content">
            <h3>--</h3>
            <p>Class Rank</p>
            <span className="stat-trend neutral">Not available yet</span>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button className="action-btn">
            <Upload size={20} />
            Upload Certificate
          </button>
          <button className="action-btn">
            <Calendar size={20} />
            View Attendance
          </button>
          <button className="action-btn">
            <BarChart3 size={20} />
            Academic Report
          </button>
        </div>
      </div>
    </div>
  );
}
export default OverviewSection;