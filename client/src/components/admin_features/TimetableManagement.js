import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Plus, Trash2, Calendar } from 'lucide-react';
import './styles/TimetableManagement.css';

function TimetableManagement({ setCurrentView, setMessage }) {
  const [timetables, setTimetables] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [currentPeriod, setCurrentPeriod] = useState(1);
  const [dayPeriods, setDayPeriods] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState({ department: '', year: '', semester: '', section: '' });
  const [staffMembers, setStaffMembers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const sections = ['A', 'B', 'C', 'D'];
  const [formData, setFormData] = useState({
    day_of_week: '',
    period_number: '',
    start_time: '',
    end_time: '',
    subject_code: '',
    staff_id: '',
    room_number: ''
  });

  const days = ['I', 'II', 'III', 'IV', 'V'];
  const periods = [
    { number: 1, start: '09:15', end: '10:05' },
    { number: 2, start: '10:05', end: '10:55' },
    { number: 3, start: '11:05', end: '11:55' },
    { number: 4, start: '11:55', end: '12:45' },
    { number: 5, start: '1:25', end: '2:10' },
    { number: 6, start: '2:10', end: '3:05' },
    { number: 7, start: '3:15', end: '4:00' },
    { number: 8, start: '4:00', end: '4:45' }
  ];

  useEffect(() => {
    fetchStaffMembers();
    fetchSubjects();
    fetchAssignments();
  }, []);

  // Refetch assignments when semester details change
  useEffect(() => {
    if (selectedSemester.department && selectedSemester.year && selectedSemester.semester) {
      fetchAssignments();
    }
  }, [selectedSemester.department, selectedSemester.year, selectedSemester.semester]);

  useEffect(() => {
    if (selectedSemester.department && selectedSemester.year && selectedSemester.semester) {
      fetchTimetables();
    }
  }, [selectedSemester]);

  const fetchStaffMembers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/accounts', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStaffMembers(data.filter(account => account.role === 'staff'));
      }
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/subjects', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSubjects(data.map(s => ({ code: s.subject_code, name: s.subject_name, department: s.department, year: s.year, semester: s.semester })));
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const { department, year, semester } = selectedSemester;
      const queryParams = new URLSearchParams({
        department,
        year,
        semester
      }).toString();

      const response = await fetch(`http://localhost:5000/api/staff-assignments?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
      }
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    }
  };

  const fetchTimetables = async () => {
    try {
      const { department, year, semester, section } = selectedSemester;
      const yearToNumeric = { 'I': '1', 'II': '2', 'III': '3', 'IV': '4' };
      const numericYear = yearToNumeric[year] || year;
      const response = await fetch(`http://localhost:5000/api/timetables?department=${department}&year=${numericYear}&semester=${semester}&section=${section}&_t=${Date.now()}`, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTimetables(data);
      }
    } catch (error) {
      console.error('Failed to fetch timetables:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const selectedAssignment = assignments.find(a => a.subject_code === formData.subject_code);
    
    if (!selectedAssignment) {
      setMessage('Please select a subject');
      return;
    }

    // Convert Roman year to numeric
    const yearToNumeric = { 'I': '1', 'II': '2', 'III': '3', 'IV': '4' };
    const numericYear = yearToNumeric[selectedSemester.year] || selectedSemester.year;
    
    // Add current period to the list
    const newPeriod = {
      department: selectedSemester.department,
      year: numericYear,
      semester: selectedSemester.semester,
      section: selectedSemester.section,
      day_of_week: formData.day_of_week,
      period_number: currentPeriod,
      start_time: periods[currentPeriod-1]?.start || '',
      end_time: periods[currentPeriod-1]?.end || '',
      subject_code: formData.subject_code,
      subject_name: selectedAssignment.subject_name,
      staff_id: selectedAssignment.staff_id,
      staff_name: selectedAssignment.staff_name,
      room_number: formData.room_number
    };
    
    setDayPeriods([...dayPeriods, newPeriod]);
    
    // Move to next period
    if (currentPeriod < 8) {
      setCurrentPeriod(currentPeriod + 1);
      setFormData({
        ...formData,
        period_number: (currentPeriod + 1).toString(),
        start_time: periods[currentPeriod]?.start || '',
        end_time: periods[currentPeriod]?.end || '',
        subject_code: '',
        staff_id: '',
        room_number: ''
      });
    } else {
      // Save all periods to database
      await saveAllPeriods([...dayPeriods, newPeriod]);
    }
  };
  
  const saveAllPeriods = async (periods) => {
    try {
      const promises = periods.map(period => {
        console.log('Saving period:', period);
        return fetch('http://localhost:5000/api/timetables', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(period)
        });
      });
      
      const responses = await Promise.all(promises);
      const results = await Promise.all(responses.map(r => r.json()));
      console.log('Save results:', results);
      
      fetchTimetables();
      resetForm();
      setMessage(`${periods.length} periods added successfully!`);
    } catch (error) {
      console.error('Error saving periods:', error);
      setMessage('Error saving periods');
    }
  };
  
  const resetForm = () => {
    setFormData({
      day_of_week: '',
      period_number: '',
      start_time: '',
      end_time: '',
      subject_code: '',
      staff_id: '',
      room_number: ''
    });
    setShowForm(false);
    setFormStep(1);
    setCurrentPeriod(1);
    setDayPeriods([]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this timetable entry?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/timetables/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        fetchTimetables();
        setMessage('Timetable entry deleted successfully!');
      }
    } catch (error) {
      setMessage('Error deleting timetable entry');
    }
  };

  const handleDeleteAllTimetable = async () => {
    if (!window.confirm(`Are you sure you want to delete the entire timetable for ${selectedSemester.department} ${selectedSemester.year} - Semester ${selectedSemester.semester} Section ${selectedSemester.section}?`)) return;

    try {
      const yearToNumeric = { 'I': '1', 'II': '2', 'III': '3', 'IV': '4' };
      const numericYear = yearToNumeric[selectedSemester.year] || selectedSemester.year;
      
      console.log('Deleting timetable for:', { department: selectedSemester.department, year: numericYear, semester: selectedSemester.semester, section: selectedSemester.section });
      
      const response = await fetch(`http://localhost:5000/api/timetables/class`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          department: selectedSemester.department,
          year: numericYear,
          semester: selectedSemester.semester,
          section: selectedSemester.section
        })
      });

      const result = await response.json();
      console.log('Delete response:', result);

      if (response.ok) {
        fetchTimetables(); // Refetch from database instead of just clearing state
        setMessage(result.message || 'Timetable deleted successfully!');
      } else {
        setMessage(result.error || 'Failed to delete timetable');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setMessage('Error deleting timetable');
    }
  };

  const getTimetableGrid = () => {
    const grid = {};
    days.forEach((day, dayIndex) => {
      grid[dayIndex] = {};
      periods.forEach(period => {
        grid[dayIndex][period.number] = null;
      });
    });

    timetables.forEach(entry => {
      if (grid[entry.day_of_week] && grid[entry.day_of_week][entry.period_number] !== undefined) {
        grid[entry.day_of_week][entry.period_number] = entry;
      }
    });

    return grid;
  };

  const filteredSubjects = subjects.filter(s => 
    s.department === selectedSemester.department && 
    s.year === selectedSemester.year && 
    s.semester === selectedSemester.semester
  );

  const grid = getTimetableGrid();

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={() => setCurrentView('main')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            color: '#6c757d'
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ margin: 0, color: '#2c3e50' }}>Timetable Management</h2>
      </div>

      {/* Semester Selection */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Select Semester</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
          <select
            value={selectedSemester.department}
            onChange={(e) => setSelectedSemester({...selectedSemester, department: e.target.value})}
            style={{ padding: '10px', borderRadius: '8px', border: '2px solid #e1e8ed' }}
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
          
          <select
            value={selectedSemester.year}
            onChange={(e) => setSelectedSemester({...selectedSemester, year: e.target.value, semester: ''})}
            style={{ padding: '10px', borderRadius: '8px', border: '2px solid #e1e8ed' }}
          >
            <option value="">Select Year</option>
            <option value="I">I Year</option>
            <option value="II">II Year</option>
            <option value="III">III Year</option>
            <option value="IV">IV Year</option>
          </select>
          
          <select
            value={selectedSemester.semester}
            onChange={(e) => setSelectedSemester({...selectedSemester, semester: e.target.value})}
            disabled={!selectedSemester.year}
            style={{ padding: '10px', borderRadius: '8px', border: '2px solid #e1e8ed' }}
          >
            <option value="">Select Semester</option>
            {selectedSemester.year === 'I' && (
              <>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
              </>
            )}
            {selectedSemester.year === 'II' && (
              <>
                <option value="3">Semester 3</option>
                <option value="4">Semester 4</option>
              </>
            )}
            {selectedSemester.year === 'III' && (
              <>
                <option value="5">Semester 5</option>
                <option value="6">Semester 6</option>
              </>
            )}
            {selectedSemester.year === 'IV' && (
              <>
                <option value="7">Semester 7</option>
                <option value="8">Semester 8</option>
              </>
            )}
          </select>

          <select
            value={selectedSemester.section}
            onChange={(e) => setSelectedSemester({...selectedSemester, section: e.target.value})}
            disabled={!selectedSemester.semester}
            style={{ padding: '10px', borderRadius: '8px', border: '2px solid #e1e8ed' }}
          >
            <option value="">Select Section</option>
            {sections.map(section => (
              <option key={section} value={section}>Section {section}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Timetable Grid */}
      {selectedSemester.department && selectedSemester.year && selectedSemester.semester && selectedSemester.section && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#2c3e50' }}>
              {selectedSemester.department} {selectedSemester.year} - Semester {selectedSemester.semester} Section {selectedSemester.section}
            </h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={async () => {
                  if (window.confirm('Clean up timetable entries with deleted staff?')) {
                    try {
                      const orphanedEntries = timetables.filter(entry => 
                        !staffMembers.some(staff => staff.staff_id === entry.staff_id)
                      );
                      
                      const deletePromises = orphanedEntries.map(entry => 
                        fetch(`http://localhost:5000/api/timetables/${entry.id}`, {
                          method: 'DELETE',
                          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                        })
                      );
                      
                      await Promise.all(deletePromises);
                      await fetchTimetables();
                      setMessage(`✅ Cleaned up ${orphanedEntries.length} orphaned timetable entries`);
                    } catch (error) {
                      setMessage('❌ Error cleaning up timetable');
                    }
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                <Clock size={16} /> Cleanup
              </button>
              <button
                onClick={handleDeleteAllTimetable}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                <Trash2 size={16} /> Delete All
              </button>
              <button
                onClick={() => setShowForm(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                <Plus size={16} /> Add Period
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px', backgroundColor: '#f8f9fa', border: '1px solid #e1e8ed', fontWeight: '600', width: '120px' }}>
                    Period
                  </th>
                  {periods.map(period => (
                    <th key={period.number} style={{ padding: '8px', backgroundColor: '#f8f9fa', border: '1px solid #e1e8ed', fontWeight: '600', fontSize: '12px', textAlign: 'center' }}>
                      <div>P{period.number}</div>
                      <div style={{ fontSize: '10px', color: '#6c757d' }}>
                        {period.start}-{period.end}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map((day, dayIndex) => (
                  <tr key={dayIndex}>
                    <td style={{ padding: '12px', border: '1px solid #e1e8ed', backgroundColor: '#f8f9fa', fontWeight: '500' }}>
                      {day}
                    </td>
                    {periods.map(period => {
                      const entry = grid[dayIndex][period.number];
                      return (
                        <td key={period.number} style={{ padding: '6px', border: '1px solid #e1e8ed', width: '100px', verticalAlign: 'top' }}>
                          {entry ? (
                            <div style={{
                              backgroundColor: !staffMembers.some(staff => staff.staff_id === entry.staff_id) ? '#ffebee' : '#e8f4fd',
                              padding: '6px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              position: 'relative',
                              minHeight: '50px',
                              border: !staffMembers.some(staff => staff.staff_id === entry.staff_id) ? '1px solid #ef4444' : 'none'
                            }}>
                              <div style={{ fontWeight: '600', color: '#2c3e50', marginBottom: '2px' }}>{entry.subject_code}</div>
                              <div style={{ color: '#6c757d', marginBottom: '2px' }}>
                                {entry.staff_name.split(' ')[0]}
                                {!staffMembers.some(staff => staff.staff_id === entry.staff_id) && (
                                  <span style={{ 
                                    display: 'inline-block', 
                                    background: '#ef4444', 
                                    color: 'white', 
                                    fontSize: '8px', 
                                    padding: '1px 3px', 
                                    borderRadius: '2px', 
                                    marginLeft: '3px' 
                                  }}>DEL</span>
                                )}
                              </div>
                              {entry.room_number && (
                                <div style={{ color: '#6c757d' }}>{entry.room_number}</div>
                              )}
                              <button
                                onClick={() => handleDelete(entry.id)}
                                style={{
                                  position: 'absolute',
                                  top: '2px',
                                  right: '2px',
                                  background: 'none',
                                  border: 'none',
                                  color: '#e74c3c',
                                  cursor: 'pointer',
                                  padding: '1px'
                                }}
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          ) : (
                            <div style={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#adb5bd' }}>
                              -
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Period Form */}
      {showForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <form onSubmit={formStep === 2 ? handleSubmit : (e) => { 
            e.preventDefault(); 
            setFormStep(2);
            setFormData({
              ...formData,
              period_number: '1',
              start_time: periods[0]?.start || '',
              end_time: periods[0]?.end || ''
            });
          }} style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            width: '500px',
            maxWidth: '90vw'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#2c3e50' }}>Add Period - Step {formStep} of 2</h3>
              <button type="button" onClick={() => { setShowForm(false); setFormStep(1); }} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>

            {formStep === 1 ? (
              <div style={{ display: 'grid', gap: '15px' }}>
                <select
                  value={formData.day_of_week}
                  onChange={(e) => {
                    setFormData({
                      ...formData, 
                      day_of_week: e.target.value,
                      period_number: '1',
                      start_time: periods[0]?.start || '',
                      end_time: periods[0]?.end || ''
                    });
                    setCurrentPeriod(1);
                  }}
                  required
                  style={{ padding: '10px', borderRadius: '8px', border: '2px solid #e1e8ed' }}
                >
                  <option value="">Select Day</option>
                  {days.map((day, index) => (
                    <option key={index} value={index}>{day}</option>
                  ))}
                </select>
                <div style={{ padding: '10px', backgroundColor: '#f0f8ff', borderRadius: '8px', textAlign: 'center' }}>
                  You will add periods consecutively from Period 1 to 8
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '15px' }}>
                <div style={{ padding: '10px', backgroundColor: '#e8f4fd', borderRadius: '8px', textAlign: 'center', fontWeight: '600' }}>
                  Day {days[formData.day_of_week]} - Period {currentPeriod} ({periods[currentPeriod-1]?.start}-{periods[currentPeriod-1]?.end})
                </div>
                <select
                  value={formData.subject_code}
                  onChange={(e) => {
                    const selectedSubject = e.target.value;
                    const assignment = assignments.find(a => a.subject_code === selectedSubject);
                    
                    setFormData({
                      ...formData, 
                      subject_code: selectedSubject,
                      staff_id: assignment ? assignment.staff_id : ''
                    });
                  }}
                  required
                  style={{ padding: '10px', borderRadius: '8px', border: '2px solid #e1e8ed' }}
                >
                  <option value="">Select Subject</option>
                  {assignments.map(assignment => (
                    <option 
                      key={assignment.id} 
                      value={assignment.subject_code}
                    >
                      {assignment.subject_code} - {assignment.subject_name} ({assignment.staff_name})
                    </option>
                  ))}
                </select>



                {formData.subject_code && (
                  <div style={{ padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e1e8ed' }}>
                    <strong>Assigned Staff:</strong> {assignments.find(a => a.subject_code === formData.subject_code)?.staff_name}
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Room Number (Optional)"
                  value={formData.room_number}
                  onChange={(e) => setFormData({...formData, room_number: e.target.value})}
                  style={{ padding: '10px', borderRadius: '8px', border: '2px solid #e1e8ed' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
              {formStep === 2 && (
                <button type="button" onClick={() => setFormStep(1)} style={{ padding: '10px 20px', border: '2px solid #e1e8ed', backgroundColor: 'white', borderRadius: '8px', cursor: 'pointer' }}>
                  Back
                </button>
              )}
              <button type="button" onClick={resetForm} style={{ padding: '10px 20px', border: '2px solid #e1e8ed', backgroundColor: 'white', borderRadius: '8px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                {formStep === 1 ? 'Start Adding Periods' : (currentPeriod < 8 ? `Add Period ${currentPeriod} & Next` : 'Add Final Period')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default TimetableManagement;