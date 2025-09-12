import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Upload, 
  TrendingUp, 
  Award, 
  AlertCircle,
  CheckCircle,
  Clock,
  BookOpen,
  Target,
  Bell
} from 'lucide-react';
import './StudentDashboard.css';

function StudentDashboard({ user, logout }) {
  const [currentView, setCurrentView] = useState('overview');
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'warning', message: 'Your attendance in Mathematics is below 75%', time: '2 hours ago' },
    { id: 2, type: 'success', message: 'Certificate "React Workshop" has been approved', time: '1 day ago' }
  ]);

  return (
    <div className="student-dashboard">
      <nav className="student-navbar">
        <h1>Smart Student Hub</h1>
        <div className="nav-right">
          <div className="notification-bell">
            <Bell size={20} />
            {notifications.length > 0 && <span className="notification-count">{notifications.length}</span>}
          </div>
          <span>Welcome, {user?.name}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </nav>

      <div className="student-layout">
        <aside className="student-sidebar">
          <div className="student-profile">
            <div className="profile-avatar">
              {user?.name?.charAt(0)}
            </div>
            <h3>{user?.name}</h3>
            <p>{user?.register_no}</p>
            <p>{user?.department}</p>
          </div>

          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${currentView === 'overview' ? 'active' : ''}`}
              onClick={() => setCurrentView('overview')}
            >
              <BarChart3 size={20} /> Overview
            </button>
            <button 
              className={`nav-item ${currentView === 'academic' ? 'active' : ''}`}
              onClick={() => setCurrentView('academic')}
            >
              <BookOpen size={20} /> Academic Performance
            </button>
            <button 
              className={`nav-item ${currentView === 'attendance' ? 'active' : ''}`}
              onClick={() => setCurrentView('attendance')}
            >
              <Calendar size={20} /> Attendance
            </button>
            <button 
              className={`nav-item ${currentView === 'certificates' ? 'active' : ''}`}
              onClick={() => setCurrentView('certificates')}
            >
              <Award size={20} /> Certificates
            </button>
          </nav>
        </aside>

        <main className="student-main">
          {currentView === 'overview' && <OverviewSection user={user} />}
          {currentView === 'academic' && <AcademicSection user={user} />}
          {currentView === 'attendance' && <AttendanceSection user={user} />}
          {currentView === 'certificates' && <CertificatesSection user={user} />}
        </main>
      </div>
    </div>
  );
}

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

function AcademicSection({ user }) {
  const [activeTab, setActiveTab] = useState('assignment');
  const [grades, setGrades] = useState({ assignments: [], ias: [], semesters: [] });
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrades();
  }, [selectedSemester, selectedYear]);

  const fetchGrades = async () => {
    try {
      let url = 'http://localhost:5000/api/student/grades';
      const params = new URLSearchParams();
      if (selectedSemester) params.append('semester', selectedSemester);
      if (selectedYear) params.append('academic_year', selectedYear);
      if (params.toString()) url += '?' + params.toString();
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setGrades(data);
      }
    } catch (error) {
      console.error('Failed to fetch grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderAssignmentTab = () => (
    <div className="grades-table">
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa' }}>
            <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'left' }}>Subject Code</th>
            <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'left' }}>Subject Name</th>
            <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>Assignment 1</th>
            <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>Assignment 2</th>
            <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>Assignment 3</th>
          </tr>
        </thead>
        <tbody>
          {grades.assignments.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
                No assignment marks available
              </td>
            </tr>
          ) : (
            grades.assignments.map((subject, index) => (
              <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa' }}>
                <td style={{ padding: '12px', border: '1px solid #e1e8ed', fontWeight: '500' }}>{subject.subject_code}</td>
                <td style={{ padding: '12px', border: '1px solid #e1e8ed' }}>{subject.subject_name}</td>
                <td style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>
                  {subject.assignment1 !== null ? `${subject.assignment1}/40` : '-'}
                </td>
                <td style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>
                  {subject.assignment2 !== null ? `${subject.assignment2}/40` : '-'}
                </td>
                <td style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>
                  {subject.assignment3 !== null ? `${subject.assignment3}/40` : '-'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const renderIATab = () => (
    <div className="grades-table">
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa' }}>
            <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'left' }}>Subject Code</th>
            <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'left' }}>Subject Name</th>
            <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>IA 1</th>
            <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>IA 2</th>
            <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>IA 3</th>
          </tr>
        </thead>
        <tbody>
          {grades.ias.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
                No IA marks available
              </td>
            </tr>
          ) : (
            grades.ias.map((subject, index) => (
              <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa' }}>
                <td style={{ padding: '12px', border: '1px solid #e1e8ed', fontWeight: '500' }}>{subject.subject_code}</td>
                <td style={{ padding: '12px', border: '1px solid #e1e8ed' }}>{subject.subject_name}</td>
                <td style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>
                  {subject.ia1 !== null ? `${subject.ia1}/50` : '-'}
                </td>
                <td style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>
                  {subject.ia2 !== null ? `${subject.ia2}/50` : '-'}
                </td>
                <td style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>
                  {subject.ia3 !== null ? `${subject.ia3}/50` : '-'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const renderSemesterTab = () => (
    <div className="grades-table">
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa' }}>
            <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'left' }}>Subject Code</th>
            <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'left' }}>Subject Name</th>
            <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>Semester Grade</th>
          </tr>
        </thead>
        <tbody>
          {grades.semesters.length === 0 ? (
            <tr>
              <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
                No semester grades available
              </td>
            </tr>
          ) : (
            grades.semesters.map((subject, index) => (
              <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa' }}>
                <td style={{ padding: '12px', border: '1px solid #e1e8ed', fontWeight: '500' }}>{subject.subject_code}</td>
                <td style={{ padding: '12px', border: '1px solid #e1e8ed' }}>{subject.subject_name}</td>
                <td style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>
                  {subject.grade ? (
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontWeight: '600',
                      backgroundColor: subject.grade.startsWith('O') ? '#d4edda' : 
                                     subject.grade.startsWith('A') ? '#cce5ff' :
                                     subject.grade.startsWith('B') ? '#fff3cd' :
                                     subject.grade.startsWith('C') ? '#ffeaa7' : '#f8d7da',
                      color: subject.grade.startsWith('O') ? '#155724' :
                             subject.grade.startsWith('A') ? '#004085' :
                             subject.grade.startsWith('B') ? '#856404' :
                             subject.grade.startsWith('C') ? '#b7791f' : '#721c24'
                    }}>
                      {subject.grade}
                    </span>
                  ) : '-'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading grades...</div>;
  }

  return (
    <div className="academic-section">
      <h2>Academic Performance</h2>
      
      <div className="semester-filters" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '20px' }}>
        <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
          <option value="">Current Semester</option>
          <option value="1">Semester 1</option>
          <option value="2">Semester 2</option>
          <option value="3">Semester 3</option>
          <option value="4">Semester 4</option>
          <option value="5">Semester 5</option>
          <option value="6">Semester 6</option>
          <option value="7">Semester 7</option>
          <option value="8">Semester 8</option>
        </select>
        
        <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
          <option value="">Current Year</option>
          <option value="2024">2024</option>
          <option value="2023">2023</option>
          <option value="2022">2022</option>
          <option value="2021">2021</option>
        </select>
      </div>
      
      <div className="grade-tabs" style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveTab('assignment')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'assignment' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'assignment' ? 'white' : '#6c757d',
            border: '1px solid #e1e8ed',
            borderRadius: '6px 0 0 6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Assignments
        </button>
        <button 
          onClick={() => setActiveTab('ia')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'ia' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'ia' ? 'white' : '#6c757d',
            border: '1px solid #e1e8ed',
            borderLeft: 'none',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          IA
        </button>
        <button 
          onClick={() => setActiveTab('semester')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'semester' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'semester' ? 'white' : '#6c757d',
            border: '1px solid #e1e8ed',
            borderLeft: 'none',
            borderRadius: '0 6px 6px 0',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Semester
        </button>
      </div>

      <div className="grade-content">
        {activeTab === 'assignment' && renderAssignmentTab()}
        {activeTab === 'ia' && renderIATab()}
        {activeTab === 'semester' && renderSemesterTab()}
      </div>
    </div>
  );
}

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

export default StudentDashboard;