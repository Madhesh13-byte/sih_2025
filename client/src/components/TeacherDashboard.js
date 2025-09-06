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
  FileText
} from 'lucide-react';
import './TeacherDashboard.css';

function TeacherDashboard({ user, logout }) {
  const [currentView, setCurrentView] = useState('grades');
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'info', message: 'New certificate uploaded by John Doe', time: '1 hour ago' }
  ]);

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
              className={`nav-item ${currentView === 'grades' ? 'active' : ''}`}
              onClick={() => setCurrentView('grades')}
            >
              <BookOpen size={20} /> Grades
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
            <button 
              className={`nav-item ${currentView === 'notifications' ? 'active' : ''}`}
              onClick={() => setCurrentView('notifications')}
            >
              <Bell size={20} /> Notifications
            </button>
          </nav>
        </aside>

        <main className="teacher-main">
          {currentView === 'grades' && <GradesSection />}
          {currentView === 'attendance' && <AttendanceSection />}
          {currentView === 'certificates' && <CertificatesSection />}
          {currentView === 'notifications' && <NotificationsSection notifications={notifications} />}
        </main>
      </div>
    </div>
  );
}

function GradesSection() {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [gradeType, setGradeType] = useState('');
  const [students, setStudents] = useState([
    { id: 1, name: 'John Doe', regNo: 'STUIT2601', grade: '' },
    { id: 2, name: 'Jane Smith', regNo: 'STUIT2602', grade: '' },
    { id: 3, name: 'Mike Johnson', regNo: 'STUIT2603', grade: '' }
  ]);

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
        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
          <option value="">Select Class</option>
          <option value="IT-3A">IT-3A</option>
          <option value="IT-3B">IT-3B</option>
          <option value="CS-3A">CS-3A</option>
        </select>
        
        <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
          <option value="">Select Subject</option>
          <option value="Data Structures">Data Structures</option>
          <option value="Database Systems">Database Systems</option>
          <option value="Web Development">Web Development</option>
        </select>
        
        <select value={gradeType} onChange={(e) => setGradeType(e.target.value)}>
          <option value="">Grade Type</option>
          <option value="Assignment">Assignment</option>
          <option value="Test">Test</option>
          <option value="Exam">Exam</option>
        </select>
      </div>

      {selectedClass && selectedSubject && gradeType && (
        <div className="grades-table">
          <h3>Enter Grades - {selectedSubject} ({gradeType})</h3>
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

function AttendanceSection() {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([
    { id: 1, name: 'John Doe', regNo: 'STUIT2601', present: false },
    { id: 2, name: 'Jane Smith', regNo: 'STUIT2602', present: false },
    { id: 3, name: 'Mike Johnson', regNo: 'STUIT2603', present: false }
  ]);

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
        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
          <option value="">Select Class</option>
          <option value="IT-3A">IT-3A</option>
          <option value="IT-3B">IT-3B</option>
          <option value="CS-3A">CS-3A</option>
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

      {selectedClass && (
        <div className="attendance-table">
          <h3>Mark Attendance - {selectedClass} ({selectedDate})</h3>
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