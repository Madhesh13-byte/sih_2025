import React, { useState, useEffect } from 'react';
import { GraduationCap, Users, Eye, ArrowLeft, RefreshCw, Trash2, BookOpen, UserCheck, BarChart3, Settings, Calendar } from 'lucide-react';
import './AdminDashboard.css';
import ClassManagement from './ClassManagementNew';
import AdminSettings from './AdminSettings';
import TimetableManagement from './TimetableManagement';

function AdminDashboard({ user, logout }) {
  const [currentView, setCurrentView] = useState('main');
  const [accounts, setAccounts] = useState([]);
  const [message, setMessage] = useState('');
  
  const setAutoHideMessage = (msg) => {
    setMessage(msg);
    if (msg.includes('successfully')) {
      setTimeout(() => setMessage(''), 3000);
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
          <CreateStudentForm setCurrentView={setCurrentView} setMessage={setAutoHideMessage} />
        )}
        
        {currentView === 'create-staff' && (
          <CreateStaffForm setCurrentView={setCurrentView} setMessage={setAutoHideMessage} />
        )}
        
        {currentView === 'view' && (
          <ViewAccounts accounts={accounts} setCurrentView={setCurrentView} setMessage={setAutoHideMessage} fetchAccounts={fetchAccounts} />
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
          <ReportsOverview setCurrentView={setCurrentView} />
        )}
        
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
            
            <button className="admin-btn classes" onClick={() => setCurrentView('classes')}>
              <Users size={24} />
              <span>Class Management</span>
            </button>
            
            <button className="admin-btn timetables" onClick={() => setCurrentView('timetables')}>
              <Calendar size={24} />
              <span>Timetable Management</span>
            </button>
          </div>
        </div>
        
        <div className="section-group">
          <h3>Reports & System</h3>
          <div className="admin-actions">
            <button className="admin-btn reports" onClick={() => setCurrentView('reports')}>
              <BarChart3 size={24} />
              <span>Reports & Analytics</span>
            </button>
            
            <button className="admin-btn settings" onClick={() => setCurrentView('settings')}>
              <Settings size={24} />
              <span>System Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateStudentForm({ setCurrentView, setMessage }) {
  const [step, setStep] = useState(1);
  const [batchData, setBatchData] = useState({
    department: '',
    year: ''
  });
  const [studentRows, setStudentRows] = useState([{
    name: '',
    email: '',
    day: '',
    month: '',
    dobYear: '',
    generatedId: '',
    generatedPassword: ''
  }]);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleBatchSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const addStudentRow = () => {
    setStudentRows([...studentRows, {
      name: '',
      email: '',
      day: '',
      month: '',
      dobYear: '',
      generatedId: '',
      generatedPassword: ''
    }]);
  };

  const removeStudentRow = (index) => {
    setStudentRows(studentRows.filter((_, i) => i !== index));
  };

  const updateStudentRow = (index, field, value) => {
    const updated = studentRows.map((row, i) => {
      if (i === index) {
        const newRow = { ...row, [field]: value };
        
        // Auto-generate ID when name is entered
        if (field === 'name' && value && !newRow.generatedId) {
          generateStudentId(index);
        }
        
        // Auto-generate password when DOB is complete
        if (['day', 'month', 'dobYear'].includes(field) && newRow.day && newRow.month && newRow.dobYear) {
          const password = `${newRow.day}${newRow.month}${newRow.dobYear.toString().slice(-2)}`;
          newRow.generatedPassword = password;
        }
        
        return newRow;
      }
      return row;
    });
    setStudentRows(updated);
  };

  const generateStudentId = async (index) => {
    try {
      const deptCode = batchData.department.toUpperCase().substring(0, 2);
      const yearCode = batchData.year.toString().slice(-2);
      
      const response = await fetch(`http://localhost:5000/api/admin/next-student-number?dept=${deptCode}&year=${yearCode}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const numStr = (data.nextNumber + index).toString().padStart(2, '0');
        const id = `STU${deptCode}${yearCode}${numStr}`;
        
        const updated = studentRows.map((row, i) => 
          i === index ? { ...row, generatedId: id } : row
        );
        setStudentRows(updated);
      }
    } catch (error) {
      console.error('Failed to generate student ID');
    }
  };
  
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    try {
      const validRows = studentRows.filter(row => row.name && row.day && row.month && row.dobYear);
      const promises = validRows.map(row => 
        fetch('http://localhost:5000/api/admin/create-student', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            name: row.name,
            email: row.email,
            day: row.day,
            month: row.month,
            dobYear: row.dobYear,
            register_no: row.generatedId,
            password: row.generatedPassword,
            department: batchData.department,
            year: batchData.year
          })
        })
      );
      
      await Promise.all(promises);
      setMessage(`${validRows.length} student accounts created successfully and auto-assigned to classes!`);
      setStep(1);
      setBatchData({ department: '', year: '' });
      setStudentRows([{ name: '', email: '', day: '', month: '', dobYear: '', generatedId: '', generatedPassword: '' }]);
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
      
      {step === 1 ? (
        <form onSubmit={handleBatchSubmit} className="admin-form">
          <div className="form-group">
            <label>Dept *</label>
            <select
              value={batchData.department}
              onChange={(e) => setBatchData({...batchData, department: e.target.value})}
              required
            >
              <option value="">Select Dept</option>
              <option value="IT">Information Technology</option>
              <option value="CSE">Computer Science Engineering</option>
              <option value="AIDS">Artificial Intelligence & Data Science</option>
              <option value="MECH">Mechanical Engineering</option>
              <option value="EEE">Electrical & Electronics Engineering</option>
              <option value="ECE">Electronics & Communication Engineering</option>
              <option value="CIVIL">Civil Engineering</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Year of Joining (YY format) *</label>
            <input
              type="text"
              value={batchData.year}
              onChange={(e) => setBatchData({...batchData, year: e.target.value})}
              placeholder="25"
              maxLength="2"
              required
            />
          </div>
          
          <button type="submit" className="submit-btn">
            Next: Add Students
          </button>
        </form>
      ) : (
        <form onSubmit={handleFinalSubmit} className="admin-form">
          <h3>Add Students for {batchData.department} - 20{batchData.year}</h3>
          
          {studentRows.map((row, index) => (
            <div key={index} className="student-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={row.name}
                  onChange={(e) => updateStudentRow(index, 'name', e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Date of Birth (DD/MM/YY) *</label>
                <div className="dob-inputs">
                  <input
                    type="text"
                    value={row.day}
                    onChange={(e) => updateStudentRow(index, 'day', e.target.value)}
                    placeholder="DD"
                    maxLength="2"
                    required
                  />
                  <span>/</span>
                  <input
                    type="text"
                    value={row.month}
                    onChange={(e) => updateStudentRow(index, 'month', e.target.value)}
                    placeholder="MM"
                    maxLength="2"
                    required
                  />
                  <span>/</span>
                  <input
                    type="text"
                    value={row.dobYear}
                    onChange={(e) => updateStudentRow(index, 'dobYear', e.target.value)}
                    placeholder="YY"
                    maxLength="2"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Email (Optional)</label>
                <input
                  type="email"
                  value={row.email}
                  onChange={(e) => updateStudentRow(index, 'email', e.target.value)}
                />
              </div>
              
              {row.generatedId && (
                <div className="form-group">
                  <label>Generated ID</label>
                  <input type="text" value={row.generatedId} disabled className="generated-field" />
                </div>
              )}
              
              {row.generatedPassword && (
                <div className="form-group">
                  <label>Generated Password</label>
                  <input type="text" value={row.generatedPassword} disabled className="generated-field" />
                </div>
              )}
              
              {studentRows.length > 1 && (
                <button type="button" className="remove-row-btn" onClick={() => removeStudentRow(index)}>
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          
          <button type="button" className="add-row-btn" onClick={addStudentRow}>
            + Add Another Student
          </button>
          
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => setStep(1)}>Back</button>
            <button type="submit" className={`submit-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Creating...
                </>
              ) : (
                'Create All Students'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default AdminDashboard;
function CreateStaffForm({ setCurrentView, setMessage }) {
  const [step, setStep] = useState(1);
  const [batchData, setBatchData] = useState({
    department: ''
  });
  const [staffRows, setStaffRows] = useState([{
    name: '',
    email: '',
    generatedId: '',
    generatedPassword: ''
  }]);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleBatchSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const addStaffRow = () => {
    setStaffRows([...staffRows, {
      name: '',
      email: '',
      generatedId: '',
      generatedPassword: ''
    }]);
  };

  const removeStaffRow = (index) => {
    setStaffRows(staffRows.filter((_, i) => i !== index));
  };

  const updateStaffRow = (index, field, value) => {
    const updated = staffRows.map((row, i) => {
      if (i === index) {
        const newRow = { ...row, [field]: value };
        
        // Auto-generate ID when name is entered
        if (field === 'name' && value && !newRow.generatedId) {
          generateStaffId(index);
        }
        
        // Auto-generate password when name is entered
        if (field === 'name' && value) {
          const name = value.toLowerCase().replace(/\s+/g, '');
          const dept = batchData.department.toLowerCase();
          newRow.generatedPassword = `${name}@${dept}`;
        }
        
        return newRow;
      }
      return row;
    });
    setStaffRows(updated);
  };

  const generateStaffId = async (index) => {
    try {
      const deptCode = batchData.department.toUpperCase().substring(0, 3);
      
      const response = await fetch(`http://localhost:5000/api/admin/next-staff-number?dept=${deptCode}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const numStr = (data.nextNumber + index).toString().padStart(3, '0');
        const id = `STF${deptCode}${numStr}`;
        
        const updated = staffRows.map((row, i) => 
          i === index ? { ...row, generatedId: id } : row
        );
        setStaffRows(updated);
      }
    } catch (error) {
      console.error('Failed to generate staff ID');
    }
  };
  
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    try {
      const validRows = staffRows.filter(row => row.name);
      const promises = validRows.map(row => 
        fetch('http://localhost:5000/api/admin/create-staff', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            name: row.name,
            email: row.email,
            staff_id: row.generatedId,
            password: row.generatedPassword,
            department: batchData.department
          })
        })
      );
      
      await Promise.all(promises);
      setMessage(`${validRows.length} staff accounts created successfully!`);
      setStep(1);
      setBatchData({ department: '' });
      setStaffRows([{ name: '', email: '', generatedId: '', generatedPassword: '' }]);
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
      
      {step === 1 ? (
        <form onSubmit={handleBatchSubmit} className="admin-form">
          <div className="form-group">
            <label>Dept *</label>
            <select
              value={batchData.department}
              onChange={(e) => setBatchData({...batchData, department: e.target.value})}
              required
            >
              <option value="">Select Dept</option>
              <option value="IT">Information Technology</option>
              <option value="CSE">Computer Science Engineering</option>
              <option value="AIDS">Artificial Intelligence & Data Science</option>
              <option value="MECH">Mechanical Engineering</option>
              <option value="EEE">Electrical & Electronics Engineering</option>
              <option value="ECE">Electronics & Communication Engineering</option>
              <option value="CIVIL">Civil Engineering</option>
            </select>
          </div>
          
          <button type="submit" className="submit-btn">
            Next: Add Staff
          </button>
        </form>
      ) : (
        <form onSubmit={handleFinalSubmit} className="admin-form">
          <h3>Add Staff for {batchData.department}</h3>
          
          {staffRows.map((row, index) => (
            <div key={index} className="staff-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={row.name}
                  onChange={(e) => updateStaffRow(index, 'name', e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Email (Optional)</label>
                <input
                  type="email"
                  value={row.email}
                  onChange={(e) => updateStaffRow(index, 'email', e.target.value)}
                />
              </div>
              
              {row.generatedId && (
                <div className="form-group">
                  <label>Generated ID</label>
                  <input type="text" value={row.generatedId} disabled className="generated-field" />
                </div>
              )}
              
              {row.generatedPassword && (
                <div className="form-group">
                  <label>Generated Password</label>
                  <input type="text" value={row.generatedPassword} disabled className="generated-field" />
                </div>
              )}
              
              {staffRows.length > 1 && (
                <button type="button" className="remove-row-btn" onClick={() => removeStaffRow(index)}>
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          
          <button type="button" className="add-row-btn" onClick={addStaffRow}>
            + Add Another Staff
          </button>
          
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => setStep(1)}>Back</button>
            <button type="submit" className={`submit-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Creating...
                </>
              ) : (
                'Create All Staff'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
function ViewAccounts({ accounts, setCurrentView, setMessage, fetchAccounts }) {
  const [resetId, setResetId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  const departments = [
    { code: 'IT', name: 'Information Technology' },
    { code: 'CSE', name: 'Computer Science Engineering' },
    { code: 'AIDS', name: 'Artificial Intelligence & Data Science' },
    { code: 'MECH', name: 'Mechanical Engineering' },
    { code: 'EEE', name: 'Electrical & Electronics Engineering' },
    { code: 'ECE', name: 'Electronics & Communication Engineering' },
    { code: 'CIVIL', name: 'Civil Engineering' }
  ];
  
  const calculateAcademicYear = (registerNo) => {
    if (!registerNo) return null;
    const yearCode = registerNo.slice(-4, -2);
    const joiningYear = 2000 + parseInt(yearCode);
    const currentYear = new Date().getFullYear();
    const academicYear = currentYear - joiningYear + 1;
    return Math.min(Math.max(academicYear, 1), 4);
  };

  const filteredAccounts = accounts.filter(account => {
    if (!selectedDept) return false;
    if (account.department !== selectedDept) return false;
    if (selectedRole && account.role !== selectedRole) return false;
    
    if (selectedRole === 'student' && selectedYear) {
      const studentYear = calculateAcademicYear(account.register_no);
      if (studentYear !== parseInt(selectedYear)) return false;
    }
    
    return true;
  });

  const handleDeptSelect = (dept) => {
    setSelectedDept(dept);
    setSelectedRole('');
    setSelectedYear('');
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setSelectedYear('');
  };
  
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
      
      <div className="dept-filters">
        <h3>Select Department</h3>
        <div className="dept-buttons">
          {departments.map(dept => (
            <button
              key={dept.code}
              className={`dept-btn ${selectedDept === dept.code ? 'active' : ''}`}
              onClick={() => handleDeptSelect(dept.code)}
            >
              {dept.code}
            </button>
          ))}
        </div>
      </div>

      {selectedDept && (
        <div className="role-filters">
          <h4>View {selectedDept} Accounts</h4>
          <div className="role-toggle">
            <button
              className={`role-btn ${selectedRole === 'student' ? 'active' : ''}`}
              onClick={() => handleRoleSelect('student')}
            >
              Students
            </button>
            <button
              className={`role-btn ${selectedRole === 'staff' ? 'active' : ''}`}
              onClick={() => handleRoleSelect('staff')}
            >
              Staff
            </button>
          </div>
        </div>
      )}

      {selectedRole === 'student' && (
        <div className="year-filters">
          <h5>Filter by Year</h5>
          <div className="year-buttons">
            <button
              className={`year-btn ${selectedYear === '' ? 'active' : ''}`}
              onClick={() => setSelectedYear('')}
            >
              All
            </button>
            {[1, 2, 3, 4].map(year => (
              <button
                key={year}
                className={`year-btn ${selectedYear === year.toString() ? 'active' : ''}`}
                onClick={() => setSelectedYear(year.toString())}
              >
                {year} Year
              </button>
            ))}
          </div>
        </div>
      )}
      
      {selectedDept && selectedRole && (
        <div className="accounts-summary">
          <p>Showing {filteredAccounts.length} {selectedRole}(s) from {selectedDept} department</p>
        </div>
      )}

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
                    {account.role === 'student' && (
                      <ClassAssignment studentId={account.id} currentClassId={account.class_id} fetchAccounts={fetchAccounts} setMessage={setMessage} />
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
  const [subjects, setSubjects] = useState([]);
  const [step, setStep] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [batchData, setBatchData] = useState({
    department: '', year: '', semester: ''
  });
  const [subjectRows, setSubjectRows] = useState([
    { code: '', name: '' }
  ]);

  useEffect(() => {
    const savedSubjects = JSON.parse(localStorage.getItem('subjects') || '[]');
    if (savedSubjects.length === 0) {
      const defaultSubjects = [
        { id: 1, code: 'CS301', name: 'Data Structures', department: 'CSE', year: 'III', semester: 1 },
        { id: 2, code: 'CS302', name: 'Database Systems', department: 'CSE', year: 'III', semester: 1 }
      ];
      setSubjects(defaultSubjects);
      localStorage.setItem('subjects', JSON.stringify(defaultSubjects));
    } else {
      setSubjects(savedSubjects);
    }
  }, []);

  const handleStep1Submit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const addSubjectRow = () => {
    setSubjectRows([...subjectRows, { code: '', name: '' }]);
  };

  const removeSubjectRow = (index) => {
    if (subjectRows.length > 1) {
      setSubjectRows(subjectRows.filter((_, i) => i !== index));
    }
  };

  const updateSubjectRow = (index, field, value) => {
    const updated = subjectRows.map((row, i) => 
      i === index ? { ...row, [field]: value } : row
    );
    setSubjectRows(updated);
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    const validRows = subjectRows.filter(row => row.code && row.name);
    if (validRows.length === 0) {
      setMessage('Please add at least one subject');
      return;
    }

    const newSubjects = validRows.map(row => ({
      id: Date.now() + Math.random(),
      code: row.code,
      name: row.name,
      department: batchData.department,
      year: batchData.year,
      semester: batchData.semester
    }));

    const updatedSubjects = [...subjects, ...newSubjects];
    setSubjects(updatedSubjects);
    localStorage.setItem('subjects', JSON.stringify(updatedSubjects));
    
    // Reset form
    setStep(1);
    setBatchData({ department: '', year: '', semester: '' });
    setSubjectRows([{ code: '', name: '' }]);
    setShowForm(false);
    setMessage(`${newSubjects.length} subjects created successfully!`);
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
          {step === 1 ? (
            <form onSubmit={handleStep1Submit} className="modern-form subject-form">
              <div className="form-header-modern">
                <h3>Step 1: Select Department & Semester</h3>
                <button type="button" className="close-btn" onClick={() => setShowForm(false)}>×</button>
              </div>
              
              <div className="form-body">
                <div className="form-row">
                  <div className="select-group-modern">
                    <select
                      value={batchData.department}
                      onChange={(e) => setBatchData({...batchData, department: e.target.value})}
                      required
                    >
                      <option value="">Select Dept</option>
                      <option value="IT">Information Technology</option>
                      <option value="CSE">Computer Science Engineering</option>
                      <option value="AIDS">Artificial Intelligence & Data Science</option>
                      <option value="MECH">Mechanical Engineering</option>
                      <option value="EEE">Electrical & Electronics Engineering</option>
                      <option value="ECE">Electronics & Communication Engineering</option>
                      <option value="CIVIL">Civil Engineering</option>
                    </select>
                    <label>Department</label>
                  </div>
                  
                  <div className="select-group-modern">
                    <select
                      value={batchData.year}
                      onChange={(e) => setBatchData({...batchData, year: e.target.value, semester: ''})}
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
                      value={batchData.semester}
                      onChange={(e) => setBatchData({...batchData, semester: e.target.value})}
                      required
                      disabled={!batchData.year}
                    >
                      <option value="">Select Semester</option>
                      {batchData.year === 'I' && (
                        <>
                          <option value="1">Semester 1</option>
                          <option value="2">Semester 2</option>
                        </>
                      )}
                      {batchData.year === 'II' && (
                        <>
                          <option value="3">Semester 3</option>
                          <option value="4">Semester 4</option>
                        </>
                      )}
                      {batchData.year === 'III' && (
                        <>
                          <option value="5">Semester 5</option>
                          <option value="6">Semester 6</option>
                        </>
                      )}
                      {batchData.year === 'IV' && (
                        <>
                          <option value="7">Semester 7</option>
                          <option value="8">Semester 8</option>
                        </>
                      )}
                    </select>
                    <label>Semester</label>
                  </div>
                </div>
              </div>
              
              <div className="form-actions-modern">
                <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="create-btn">Next: Add Subjects</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleFinalSubmit} className="modern-form subject-form bulk-subjects">
              <div className="form-header-modern">
                <h3>Step 2: Add Subjects for {batchData.department} - Year {batchData.year} - Sem {batchData.semester}</h3>
                <button type="button" className="close-btn" onClick={() => setShowForm(false)}>×</button>
              </div>
              
              <div className="form-body">
                <div className="subjects-bulk">
                  {subjectRows.map((row, index) => (
                    <div key={index} className="subject-row">
                      <div className="input-group-modern">
                        <input
                          type="text"
                          value={row.code}
                          onChange={(e) => updateSubjectRow(index, 'code', e.target.value)}
                          placeholder="CS301"
                          required
                        />
                        <label>Subject Code</label>
                      </div>
                      
                      <div className="input-group-modern">
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) => updateSubjectRow(index, 'name', e.target.value)}
                          placeholder="Data Structures"
                          required
                        />
                        <label>Subject Name</label>
                      </div>
                      
                      {subjectRows.length > 1 && (
                        <button type="button" className="remove-row-btn" onClick={() => removeSubjectRow(index)}>×</button>
                      )}
                    </div>
                  ))}
                  
                  <button type="button" className="add-row-btn" onClick={addSubjectRow}>
                    + Add Another Subject
                  </button>
                </div>
              </div>
              
              <div className="form-actions-modern">
                <button type="button" className="cancel-btn" onClick={() => setStep(1)}>Back</button>
                <button type="submit" className="create-btn">Create All Subjects</button>
              </div>
            </form>
          )}
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
                    const updatedSubjects = subjects.filter(s => s.id !== subject.id);
                    setSubjects(updatedSubjects);
                    localStorage.setItem('subjects', JSON.stringify(updatedSubjects));
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
  const [step, setStep] = useState(1);
  const [staffMembers, setStaffMembers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [batchData, setBatchData] = useState({
    department: '', year: '', semester: ''
  });
  const [assignmentRows, setAssignmentRows] = useState([{ staffId: '', subjectCode: '' }]);

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

  const fetchAssignments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/staff-assignments', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
      }
    } catch (error) {
      console.error('Failed to fetch assignments');
    }
  };

  useEffect(() => {
    fetchStaffMembers();
    fetchAssignments();
    const savedSubjects = JSON.parse(localStorage.getItem('subjects') || '[]');
    setSubjects(savedSubjects);
  }, []);

  const handleBatchSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const addAssignmentRow = () => {
    setAssignmentRows([...assignmentRows, { staffId: '', subjectCode: '' }]);
  };

  const removeAssignmentRow = (index) => {
    setAssignmentRows(assignmentRows.filter((_, i) => i !== index));
  };

  const updateAssignmentRow = (index, field, value) => {
    const updated = assignmentRows.map((row, i) => 
      i === index ? { ...row, [field]: value } : row
    );
    setAssignmentRows(updated);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    try {
      const promises = assignmentRows.map(row => {
        const staff = staffMembers.find(s => s.id === row.staffId);
        const subject = subjects.find(s => s.code === row.subjectCode);
        return fetch('http://localhost:5000/api/staff-assignments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            staffId: row.staffId,
            staffName: staff?.name || '',
            subjectCode: row.subjectCode,
            subjectName: subject?.name || '',
            department: batchData.department,
            year: batchData.year,
            semester: batchData.semester
          })
        });
      });
      
      await Promise.all(promises);
      fetchAssignments();
      setShowForm(false);
      setStep(1);
      setBatchData({ department: '', year: '', semester: '' });
      setAssignmentRows([{ staffId: '', subjectCode: '' }]);
      setMessage(`${assignmentRows.length} staff assignments created successfully!`);
    } catch (error) {
      setMessage('Error creating assignments');
    }
  };

  const filteredSubjects = subjects.filter(s => 
    s.department === batchData.department && 
    s.year === batchData.year && 
    s.semester === batchData.semester
  );

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
          {step === 1 ? (
            <form onSubmit={handleBatchSubmit} className="modern-form assignment-form">
              <div className="form-header-modern">
                <h3>Step 1: Select Class Details</h3>
                <button type="button" className="close-btn" onClick={() => setShowForm(false)}>×</button>
              </div>
              
              <div className="form-body">
                <div className="form-row">
                  <div className="select-group-modern">
                    <select
                      value={batchData.department}
                      onChange={(e) => setBatchData({...batchData, department: e.target.value})}
                      required
                    >
                      <option value="">Select Dept</option>
                      <option value="IT">Information Technology</option>
                      <option value="CSE">Computer Science Engineering</option>
                      <option value="AIDS">Artificial Intelligence & Data Science</option>
                      <option value="MECH">Mechanical Engineering</option>
                      <option value="EEE">Electrical & Electronics Engineering</option>
                      <option value="ECE">Electronics & Communication Engineering</option>
                      <option value="CIVIL">Civil Engineering</option>
                    </select>
                    <label>Department</label>
                  </div>
                  
                  <div className="select-group-modern">
                    <select
                      value={batchData.year}
                      onChange={(e) => setBatchData({...batchData, year: e.target.value, semester: ''})}
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
                      value={batchData.semester}
                      onChange={(e) => setBatchData({...batchData, semester: e.target.value})}
                      required
                      disabled={!batchData.year}
                    >
                      <option value="">Select Semester</option>
                      {batchData.year === 'I' && (
                        <>
                          <option value="1">Semester 1</option>
                          <option value="2">Semester 2</option>
                        </>
                      )}
                      {batchData.year === 'II' && (
                        <>
                          <option value="3">Semester 3</option>
                          <option value="4">Semester 4</option>
                        </>
                      )}
                      {batchData.year === 'III' && (
                        <>
                          <option value="5">Semester 5</option>
                          <option value="6">Semester 6</option>
                        </>
                      )}
                      {batchData.year === 'IV' && (
                        <>
                          <option value="7">Semester 7</option>
                          <option value="8">Semester 8</option>
                        </>
                      )}
                    </select>
                    <label>Semester</label>
                  </div>
                </div>
              </div>
              
              <div className="form-actions-modern">
                <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="create-btn">Next: Assign Staff</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleFinalSubmit} className="modern-form assignment-form bulk-assignments">
              <div className="form-header-modern">
                <h3>Step 2: Assign Staff for {batchData.department} - Year {batchData.year} - Sem {batchData.semester}</h3>
                <button type="button" className="close-btn" onClick={() => setShowForm(false)}>×</button>
              </div>
              
              <div className="form-body">
                <div className="assignments-bulk">
                  {assignmentRows.map((row, index) => (
                    <div key={index} className="assignment-row">
                      <div className="select-group-modern">
                        <select
                          value={row.staffId}
                          onChange={(e) => updateAssignmentRow(index, 'staffId', e.target.value)}
                          required
                        >
                          <option value="">Select Staff</option>
                          {staffMembers.map(staff => (
                            <option key={staff.id} value={staff.id}>
                              {staff.name} ({staff.department})
                            </option>
                          ))}
                        </select>
                        <label>Staff Member</label>
                      </div>
                      
                      <div className="select-group-modern">
                        <select
                          value={row.subjectCode}
                          onChange={(e) => updateAssignmentRow(index, 'subjectCode', e.target.value)}
                          required
                        >
                          <option value="">Select Subject</option>
                          {filteredSubjects.map(subject => (
                            <option key={subject.code} value={subject.code}>
                              {subject.code} - {subject.name}
                            </option>
                          ))}
                        </select>
                        <label>Subject</label>
                      </div>
                      
                      {assignmentRows.length > 1 && (
                        <button type="button" className="remove-row-btn" onClick={() => removeAssignmentRow(index)}>×</button>
                      )}
                    </div>
                  ))}
                  
                  <button type="button" className="add-row-btn" onClick={addAssignmentRow}>
                    + Add Another Assignment
                  </button>
                </div>
              </div>
              
              <div className="form-actions-modern">
                <button type="button" className="cancel-btn" onClick={() => setStep(1)}>Back</button>
                <button type="submit" className="create-btn">Create All Assignments</button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="assignments-table">
        <table>
          <thead>
            <tr>
              <th>Staff Name</th>
              <th>Staff ID</th>
              <th>Subject</th>
              <th>Dept</th>
              <th>Year</th>
              <th>Semester</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map(assignment => (
              <tr key={assignment.id}>
                <td>{assignment.staff_name}</td>
                <td>{assignment.staff_id}</td>
                <td>{assignment.subject_name}</td>
                <td>{assignment.department}</td>
                <td>{assignment.year}</td>
                <td>{assignment.semester}</td>
                <td>
                  <button className="delete-btn" onClick={async () => {
                    try {
                      const response = await fetch(`http://localhost:5000/api/staff-assignments/${assignment.id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                      });
                      if (response.ok) {
                        fetchAssignments();
                        setMessage('Assignment deleted successfully!');
                      }
                    } catch (error) {
                      setMessage('Error deleting assignment');
                    }
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
  const [coordinators, setCoordinators] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [staffMembers, setStaffMembers] = useState([]);
  const [formData, setFormData] = useState({
    staffId: '', department: '', year: '', semester: ''
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

  const fetchCoordinators = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/cc-assignments', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCoordinators(data);
      }
    } catch (error) {
      console.error('Failed to fetch coordinators');
    }
  };

  useEffect(() => {
    fetchStaffMembers();
    fetchCoordinators();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.staffId || !formData.department || !formData.year || !formData.semester) {
      setMessage('Please fill all fields');
      return;
    }
    
    try {
      const staff = staffMembers.find(s => s.id === formData.staffId);
      if (!staff) {
        setMessage('Staff member not found');
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/cc-assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          staffId: formData.staffId,
          staffName: staff.name,
          department: formData.department,
          year: formData.year,
          semester: formData.semester
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        fetchCoordinators();
        setFormData({ staffId: '', department: '', year: '', semester: '' });
        setShowForm(false);
        setMessage('CC assigned successfully!');
      } else {
        setMessage('Failed to assign CC: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      setMessage('Error assigning CC: ' + error.message);
    }
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
                    <option value="IT">Information Technology</option>
                    <option value="CSE">Computer Science Engineering</option>
                    <option value="AIDS">Artificial Intelligence & Data Science</option>
                    <option value="MECH">Mechanical Engineering</option>
                    <option value="EEE">Electrical & Electronics Engineering</option>
                    <option value="ECE">Electronics & Communication Engineering</option>
                    <option value="CIVIL">Civil Engineering</option>
                  </select>
                  <label>Dept</label>
                </div>
                
                <div className="select-group-modern">
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value, semester: ''})}
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
              </div>
              
              <div className="form-row">
                <div className="select-group-modern">
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({...formData, semester: e.target.value})}
                    required
                    disabled={!formData.year}
                  >
                    <option value="">Select Semester</option>
                    {formData.year === 'I' && (
                      <>
                        <option value="1">Semester 1</option>
                        <option value="2">Semester 2</option>
                      </>
                    )}
                    {formData.year === 'II' && (
                      <>
                        <option value="3">Semester 3</option>
                        <option value="4">Semester 4</option>
                      </>
                    )}
                    {formData.year === 'III' && (
                      <>
                        <option value="5">Semester 5</option>
                        <option value="6">Semester 6</option>
                      </>
                    )}
                    {formData.year === 'IV' && (
                      <>
                        <option value="7">Semester 7</option>
                        <option value="8">Semester 8</option>
                      </>
                    )}
                  </select>
                  <label>Semester</label>
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
              <th>Semester</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coordinators.map(coordinator => (
              <tr key={coordinator.id}>
                <td>{coordinator.staff_name}</td>
                <td>{coordinator.department}-{coordinator.year}-S{coordinator.semester}</td>
                <td>{coordinator.department}</td>
                <td>{coordinator.year}</td>
                <td>{coordinator.semester}</td>
                <td>
                  <button className="delete-btn" onClick={async () => {
                    try {
                      const response = await fetch(`http://localhost:5000/api/cc-assignments/${coordinator.id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                      });
                      if (response.ok) {
                        fetchCoordinators();
                        setMessage('CC removed successfully!');
                      }
                    } catch (error) {
                      setMessage('Error removing CC');
                    }
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

function ClassAssignment({ studentId, currentClassId, fetchAccounts, setMessage }) {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(currentClassId || '');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

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

  const handleAssign = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/assign-student-class/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ class_id: selectedClass })
      });
      
      if (response.ok) {
        fetchAccounts();
        setShowForm(false);
        setMessage('Student assigned to class successfully!');
      }
    } catch (error) {
      setMessage('Error assigning student to class');
    }
  };

  return (
    <div>
      {!showForm ? (
        <button className="assign-btn" onClick={() => setShowForm(true)}>
          {currentClassId ? 'Change Class' : 'Assign Class'}
        </button>
      ) : (
        <div className="class-assign-form">
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            <option value="">Select Class</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.department} {cls.year} {cls.section}
              </option>
            ))}
          </select>
          <button onClick={handleAssign} disabled={!selectedClass}>Assign</button>
          <button onClick={() => setShowForm(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}