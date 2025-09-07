import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';

function ClassManagement({ setCurrentView, setMessage }) {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classDetails, setClassDetails] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [classStats, setClassStats] = useState({});
  const [formData, setFormData] = useState({
    department: '', year: '', section: ''
  });

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
        
        // Fetch stats for each class
        const statsPromises = data.map(cls => fetchClassStats(cls.id));
        const stats = await Promise.all(statsPromises);
        
        const statsMap = {};
        data.forEach((cls, index) => {
          statsMap[cls.id] = stats[index];
        });
        setClassStats(statsMap);
      }
    } catch (error) {
      console.error('Failed to fetch classes');
    }
  };
  
  const fetchClassStats = async (classId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/classes/${classId}/details`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        return {
          students: data.students.length,
          assignments: data.assignments.length,
          ccAssignments: data.ccAssignments?.length || 0
        };
      }
    } catch (error) {
      console.error('Failed to fetch class stats');
    }
    return { students: 0, assignments: 0, ccAssignments: 0 };
  };

  const fetchClassDetails = async (classId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/classes/${classId}/details`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setClassDetails(data);
        setSelectedClass(classId);
      }
    } catch (error) {
      console.error('Failed to fetch class details');
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        fetchClasses();
        setFormData({ department: '', year: '', section: '' });
        setShowForm(false);
        setMessage('Class created successfully!');
      }
    } catch (error) {
      setMessage('Error creating class');
    }
  };

  const calculateCurrentYear = (joiningYear) => {
    if (!joiningYear) return 'N/A';
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    // Academic year starts in June
    const currentAcademicYear = currentMonth >= 6 ? currentYear : currentYear - 1;
    const academicYear = Math.min(Math.max(currentAcademicYear - joiningYear + 1, 1), 4);
    return academicYear;
  };
  
  const getCurrentSemester = (studentYear) => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const isOddSemester = currentMonth >= 6 && currentMonth <= 11;
    const baseSemester = (studentYear - 1) * 2;
    return baseSemester + (isOddSemester ? 1 : 2);
  };

  if (selectedClass && classDetails) {
    return (
      <div className="class-details" style={{padding: '20px', backgroundColor: '#f8f9fa', minHeight: '100vh'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px', backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'}}>
          <button onClick={() => { setSelectedClass(null); setClassDetails(null); }} style={{padding: '12px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center'}}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 style={{margin: 0, color: '#2c3e50', fontSize: '28px', fontWeight: '600'}}>{classDetails.class.department} {classDetails.class.year} {classDetails.class.section}</h2>
            <p style={{margin: '5px 0 0 0', color: '#6c757d', fontSize: '14px'}}>Class Details & Management</p>
          </div>
        </div>

        <div className="class-overview" style={{margin: '20px 0'}}>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px'}}>
            <div style={{backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', textAlign: 'center', border: '1px solid #e1e8ed'}}>
              <div style={{fontSize: '32px', fontWeight: '700', color: '#27ae60', marginBottom: '8px'}}>{classDetails.students.length}</div>
              <div style={{color: '#6c757d', fontSize: '14px', fontWeight: '500'}}>Students Enrolled</div>
              <div style={{fontSize: '12px', color: '#adb5bd', marginTop: '4px'}}>Capacity: 60</div>
            </div>
            <div style={{backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', textAlign: 'center', border: '1px solid #e1e8ed'}}>
              <div style={{fontSize: '32px', fontWeight: '700', color: '#e74c3c', marginBottom: '8px'}}>{classDetails.assignments.length}</div>
              <div style={{color: '#6c757d', fontSize: '14px', fontWeight: '500'}}>Subject Assignments</div>
              <div style={{fontSize: '12px', color: '#adb5bd', marginTop: '4px'}}>Active Subjects</div>
            </div>
            <div style={{backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', textAlign: 'center', border: '1px solid #e1e8ed'}}>
              <div style={{fontSize: '32px', fontWeight: '700', color: '#f39c12', marginBottom: '8px'}}>{classDetails.ccAssignments?.length || 0}</div>
              <div style={{color: '#6c757d', fontSize: '14px', fontWeight: '500'}}>Class Coordinators</div>
              <div style={{fontSize: '12px', color: '#adb5bd', marginTop: '4px'}}>Assigned Staff</div>
            </div>
          </div>
        </div>

        <div className="class-sections" style={{margin: '20px 0'}}>
          <div className="students-section" style={{marginBottom: '40px', backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px'}}>
              <div style={{width: '4px', height: '24px', backgroundColor: '#27ae60', borderRadius: '2px'}}></div>
              <h3 style={{margin: 0, color: '#2c3e50', fontSize: '18px', fontWeight: '600'}}>Students (Auto-assigned based on joining year)</h3>
            </div>
            <div className="students-table" style={{margin: '0 10px'}}>
              <table style={{width: '100%', borderCollapse: 'collapse', margin: '10px 0'}}>
                <thead>
                  <tr>
                    <th style={{padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #ddd'}}>Register No</th>
                    <th style={{padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #ddd'}}>Name</th>
                    <th style={{padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #ddd'}}>Joining Year</th>
                    <th style={{padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #ddd'}}>Current Year</th>
                  </tr>
                </thead>
                <tbody>
                  {classDetails.students.map(student => (
                    <tr key={student.id}>
                      <td style={{padding: '10px 15px', borderBottom: '1px solid #eee'}}>{student.register_no}</td>
                      <td style={{padding: '10px 15px', borderBottom: '1px solid #eee'}}>{student.name}</td>
                      <td style={{padding: '10px 15px', borderBottom: '1px solid #eee'}}>{student.joining_year || 'N/A'}</td>
                      <td style={{padding: '10px 15px', borderBottom: '1px solid #eee'}}>Year {calculateCurrentYear(student.joining_year)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {classDetails.students.length === 0 && (
                <p className="no-students" style={{margin: '20px 10px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px'}}>No students assigned to this class yet.</p>
              )}
            </div>
          </div>

          <div className="assignments-section" style={{marginTop: '30px', backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px'}}>
              <div style={{width: '4px', height: '24px', backgroundColor: '#e74c3c', borderRadius: '2px'}}></div>
              <h3 style={{margin: 0, color: '#2c3e50', fontSize: '18px', fontWeight: '600'}}>Staff Assignments (From Staff Assignment Section)</h3>
            </div>
            <div className="assignments-table" style={{margin: '0 10px'}}>
              <table style={{width: '100%', borderCollapse: 'collapse', margin: '10px 0'}}>
                <thead>
                  <tr>
                    <th style={{padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #ddd'}}>Subject</th>
                    <th style={{padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #ddd'}}>Staff</th>
                    <th style={{padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #ddd'}}>Department</th>
                    <th style={{padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #ddd'}}>Semester</th>
                  </tr>
                </thead>
                <tbody>
                  {classDetails.assignments.map(assignment => (
                    <tr key={assignment.id}>
                      <td style={{padding: '10px 15px', borderBottom: '1px solid #eee'}}>
                        <div>
                          <strong>{assignment.subject_code}</strong>
                          <br />
                          <small>{assignment.subject_name}</small>
                        </div>
                      </td>
                      <td style={{padding: '10px 15px', borderBottom: '1px solid #eee'}}>{assignment.staff_name}</td>
                      <td style={{padding: '10px 15px', borderBottom: '1px solid #eee'}}>{assignment.department}</td>
                      <td style={{padding: '10px 15px', borderBottom: '1px solid #eee'}}>Sem {assignment.semester}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {classDetails.assignments.length === 0 && (
                <p className="no-assignments" style={{margin: '20px 10px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px'}}>No staff assignments found. Assign teachers to subjects in Staff Assignments section.</p>
              )}
            </div>
          </div>

          <div className="cc-section" style={{marginTop: '30px', backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px'}}>
              <div style={{width: '4px', height: '24px', backgroundColor: '#f39c12', borderRadius: '2px'}}></div>
              <h3 style={{margin: 0, color: '#2c3e50', fontSize: '18px', fontWeight: '600'}}>Class Coordinators (From CC Management Section)</h3>
            </div>
            <div className="cc-table" style={{margin: '0 10px'}}>
              <table style={{width: '100%', borderCollapse: 'collapse', margin: '10px 0'}}>
                <thead>
                  <tr>
                    <th style={{padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #ddd'}}>Staff Name</th>
                    <th style={{padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #ddd'}}>Staff ID</th>
                    <th style={{padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #ddd'}}>Department</th>
                    <th style={{padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #ddd'}}>Semester</th>
                  </tr>
                </thead>
                <tbody>
                  {classDetails.ccAssignments?.map(cc => (
                    <tr key={cc.id}>
                      <td style={{padding: '10px 15px', borderBottom: '1px solid #eee'}}>{cc.staff_name}</td>
                      <td style={{padding: '10px 15px', borderBottom: '1px solid #eee'}}>{cc.staff_id}</td>
                      <td style={{padding: '10px 15px', borderBottom: '1px solid #eee'}}>{cc.department}</td>
                      <td style={{padding: '10px 15px', borderBottom: '1px solid #eee'}}>Sem {cc.semester}</td>
                    </tr>
                  )) || []}
                </tbody>
              </table>
              {(!classDetails.ccAssignments || classDetails.ccAssignments.length === 0) && (
                <p className="no-cc" style={{margin: '20px 10px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px'}}>No class coordinators assigned. Assign coordinators in CC Management section.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="class-management" style={{padding: '20px', backgroundColor: '#f8f9fa', minHeight: '100vh'}}>
      <div className="form-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
          <button className="back-btn" onClick={() => setCurrentView('main')} style={{padding: '10px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: 'white', cursor: 'pointer'}}>
            <ArrowLeft size={16} />
          </button>
          <h2 style={{margin: 0, color: '#2c3e50', fontSize: '24px'}}>Class Management</h2>
        </div>
        <button className="add-btn" onClick={() => setShowForm(!showForm)} style={{padding: '12px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500'}}>
          + Create Class
        </button>
      </div>
      
      <div className="classes-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px'}}>
        {classes.map(cls => (
          <div key={cls.id} className="class-card" 
               onClick={() => fetchClassDetails(cls.id)}
               style={{
                 backgroundColor: 'white',
                 borderRadius: '12px',
                 padding: '20px',
                 boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                 cursor: 'pointer',
                 border: '1px solid #e1e8ed'
               }}>
            <div className="class-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
              <h3 style={{margin: 0, color: '#2c3e50', fontSize: '18px', fontWeight: '600'}}>
                {cls.department} {cls.year} {cls.section}
              </h3>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <span style={{backgroundColor: '#e8f4fd', color: '#3498db', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '500'}}>
                  Active
                </span>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (window.confirm(`Are you sure you want to delete ${cls.department} ${cls.year} ${cls.section}?`)) {
                      try {
                        const response = await fetch(`http://localhost:5000/api/classes/${cls.id}`, {
                          method: 'DELETE',
                          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                        });
                        if (response.ok) {
                          fetchClasses();
                          setMessage('Class deleted successfully!');
                        }
                      } catch (error) {
                        setMessage('Error deleting class');
                      }
                    }
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#e74c3c',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="class-stats" style={{display: 'flex', gap: '15px'}}>
              <div style={{textAlign: 'center'}}>
                <div style={{fontSize: '20px', fontWeight: '600', color: '#27ae60'}}>{classStats[cls.id]?.students || 0}</div>
                <div style={{fontSize: '12px', color: '#7f8c8d'}}>Students</div>
              </div>
              <div style={{textAlign: 'center'}}>
                <div style={{fontSize: '20px', fontWeight: '600', color: '#e74c3c'}}>{classStats[cls.id]?.assignments || 0}</div>
                <div style={{fontSize: '12px', color: '#7f8c8d'}}>Subjects</div>
              </div>
              <div style={{textAlign: 'center'}}>
                <div style={{fontSize: '20px', fontWeight: '600', color: '#f39c12'}}>{classStats[cls.id]?.ccAssignments || 0}</div>
                <div style={{fontSize: '12px', color: '#7f8c8d'}}>CC</div>
              </div>
            </div>
            <div style={{marginTop: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '6px', fontSize: '12px', color: '#6c757d'}}>
              Click to view details →
            </div>
          </div>
        ))}
        
        {classes.length === 0 && (
          <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
            <div style={{fontSize: '48px', marginBottom: '20px'}}>📚</div>
            <h3 style={{color: '#6c757d', marginBottom: '10px'}}>No Classes Found</h3>
            <p style={{color: '#adb5bd', marginBottom: '20px'}}>Create your first class to get started</p>
            <button onClick={() => setShowForm(true)} style={{padding: '12px 24px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer'}}>
              Create First Class
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <div className="form-overlay" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
          <form onSubmit={handleCreateClass} style={{backgroundColor: 'white', borderRadius: '12px', padding: '30px', width: '500px', maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px'}}>
              <h3 style={{margin: 0, color: '#2c3e50', fontSize: '20px'}}>Create New Class</h3>
              <button type="button" onClick={() => setShowForm(false)} style={{background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#95a5a6'}}>×</button>
            </div>
            
            <div style={{display: 'grid', gap: '20px'}}>
              <div>
                <label style={{display: 'block', marginBottom: '8px', color: '#34495e', fontWeight: '500'}}>Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  required
                  style={{width: '100%', padding: '12px', border: '2px solid #e1e8ed', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white'}}
                >
                  <option value="">Select Department</option>
                  <option value="IT">Information Technology</option>
                  <option value="CSE">Computer Science Engineering</option>
                  <option value="AIDS">Artificial Intelligence & Data Science</option>
                  <option value="MECH">Mechanical Engineering</option>
                  <option value="EEE">Electrical & Electronics Engineering</option>
                  <option value="ECE">Electronics & Communication Engineering</option>
                  <option value="CIVIL">Civil Engineering</option>
                </select>
              </div>
              
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                <div>
                  <label style={{display: 'block', marginBottom: '8px', color: '#34495e', fontWeight: '500'}}>Year</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    required
                    style={{width: '100%', padding: '12px', border: '2px solid #e1e8ed', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white'}}
                  >
                    <option value="">Select Year</option>
                    <option value="I">I Year</option>
                    <option value="II">II Year</option>
                    <option value="III">III Year</option>
                    <option value="IV">IV Year</option>
                  </select>
                </div>
                
                <div>
                  <label style={{display: 'block', marginBottom: '8px', color: '#34495e', fontWeight: '500'}}>Section</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({...formData, section: e.target.value})}
                    required
                    style={{width: '100%', padding: '12px', border: '2px solid #e1e8ed', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white'}}
                  >
                    <option value="">Select Section</option>
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div style={{display: 'flex', gap: '10px', marginTop: '25px', justifyContent: 'flex-end'}}>
              <button type="button" onClick={() => setShowForm(false)} style={{padding: '12px 20px', border: '2px solid #e1e8ed', backgroundColor: 'white', color: '#6c757d', borderRadius: '8px', cursor: 'pointer'}}>Cancel</button>
              <button type="submit" style={{padding: '12px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500'}}>Create Class</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default ClassManagement;