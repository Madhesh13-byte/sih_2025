import React, { useState, useEffect } from 'react';
import { GraduationCap, Users, Eye, ArrowLeft, RefreshCw, Trash2, BookOpen, UserCheck, BarChart3, Settings, Calendar, Filter, Hash, Building2 } from 'lucide-react';
import './styles/AdminDashboard.css';
import './styles/SubjectFilters.css';
import ClassManagement from './ClassManagementNew';
import AdminSettings from './AdminSettings';
import TimetableManagement from './TimetableManagement';
import CCManagement from './CCManagement';
import ClassAssignment from './ClassAssignment';
import CreateStudentForm from './StudentAccountForm';
import CreateStaffForm from './StaffAccountForm';
import ViewAccounts from './ViewAccounts';
import SubjectManagement from './SubjectManagement';
import StaffAssignments from './StaffAssignments';
import StudentResultsManagement from './StudentResultsManagement';
import ReportsManagement from './ReportsManagement';

function AdminDashboard({ user, logout }) {
  const [currentView, setCurrentView] = useState('main');
  const [accounts, setAccounts] = useState([]);
  const [message, setMessage] = useState('');
  const [classes, setClasses] = useState([]);
  
  const setAutoHideMessage = (msg) => {
    setMessage(msg);
    if (msg.includes('successfully') || msg.includes('✅')) {
      setTimeout(() => setMessage(''), 2000);
    }
  };
  
  const fetchAccounts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/accounts', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (response.ok) {
        setAccounts(data);
      }
    } catch (error) {
      console.error('Failed to fetch accounts');
    }
  };
  
  useEffect(() => {
    if (currentView === 'view') {
      fetchAccounts();
      fetchClasses();
    }
  }, [currentView]);

  const fetchClasses = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/classes', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      }
    } catch (error) {
      console.error('Failed to fetch classes');
    }
  };
  
  return (
    <div className="dashboard-enhanced">
      <nav className="navbar-enhanced">
        <div className="nav-brand">
          <div className="brand-icon">
            <Settings size={28} />
          </div>
          <div className="brand-text">
            <h1>Admin Dashboard</h1>
            <span>Smart Student Hub</span>
          </div>
        </div>
        <div className="nav-right">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0)}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">Administrator</span>
            </div>
          </div>
          <button className="logout-btn-enhanced" onClick={logout}>Logout</button>
        </div>
      </nav>
      
      <div className="content-enhanced">
        {message && (
          <div className={`message-enhanced ${message.includes('successfully') || message.includes('✅') ? 'success' : 'error'}`}>
            <div className="message-content">
              {message.includes('successfully') || message.includes('✅') ? '✅' : '❌'}
              <span>{message}</span>
            </div>
          </div>
        )}
        
        {currentView === 'main' && (
          <MainAdminView setCurrentView={setCurrentView} />
        )}
        
        {currentView === 'create-student' && (
          <CreateStudentForm setCurrentView={setCurrentView} setMessage={setMessage} setAutoHideMessage={setAutoHideMessage} />
        )}
        
        {currentView === 'create-staff' && (
          <CreateStaffForm setCurrentView={setCurrentView} setMessage={setAutoHideMessage} />
        )}
        
        {currentView === 'view' && (
          <ViewAccounts 
            accounts={accounts} 
            classesList={classes}
            setCurrentView={setCurrentView} 
            setMessage={setAutoHideMessage} 
            fetchAccounts={fetchAccounts} 
          />
        )}
        
        {currentView === 'subjects' && (
          <SubjectManagement setCurrentView={setCurrentView} setMessage={setAutoHideMessage} />
        )}
        
        {currentView === 'assignments' && (
          <StaffAssignments setCurrentView={setCurrentView} setMessage={setAutoHideMessage} />
        )}
        
        {currentView === 'coordinators' && (
          <CCManagement setCurrentView={setCurrentView} setMessage={setAutoHideMessage} />
        )}
        
        {currentView === 'classes' && (
          <ClassManagement setCurrentView={setCurrentView} setMessage={setAutoHideMessage} />
        )}
        
        {currentView === 'reports' && (
          <ReportsManagement setCurrentView={setCurrentView} setMessage={setAutoHideMessage} />
        )}
        
        {currentView === 'settings' && (
          <AdminSettings setCurrentView={setCurrentView} />
        )}
        
        {currentView === 'timetables' && (
          <TimetableManagement setCurrentView={setCurrentView} setMessage={setAutoHideMessage} />
        )}
        
        {currentView === 'student-results' && (
          <StudentResultsManagement setCurrentView={setCurrentView} setMessage={setAutoHideMessage} />
        )}
      </div>
    </div>
  );
}
export default AdminDashboard;
function MainAdminView({ setCurrentView }) {
  return (
    <div className="admin-main-enhanced">
      <div className="admin-header">
        <h1>Admin Control Panel</h1>
        <p>Manage your institution's academic and administrative operations</p>
      </div>
      
      <div className="admin-grid">
        <div className="section-card account-section">
          <div className="section-header">
            <div className="section-icon account-icon">
              <Users size={24} />
            </div>
            <h3>Account Management</h3>
          </div>
          <div className="card-actions">
            <button className="action-card student-card" onClick={() => setCurrentView('create-student')}>
              <GraduationCap size={20} />
              <span>Create Student</span>
            </button>
            <button className="action-card staff-card" onClick={() => setCurrentView('create-staff')}>
              <Users size={20} />
              <span>Create Staff</span>
            </button>
            <button className="action-card view-card" onClick={() => setCurrentView('view')}>
              <Eye size={20} />
              <span>View Accounts</span>
            </button>
          </div>
        </div>
        
        <div className="section-card academic-section">
          <div className="section-header">
            <div className="section-icon academic-icon">
              <BookOpen size={24} />
            </div>
            <h3>Academic Management</h3>
          </div>
          <div className="card-actions">
            <button className="action-card subjects-card" onClick={() => setCurrentView('subjects')}>
              <BookOpen size={20} />
              <span>Subjects</span>
            </button>
            <button className="action-card assignments-card" onClick={() => setCurrentView('assignments')}>
              <Settings size={20} />
              <span>Staff Assignments</span>
            </button>
            <button className="action-card cc-card" onClick={() => setCurrentView('coordinators')}>
              <UserCheck size={20} />
              <span>CC Management</span>
            </button>
            <button className="action-card classes-card" onClick={() => setCurrentView('classes')}>
              <Building2 size={20} />
              <span>Classes</span>
            </button>
            <button className="action-card timetable-card" onClick={() => setCurrentView('timetables')}>
              <Calendar size={20} />
              <span>Timetables</span>
            </button>
            <button className="action-card results-card" onClick={() => setCurrentView('student-results')}>
              <BarChart3 size={20} />
              <span>Results</span>
            </button>
          </div>
        </div>
        
        <div className="section-card reports-section">
          <div className="section-header">
            <div className="section-icon reports-icon">
              <BarChart3 size={24} />
            </div>
            <h3>Reports & Analytics</h3>
          </div>
          <div className="card-actions">
            <button className="action-card reports-card" onClick={() => setCurrentView('reports')}>
              <BarChart3 size={20} />
              <span>Institutional Reports</span>
            </button>
          </div>
        </div>
        
        <div className="section-card system-section">
          <div className="section-header">
            <div className="section-icon system-icon">
              <Settings size={24} />
            </div>
            <h3>System Settings</h3>
          </div>
          <div className="card-actions">
            <button className="action-card settings-card" onClick={() => setCurrentView('settings')}>
              <Settings size={20} />
              <span>System Config</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}