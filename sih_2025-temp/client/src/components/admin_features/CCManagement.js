import React, { useState, useEffect } from 'react';
import { GraduationCap, Users, Eye, ArrowLeft, RefreshCw, Trash2, BookOpen, UserCheck, BarChart3, Settings, Calendar, Filter, Hash, Building2 } from 'lucide-react';
import './styles/CCManagement.css';
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
              <div className="form-grid">
                <div className="select-group-modern staff-select">
                  <select
                    value={formData.staffId}
                    onChange={(e) => setFormData({...formData, staffId: e.target.value})}
                    required
                  >
                    <option value="">Staff</option>
                    {staffMembers.map(staff => (
                      <option key={staff.id} value={staff.id}>{staff.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="select-group-modern">
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    required
                  >
                    <option value="">Department</option>
                    <option value="IT">Information Technology</option>
                    <option value="CSE">Computer Science Engineering</option>
                    <option value="AIDS">Artificial Intelligence & Data Science</option>
                    <option value="MECH">Mechanical Engineering</option>
                    <option value="EEE">Electrical & Electronics Engineering</option>
                    <option value="ECE">Electronics & Communication Engineering</option>
                    <option value="CIVIL">Civil Engineering</option>
                  </select>
                </div>
                
                <div className="select-group-modern">
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value, semester: ''})}
                    required
                  >
                    <option value="">Year</option>
                    <option value="I">I Year</option>
                    <option value="II">II Year</option>
                    <option value="III">III Year</option>
                    <option value="IV">IV Year</option>
                  </select>
                </div>
                
                <div className="select-group-modern">
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({...formData, semester: e.target.value})}
                    required
                    disabled={!formData.year}
                  >
                    <option value="">Semester</option>
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
 export default CCManagement;