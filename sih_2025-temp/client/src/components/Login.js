import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Users, Lock, User, Shield, ArrowLeft } from 'lucide-react';
import './Login.css';

function LoginPage({ setToken, setUser, setCurrentPage }) {
  const [showSplash, setShowSplash] = useState(false);
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

  if (showSplash) {
    return (
      <motion.div 
        className="splash-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1
          className="splash-title"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 1, type: "spring" }}
        >
          Smart Student Hub
        </motion.h1>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="login-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="floating-elements">
        {[0, 1, 2].map((i) => (
          <motion.div 
            key={i}
            className="floating-element"
            style={{
              left: `${20 + i * 30}%`,
              width: '80px',
              height: '80px',
            }}
            animate={{ 
              y: [-20, 20, -20],
              rotate: [0, 360],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{ 
              duration: [6, 8, 10][i],
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
        <motion.div 
          className="background-overlay"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </div>
      
      <motion.div 
        className="login-box"
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div 
          className="login-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Smart Student Hub
          </motion.h1>
          <motion.p 
            className="login-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Access your digital achievement portfolio
          </motion.p>
        </motion.div>

        <motion.div 
          className="toggle-container"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <motion.div 
            className={`toggle-slider ${userType === 'staff' ? 'staff' : ''}`}
            layout
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          />
          <motion.button 
            className={`toggle-btn ${userType === 'student' ? 'active' : ''}`}
            onClick={() => setUserType('student')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <GraduationCap size={18} /> Student
          </motion.button>
          <motion.button 
            className={`toggle-btn ${userType === 'staff' ? 'active' : ''}`}
            onClick={() => setUserType('staff')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Users size={18} /> Staff
          </motion.button>
        </motion.div>

        <motion.form 
          onSubmit={handleLogin} 
          className="login-form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <motion.div 
            className="input-group"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            whileHover={{ x: 5 }}
          >
            <motion.div 
              className="input-icon"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              {userType === 'student' ? <GraduationCap size={20} /> : <User size={20} />}
            </motion.div>
            <AnimatePresence mode="wait">
              {userType === 'student' ? (
                <motion.input
                  key="student"
                  type="text"
                  className="login-input"
                  placeholder="Register Number"
                  value={formData.register_no}
                  onChange={(e) => setFormData({...formData, register_no: e.target.value})}
                  required
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  whileFocus={{ scale: 1.02, boxShadow: "0 0 30px rgba(99, 102, 241, 0.5)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
              ) : (
                <motion.input
                  key="staff"
                  type="text"
                  className="login-input"
                  placeholder="Staff ID"
                  value={formData.staff_id}
                  onChange={(e) => setFormData({...formData, staff_id: e.target.value})}
                  required
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  whileFocus={{ scale: 1.02, boxShadow: "0 0 30px rgba(99, 102, 241, 0.5)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
              )}
            </AnimatePresence>
          </motion.div>
          
          <motion.div 
            className="input-group"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0, duration: 0.6 }}
            whileHover={{ x: 5 }}
          >
            <motion.div 
              className="input-icon"
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4 }}
            >
              <Lock size={20} />
            </motion.div>
            <motion.input
              type="password"
              className="login-input"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              whileFocus={{ scale: 1.02, boxShadow: "0 0 30px rgba(99, 102, 241, 0.5)" }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          </motion.div>
          
          <motion.button 
            type="submit" 
            className="submit-btn" 
            disabled={isLoading}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.span
              animate={isLoading ? { rotate: 360 } : {}}
              transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: "linear" }}
            >
              {isLoading ? '⟳' : '→'}
            </motion.span>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </motion.button>
        </motion.form>

        <AnimatePresence>
          {error && (
            <motion.div 
              className="error"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ type: "spring", stiffness: 300 }}
              whileHover={{ scale: 1.02 }}
            >
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 3 }}
              >
                ⚠️
              </motion.span>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          className="admin-hint"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.8 }}
          whileHover={{ scale: 1.05, y: -2 }}
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Shield size={16} />
          </motion.div>
          Admin Access: Press Ctrl + A
        </motion.div>
      </motion.div>
    </motion.div>
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
        {[...Array(10)].map((_, i) => (
          <motion.div 
            key={i}
            className="floating-particle"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 6 + 4}px`,
              height: `${Math.random() * 6 + 4}px`,
            }}
            animate={{ 
              y: [window.innerHeight + 50, -100],
              rotate: [0, 360],
              scale: [0, 1, 0]
            }}
            transition={{ 
              duration: Math.random() * 10 + 15,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
          />
        ))}
      </div>
      
      <motion.div 
        className="login-box"
        initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15, duration: 0.8 }}
      >
        <motion.div 
          className="login-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
          >
            Admin Portal
          </motion.h1>
          <motion.p 
            className="login-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            Secure administrative access
          </motion.p>
        </motion.div>

        <motion.div 
          className="admin-badge"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          whileHover={{ scale: 1.05 }}
        >
          <Shield size={18} /> Authorized Personnel Only
        </motion.div>
        
        <motion.form 
          onSubmit={handleLogin} 
          className="login-form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <motion.div 
            className="input-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <div className="input-icon"><Shield size={20} /></div>
            <motion.input
              type="text"
              className="login-input"
              placeholder="Admin ID"
              value={formData.admin_id}
              onChange={(e) => setFormData({...formData, admin_id: e.target.value})}
              required
              whileFocus={{ scale: 1.02 }}
            />
          </motion.div>
          
          <motion.div 
            className="input-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <div className="input-icon"><Lock size={20} /></div>
            <motion.input
              type="password"
              className="login-input"
              placeholder="Admin Password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              whileFocus={{ scale: 1.02 }}
            />
          </motion.div>
          
          <motion.button 
            type="submit" 
            className="submit-btn" 
            disabled={isLoading}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
          >
            {isLoading ? 'Authenticating...' : 'Admin Login'}
          </motion.button>
        </motion.form>

        {error && (
          <motion.div 
            className="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {error}
          </motion.div>
        )}

        <motion.button 
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
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <ArrowLeft size={16} /> Back
        </motion.button>
      </motion.div>
    </div>
  );
}

export { LoginPage, AdminLogin };