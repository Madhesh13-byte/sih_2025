import React, { useState, useEffect } from 'react';
import { GraduationCap, Users, Eye, ArrowLeft, RefreshCw, Trash2, BookOpen, UserCheck, BarChart3, Settings, Calendar, Filter, Hash, Building2 } from 'lucide-react';
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
export default ClassAssignment;