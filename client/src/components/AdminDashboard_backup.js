import React, { useState, useEffect } from 'react';
import { GraduationCap, Users, Eye, ArrowLeft, RefreshCw, Trash2, BookOpen, UserCheck, BarChart3, Settings } from 'lucide-react';
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
        
        {currentView === 'subjects' && (
          <SubjectManagement setCurrentView={setCurrentView} setMessage={setMessage} />
        )}
        
        {currentView === 'assignments' && (
          <StaffAssignments setCurrentView={setCurrentView} setMessage={setMessage} />
        )}
        
        {currentView === 'coordinators' && (
          <CCManagement setCurrentView={setCurrentView} setMessage={setMessage} />
        )}
        
        {currentView === 'reports' && (
          <ReportsOverview setCurrentView={setCurrentView} />
        )}
      </div>
    </div>
  );
}

function MainAdminView({ setCurrentView }) {
  return (
    <div className="admin-main">
      <h2>Admin Control Panel</h2>
      <div className="admin-sections">
        <div className="section-group">
          <h3>Account Management</h3>
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
        
        <div className="section-group">
          <h3>Academic Management</h3>
          <div className="admin-actions">
            <button className="admin-btn subjects" onClick={() => setCurrentView('subjects')}>
              <BookOpen size={24} />
              <span>Subject Management</span>
            </button>
            
            <button className="admin-btn assignments" onClick={() => setCurrentView('assignments')}>
              <Settings size={24} />
              <span>Staff Assignments</span>
            </button>
            
            <button className="admin-btn coordinators" onClick={() => setCurrentView('coordinators')}>
              <UserCheck size={24} />
              <span>CC Management</span>
            </button>
          </div>
        </div>
        
        <div className="section-group">
          <h3>Reports & Oversight</h3>
          <div className="admin-actions">
            <button className="admin-btn reports" onClick={() => setCurrentView('reports')}>
              <BarChart3 size={24} />
              <span>Reports & Analytics</span>
            </button>
          </div>
        </div>
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
          <label>Dept *</label>
          <select
            value={formData.department}
            onChange={(e) => setFormData({...formData, department: e.target.value})}
            required
          >
            <option value="">Select Dept</option>
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
          <label>Date of Birth (DD/MM/YY) *</label>
          <div className="dob-inputs">
            <input
              type="text"
              value={formData.day}
              onChange={(e) => setFormData({...formData, day: e.target.value})}
              placeholder="DD"
              maxLength="2"
              required
            />
            <span>/</span>
            <input
              type="text"
              value={formData.month}
              onChange={(e) => setFormData({...formData, month: e.target.value})}
              placeholder="MM"
              maxLength="2"
              required
            />
            <span>/</span>
            <input
              type="text"
              value={formData.dobYear}
              onChange={(e) => setFormData({...formData, dobYear: e.target.value})}
              placeholder="YY"
              maxLength="2"
              required
            />
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
        
        <button type="submit" className={`submit-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="spinner"></div>
              Creating...
            </>
          ) : (
            'Create Student Account'
          )}
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
          <label>Dept *</label>
          <select
            value={formData.department}
            onChange={(e) => setFormData({...formData, department: e.target.value})}
            required
          >
            <option value="">Select Dept</option>
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
        
        <button type="submit" className={`submit-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="spinner"></div>
              Creating...
            </>
          ) : (
            'Create Staff Account'
          )}
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
          <option value="">All Depts</option>
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
              <th>Dept</th>
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

function SubjectManagement({ setCurrentView, setMessage }) {
  const [subjects, setSubjects] = useState([
    { id: 1, code: 'CS301', name: 'Data Structures', department: 'CS', year: 'III', semester: 1 },
    { id: 2, code: 'CS302', name: 'Database Systems', department: 'CS', year: 'III', semester: 1 }
  ]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '', name: '', department: '', year: '', semester: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newSubject = { ...formData, id: Date.now() };
    setSubjects([...subjects, newSubject]);
    setFormData({ code: '', name: '', department: '', year: '', semester: '' });
    setShowForm(false);
    setMessage('Subject created successfully!');
  };

  return (
    <div className="subject-management">
      <div className="form-header">
        <button className="back-btn" onClick={() => setCurrentView('main')}>
          <ArrowLeft size={16} />
        </button>
        <h2>Subject Management</h2>
        <button className="add-btn" onClick={() => setShowForm(!showForm)}>
          + Add Subject
        </button>
      </div>

      {showForm && (
        <div className="form-overlay">
          <form onSubmit={handleSubmit} className="modern-form subject-form">
            <div className="form-header-modern">
              <h3>Create New Subject</h3>
              <button type="button" className="close-btn" onClick={() => setShowForm(false)}>×</button>
            </div>
            
            <div className="form-body">
              <div className="form-row">
                <div className="input-group-modern">
                  <input
                    type="text"
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    required
                  />
                  <label htmlFor="code">Subject Code</label>
                  <span className="input-highlight"></span>
                </div>
                
                <div className="input-group-modern">
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                  <label htmlFor="name">Subject Name</label>
                  <span className="input-highlight"></span>
                </div>
              </div>
              
              <div className="form-row">
                <div className="select-group-modern">
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    required
                  >
                    <option value="">Select Dept</option>
                    <option value="CS">Computer Science</option>
                    <option value="IT">Information Technology</option>
                    <option value="EC">Electronics</option>
                  </select>
                  <label>Dept</label>
                </div>
                
                <div className="select-group-modern">
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    required
                  >
                    <option value="">Select Year</option>
                    <option value="I">I Year</option>
                    <option value="II">II Year</option>
                    <option value="III">III Year</option>
                    <option value="IV">IV Year</option>
                  </select>
                  <label>Year</label>
                </div>
                
                <div className="select-group-modern">
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({...formData, semester: e.target.value})}
                    required
                  >
                    <option value="">Select Semester</option>
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                  </select>
                  <label>Semester</label>
                </div>
              </div>
            </div>
            
            <div className="form-actions-modern">
              <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="create-btn">Create Subject</button>
            </div>
          </form>
        </div>
      )}

      <div className="subjects-table">
        <table>
          <thead>
            <tr>
              <th>Subject Code</th>
              <th>Subject Name</th>
              <th>Dept</th>
              <th>Year</th>
              <th>Semester</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map(subject => (
              <tr key={subject.id}>
                <td>{subject.code}</td>
                <td>{subject.name}</td>
                <td>{subject.department}</td>
                <td>{subject.year}</td>
                <td>{subject.semester}</td>
                <td>
                  <button className="delete-btn" onClick={() => {
                    setSubjects(subjects.filter(s => s.id !== subject.id));
                    setMessage('Subject deleted successfully!');
                  }}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StaffAssignments({ setCurrentView, setMessage }) {
  const [assignments, setAssignments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [staffMembers, setStaffMembers] = useState([]);
  const [formData, setFormData] = useState({
    staffId: '', subject: '', department: '', year: ''
  });

  const fetchStaffMembers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/accounts', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (response.ok) {
        const staff = data.filter(account => account.role === 'staff');
        setStaffMembers(staff.map(s => ({ id: s.staff_id, name: s.name, department: s.department })));
      }
    } catch (error) {
      console.error('Failed to fetch staff members');
    }
  };

  useEffect(() => {
    fetchStaffMembers();
  }, []);

  const subjects = [
    'Data Structures', 'Database Systems', 'Web Development', 'Computer Networks'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const staff = staffMembers.find(s => s.id === formData.staffId);
    const newAssignment = {
      id: Date.now(),
      staff: staff.name,
      staffId: formData.staffId,
      subject: formData.subject,
      department: formData.department,
      year: formData.year
    };
    setAssignments([...assignments, newAssignment]);
    setFormData({ staffId: '', subject: '', department: '', year: '' });
    setShowForm(false);
    setMessage('Staff assigned successfully!');
  };

  return (
    <div className="staff-assignments">
      <div className="form-header">
        <button className="back-btn" onClick={() => setCurrentView('main')}>
          <ArrowLeft size={16} />
        </button>
        <h2>Staff Assignments</h2>
        <button className="add-btn" onClick={() => setShowForm(!showForm)}>
          + Assign Staff
        </button>
      </div>

      {showForm && (
        <div className="form-overlay">
          <form onSubmit={handleSubmit} className="modern-form assignment-form">
            <div className="form-header-modern">
              <h3>Assign Staff to Subject</h3>
              <button type="button" className="close-btn" onClick={() => setShowForm(false)}>×</button>
            </div>
            
            <div className="form-body">
              <div className="form-row">
                <div className="select-group-modern">
                  <select
                    value={formData.staffId}
                    onChange={(e) => setFormData({...formData, staffId: e.target.value})}
                    required
                  >
                    <option value="">Select Staff</option>
                    {staffMembers
                      .filter(staff => !formData.department || staff.department === formData.department)
                      .map(staff => (
                        <option key={staff.id} value={staff.id}>{staff.name} ({staff.id})</option>
                      ))}
                  </select>
                  <label>Staff</label>
                </div>
                
                <div className="select-group-modern">
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                  <label>Subject</label>
                </div>
              </div>
              
              <div className="form-row">
                <div className="select-group-modern">
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    required
                  >
                    <option value="">Select Dept</option>
                    <option value="CS">Computer Science</option>
                    <option value="IT">Information Technology</option>
                    <option value="EC">Electronics</option>
                  </select>
                  <label>Dept</label>
                </div>
                
                <div className="input-group-modern">
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    placeholder="e.g., 24 for 2024"
                    maxLength="2"
                    required
                  />
                  <label>Year</label>
                </div>
              </div>
            </div>
            
            <div className="form-actions-modern">
              <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="create-btn">Assign Staff</button>
            </div>
          </form>
        </div>
      )}

      <div className="assignments-table">
        <table>
          <thead>
            <tr>
              <th>Staff</th>
              <th>Subject</th>
              <th>Dept</th>
              <th>Year</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map(assignment => (
              <tr key={assignment.id}>
                <td>{assignment.staff}</td>
                <td>{assignment.subject}</td>
                <td>{assignment.department}</td>
                <td>{assignment.year}</td>
                <td>
                  <button className="delete-btn" onClick={() => {
                    setAssignments(assignments.filter(a => a.id !== assignment.id));
                    setMessage('Assignment removed successfully!');
                  }}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CCManagement({ setCurrentView, setMessage }) {
  const [coordinators, setCoordinators] = useState([
    { id: 1, staff: 'Dr. Kumar Singh', staffId: 'STF003', department: 'CS', year: 3, batch: 'CS-3rd Year' }
  ]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    staffId: '', department: '', year: ''
  });

  const staffMembers = [
    { id: 'STF001', name: 'Mr. Raj Kumar' },
    { id: 'STF002', name: 'Ms. Priya Sharma' },
    { id: 'STF003', name: 'Dr. Kumar Singh' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const staff = staffMembers.find(s => s.id === formData.staffId);
    const newCoordinator = {
      id: Date.now(),
      staff: staff.name,
      staffId: formData.staffId,
      department: formData.department,
      year: formData.year,
      batch: `${formData.department}-20${formData.year}`
    };
    setCoordinators([...coordinators, newCoordinator]);
    setFormData({ staffId: '', department: '', year: '' });
    setShowForm(false);
    setMessage('CC assigned successfully!');
  };

  return (
    <div className="cc-management">
      <div className="form-header">
        <button className="back-btn" onClick={() => setCurrentView('main')}>
          <ArrowLeft size={16} />
        </button>
        <h2>CC Management</h2>
        <button className="add-btn" onClick={() => setShowForm(!showForm)}>
          + Assign CC
        </button>
      </div>

      {showForm && (
        <div className="form-overlay">
          <form onSubmit={handleSubmit} className="modern-form coordinator-form">
            <div className="form-header-modern">
              <h3>Assign CC</h3>
              <button type="button" className="close-btn" onClick={() => setShowForm(false)}>×</button>
            </div>
            
            <div className="form-body">
              <div className="form-row">
                <div className="select-group-modern full-width">
                  <select
                    value={formData.staffId}
                    onChange={(e) => setFormData({...formData, staffId: e.target.value})}
                    required
                  >
                    <option value="">Select Staff</option>
                    {staffMembers.map(staff => (
                      <option key={staff.id} value={staff.id}>{staff.name}</option>
                    ))}
                  </select>
                  <label>Staff</label>
                </div>
              </div>
              
              <div className="form-row">
                <div className="select-group-modern">
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    required
                  >
                    <option value="">Select Dept</option>
                    <option value="CS">Computer Science</option>
                    <option value="IT">Information Technology</option>
                    <option value="EC">Electronics</option>
                  </select>
                  <label>Dept</label>
                </div>
                
                <div className="input-group-modern">
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    placeholder="e.g., 24 for 2024"
                    maxLength="2"
                    required
                  />
                  <label>Year</label>
                </div>
              </div>
            </div>
            
            <div className="form-actions-modern">
              <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="create-btn">Assign CC</button>
            </div>
          </form>
        </div>
      )}

      <div className="coordinators-table">
        <table>
          <thead>
            <tr>
              <th>Staff</th>
              <th>Batch</th>
              <th>Dept</th>
              <th>Year</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coordinators.map(coordinator => (
              <tr key={coordinator.id}>
                <td>{coordinator.staff}</td>
                <td>{coordinator.batch}</td>
                <td>{coordinator.department}</td>
                <td>{coordinator.year}</td>
                <td>
                  <button className="delete-btn" onClick={() => {
                    setCoordinators(coordinators.filter(c => c.id !== coordinator.id));
                    setMessage('CC removed successfully!');
                  }}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReportsOverview({ setCurrentView }) {
  const reportData = {
    totalStudents: 245,
    totalTeachers: 18,
    totalSubjects: 24,
    avgAttendance: 78.5,
    pendingCertificates: 12,
    activeCoordinators: 4
  };

  return (
    <div className="reports-overview">
      <div className="form-header">
        <button className="back-btn" onClick={() => setCurrentView('main')}>
          <ArrowLeft size={16} />
        </button>
        <h2>Reports & Analytics</h2>
      </div>

      <div className="reports-grid">
        <div className="report-card">
          <div className="report-icon students">
            <GraduationCap size={24} />
          </div>
          <div className="report-content">
            <h3>{reportData.totalStudents}</h3>
            <p>Total Students</p>
          </div>
        </div>

        <div className="report-card">
          <div className="report-icon staff">
            <Users size={24} />
          </div>
          <div className="report-content">
            <h3>{reportData.totalTeachers}</h3>
            <p>Total Staff</p>
          </div>
        </div>

        <div className="report-card">
          <div className="report-icon subjects">
            <BookOpen size={24} />
          </div>
          <div className="report-content">
            <h3>{reportData.totalSubjects}</h3>
            <p>Total Subjects</p>
          </div>
        </div>

        <div className="report-card">
          <div className="report-icon attendance">
            <BarChart3 size={24} />
          </div>
          <div className="report-content">
            <h3>{reportData.avgAttendance}%</h3>
            <p>Avg Attendance</p>
          </div>
        </div>

        <div className="report-card">
          <div className="report-icon certificates">
            <Eye size={24} />
          </div>
          <div className="report-content">
            <h3>{reportData.pendingCertificates}</h3>
            <p>Pending Certificates</p>
          </div>
        </div>

        <div className="report-card">
          <div className="report-icon coordinators">
            <UserCheck size={24} />
          </div>
          <div className="report-content">
            <h3>{reportData.activeCoordinators}</h3>
            <p>Active CCs</p>
          </div>
        </div>
      </div>

      <div className="detailed-reports">
        <h3>Detailed Reports</h3>
        <div className="report-buttons">
          <button className="report-btn">Download Attendance Report</button>
          <button className="report-btn">Download Grades Report</button>
          <button className="report-btn">Download Certificate Report</button>
          <button className="report-btn">Download Staff Assignment Report</button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;