import React, { useState, useEffect, useRef } from 'react';
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
  Home,
  Clock
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
  const [gradeCategory, setGradeCategory] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [students, setStudents] = useState([]);
  const inputRefs = useRef([]);
  
  const fetchStudents = async (assignmentId) => {
    try {
      const url = academicYear ? 
        `http://localhost:5000/api/staff/students/${assignmentId}?academic_year=${academicYear}` :
        `http://localhost:5000/api/staff/students/${assignmentId}`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students.map(student => ({
          id: student.id,
          name: student.name,
          regNo: student.register_no,
          section: student.section,
          marks: ''
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
  }, [selectedAssignment, academicYear]);

  const handleMarksChange = (studentId, marks, currentIndex) => {
    const maxMarks = getMaxMarks();
    if (marks && parseFloat(marks) > maxMarks) {
      alert(`Invalid marks! Maximum allowed is ${maxMarks}`);
      return;
    }
    setStudents(students.map(student => 
      student.id === studentId ? { ...student, marks } : student
    ));
    
    // Auto-advance to next input if 2 digits entered and not last input
    if (marks && marks.length === 2 && currentIndex < students.length - 1) {
      setTimeout(() => {
        inputRefs.current[currentIndex + 1]?.focus();
      }, 50);
    }
  };

  const saveGrades = async () => {
    if (!selectedAssignment || !gradeType) {
      alert('Please fill all required fields');
      return;
    }

    const assignment = assignments.find(a => a.id.toString() === selectedAssignment);
    const maxMarks = getMaxMarks();
    
    try {
      const response = await fetch('http://localhost:5000/api/staff/grades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          students: students.map(s => ({ 
            id: s.id, 
            marks: gradeType === 'Semester' ? null : parseFloat(s.marks) || 0,
            grade: gradeType === 'Semester' ? s.marks : null
          })),
          subject_code: assignment?.subject_code,
          subject_name: assignment?.subject_name,
          semester: assignment?.semester,
          grade_type: gradeType,
          academic_year: new Date().getFullYear().toString()
        })
      });

      if (response.ok) {
        alert('Grades saved successfully!');
      } else {
        alert('Failed to save grades');
      }
    } catch (error) {
      console.error('Error saving grades:', error);
      alert('Error saving grades');
    }
  };

  const getCategoryOptions = () => {
    if (gradeType === 'Assignment') {
      return ['Assignment 1', 'Assignment 2', 'Assignment 3'];
    } else if (gradeType === 'IA') {
      return ['IA 1', 'IA 2', 'IA 3'];
    } else if (gradeType === 'Semester') {
      return ['Semester Exam'];
    }
    return [];
  };

  const getMaxMarks = () => {
    if (gradeType === 'Assignment') return 40;
    if (gradeType === 'IA1' || gradeType === 'IA2' || gradeType === 'IA3') return 50;
    if (gradeType === 'Semester') return 'Grade';
    return 50;
  };

  const getGradeOptions = () => {
    return ['O', 'A+', 'A', 'B+', 'B', 'C', 'RA', 'Ab'];
  };

  return (
    <div className="grades-section">
      <h2>Grade Management</h2>
      
      <div className="grade-filters" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '20px' }}>
        <select value={selectedAssignment} onChange={(e) => setSelectedAssignment(e.target.value)}>
          <option value="">Select Subject Assignment</option>
          {assignments.map(assignment => (
            <option key={assignment.id} value={assignment.id}>
              {assignment.subject_code} - {assignment.department} {assignment.year}
            </option>
          ))}
        </select>
        
        <select value={gradeType} onChange={(e) => setGradeType(e.target.value)}>
          <option value="">Select Grade Type</option>
          <option value="IA1">IA 1 (50 marks)</option>
          <option value="IA2">IA 2 (50 marks)</option>
          <option value="IA3">IA 3 (50 marks)</option>
          <option value="Semester">Semester Grade</option>
        </select>
      </div>

      {selectedAssignment && gradeType && (
        <div className="grades-table">
          <h3>Enter {gradeType === 'Semester' ? 'Grades' : 'Marks'} - {assignments.find(a => a.id.toString() === selectedAssignment)?.subject_code} ({gradeType}) - Max: {getMaxMarks()}</h3>
          <table>
            <thead>
              <tr>
                <th>Register No</th>
                <th>Student Name</th>
                <th>{gradeType === 'Semester' ? 'Grade' : `Marks (out of ${getMaxMarks()})`}</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.id}>
                  <td>{student.regNo}</td>
                  <td>{student.name}</td>
                  <td>
                    {gradeType === 'Semester' ? (
                      <select
                        value={student.marks}
                        onChange={(e) => handleMarksChange(student.id, e.target.value, index)}
                        style={{ width: '100px' }}
                      >
                        <option value="">Select Grade</option>
                        {getGradeOptions().map(grade => (
                          <option key={grade} value={grade}>{grade}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        ref={(el) => inputRefs.current[index] = el}
                        type="number"
                        min="0"
                        max={getMaxMarks()}
                        value={student.marks}
                        onChange={(e) => handleMarksChange(student.id, e.target.value, index)}
                        placeholder="0"
                        style={{ width: '80px' }}
                        className="no-spinner"
                      />
                    )}
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
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [students, setStudents] = useState([]);
  const [availablePeriods, setAvailablePeriods] = useState([]);
  const [academicYear, setAcademicYear] = useState('');
  
  const fetchStudents = async (assignmentId) => {
    console.log('Fetching students for assignment:', assignmentId);
    try {
      const response = await fetch(`http://localhost:5000/api/staff/students/${assignmentId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('Students API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Students data received:', data);
        
        if (data.students && data.students.length > 0) {
          setStudents(data.students.map(student => ({
            id: student.id,
            name: student.name,
            regNo: student.register_no,
            section: student.section,
            present: false
          })));
        } else {
          console.log('No students found in response');
          setStudents([]);
        }
      } else {
        console.error('Failed to fetch students, response not ok:', response.status);
        setStudents([]);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
      setStudents([]);
    }
  };
  
  const fetchTimetablePeriods = async (assignmentId) => {
    try {
      const assignment = assignments.find(a => a.id.toString() === assignmentId);
      if (!assignment) return;
      
      const response = await fetch(`http://localhost:5000/api/timetables?department=${assignment.department}&year=${assignment.year}&semester=${assignment.semester}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const timetables = await response.json();
        const subjectPeriods = timetables.filter(t => 
          t.subject_code === assignment.subject_code
        );
        
        console.log('Assignment subject_code:', assignment.subject_code);
        console.log('All timetable subject codes:', timetables.map(t => t.subject_code));
        console.log('Exact match found:', timetables.some(t => t.subject_code === assignment.subject_code));
        console.log('Filtered subject periods:', subjectPeriods);
        
        const dayOrders = ['I', 'II', 'III', 'IV', 'V'];
        const periods = [
          { number: 1, start: '09:15', end: '10:05' },
          { number: 2, start: '10:05', end: '10:55' },
          { number: 3, start: '11:05', end: '11:55' },
          { number: 4, start: '11:55', end: '12:45' },
          { number: 5, start: '13:25', end: '14:10' },
          { number: 6, start: '14:10', end: '15:05' },
          { number: 7, start: '15:15', end: '16:00' },
          { number: 8, start: '16:00', end: '16:45' }
        ];
        
        const formattedPeriods = subjectPeriods
          .filter(sp => sp.period_number >= 1 && sp.period_number <= 8 && sp.day_of_week >= 0 && sp.day_of_week <= 4)
          .map(sp => {
            const periodInfo = periods[sp.period_number - 1];
            return {
              id: `${sp.day_of_week}-${sp.period_number}`,
              dayOrder: dayOrders[sp.day_of_week],
              period: sp.period_number,
              time: `${periodInfo.start}-${periodInfo.end}`,
              dayOfWeek: sp.day_of_week,
              periodNumber: sp.period_number
            };
          });
        
        setAvailablePeriods(formattedPeriods);
      }
    } catch (error) {
      console.error('Failed to fetch timetable periods:', error);
    }
  };
  
  const calculateDateForDayOrder = (dayOrder) => {
    // Simple mapping: Day I = Monday, Day II = Tuesday, etc.
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayOrderMap = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5 };
    const targetDay = dayOrderMap[dayOrder];
    
    // Calculate days to add/subtract to get to target day
    let daysToAdd = targetDay - currentDay;
    if (daysToAdd <= 0) daysToAdd += 7; // Next occurrence
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysToAdd);
    
    return targetDate.toISOString().split('T')[0];
  };
  
  const handlePeriodChange = (periodId) => {
    setSelectedPeriod(periodId);
    const selectedPeriodData = availablePeriods.find(p => p.id === periodId);
    if (selectedPeriodData) {
      const newDate = calculateDateForDayOrder(selectedPeriodData.dayOrder);
      setSelectedDate(newDate);
    }
  };
  
  useEffect(() => {
    if (selectedAssignment) {
      fetchStudents(selectedAssignment);
      fetchTimetablePeriods(selectedAssignment);
    }
  }, [selectedAssignment]);

  const handleAttendanceChange = (studentId, present) => {
    setStudents(students.map(student => 
      student.id === studentId ? { ...student, present } : student
    ));
  };

  const saveAttendance = async () => {
    if (!selectedAssignment || !selectedPeriod) return;

    const assignment = assignments.find(a => a.id.toString() === selectedAssignment);
    const period = availablePeriods.find(p => p.id === selectedPeriod);
    
    console.log('Saving attendance for:', {
      assignment: assignment?.subject_code,
      students: students.length,
      period: period?.dayOfWeek + '-' + period?.periodNumber
    });

    try {
      const response = await fetch('http://localhost:5000/api/staff/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          students: students.map(s => ({ id: s.id, status: s.present ? 'present' : 'absent' })),
          subject_code: assignment?.subject_code,
          department: assignment?.department,
          year: assignment?.year,
          semester: assignment?.semester,
          day_of_week: period?.dayOfWeek,
          period_number: period?.periodNumber,
          academic_year: new Date().getFullYear().toString()
        })
      });

      if (response.ok) {
        alert('Attendance saved successfully!');
        console.log('Attendance saved for', students.length, 'students');
      } else {
        console.error('Failed to save attendance:', response.status);
        alert('Failed to save attendance');
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Error saving attendance');
    }
  };

  const markAllPresent = () => {
    setStudents(students.map(student => ({ ...student, present: true })));
  };

  return (
    <div className="attendance-section">
      <h2>Attendance Management</h2>
      
      <div className="attendance-filters" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' }}>
        <select value={selectedAssignment} onChange={(e) => setSelectedAssignment(e.target.value)}>
          <option value="">Select Subject Assignment</option>
          {assignments.map(assignment => (
            <option key={assignment.id} value={assignment.id}>
              {assignment.subject_code} - {assignment.department} {assignment.year}
            </option>
          ))}
        </select>
        
        <select value={selectedPeriod} onChange={(e) => handlePeriodChange(e.target.value)}>
          <option value="">Select Period</option>
          {availablePeriods.length > 0 ? (
            availablePeriods.map(period => (
              <option key={period.id} value={period.id}>
                Day {period.dayOrder} - Period {period.period} ({period.time})
              </option>
            ))
          ) : (
            <option disabled>No periods scheduled for this subject</option>
          )}
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

      {selectedAssignment && selectedPeriod && (
        <div className="attendance-table">
          <h3>Mark Attendance - {assignments.find(a => a.id.toString() === selectedAssignment)?.subject_code} (Day {availablePeriods.find(p => p.id === selectedPeriod)?.dayOrder} P{availablePeriods.find(p => p.id === selectedPeriod)?.period} - {selectedDate})</h3>
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