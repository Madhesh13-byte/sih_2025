import React, { useState, useEffect } from 'react';
import { GraduationCap, Users, Eye, ArrowLeft, RefreshCw, Trash2, BookOpen, UserCheck, BarChart3, Settings, Calendar, Filter, Hash, Building2 } from 'lucide-react';
import ClassAssignment from './ClassAssignment';
import './styles/ViewAccounts.css';

function ViewAccounts({ accounts, setCurrentView, setMessage, fetchAccounts }) {
  const [resetId, setResetId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showClassAssignment, setShowClassAssignment] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [classesList, setClassesList] = useState([]);

  // Fetch classes when component mounts
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/classes', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
          const data = await response.json();
          setClassesList(data);
        }
      } catch (error) {
        console.error('Failed to fetch classes');
      }
    };
    fetchClasses();
  }, []);

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

  const handleDeleteAll = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/delete-all-accounts', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage(`✅ ${data.message}`);
        fetchAccounts();
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    }
  };
  
  return (
    <div className="accounts-container">
      <div className="form-header">
        <button className="back-btn" onClick={() => setCurrentView('main')}>
          <ArrowLeft size={16} />
        </button>
        <h2>All Accounts</h2>
        <div className="header-actions">
          <button className="delete-all-btn" onClick={() => {
            if (window.confirm('Are you sure you want to delete ALL accounts? This cannot be undone!')) {
              handleDeleteAll();
            }
          }}>
            <Trash2 size={16} /> Delete All
          </button>
          <button className="refresh-btn" onClick={fetchAccounts}>
            <RefreshCw size={16} />
          </button>
        </div>
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

      {selectedRole === 'student' && selectedStudents.length > 0 && (
        <div className="bulk-actions" style={{
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>{selectedStudents.length} students selected</span>
          <button
            onClick={() => {
              if (selectedStudents.length === 0) {
                setMessage('Please select students to assign to class');
                return;
              }
              setShowClassAssignment(true);
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Assign to Class
          </button>

          {showClassAssignment && (
            <div className="class-assignment-modal" style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
              zIndex: 1000
            }}>
              <h3>Assign Students to Class</h3>
              <div style={{ marginTop: '15px', marginBottom: '15px' }}>
                <select 
                  value={selectedClass} 
                  onChange={(e) => setSelectedClass(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginBottom: '10px',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}
                >
                  <option value="">Select Class</option>
                  {classesList.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.department} - {cls.year} {cls.section}
                    </option>
                  ))}
                </select>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    onClick={() => setShowClassAssignment(false)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const promises = selectedStudents.map(studentId => 
                          fetch(`http://localhost:5000/api/admin/assign-student-class/${studentId}`, {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${localStorage.getItem('token')}`
                            },
                            body: JSON.stringify({ class_id: selectedClass })
                          })
                        );

                        await Promise.all(promises);
                        setMessage(`Successfully assigned ${selectedStudents.length} students to class`);
                        setShowClassAssignment(false);
                        setSelectedStudents([]);
                        fetchAccounts();
                      } catch (error) {
                        setMessage('Error assigning students to class');
                      }
                    }}
                    disabled={!selectedClass}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: selectedClass ? '#2ecc71' : '#95a5a6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: selectedClass ? 'pointer' : 'not-allowed'
                    }}
                  >
                    Assign Selected Students
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="accounts-table">
        <table>
          <thead>
            <tr>
              {selectedRole === 'student' && <th><input 
                type="checkbox"
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedStudents(filteredAccounts.map(a => a.id));
                  } else {
                    setSelectedStudents([]);
                  }
                }}
                checked={selectedStudents.length === filteredAccounts.length && filteredAccounts.length > 0}
              /></th>}
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
                {selectedRole === 'student' && (
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(account.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudents([...selectedStudents, account.id]);
                        } else {
                          setSelectedStudents(selectedStudents.filter(id => id !== account.id));
                        }
                      }}
                    />
                  </td>
                )}
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
export default ViewAccounts;