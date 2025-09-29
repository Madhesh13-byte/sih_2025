import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Award, Target, Upload, BarChart3, Clock } from 'lucide-react';
import { AnimatedProgressBar, AnimatedCircularProgress, AnimatedBarChart } from '../AnimatedCharts';
import '../AnimatedCharts.css';
import './StudentDashboard.css';
function OverviewSection({ user }) {
  const [overallAttendance, setOverallAttendance] = useState(0);
  const [cgpa, setCgpa] = useState(0);
  const [timetable, setTimetable] = useState([]);

  useEffect(() => {
    fetchOverallAttendance();
    fetchCGPA();
    fetchTimetable();
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

  const fetchCGPA = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/student/gpa', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCgpa(data.current?.cgpa || 0);
      }
    } catch (error) {
      console.error('Failed to fetch CGPA:', error);
    }
  };

  const fetchTimetable = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/student/timetable', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTimetable(data);
      }
    } catch (error) {
      console.error('Failed to fetch timetable:', error);
    }
  };

  return (
    <div className="overview-section">
      <h2>Dashboard Overview</h2>
      
      <div className="stats-grid">
        <div className="stat-card animated-card">
          <div className="stat-icon academic">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>{cgpa > 0 ? cgpa : '--'}</h3>
            <p>CGPA</p>
            {cgpa > 0 && (
              <AnimatedProgressBar 
                percentage={(cgpa / 10) * 100}
                label=""
                color={cgpa >= 8 ? '#10b981' : cgpa >= 6 ? '#f59e0b' : '#ef4444'}
                delay={0}
              />
            )}
            <span className={`stat-trend ${cgpa >= 8 ? 'positive' : cgpa >= 6 ? 'neutral' : 'negative'}`}>
              {cgpa > 0 ? (cgpa >= 8 ? 'Excellent' : cgpa >= 6 ? 'Good' : 'Needs improvement') : 'Not available yet'}
            </span>
          </div>
        </div>

        <div className="stat-card animated-card">
          <div className="stat-icon attendance">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <h3>{overallAttendance}%</h3>
            <p>Overall Attendance</p>
            <AnimatedProgressBar 
              percentage={overallAttendance}
              label=""
              color={overallAttendance >= 75 ? '#10b981' : '#ef4444'}
              delay={200}
            />
            <span className={`stat-trend ${overallAttendance >= 75 ? 'positive' : 'negative'}`}>
              {overallAttendance >= 75 ? 'Good standing' : 'Below required'}
            </span>
          </div>
        </div>

        <div className="stat-card animated-card">
          <div className="stat-icon certificates">
            <Award size={24} />
          </div>
          <div className="stat-content">
            <h3>0</h3>
            <p>Certificates</p>
            <span className="stat-trend neutral">Upload your first certificate</span>
          </div>
        </div>

        <div className="stat-card animated-card">
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

      {/* Performance Chart */}
      <div className="performance-chart">
        <h3>Performance Overview</h3>
        <AnimatedBarChart 
          data={[
            { label: 'Attendance', value: overallAttendance, color: overallAttendance >= 75 ? '#10b981' : '#ef4444' },
            { label: 'CGPA', value: cgpa > 0 ? (cgpa / 10) * 100 : 0, color: cgpa >= 8 ? '#10b981' : cgpa >= 6 ? '#f59e0b' : '#ef4444' },
            { label: 'Assignments', value: 85, color: '#6366f1' },
            { label: 'Projects', value: 78, color: '#8b5cf6' }
          ]}
          height={200}
        />
      </div>

      {/* Today's Timetable */}
      <div className="todays-timetable">
        <h3>Today's Schedule</h3>
        {timetable.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'left' }}>Period</th>
                  <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'left' }}>Time</th>
                  <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'left' }}>Subject</th>
                  <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'left' }}>Staff</th>
                </tr>
              </thead>
              <tbody>
                {timetable.slice(0, 8).map((period, index) => (
                  <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa' }}>
                    <td style={{ padding: '12px', border: '1px solid #e1e8ed', fontWeight: '500' }}>{period.period_number}</td>
                    <td style={{ padding: '12px', border: '1px solid #e1e8ed' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Clock size={14} />
                        {period.start_time} - {period.end_time}
                      </div>
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #e1e8ed' }}>
                      <div>
                        <strong>{period.subject_code}</strong>
                        <br />
                        <small>{period.subject_name}</small>
                      </div>
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #e1e8ed' }}>{period.staff_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
            No timetable available
          </div>
        )}
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