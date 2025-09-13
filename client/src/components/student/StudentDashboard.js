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
  Bell,
  User
} from 'lucide-react';
import './StudentDashboard.css';

// Import section components
import OverviewSection from './OverviewSection';
import AcademicSection from './AcademicSection';
import AttendanceSection from './AttendanceSection';
import CertificatesSection from './CertificatesSection';
import PortfolioSection from './PortfolioSection';

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
            <button 
              className={`nav-item ${currentView === 'portfolio' ? 'active' : ''}`}
              onClick={() => setCurrentView('portfolio')}
            >
              <User size={20} /> Portfolio
            </button>
          </nav>
        </aside>

        <main className="student-main">
          {currentView === 'overview' && <OverviewSection user={user} />}
          {currentView === 'academic' && <AcademicSection user={user} />}
          {currentView === 'attendance' && <AttendanceSection user={user} />}
          {currentView === 'certificates' && <CertificatesSection user={user} />}
          {currentView === 'portfolio' && <PortfolioSection user={user} />}
        </main>
      </div>
    </div>
  );
}


export default StudentDashboard;