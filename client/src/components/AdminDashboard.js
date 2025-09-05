import React, { useState, useEffect } from 'react';
import { GraduationCap, Users, Eye, ArrowLeft, RefreshCw, Trash2 } from 'lucide-react';
import './AdminDashboard.css';

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
      </div>
    </div>
  );
}

function MainAdminView({ setCurrentView }) {
  return (
    <div className="admin-main">
      <h2>Account Management</h2>
      <div className="admin-actions">
        <button className="admin-btn create-student" onClick={() => setCurrentView('create-student')}>
          <GraduationCap size={24} />
          <span>Create Student Account</span>
        </button>
        
        <button className="admin-btn create-staff" onClick={() => setCurrentView('create-staff')}>
          <Users size={24} />
          <span>Create Staff Account</span>
        </button>
        
        <button className="admin-btn view-accounts" onClick={() => setCurrentView('view')}>
          <Eye size={24} />
          <span>View All Accounts</span>
        </button>
      </div>
    </div>
  );
}

function CreateStudentForm({ setCurrentView, setMessage }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    day: '',
    month: '',
    dobYear: '',
    department: '',
    year: ''
  });
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [generatedId, setGeneratedId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const generateStudentId = async () => {
    if (formData.department && formData.year) {
      try {
        const deptCode = formData.department.toUpperCase().substring(0, 2);
        const yearCode = formData.year.toString().slice(-2);
        
        const response = await fetch(`http://localhost:5000/api/admin/next-student-number?dept=${deptCode}&year=${yearCode}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          const numStr = data.nextNumber.toString().padStart(2, '0');
          const id = `STU${deptCode}${yearCode}${numStr}`;
          setGeneratedId(id);
        }
      } catch (error) {
        console.error('Failed to generate student ID');
      }
    }
  };
  
  const generatePassword = () => {
    if (formData.day && formData.month && formData.dobYear) {
      const day = formData.day;
      const month = formData.month;
      const year = formData.dobYear.toString().slice(-2);
      const password = `${day}${month}${year}`;
      setGeneratedPassword(password);
    }
  };
  
  useEffect(() => {
    if (formData.department && formData.year) {
      generateStudentId();
    }
  }, [formData.department, formData.year]);
  
  useEffect(() => {
    generatePassword();
  }, [formData.day, formData.month, formData.dobYear]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('http://localhost:5000/api/admin/create-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({...formData, register_no: generatedId, password: generatedPassword, department: formData.department})
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage(data.message);
        setFormData({ name: '', email: '', day: '', month: '', dobYear: '', department: '', year: '' });
        setGeneratedId('');
        setGeneratedPassword('');
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="form-container">
      <div className="form-header">
        <button className="back-btn" onClick={() => setCurrentView('main')}>
          <ArrowLeft size={16} />
        </button>
        <h2>Create Student Account</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="admin-form">
        {generatedId && (
          <div className="form-group">
            <label>Generated Register Number</label>
            <input type="text" value={generatedId} disabled className="generated-field" />
          </div>
        )}
        
        <div className="form-group">
          <label>Full Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="John Doe"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Department *</label>
          <select
            value={formData.department}
            onChange={(e) => setFormData({...formData, department: e.target.value})}
            required
          >
            <option value="">Select Department</option>
            <option value="IT">Information Technology</option>
            <option value="CS">Computer Science</option>
            <option value="EC">Electronics</option>
            <option value="ME">Mechanical</option>
            <option value="CE">Civil</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Year of Joining *</label>
          <select
            value={formData.year}
            onChange={(e) => setFormData({...formData, year: e.target.value})}
            required
          >
            <option value="">Select Year</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Date of Birth *</label>
          <div className="date-selectors">
            <select
              value={formData.day || ''}
              onChange={(e) => setFormData({...formData, day: e.target.value})}
              required
            >
              <option value="">Day</option>
              {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                <option key={day} value={day.toString().padStart(2, '0')}>
                  {day.toString().padStart(2, '0')}
                </option>
              ))}
            </select>
            
            <select
              value={formData.month || ''}
              onChange={(e) => setFormData({...formData, month: e.target.value})}
              required
            >
              <option value="">Month</option>
              <option value="01">January</option>
              <option value="02">February</option>
              <option value="03">March</option>
              <option value="04">April</option>
              <option value="05">May</option>
              <option value="06">June</option>
              <option value="07">July</option>
              <option value="08">August</option>
              <option value="09">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
            
            <select
              value={formData.dobYear || ''}
              onChange={(e) => setFormData({...formData, dobYear: e.target.value})}
              required
            >
              <option value="">Year</option>
              {Array.from({length: 30}, (_, i) => 2010 - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
        
        {generatedPassword && (
          <div className="form-group">
            <label>Generated Password</label>
            <input type="text" value={generatedPassword} disabled className="generated-field" />
          </div>
        )}
        
        <div className="form-group">
          <label>Email (Optional)</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="john@example.com"
          />
        </div>
        
        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Student Account'}
        </button>
      </form>
    </div>
  );
}

function CreateStaffForm({ setCurrentView, setMessage }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    year: ''
  });
  const [generatedStaffId, setGeneratedStaffId] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const generateStaffId = async () => {
    if (formData.department && formData.year) {
      try {
        const deptCode = formData.department.toUpperCase().substring(0, 2);
        const yearCode = formData.year.toString().slice(-2);
        
        const response = await fetch(`http://localhost:5000/api/admin/next-staff-number?dept=${deptCode}&year=${yearCode}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          const numStr = data.nextNumber.toString().padStart(2, '0');
          const id = `STF${deptCode}${yearCode}${numStr}`;
          setGeneratedStaffId(id);
        }
      } catch (error) {
        console.error('Failed to generate staff ID');
      }
    }
  };
  
  const generatePassword = () => {
    if (formData.name && formData.department) {
      const name = formData.name.toLowerCase().replace(/\s+/g, '');
      const dept = formData.department.toLowerCase();
      const password = `${name}@${dept}`;
      setGeneratedPassword(password);
    }
  };
  
  useEffect(() => {
    if (formData.department && formData.year) {
      generateStaffId();
    }
  }, [formData.department, formData.year]);
  
  useEffect(() => {
    generatePassword();
  }, [formData.name, formData.department]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('http://localhost:5000/api/admin/create-staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({...formData, staff_id: generatedStaffId, password: generatedPassword})
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage(data.message);
        setFormData({ name: '', email: '', department: '', year: '' });
        setGeneratedStaffId('');
        setGeneratedPassword('');
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="form-container">
      <div className="form-header">
        <button className="back-btn" onClick={() => setCurrentView('main')}>
          <ArrowLeft size={16} />
        </button>
        <h2>Create Staff Account</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="admin-form">
        {generatedStaffId && (
          <div className="form-group">
            <label>Generated Staff ID</label>
            <input type="text" value={generatedStaffId} disabled className="generated-field" />
          </div>
        )}
        
        <div className="form-group">
          <label>Full Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Jane Smith"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Department *</label>
          <select
            value={formData.department}
            onChange={(e) => setFormData({...formData, department: e.target.value})}
            required
          >
            <option value="">Select Department</option>
            <option value="IT">Information Technology</option>
            <option value="CS">Computer Science</option>
            <option value="EC">Electronics</option>
            <option value="ME">Mechanical</option>
            <option value="CE">Civil</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Year of Joining *</label>
          <select
            value={formData.year}
            onChange={(e) => setFormData({...formData, year: e.target.value})}
            required
          >
            <option value="">Select Year</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>
        
        {generatedPassword && (
          <div className="form-group">
            <label>Generated Password</label>
            <input type="text" value={generatedPassword} disabled className="generated-field" />
          </div>
        )}
        
        <div className="form-group">
          <label>Email (Optional)</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="jane@example.com"
          />
        </div>
        
        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Staff Account'}
        </button>
      </form>
    </div>
  );
}

function ViewAccounts({ accounts, setCurrentView, setMessage, fetchAccounts }) {
  const [resetId, setResetId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const [filters, setFilters] = useState({
    department: '',
    year: '',
    role: ''
  });
  
  const filteredAccounts = accounts.filter(account => {
    if (filters.department && account.department !== filters.department) return false;
    
    if (filters.year) {
      const yearCode = filters.year.slice(-2);
      if (!account.register_no?.includes(yearCode) && !account.staff_id?.includes(yearCode)) return false;
    }
    
    if (filters.role && account.role !== filters.role) return false;
    
    return true;
  });
  
  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/delete-account/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage(data.message);
        fetchAccounts();
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    }
  };
  

  const handleResetPassword = async (userId) => {
    if (!newPassword) {
      setMessage('Please enter a new password');
      return;
    }
    
    setIsResetting(true);
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/reset-password/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ password: newPassword })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage(data.message);
        setResetId('');
        setNewPassword('');
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };
  
  return (
    <div className="accounts-container">
      <div className="form-header">
        <button className="back-btn" onClick={() => setCurrentView('main')}>
          <ArrowLeft size={16} />
        </button>
        <h2>All Accounts</h2>
        <button className="refresh-btn" onClick={fetchAccounts}>
          <RefreshCw size={16} />
        </button>
      </div>
      
      <div className="filters">
        <select
          value={filters.role}
          onChange={(e) => setFilters({...filters, role: e.target.value})}
        >
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="staff">Staff</option>
        </select>
        
        <select
          value={filters.department}
          onChange={(e) => setFilters({...filters, department: e.target.value})}
        >
          <option value="">All Departments</option>
          <option value="IT">IT</option>
          <option value="CS">CS</option>
          <option value="EC">EC</option>
          <option value="ME">ME</option>
          <option value="CE">CE</option>
        </select>
        
        <select
          value={filters.year}
          onChange={(e) => setFilters({...filters, year: e.target.value})}
        >
          <option value="">All Years</option>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
        </select>
      </div>
      
      <div className="accounts-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.map(account => (
              <tr key={account.id}>
                <td>{account.register_no || account.staff_id}</td>
                <td>{account.name}</td>
                <td>{account.email || 'N/A'}</td>
                <td>{account.role}</td>
                <td>{account.department || 'N/A'}</td>
                <td>
                  <div className="action-buttons">
                    <button className="delete-btn" onClick={() => handleDelete(account.id)}>
                      <Trash2 size={16} />
                    </button>
                    {resetId === account.id ? (
                      <div className="reset-form">
                        <input
                          type="password"
                          placeholder="New password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button onClick={() => handleResetPassword(account.id)} disabled={isResetting}>
                          {isResetting ? 'Resetting...' : 'Reset'}
                        </button>
                        <button onClick={() => { setResetId(''); setNewPassword(''); }}>Cancel</button>
                      </div>
                    ) : (
                      <button className="reset-btn" onClick={() => setResetId(account.id)}>Reset Password</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;