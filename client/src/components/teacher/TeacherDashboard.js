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
import OverviewSection from './OverviewSection';
import AssignmentsSection from './AssignmentsSection';
import GradesSection from './GradesSection';
import AttendanceSection from './AttendanceSection';
import CertificatesSection from './CertificatesSection';
import RealTimeScheduleNotification from './RealTimeScheduleNotification';
import TimetableNotification from './TimetableNotification';
import './TeacherDashboard.css';

function TeacherDashboard({ user, logout }) {
  const [currentView, setCurrentView] = useState('overview');
  const [assignments, setAssignments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isCC, setIsCC] = useState(false);
  
  useEffect(() => {
    fetchStaffAssignments();
    checkCCAssignment();
  }, []);
  
  const checkCCAssignment = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/cc-assignments', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const ccAssignments = await response.json();
        const isCCStaff = ccAssignments.some(cc => cc.staff_id === user?.staff_id);
        setIsCC(isCCStaff);
      }
    } catch (error) {
      console.error('Failed to check CC assignment:', error);
    }
  };
  
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
            {isCC && (
              <button 
                className={`nav-item ${currentView === 'certificates' ? 'active' : ''}`}
                onClick={() => setCurrentView('certificates')}
              >
                <FileText size={20} /> Certificates
              </button>
            )}
            <button 
              className={`nav-item ${currentView === 'portfolio' ? 'active' : ''}`}
              onClick={() => setCurrentView('portfolio')}
            >
              <Download size={20} /> Official Portfolio
            </button>
          </nav>
        </aside>

        <main className="teacher-main">
          <TimetableNotification user={user} />
          {currentView === 'overview' && <OverviewSection user={user} assignments={assignments} />}

          {currentView === 'assignments' && <AssignmentsSection assignments={assignments} />}
          {currentView === 'grades' && <GradesSection assignments={assignments} />}
          {currentView === 'attendance' && <AttendanceSection assignments={assignments} />}
          {currentView === 'certificates' && isCC && <CertificatesSection user={user} />}
          {currentView === 'portfolio' && <OfficialPortfolio user={user} />}
        </main>
      </div>
    </div>
  );
}

export default TeacherDashboard;