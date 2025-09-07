import React, { useState, useEffect } from 'react';
import { GraduationCap, Users, Eye, ArrowLeft, RefreshCw, Trash2, BookOpen, UserCheck, BarChart3, Settings } from 'lucide-react';
import './AdminDashboard.css';
import ClassManagement from './ClassManagementNew';
import MainAdminView from './MainAdminView';
import CreateStudentForm from './CreateStudentForm';
import CreateStaffForm from './CreateStaffForm';
import ViewAccounts from './ViewAccounts';
import SubjectManagement from './SubjectManagement';
import StaffAssignments from './StaffAssignments';
import CCManagement from './CCManagement';
import ReportsOverview from './ReportsOverview';

function AdminDashboard({ user, logout }) {
  const [currentView, setCurrentView] = useState('main');
  const [accounts, setAccounts] = useState([]);
  const [message, setMessage] = useState('');
  
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
    }
  }, [currentView]);
  
  return (
    <div className="dashboard">
      <nav className="navbar">
        <h1>Admin Dashboard</h1>
        <div className="nav-right">
          <span>Welcome, {user?.name}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </nav>
      
      <div className="content">
        {message && (
          <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
        
        {currentView === 'main' && (
          <MainAdminView setCurrentView={setCurrentView} />
        )}
        
        {currentView === 'create-student' && (
          <CreateStudentForm setCurrentView={setCurrentView} setMessage={setMessage} />
        )}
        
        {currentView === 'create-staff' && (
          <CreateStaffForm setCurrentView={setCurrentView} setMessage={setMessage} />
        )}
        
        {currentView === 'view' && (
          <ViewAccounts accounts={accounts} setCurrentView={setCurrentView} setMessage={setMessage} fetchAccounts={fetchAccounts} />
        )}
        
        {currentView === 'subjects' && (
          <SubjectManagement setCurrentView={setCurrentView} setMessage={setMessage} />
        )}
        
        {currentView === 'assignments' && (
          <StaffAssignments setCurrentView={setCurrentView} setMessage={setMessage} />
        )}
        
        {currentView === 'coordinators' && (
          <CCManagement setCurrentView={setCurrentView} setMessage={setMessage} />
        )}
        
        {currentView === 'classes' && (
          <ClassManagement setCurrentView={setCurrentView} setMessage={setMessage} />
        )}
        
        {currentView === 'reports' && (
          <ReportsOverview setCurrentView={setCurrentView} />
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;