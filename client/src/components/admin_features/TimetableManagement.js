import React, { useState, useEffect } from 'react';
import { Plus, Check, X, AlertTriangle } from 'lucide-react';

function TimetableManagement() {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [batches, setBatches] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    staffId: '',
    subjectCode: '',
    batchId: '',
    dayOfWeek: '',
    timeSlotId: '',
    roomNumber: '',
    academicYear: new Date().getFullYear(),
    semester: 1
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teachersRes, subjectsRes, batchesRes, timeSlotsRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/users?role=staff', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('http://localhost:5000/api/subjects', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('http://localhost:5000/api/classes', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('http://localhost:5000/api/timetable/time-slots', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (teachersRes.ok) setTeachers(await teachersRes.json());
      if (subjectsRes.ok) setSubjects(await subjectsRes.json());
      if (batchesRes.ok) setBatches(await batchesRes.json());
      if (timeSlotsRes.ok) setTimeSlots(await timeSlotsRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const checkConflicts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/timetable/check-conflicts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setConflicts(data.conflicts);
        return !data.hasConflicts;
      }
    } catch (error) {
      console.error('Failed to check conflicts:', error);
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const noConflicts = await checkConflicts();
    if (!noConflicts && conflicts.length > 0) {
      alert('Conflicts detected! Please resolve them before creating the entry.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/timetable/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Timetable entry created successfully!');
        setShowForm(false);
        setFormData({
          staffId: '',
          subjectCode: '',
          batchId: '',
          dayOfWeek: '',
          timeSlotId: '',
          roomNumber: '',
          academicYear: new Date().getFullYear(),
          semester: 1
        });
        setConflicts([]);
      } else {
        const error = await response.json();
        alert(`Failed to create entry: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to create timetable entry:', error);
      alert('Failed to create timetable entry');
    }
  };

  const getDayName = (day) => {
    const days = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
  };

  return (
    <div className="timetable-management">
      <div className="section-header">
        <h2>Timetable Management</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          <Plus size={16} /> Create Entry
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create Timetable Entry</h3>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <select
                  value={formData.staffId}
                  onChange={(e) => setFormData({...formData, staffId: e.target.value})}
                  required
                >
                  <option value="">Select Teacher</option>
                  {teachers.map(teacher => (
                    <option key={teacher.staff_id} value={teacher.staff_id}>
                      {teacher.name} ({teacher.staff_id})
                    </option>
                  ))}
                </select>

                <select
                  value={formData.subjectCode}
                  onChange={(e) => setFormData({...formData, subjectCode: e.target.value})}
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map(subject => (
                    <option key={subject.subject_code} value={subject.subject_code}>
                      {subject.subject_code} - {subject.subject_name}
                    </option>
                  ))}
                </select>

                <select
                  value={formData.batchId}
                  onChange={(e) => setFormData({...formData, batchId: e.target.value})}
                  required
                >
                  <option value="">Select Batch</option>
                  {batches.map(batch => (
                    <option key={batch.id} value={batch.id}>
                      {batch.class_name} ({batch.department} {batch.year})
                    </option>
                  ))}
                </select>

                <select
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({...formData, dayOfWeek: e.target.value})}
                  required
                >
                  <option value="">Select Day</option>
                  <option value="1">Monday</option>
                  <option value="2">Tuesday</option>
                  <option value="3">Wednesday</option>
                  <option value="4">Thursday</option>
                  <option value="5">Friday</option>
                  <option value="6">Saturday</option>
                </select>

                <select
                  value={formData.timeSlotId}
                  onChange={(e) => setFormData({...formData, timeSlotId: e.target.value})}
                  required
                >
                  <option value="">Select Time Slot</option>
                  {timeSlots.map(slot => (
                    <option key={slot.id} value={slot.id}>
                      {slot.slot_name} ({slot.start_time} - {slot.end_time})
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Room Number (optional)"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
                />
              </div>

              {conflicts.length > 0 && (
                <div className="conflicts-section">
                  <h4><AlertTriangle size={16} /> Conflicts Detected:</h4>
                  {conflicts.map((conflict, index) => (
                    <div key={index} className="conflict-item">
                      <strong>{conflict.type.toUpperCase()}:</strong> {conflict.message}
                    </div>
                  ))}
                </div>
              )}

              <div className="form-actions">
                <button type="button" onClick={checkConflicts} className="btn-secondary">
                  Check Conflicts
                </button>
                <button type="submit" className="btn-primary">
                  <Check size={16} /> Create Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="info-section">
        <h3>Timetable System Features:</h3>
        <ul>
          <li>✅ <strong>Multi-subject Assignment:</strong> Teachers can handle multiple subjects across different batches</li>
          <li>✅ <strong>Conflict Prevention:</strong> Automatic detection of teacher, batch, and room conflicts</li>
          <li>✅ <strong>Workload Distribution:</strong> Track teacher workload across subjects and batches</li>
          <li>✅ <strong>Flexible Scheduling:</strong> Support for different time slots and room assignments</li>
          <li>✅ <strong>Batch-specific Subjects:</strong> Each subject is linked to a specific batch</li>
        </ul>
      </div>
    </div>
  );
}

export default TimetableManagement;