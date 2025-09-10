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
    <div className="dashboard">
      <nav className="navbar">
        <h1>Admin Dashboard</h1>
        <div className="nav-right">
          <span className="welcome-text">Welcome, {user?.name}</span>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
      </nav>
      
      <div className="content">
        {message && (
          <div className={`message ${message.includes('successfully') || message.includes('✅') ? 'success' : 'error'}`}>
            {message}
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
        
        {/* {currentView === 'reports' && (
          <ReportsOverview setCurrentView={setCurrentView} />
        )} */}
        
        {currentView === 'settings' && (
          <AdminSettings setCurrentView={setCurrentView} />
        )}
        
        {currentView === 'timetables' && (
          <TimetableManagement setCurrentView={setCurrentView} setMessage={setAutoHideMessage} />
        )}
      </div>
    </div>
  );
}
export default AdminDashboard;
function MainAdminView({ setCurrentView }) {
  return (
    <div className="admin-main">
      <h2>Admin Control Panel</h2>
      <div className="admin-sections">
        <div className="section-group">
          <h3>Account Management</h3>
          <div className="admin-actions">
            <button className="admin-btn create-student" onClick={() => setCurrentView('create-student')}>
              <GraduationCap />
              <span>Create Student Account</span>
            </button>
            
            <button className="admin-btn create-staff" onClick={() => setCurrentView('create-staff')}>
              <Users />
              <span>Create Staff Account</span>
            </button>
            
            <button className="admin-btn view-accounts" onClick={() => setCurrentView('view')}>
              <Eye />
              <span>View All Accounts</span>
            </button>
          </div>
        </div>
        
        <div className="section-group">
          <h3>Academic Management</h3>
          <div className="admin-actions">
            <button className="admin-btn subjects" onClick={() => setCurrentView('subjects')}>
              <BookOpen />
              <span>Subject Management</span>
            </button>
            
            <button className="admin-btn assignments" onClick={() => setCurrentView('assignments')}>
              <Settings />
              <span>Staff Assignments</span>
            </button>
            
            <button className="admin-btn coordinators" onClick={() => setCurrentView('coordinators')}>
              <UserCheck />
              <span>CC Management</span>
            </button>
            
            <button className="admin-btn classes" onClick={() => setCurrentView('classes')}>
              <Users />
              <span>Class Management</span>
            </button>
            
            <button className="admin-btn timetables" onClick={() => setCurrentView('timetables')}>
              <Calendar />
              <span>Timetable Management</span>
            </button>
          </div>
        </div>
        
        <div className="section-group">
          <h3>System</h3>
          <div className="admin-actions">
            <button className="admin-btn settings" onClick={() => setCurrentView('settings')}>
              <Settings />
              <span>System Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
