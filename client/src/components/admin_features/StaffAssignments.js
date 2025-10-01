import React, { useState, useEffect } from 'react';
import { GraduationCap, Users, Eye, ArrowLeft, RefreshCw, Trash2, BookOpen, UserCheck, BarChart3, Settings, Calendar, Filter, Hash, Building2 } from 'lucide-react';
import './styles/StaffAssignments.css';
function StaffAssignments({ setCurrentView, setMessage }) {
  const [assignments, setAssignments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState(1);
  const [staffMembers, setStaffMembers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [batchData, setBatchData] = useState({
    department: '', year: '', semester: '', section: ''
  });
  const [assignmentRows, setAssignmentRows] = useState([{ staffId: '', subjectCode: '' }]);
  const [classes, setClasses] = useState([]);

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

  const fetchStaffMembers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/accounts', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (response.ok) {
        const staff = data.filter(account => account.role === 'staff');
        console.log('Fetched staff:', staff); // Debug log
        setStaffMembers(staff.map(s => ({ 
          id: s.staff_id, 
          name: s.name, 
          department: s.department || 'Not Assigned' 
        })).filter(s => s.id)); // Filter out invalid entries
      }
    } catch (error) {
      console.error('Failed to fetch staff members:', error);
      setMessage('❌ Failed to load staff members');
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/staff-assignments', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        // Filter out assignments with non-existent staff
        const validAssignments = data.filter(assignment => 
          staffMembers.some(staff => staff.id === assignment.staff_id)
        );
        setAssignments(validAssignments);
      }
    } catch (error) {
      console.error('Failed to fetch assignments');
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/subjects', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched subjects:', data); // Debug log
        setSubjects(data.filter(subject => 
          subject.subject_code && 
          subject.subject_name && 
          subject.department && 
          subject.year && 
          subject.semester
        ));
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      setMessage('❌ Failed to load subjects');
    }
  };

  useEffect(() => {
    fetchStaffMembers();
    fetchSubjects();
    fetchClasses();
  }, []);

  useEffect(() => {
    if (staffMembers.length > 0) {
      fetchAssignments();
    }
  }, [staffMembers]);

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
      const yearMap = { 'I': '1', 'II': '2', 'III': '3', 'IV': '4' };
      const romanYear = batchData.year; // Keep the Roman numeral version for class lookup
      const numericYear = yearMap[batchData.year] || batchData.year;
      
      // Find the corresponding class_id
      const classMatch = classes.find(c => 
        c.department === batchData.department && 
        c.year === romanYear && 
        c.section === batchData.section
      );

      const promises = assignmentRows.map(row => {
        const staff = staffMembers.find(s => s.id === row.staffId);
        const subject = subjects.find(s => s.subject_code === row.subjectCode);
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
            subjectName: subject?.subject_name || '',
            department: batchData.department,
            year: numericYear,
            semester: batchData.semester,
            section: batchData.section,
            class_id: classMatch ? classMatch.id : null
          })
        });
      });
      
      await Promise.all(promises);
      fetchAssignments();
      setShowForm(false);
      setStep(1);
      setBatchData({ department: '', year: '', semester: '', section: '' });
      setAssignmentRows([{ staffId: '', subjectCode: '' }]);
      setMessage(`${assignmentRows.length} staff assignments created successfully!`);
    } catch (error) {
      setMessage('Error creating assignments');
    }
  };

  const yearMap = { 'I': '1', 'II': '2', 'III': '3', 'IV': '4' };
  const numericYear = yearMap[batchData.year] || batchData.year;
  
  const filteredSubjects = subjects.filter(s => {
    return s.department === batchData.department && 
           s.year == numericYear && 
           s.semester == batchData.semester;
  });

  return (
    <div className="staff-assignments">
      <div className="form-header">
        <button className="back-btn" onClick={() => setCurrentView('main')}>
          <ArrowLeft size={16} />
        </button>
        <h2>Staff Assignments</h2>
        <div className="header-actions">
          <button 
            className="cleanup-btn" 
            onClick={async () => {
              if (window.confirm('Clean up assignments with deleted staff? This will remove orphaned assignments.')) {
                try {
                  const orphanedAssignments = assignments.filter(assignment => 
                    !staffMembers.some(staff => staff.id === assignment.staff_id)
                  );
                  
                  const deletePromises = orphanedAssignments.map(assignment => 
                    fetch(`http://localhost:5000/api/staff-assignments/${assignment.id}`, {
                      method: 'DELETE',
                      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    })
                  );
                  
                  await Promise.all(deletePromises);
                  await fetchAssignments();
                  setMessage(`✅ Cleaned up ${orphanedAssignments.length} orphaned assignments`);
                } catch (error) {
                  setMessage('❌ Error cleaning up assignments');
                }
              }
            }}
          >
            <RefreshCw size={16} /> Cleanup
          </button>
          <button 
            className="delete-all-btn" 
            onClick={async () => {
              if (window.confirm('Are you sure you want to delete ALL staff assignments? This cannot be undone!')) {
                try {
                  const response = await fetch('http://localhost:5000/api/staff-assignments', {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                  });
                  
                  if (response.ok) {
                    await fetchAssignments();
                    setMessage('✅ All staff assignments deleted successfully');
                  } else {
                    setMessage('❌ Failed to delete assignments');
                  }
                } catch (error) {
                  setMessage('❌ Error deleting assignments');
                }
              }
            }}
          >
            <Trash2 size={16} /> Delete All
          </button>
          <button className="add-btn" onClick={() => setShowForm(!showForm)}>
            + Assign Staff
          </button>
        </div>
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
                      value={batchData.year}
                      onChange={(e) => setBatchData({...batchData, year: e.target.value, semester: ''})}
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
                      value={batchData.semester}
                      onChange={(e) => setBatchData({...batchData, semester: e.target.value})}
                      required
                      disabled={!batchData.year}
                    >
                      <option value="">Semester</option>
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
                  </div>
                  
                  <div className="select-group-modern">
                    <select
                      value={batchData.section}
                      onChange={(e) => setBatchData({...batchData, section: e.target.value})}
                      required
                    >
                      <option value="">Section</option>
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                      <option value="C">Section C</option>
                    </select>
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
                            <option key={subject.subject_code} value={subject.subject_code}>
                              {subject.subject_code} - {subject.subject_name}
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
              <th>Section</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map(assignment => {
              const staffExists = staffMembers.some(staff => staff.id === assignment.staff_id);
              return (
                <tr key={assignment.id} className={!staffExists ? 'orphaned-row' : ''}>
                  <td>
                    {assignment.staff_name}
                    {!staffExists && <span className="missing-badge">DELETED</span>}
                  </td>
                  <td>{assignment.staff_id}</td>
                  <td>{assignment.subject_name}</td>
                  <td>{assignment.department}</td>
                  <td>{assignment.year}</td>
                  <td>{assignment.semester}</td>
                  <td>{assignment.section}</td>
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default StaffAssignments;