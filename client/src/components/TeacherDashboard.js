import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Calendar, 
  Award, 
  Bell, 
  Upload,
  Check,
  X,
  Edit,
  Save,
  Users,
  FileText,
  Home
} from 'lucide-react';
import './TeacherDashboard.css';

function TeacherDashboard({ user, logout }) {
  const [currentView, setCurrentView] = useState('overview');
  const [assignments, setAssignments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    fetchStaffAssignments();
  }, []);
  
  const fetchStaffAssignments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/staff-assignments', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        const myAssignments = data.filter(assignment => assignment.staff_id === user?.staff_id);
        setAssignments(myAssignments);
      }
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    }
  };

  return (
    <div className="teacher-dashboard">
      <nav className="teacher-navbar">
        <h1>Teacher Portal</h1>
        <div className="nav-right">
          <div className="notification-bell">
            <Bell size={20} />
            {notifications.length > 0 && <span className="notification-count">{notifications.length}</span>}
          </div>
          <span>Welcome, {user?.name}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </nav>

      <div className="teacher-layout">
        <aside className="teacher-sidebar">
          <div className="teacher-profile">
            <div className="profile-avatar">
              {user?.name?.charAt(0)}
            </div>
            <h3>{user?.name}</h3>
            <p>{user?.staff_id}</p>
            <p>{user?.department}</p>
          </div>

          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${currentView === 'overview' ? 'active' : ''}`}
              onClick={() => setCurrentView('overview')}
            >
              <Home size={20} /> Overview
            </button>
            <button 
              className={`nav-item ${currentView === 'assignments' ? 'active' : ''}`}
              onClick={() => setCurrentView('assignments')}
            >
              <BookOpen size={20} /> My Assignments
            </button>
            <button 
              className={`nav-item ${currentView === 'grades' ? 'active' : ''}`}
              onClick={() => setCurrentView('grades')}
            >
              <Award size={20} /> Grades
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
              <FileText size={20} /> Certificates
            </button>
          </nav>
        </aside>

        <main className="teacher-main">
          {currentView === 'overview' && <OverviewSection user={user} assignments={assignments} />}
          {currentView === 'assignments' && <AssignmentsSection assignments={assignments} />}
          {currentView === 'grades' && <GradesSection assignments={assignments} />}
          {currentView === 'attendance' && <AttendanceSection assignments={assignments} />}
          {currentView === 'certificates' && <CertificatesSection />}
        </main>
      </div>
    </div>
  );
}

function OverviewSection({ user, assignments }) {
  return (
    <div className="overview-section">
      <h2>Welcome back, {user?.name}!</h2>
      
      <div className="overview-stats">
        <div className="stat-card">
          <div className="stat-icon subjects">
            <BookOpen size={24} />
          </div>
          <div className="stat-content">
            <h3>{assignments.length}</h3>
            <p>Subjects Assigned</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon classes">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>{new Set(assignments.map(a => `${a.department}-${a.year}`)).size}</h3>
            <p>Classes Teaching</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon semesters">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <h3>{new Set(assignments.map(a => a.semester)).size}</h3>
            <p>Active Semesters</p>
          </div>
        </div>
      </div>
      
      <div className="recent-assignments">
        <h3>Your Current Assignments</h3>
        <div className="assignments-grid">
          {assignments.map(assignment => (
            <div key={assignment.id} className="assignment-card">
              <h4>{assignment.subject_name}</h4>
              <p><strong>Code:</strong> {assignment.subject_code}</p>
              <p><strong>Class:</strong> {assignment.department} {assignment.year}</p>
              <p><strong>Semester:</strong> {assignment.semester}</p>
            </div>
          ))}
        </div>
        
        {assignments.length === 0 && (
          <div className="empty-state">
            <BookOpen size={48} />
            <h3>No Assignments Yet</h3>
            <p>Contact admin to get subject assignments</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AssignmentsSection({ assignments }) {
  return (
    <div className="assignments-section">
      <h2>My Subject Assignments</h2>
      
      <div className="assignments-table">
        <table>
          <thead>
            <tr>
              <th>Subject Code</th>
              <th>Subject Name</th>
              <th>Department</th>
              <th>Year</th>
              <th>Semester</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map(assignment => (
              <tr key={assignment.id}>
                <td>{assignment.subject_code}</td>
                <td>{assignment.subject_name}</td>
                <td>{assignment.department}</td>
                <td>{assignment.year}</td>
                <td>{assignment.semester}</td>
                <td><span className="status active">Active</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {assignments.length === 0 && (
          <div className="empty-state">
            <BookOpen size={48} />
            <h3>No Subject Assignments</h3>
            <p>You haven't been assigned any subjects yet. Contact your admin.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function GradesSection({ assignments }) {
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [gradeType, setGradeType] = useState('');
  const [students, setStudents] = useState([]);
  
  const fetchStudents = async (assignmentId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/staff/students/${assignmentId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students.map(student => ({
          id: student.id,
          name: student.name,
          regNo: student.register_no,
          section: student.section,
          grade: ''
        })));
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
      setStudents([]);
    }
  };
  
  useEffect(() => {
    if (selectedAssignment) {
      fetchStudents(selectedAssignment);
    }
  }, [selectedAssignment]);

  const handleGradeChange = (studentId, grade) => {
    setStudents(students.map(student => 
      student.id === studentId ? { ...student, grade } : student
    ));
  };

  const saveGrades = () => {
    console.log('Saving grades:', students);
    alert('Grades saved successfully!');
  };

  return (
    <div className="grades-section">
      <h2>Grade Management</h2>
      
      <div className="grade-filters">
        <select value={selectedAssignment} onChange={(e) => setSelectedAssignment(e.target.value)}>
          <option value="">Select Subject Assignment</option>
          {assignments.map(assignment => (
            <option key={assignment.id} value={assignment.id}>
              {assignment.subject_name} - {assignment.department} {assignment.year}
            </option>
          ))}
        </select>
        
        <select value={gradeType} onChange={(e) => setGradeType(e.target.value)}>
          <option value="">Grade Type</option>
          <option value="Assignment">Assignment</option>
          <option value="Test">Test</option>
          <option value="Exam">Exam</option>
        </select>
      </div>

      {selectedAssignment && gradeType && (
        <div className="grades-table">
          <h3>Enter Grades - {assignments.find(a => a.id.toString() === selectedAssignment)?.subject_name} ({gradeType})</h3>
          <table>
            <thead>
              <tr>
                <th>Register No</th>
                <th>Student Name</th>
                <th>Grade/Marks</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id}>
                  <td>{student.regNo}</td>
                  <td>{student.name}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={student.grade}
                      onChange={(e) => handleGradeChange(student.id, e.target.value)}
                      placeholder="Enter marks"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="save-btn" onClick={saveGrades}>
            <Save size={16} /> Save Grades
          </button>
        </div>
      )}
    </div>
  );
}

function AttendanceSection({ assignments }) {
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  
  const fetchStudents = async (assignmentId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/staff/students/${assignmentId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students.map(student => ({
          id: student.id,
          name: student.name,
          regNo: student.register_no,
          section: student.section,
          present: false
        })));
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
      setStudents([]);
    }
  };
  
  useEffect(() => {
    if (selectedAssignment) {
      fetchStudents(selectedAssignment);
    }
  }, [selectedAssignment]);

  const handleAttendanceChange = (studentId, present) => {
    setStudents(students.map(student => 
      student.id === studentId ? { ...student, present } : student
    ));
  };

  const saveAttendance = () => {
    console.log('Saving attendance:', students);
    alert('Attendance saved successfully!');
  };

  const markAllPresent = () => {
    setStudents(students.map(student => ({ ...student, present: true })));
  };

  return (
    <div className="attendance-section">
      <h2>Attendance Management</h2>
      
      <div className="attendance-filters">
        <select value={selectedAssignment} onChange={(e) => setSelectedAssignment(e.target.value)}>
          <option value="">Select Subject Assignment</option>
          {assignments.map(assignment => (
            <option key={assignment.id} value={assignment.id}>
              {assignment.subject_name} - {assignment.department} {assignment.year}
            </option>
          ))}
        </select>
        
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        
        <button className="mark-all-btn" onClick={markAllPresent}>
          <Users size={16} /> Mark All Present
        </button>
      </div>

      {selectedAssignment && (
        <div className="attendance-table">
          <h3>Mark Attendance - {assignments.find(a => a.id.toString() === selectedAssignment)?.subject_name} ({selectedDate})</h3>
          <table>
            <thead>
              <tr>
                <th>Register No</th>
                <th>Student Name</th>
                <th>Present</th>
                <th>Absent</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id}>
                  <td>{student.regNo}</td>
                  <td>{student.name}</td>
                  <td>
                    <input
                      type="radio"
                      name={`attendance-${student.id}`}
                      checked={student.present === true}
                      onChange={() => handleAttendanceChange(student.id, true)}
                    />
                  </td>
                  <td>
                    <input
                      type="radio"
                      name={`attendance-${student.id}`}
                      checked={student.present === false}
                      onChange={() => handleAttendanceChange(student.id, false)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="save-btn" onClick={saveAttendance}>
            <Save size={16} /> Save Attendance
          </button>
        </div>
      )}
    </div>
  );
}

function CertificatesSection() {
  const [certificates, setCertificates] = useState([
    { 
      id: 1, 
      studentName: 'John Doe', 
      regNo: 'STUIT2601',
      certificateName: 'React Workshop Certificate', 
      category: 'Technical', 
      status: 'pending',
      uploadDate: '2024-01-15',
      fileUrl: '#'
    },
    { 
      id: 2, 
      studentName: 'Jane Smith', 
      regNo: 'STUIT2602',
      certificateName: 'Basketball Tournament', 
      category: 'Sports', 
      status: 'pending',
      uploadDate: '2024-01-16',
      fileUrl: '#'
    }
  ]);

  const [remarks, setRemarks] = useState({});

  const handleApproval = (certId, status) => {
    setCertificates(certificates.map(cert => 
      cert.id === certId ? { ...cert, status } : cert
    ));
    
    const remark = remarks[certId] || '';
    console.log(`Certificate ${certId} ${status} with remark: ${remark}`);
    alert(`Certificate ${status} successfully!`);
  };

  const handleRemarkChange = (certId, remark) => {
    setRemarks({ ...remarks, [certId]: remark });
  };

  return (
    <div className="certificates-section">
      <h2>Certificate Approval</h2>
      
      <div className="certificates-list">
        {certificates.map(cert => (
          <div key={cert.id} className="certificate-card">
            <div className="cert-info">
              <h4>{cert.certificateName}</h4>
              <p><strong>Student:</strong> {cert.studentName} ({cert.regNo})</p>
              <p><strong>Category:</strong> {cert.category}</p>
              <p><strong>Upload Date:</strong> {cert.uploadDate}</p>
              <p><strong>Status:</strong> 
                <span className={`status ${cert.status}`}>{cert.status}</span>
              </p>
            </div>
            
            <div className="cert-actions">
              <a href={cert.fileUrl} target="_blank" rel="noopener noreferrer" className="view-btn">
                <FileText size={16} /> View Certificate
              </a>
              
              <textarea
                placeholder="Add remarks (optional)"
                value={remarks[cert.id] || ''}
                onChange={(e) => handleRemarkChange(cert.id, e.target.value)}
                rows="2"
              />
              
              {cert.status === 'pending' && (
                <div className="approval-buttons">
                  <button 
                    className="approve-btn"
                    onClick={() => handleApproval(cert.id, 'approved')}
                  >
                    <Check size={16} /> Approve
                  </button>
                  <button 
                    className="reject-btn"
                    onClick={() => handleApproval(cert.id, 'rejected')}
                  >
                    <X size={16} /> Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationsSection({ notifications }) {
  return (
    <div className="notifications-section">
      <h2>Notifications</h2>
      
      <div className="notifications-list">
        {notifications.map(notification => (
          <div key={notification.id} className={`notification-item ${notification.type}`}>
            <div className="notification-content">
              <p>{notification.message}</p>
              <span className="notification-time">{notification.time}</span>
            </div>
          </div>
        ))}
        
        {notifications.length === 0 && (
          <div className="empty-state">
            <Bell size={48} />
            <h3>No Notifications</h3>
            <p>You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherDashboard;