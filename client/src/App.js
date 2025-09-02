import React, { useState, useEffect } from 'react';
import { GraduationCap, Users, Lock, User, Shield, Target, ArrowLeft } from 'lucide-react';
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

function LoginPage({ setToken, setUser, setCurrentPage }) {
  const [userType, setUserType] = useState('student');
  const [formData, setFormData] = useState({
    register_no: '',
    staff_id: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Admin access shortcut
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        setCurrentPage('admin');
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [setCurrentPage]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const endpoint = userType === 'student' ? '/api/student/login' : '/api/staff/login';
    const loginData = userType === 'student' 
      ? { register_no: formData.register_no, password: formData.password }
      : { staff_id: formData.staff_id, password: formData.password };

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="floating-elements">
        <div className="floating-element"></div>
        <div className="floating-element"></div>
        <div className="floating-element"></div>
      </div>
      
      <div className="login-box">
        <div className="login-header">
          <h1>Smart Student Hub</h1>
          <p className="login-subtitle">Access your digital achievement portfolio</p>
        </div>

        <div className="toggle-container">
          <div className={`toggle-slider ${userType === 'staff' ? 'staff' : ''}`}></div>
          <button 
            className={`toggle-btn ${userType === 'student' ? 'active' : ''}`}
            onClick={() => setUserType('student')}
          >
            <GraduationCap size={18} /> Student
          </button>
          <button 
            className={`toggle-btn ${userType === 'staff' ? 'active' : ''}`}
            onClick={() => setUserType('staff')}
          >
            <Users size={18} /> Staff
          </button>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <div className="input-icon">
              {userType === 'student' ? <GraduationCap size={20} /> : <User size={20} />}
            </div>
            {userType === 'student' ? (
              <input
                type="text"
                className="login-input"
                placeholder="Register Number"
                value={formData.register_no}
                onChange={(e) => setFormData({...formData, register_no: e.target.value})}
                required
              />
            ) : (
              <input
                type="text"
                className="login-input"
                placeholder="Staff ID"
                value={formData.staff_id}
                onChange={(e) => setFormData({...formData, staff_id: e.target.value})}
                required
              />
            )}
          </div>
          
          <div className="input-group">
            <div className="input-icon"><Lock size={20} /></div>
            <input
              type="password"
              className="login-input"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {error && <div className="error">{error}</div>}

        <div className="admin-hint">
          <Shield size={16} /> Admin Access: Press Ctrl + A
        </div>
      </div>
    </div>
  );
}

function AdminLogin({ setToken, setUser, setCurrentPage }) {
  const [formData, setFormData] = useState({
    admin_id: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container admin-login">
      <div className="floating-elements">
        <div className="floating-element"></div>
        <div className="floating-element"></div>
        <div className="floating-element"></div>
      </div>
      
      <div className="login-box">
        <div className="login-header">
          <h1>Admin Portal</h1>
          <p className="login-subtitle">Secure administrative access</p>
        </div>

        <div className="admin-badge">
          <Shield size={18} /> Authorized Personnel Only
        </div>
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <div className="input-icon"><Shield size={20} /></div>
            <input
              type="text"
              className="login-input"
              placeholder="Admin ID"
              value={formData.admin_id}
              onChange={(e) => setFormData({...formData, admin_id: e.target.value})}
              required
            />
          </div>
          
          <div className="input-group">
            <div className="input-icon"><Lock size={20} /></div>
            <input
              type="password"
              className="login-input"
              placeholder="Admin Password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? 'Authenticating...' : 'Admin Login'}
          </button>
        </form>

        {error && <div className="error">{error}</div>}



        <button 
          onClick={() => setCurrentPage('login')} 
          style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>
    </div>
  );
}

function Dashboard({ user, logout }) {
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