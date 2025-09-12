import React, { useState, useEffect } from 'react';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/admin_features/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import { LoginPage, AdminLogin } from './components/Login';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [currentPage, setCurrentPage] = useState('login');

  useEffect(() => {
    if (token) {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(userData);
      setCurrentPage('dashboard');
    } else {
      // Check URL hash for admin access
      if (window.location.hash === '#admin') {
        setCurrentPage('admin');
      }
    }
  }, [token]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setCurrentPage('login');
  };

  if (currentPage === 'login') {
    return <LoginPage setToken={setToken} setUser={setUser} setCurrentPage={setCurrentPage} />;
  }

  if (currentPage === 'admin') {
    return <AdminLogin setToken={setToken} setUser={setUser} setCurrentPage={setCurrentPage} />;
  }

  if (currentPage === 'dashboard' && user) {
    return <Dashboard user={user} logout={logout} />;
  }

  return <LoginPage setToken={setToken} setUser={setUser} setCurrentPage={setCurrentPage} />;
}



function Dashboard({ user, logout }) {
  if (user?.role === 'admin') {
    return <AdminDashboard user={user} logout={logout} />;
  }
  
  if (user?.role === 'student') {
    return <StudentDashboard user={user} logout={logout} />;
  }
  
  if (user?.role === 'staff') {
    return <TeacherDashboard user={user} logout={logout} />;
  }
  
  // Fallback dashboard
  return (
    <div className="dashboard">
      <nav className="navbar">
        <h1>Smart Student Hub</h1>
        <div className="nav-right">
          <span>Welcome, {user?.name} ({user?.role})</span>
          <button onClick={logout}>Logout</button>
        </div>
      </nav>
      
      <div className="content">
        <h2>{user?.role.charAt(0).toUpperCase() + user?.role.slice(1)} Dashboard</h2>
        <div className="user-info">
          <p><strong>Name:</strong> {user?.name}</p>
          {user?.register_no && <p><strong>Register No:</strong> {user?.register_no}</p>}
          {user?.staff_id && <p><strong>Staff ID:</strong> {user?.staff_id}</p>}
          {user?.admin_id && <p><strong>Admin ID:</strong> {user?.admin_id}</p>}
          {user?.department && <p><strong>Department:</strong> {user?.department}</p>}
          <p><strong>Role:</strong> {user?.role}</p>
        </div>
      </div>
    </div>
  );
}



export default App;