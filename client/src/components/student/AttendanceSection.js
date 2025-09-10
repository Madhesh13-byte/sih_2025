import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Award, Target, Upload, BarChart3 } from 'lucide-react';
import './StudentDashboard.css';
function AttendanceSection({ user }) {
  const [attendanceData, setAttendanceData] = useState([]);
  const [overallStats, setOverallStats] = useState({ total: 0, present: 0, missed: 0, percentage: 0 });
  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjectRecords, setSubjectRecords] = useState([]);
  const [viewMode, setViewMode] = useState('summary'); // 'summary' or 'table'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/student/attendance', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAttendanceData(data.subjects);
        setOverallStats(data.overall);
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectSelect = (subjectCode) => {
    setSelectedSubject(subjectCode);
    const subject = attendanceData.find(s => s.subject_code === subjectCode);
    if (subject) {
      setSubjectRecords(subject.records);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN');
  };

  const getDayOrder = (dayOfWeek) => {
    const days = ['I', 'II', 'III', 'IV', 'V'];
    return days[dayOfWeek] || dayOfWeek;
  };

  const getAttendanceStatus = (percentage) => {
    if (percentage >= 85) return 'excellent';
    if (percentage >= 75) return 'good';
    if (percentage >= 65) return 'warning';
    return 'critical';
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading attendance...</div>;
  }

  return (
    <div className="attendance-section">
      <h2>Attendance Records</h2>
      
      <div className="attendance-overview">
        <div className="overall-attendance">
          <div className="attendance-circle">
            <span className="percentage">{overallStats.percentage}%</span>
            <span className="label">Overall</span>
          </div>
          <div className="attendance-info">
            <p>Total Classes: {overallStats.total}</p>
            <p>Attended: {overallStats.present}</p>
            <p>Missed: {overallStats.missed}</p>
          </div>
        </div>

        <div className="attendance-prediction">
          <h3>Attendance Status</h3>
          <div className="prediction-card">
            <Calendar size={20} />
            <div>
              {overallStats.percentage >= 75 ? (
                <>
                  <p><strong>Good Standing</strong></p>
                  <p>Your attendance is above the required 75%</p>
                </>
              ) : overallStats.percentage >= 65 ? (
                <>
                  <p><strong>Warning</strong></p>
                  <p>Your attendance is below 75%. Attend more classes.</p>
                </>
              ) : (
                <>
                  <p><strong>Critical</strong></p>
                  <p>Your attendance is critically low. Contact your advisor.</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="subject-attendance">
        <h3>Subject-wise Attendance</h3>
        <div className="attendance-list">
          {attendanceData.length === 0 ? (
            <div className="empty-state">
              <Calendar size={48} />
              <h3>No Attendance Records</h3>
              <p>Subject-wise attendance will be tracked here once classes begin</p>
            </div>
          ) : (
            attendanceData.map((subject, index) => (
              <div 
                key={index} 
                className={`attendance-item ${selectedSubject === subject.subject_code ? 'selected' : ''}`}
                onClick={() => handleSubjectSelect(subject.subject_code)}
                style={{ cursor: 'pointer' }}
              >
                <div className="subject-info">
                  <span className="subject-name">{subject.subject_name}</span>
                  <span className="attendance-ratio">{subject.present}/{subject.total}</span>
                </div>
                <div className="attendance-bar">
                  <div 
                    className={`bar-fill ${getAttendanceStatus(subject.percentage)}`}
                    style={{ width: `${subject.percentage}%` }}
                  ></div>
                </div>
                <span className={`percentage ${getAttendanceStatus(subject.percentage)}`}>
                  {subject.percentage}%
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* View Mode Toggle */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={() => setViewMode('summary')}
          style={{
            padding: '8px 16px',
            backgroundColor: viewMode === 'summary' ? '#007bff' : '#f8f9fa',
            color: viewMode === 'summary' ? 'white' : '#6c757d',
            border: '1px solid #e1e8ed',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Summary View
        </button>
        <button 
          onClick={() => setViewMode('table')}
          style={{
            padding: '8px 16px',
            backgroundColor: viewMode === 'table' ? '#007bff' : '#f8f9fa',
            color: viewMode === 'table' ? 'white' : '#6c757d',
            border: '1px solid #e1e8ed',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Table View
        </button>
      </div>

      {viewMode === 'table' ? (
        <div className="attendance-table-view">
          <h3>Subject-wise Attendance Table</h3>
          {attendanceData.length === 0 ? (
            <div className="empty-state">
              <Calendar size={48} />
              <h3>No Attendance Records</h3>
              <p>Attendance records will appear here once classes begin</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'left' }}>Subject</th>
                    <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>Total Classes</th>
                    <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>Present</th>
                    <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>Absent</th>
                    <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>Percentage</th>
                    <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.map((subject, index) => (
                    <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa' }}>
                      <td style={{ padding: '12px', border: '1px solid #e1e8ed', fontWeight: '500' }}>
                        {subject.subject_name}
                        <div style={{ fontSize: '12px', color: '#6c757d' }}>{subject.subject_code}</div>
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>{subject.total}</td>
                      <td style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center', color: '#28a745' }}>{subject.present}</td>
                      <td style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center', color: '#dc3545' }}>{subject.total - subject.present}</td>
                      <td style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center', fontWeight: '600' }}>{subject.percentage}%</td>
                      <td style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: subject.percentage >= 75 ? '#d4edda' : subject.percentage >= 65 ? '#fff3cd' : '#f8d7da',
                          color: subject.percentage >= 75 ? '#155724' : subject.percentage >= 65 ? '#856404' : '#721c24'
                        }}>
                          {subject.percentage >= 75 ? 'Good' : subject.percentage >= 65 ? 'Warning' : 'Critical'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <>
          {selectedSubject && (
            <div className="subject-details">
              <h3>Detailed Records - {attendanceData.find(s => s.subject_code === selectedSubject)?.subject_name}</h3>
              <div className="records-table">
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                      <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'left' }}>Date</th>
                      <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'left' }}>Day Order</th>
                      <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'left' }}>Period</th>
                      <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'left' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjectRecords.map((record, index) => (
                      <tr key={index}>
                        <td style={{ padding: '12px', border: '1px solid #e1e8ed' }}>{formatDate(record.date)}</td>
                        <td style={{ padding: '12px', border: '1px solid #e1e8ed' }}>Day {getDayOrder(record.day_of_week)}</td>
                        <td style={{ padding: '12px', border: '1px solid #e1e8ed' }}>Period {record.period_number}</td>
                        <td style={{ padding: '12px', border: '1px solid #e1e8ed' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor: record.status === 'present' ? '#d4edda' : '#f8d7da',
                            color: record.status === 'present' ? '#155724' : '#721c24'
                          }}>
                            {record.status === 'present' ? 'Present' : 'Absent'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
export default AttendanceSection;