import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createParticleBurst } from './utils/animations';
import AnimatedBackground from './AnimatedBackground';
import { GraduationCap, Users, Eye, ArrowLeft, RefreshCw, Trash2, BookOpen, UserCheck, BarChart3, Settings, Calendar, Filter, Hash, Building2, CheckCircle } from 'lucide-react';
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
    if (msg.includes('successfully') || msg.includes('CheckCircle')) {
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
    <div className="dashboard relative">
      <AnimatedBackground />
      <motion.nav 
        className="navbar relative z-10"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1 
          data-text="Admin Dashboard"
          className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          Admin Dashboard
        </motion.h1>
        <div className="nav-right">
          <span className="welcome-text">Welcome, {user?.name}</span>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
      </motion.nav>
      
      {/* Floating Particles */}
      <div className="floating-particles">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="floating-particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>
      
      {/* Morphing Background Shapes */}
      <div className="morphing-shape" />
      <div className="morphing-shape" />
      <div className="morphing-shape" />
      
      <div className="content">
        {message && (
          <div className={`message ${message.includes('successfully') || message.includes('CheckCircle') ? 'success' : 'error'}`}>
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
  const [hoveredCard, setHoveredCard] = useState(null);
  
  const handleCardClick = (view) => {
    // Add ripple effect
    const button = document.querySelector(`.admin-btn.${view}`);
    if (button) {
      button.classList.add('ripple');
      setTimeout(() => button.classList.remove('ripple'), 600);
    }
    setCurrentView(view);
  };
  
  return (
    <div className="admin-main">
      <motion.h2 
        className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        Admin Control Panel
      </motion.h2>
      

      
      <div className="admin-sections">
        <div className="section-group">
          <h3>
            <Building2 size={20} />
            Account Management
          </h3>
          <div className="admin-actions">
            <button 
              className="admin-btn create-student ripple" 
              onClick={() => handleCardClick('create-student')}
            >
              <GraduationCap size={24} />
              <span>Create Student Account</span>
            </button>
            
            <button 
              className="admin-btn create-staff ripple" 
              onClick={() => handleCardClick('create-staff')}
            >
              <Users size={24} />
              <span>Create Staff Account</span>
            </button>
            
            <button 
              className="admin-btn view-accounts ripple" 
              onClick={() => handleCardClick('view')}
            >
              <Eye size={24} />
              <span>View All Accounts</span>
            </button>
          </div>
        </div>
        
        <div className="section-group">
          <h3>
            <BookOpen size={20} />
            Academic Management
          </h3>
          <div className="admin-actions">
            <button 
              className="admin-btn subjects ripple" 
              onClick={() => handleCardClick('subjects')}
            >
              <BookOpen size={24} />
              <span>Subject Management</span>
            </button>
            
            <button 
              className="admin-btn assignments ripple" 
              onClick={() => handleCardClick('assignments')}
            >
              <Settings size={24} />
              <span>Staff Assignments</span>
            </button>
            
            <button 
              className="admin-btn coordinators ripple" 
              onClick={() => handleCardClick('coordinators')}
            >
              <UserCheck size={24} />
              <span>CC Management</span>
            </button>
            
            <button 
              className="admin-btn classes ripple" 
              onClick={() => handleCardClick('classes')}
            >
              <Users size={24} />
              <span>Class Management</span>
            </button>
            
            <button 
              className="admin-btn timetables ripple" 
              onClick={() => handleCardClick('timetables')}
            >
              <Calendar size={24} />
              <span>Timetable Management</span>
            </button>
          </div>
        </div>
        
        <div className="section-group">
          <h3>
            <Settings size={20} />
            System
          </h3>
          <div className="admin-actions">
            <button 
              className="admin-btn settings ripple" 
              onClick={() => handleCardClick('settings')}
            >
              <Settings size={24} />
              <span>System Settings</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Enhanced Floating Action Button */}
      <button 
        className="fab enhanced-fab" 
        title="Quick Actions"
        onClick={() => {
          // Add particle burst effect
          const fab = document.querySelector('.fab');
          createParticleBurst(fab, 20);
        }}
      >
        <Hash size={24} />
      </button>
      
      {/* Interactive Background Elements */}
      <div className="interactive-bg">
        <div className="bg-element" style={{top: '10%', left: '5%'}} />
        <div className="bg-element" style={{top: '70%', right: '10%'}} />
        <div className="bg-element" style={{bottom: '20%', left: '60%'}} />
      </div>
    </div>
  );
}
