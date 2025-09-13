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
  Clock,
  CheckCircle,
  Download
} from 'lucide-react';
import OfficialPortfolio from './OfficialPortfolio';
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
      organization: 'Tech Academy',
      issueDate: '2024-01-10',
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
      organization: 'Sports Club',
      issueDate: '2024-01-12',
      category: 'Sports', 
      status: 'pending',
      uploadDate: '2024-01-16',
      fileUrl: '#'
    },
    { 
      id: 3, 
      studentName: 'Mike Johnson', 
      regNo: 'STUIT2603',
      certificateName: 'Python Certification', 
      organization: 'CodeAcademy',
      issueDate: '2024-01-08',
      category: 'Technical', 
      status: 'approved',
      uploadDate: '2024-01-14',
      fileUrl: '#'
    }
  ]);

  const [filteredCertificates, setFilteredCertificates] = useState(certificates);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('uploadDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showPreview, setShowPreview] = useState(false);
  const [previewCert, setPreviewCert] = useState(null);
  const [remarks, setRemarks] = useState({});
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Filter and sort certificates
  useEffect(() => {
    let filtered = certificates;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(cert => cert.status === statusFilter);
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(cert => cert.category === categoryFilter);
    }
    
    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(cert => 
        cert.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.certificateName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'uploadDate' || sortBy === 'issueDate') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    setFilteredCertificates(filtered);
  }, [certificates, statusFilter, categoryFilter, searchTerm, sortBy, sortOrder]);

  const handleApproval = (certId, status) => {
    setCertificates(certificates.map(cert => 
      cert.id === certId ? { ...cert, status } : cert
    ));
    
    const remark = remarks[certId] || '';
    console.log(`Certificate ${certId} ${status} with remark: ${remark}`);
    
    // Show success message
    const message = status === 'approved' ? 'Certificate approved successfully!' : 'Certificate rejected successfully!';
    alert(message);
  };

  const handleRemarkChange = (certId, remark) => {
    setRemarks({ ...remarks, [certId]: remark });
  };

  const openPreview = (cert) => {
    setPreviewCert(cert);
    setShowPreview(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#28a745';
      case 'rejected': return '#dc3545';
      case 'pending': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const pendingCount = certificates.filter(c => c.status === 'pending').length;
  const approvedToday = certificates.filter(c => 
    c.status === 'approved' && 
    new Date(c.uploadDate).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="certificates-section">
      <h2>Certificate Approval Panel</h2>
      
      {/* Generate Portfolio Button */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => setShowPortfolio(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 16px rgba(30, 58, 138, 0.4)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(30, 58, 138, 0.3)';
          }}
        >
          <Download size={16} />
          Generate Portfolio
        </button>
      </div>

      {/* Dashboard Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div style={{ padding: '20px', backgroundColor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock style={{ color: '#856404' }} size={24} />
            <div>
              <h3 style={{ margin: 0, color: '#856404' }}>{pendingCount}</h3>
              <p style={{ margin: 0, color: '#856404', fontSize: '14px' }}>Pending Certificates</p>
            </div>
          </div>
        </div>
        
        <div style={{ padding: '20px', backgroundColor: '#d4edda', borderRadius: '8px', border: '1px solid #c3e6cb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle style={{ color: '#155724' }} size={24} />
            <div>
              <h3 style={{ margin: 0, color: '#155724' }}>{approvedToday}</h3>
              <p style={{ margin: 0, color: '#155724', fontSize: '14px' }}>Approved Today</p>
            </div>
          </div>
        </div>
        
        <div style={{ padding: '20px', backgroundColor: '#e2e3e5', borderRadius: '8px', border: '1px solid #d6d8db' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText style={{ color: '#383d41' }} size={24} />
            <div>
              <h3 style={{ margin: 0, color: '#383d41' }}>{certificates.length}</h3>
              <p style={{ margin: 0, color: '#383d41', fontSize: '14px' }}>Total Submissions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(5, 1fr)', 
        gap: '15px', 
        marginBottom: '20px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <input
          type="text"
          placeholder="Search students or certificates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
        
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px' }}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        
        <select 
          value={categoryFilter} 
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px' }}
        >
          <option value="all">All Categories</option>
          <option value="Technical">Technical</option>
          <option value="Sports">Sports</option>
          <option value="Cultural">Cultural</option>
          <option value="Volunteer">Volunteer</option>
        </select>
        
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px' }}
        >
          <option value="uploadDate">Sort by Upload Date</option>
          <option value="studentName">Sort by Student Name</option>
          <option value="certificateName">Sort by Certificate</option>
          <option value="issueDate">Sort by Issue Date</option>
        </select>
        
        <select 
          value={sortOrder} 
          onChange={(e) => setSortOrder(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px' }}
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>

      {/* Certificates Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f8f9fa' }}>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #e1e8ed', fontWeight: '600' }}>Student</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #e1e8ed', fontWeight: '600' }}>Certificate</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #e1e8ed', fontWeight: '600' }}>Organization</th>
              <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #e1e8ed', fontWeight: '600' }}>Upload Date</th>
              <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #e1e8ed', fontWeight: '600' }}>Status</th>
              <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #e1e8ed', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCertificates.map((cert, index) => (
              <tr key={cert.id} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa' }}>
                <td style={{ padding: '15px', borderBottom: '1px solid #e1e8ed' }}>
                  <div>
                    <div style={{ fontWeight: '500' }}>{cert.studentName}</div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>{cert.regNo}</div>
                  </div>
                </td>
                <td style={{ padding: '15px', borderBottom: '1px solid #e1e8ed' }}>
                  <div>
                    <div style={{ fontWeight: '500' }}>{cert.certificateName}</div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>{cert.category}</div>
                  </div>
                </td>
                <td style={{ padding: '15px', borderBottom: '1px solid #e1e8ed' }}>
                  <div>
                    <div>{cert.organization}</div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>Issued: {cert.issueDate}</div>
                  </div>
                </td>
                <td style={{ padding: '15px', borderBottom: '1px solid #e1e8ed', textAlign: 'center' }}>
                  {cert.uploadDate}
                </td>
                <td style={{ padding: '15px', borderBottom: '1px solid #e1e8ed', textAlign: 'center' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: getStatusColor(cert.status) + '20',
                    color: getStatusColor(cert.status)
                  }}>
                    {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                  </span>
                </td>
                <td style={{ padding: '15px', borderBottom: '1px solid #e1e8ed', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                    <button 
                      onClick={() => openPreview(cert)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <FileText size={14} /> Preview
                    </button>
                    
                    {cert.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleApproval(cert.id, 'approved')}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button 
                          onClick={() => handleApproval(cert.id, 'rejected')}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <X size={14} /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredCertificates.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
            <FileText size={48} style={{ marginBottom: '15px' }} />
            <h3>No certificates found</h3>
            <p>No certificates match your current filters.</p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && previewCert && (
        <>
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '30px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>Certificate Preview</h3>
                <button 
                  onClick={() => setShowPreview(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#6c757d'
                  }}
                >
                  ×
                </button>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <h4>{previewCert.certificateName}</h4>
                <p><strong>Student:</strong> {previewCert.studentName} ({previewCert.regNo})</p>
                <p><strong>Organization:</strong> {previewCert.organization}</p>
                <p><strong>Issue Date:</strong> {previewCert.issueDate}</p>
                <p><strong>Category:</strong> {previewCert.category}</p>
              </div>
              
              <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '4px', textAlign: 'center' }}>
                <FileText size={48} style={{ color: '#6c757d', marginBottom: '10px' }} />
                <p style={{ margin: 0, color: '#6c757d' }}>Certificate preview would appear here</p>
                <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#6c757d' }}>PDF/Image viewer integration needed</p>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Remarks:</label>
                <textarea
                  placeholder="Add your remarks here..."
                  value={remarks[previewCert.id] || ''}
                  onChange={(e) => handleRemarkChange(previewCert.id, e.target.value)}
                  rows="3"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              
              {previewCert.status === 'pending' && (
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={() => {
                      handleApproval(previewCert.id, 'approved');
                      setShowPreview(false);
                    }}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Check size={16} /> Approve Certificate
                  </button>
                  <button 
                    onClick={() => {
                      handleApproval(previewCert.id, 'rejected');
                      setShowPreview(false);
                    }}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <X size={16} /> Reject Certificate
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Portfolio Generation Modal */}
      {showPortfolio && (
        <>
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '900px',
              height: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}>
              <div style={{
                padding: '20px 30px',
                borderBottom: '1px solid #e1e8ed',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f8f9fa'
              }}>
                <h3 style={{ margin: 0, color: '#1e3a8a', fontWeight: '600' }}>Official Student Portfolio</h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    onClick={async () => {
                      console.log('Download PDF button clicked');
                      try {
                        console.log('Sending request to server...');
                        const response = await fetch('http://localhost:5000/api/generate-portfolio-pdf', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                          },
                          body: JSON.stringify({
                            studentData: { regNo: '20IT101', fullName: 'John Doe', department: 'Information Technology', year: 'III', program: 'B.Tech Information Technology', cgpa: '8.5', attendance: '92%' },
                            semesterResults: [{ semester: 'I', gpa: '8.2', credits: '24' }, { semester: 'II', gpa: '8.4', credits: '26' }, { semester: 'III', gpa: '8.6', credits: '25' }, { semester: 'IV', gpa: '8.3', credits: '24' }, { semester: 'V', gpa: '8.7', credits: '23' }],
                            achievements: [{ sl: 1, type: 'Workshop', title: 'AI & Machine Learning Bootcamp', issuer: 'NPTEL', date: '2024-12-15', verified: true }, { sl: 2, type: 'Internship', title: 'Web Development Intern', issuer: 'TCS Limited', date: '2024-11-20', verified: true }, { sl: 3, type: 'Competition', title: 'Hackathon - 1st Place', issuer: 'IEEE Student Chapter', date: '2024-10-05', verified: true }, { sl: 4, type: 'Certification', title: 'Full Stack Development', issuer: 'Coursera', date: '2024-09-12', verified: true }, { sl: 5, type: 'Leadership', title: 'Technical Club President', issuer: 'College Tech Club', date: '2024-08-01', verified: true }]
                          })
                        });
                        console.log('Response status:', response.status);
                        if (response.ok) {
                          console.log('Creating blob...');
                          const blob = await response.blob();
                          console.log('Blob size:', blob.size, 'Type:', blob.type);
                          
                          if (blob.size === 0) {
                            alert('PDF file is empty');
                            return;
                          }
                          
                          const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'John_Doe_Portfolio.pdf';
                          a.style.display = 'none';
                          document.body.appendChild(a);
                          a.click();
                          
                          setTimeout(() => {
                            window.URL.revokeObjectURL(url);
                            document.body.removeChild(a);
                          }, 100);
                          
                          console.log('Download initiated');
                        } else {
                          const errorText = await response.text();
                          console.error('Server error:', errorText);
                          alert('PDF generation failed: ' + response.status);
                        }
                      } catch (error) {
                        console.error('PDF generation error:', error);
                        alert('PDF generation failed: ' + error.message);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      background: '#1e3a8a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    <Download size={14} />
                    Download PDF
                  </button>
                  <button 
                    onClick={() => setShowPortfolio(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '24px',
                      cursor: 'pointer',
                      color: '#6c757d',
                      padding: '4px'
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div style={{ 
                flex: 1, 
                overflow: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}>
                <style>
                  {`
                    .portfolio-modal ::-webkit-scrollbar {
                      display: none;
                    }
                    @media print {
                      .portfolio-modal {
                        position: static !important;
                        width: 100% !important;
                        height: auto !important;
                        overflow: visible !important;
                      }
                      body * {
                        visibility: hidden;
                      }
                      .portfolio-modal, .portfolio-modal * {
                        visibility: visible;
                      }
                      .portfolio-modal {
                        position: absolute;
                        left: 0;
                        top: 0;
                      }
                    }
                  `}
                </style>
                <div className="portfolio-modal">
                  <OfficialPortfolio user={{ name: 'John Doe', register_no: '20IT101' }} isModal={true} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
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