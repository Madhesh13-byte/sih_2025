import React, { useState, useEffect } from 'react';
import { Save, Plus } from 'lucide-react';

function ManualMarksEntry({ assignments }) {
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [markType, setMarkType] = useState('');
  const [maxMarks, setMaxMarks] = useState(50);
  const [students, setStudents] = useState([]);
  const [manualEntries, setManualEntries] = useState([]);

  const markTypes = [
    { value: 'IA1', label: 'IA 1', max: 50 },
    { value: 'IA2', label: 'IA 2', max: 50 },
    { value: 'Assignment', label: 'Assignment', max: 40 },
    { value: 'Quiz', label: 'Quiz', max: 20 }
  ];

  const fetchStudents = async (assignmentId) => {
    try {
      const assignment = assignments.find(a => a.id.toString() === assignmentId);
      if (!assignment) return;
      
      const params = new URLSearchParams({
        subject_code: assignment.subject_code,
        semester: assignment.semester,
        department: assignment.department,
        year: assignment.year
      });
      
      const response = await fetch(`http://localhost:5000/api/teacher/students?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStudents(data.map(student => ({
          id: student.id,
          name: student.name,
          regNo: student.register_no,
          marks: ''
        })));
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  useEffect(() => {
    if (selectedAssignment) {
      fetchStudents(selectedAssignment);
    }
  }, [selectedAssignment]);

  useEffect(() => {
    const selectedType = markTypes.find(type => type.value === markType);
    if (selectedType) {
      setMaxMarks(selectedType.max);
    }
  }, [markType]);

  const addManualEntry = () => {
    setManualEntries([...manualEntries, { regNo: '', name: '', marks: '' }]);
  };

  const updateManualEntry = (index, field, value) => {
    const updated = [...manualEntries];
    updated[index][field] = value;
    setManualEntries(updated);
  };

  const removeManualEntry = (index) => {
    setManualEntries(manualEntries.filter((_, i) => i !== index));
  };

  const handleStudentMarkChange = (studentId, marks) => {
    if (marks && parseFloat(marks) > maxMarks) {
      alert(`Maximum marks allowed: ${maxMarks}`);
      return;
    }
    setStudents(students.map(student => 
      student.id === studentId ? { ...student, marks } : student
    ));
  };

  const saveMarks = async () => {
    if (!selectedAssignment || !markType) {
      alert('Please select assignment and mark type');
      return;
    }

    const assignment = assignments.find(a => a.id.toString() === selectedAssignment);
    const allMarks = [
      ...students.filter(s => s.marks).map(s => ({ id: s.id, marks: parseFloat(s.marks) })),
      ...manualEntries.filter(e => e.regNo && e.marks).map(e => ({ 
        regNo: e.regNo, 
        name: e.name, 
        marks: parseFloat(e.marks) 
      }))
    ];

    try {
      const response = await fetch('http://localhost:5000/api/teacher/marks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          students: allMarks,
          subject_code: assignment?.subject_code,
          subject_name: assignment?.subject_name,
          semester: assignment?.semester,
          mark_type: markType,
          max_marks: maxMarks,
          academic_year: new Date().getFullYear().toString()
        })
      });

      if (response.ok) {
        alert('Marks saved successfully!');
        setManualEntries([]);
      } else {
        alert('Failed to save marks');
      }
    } catch (error) {
      console.error('Error saving marks:', error);
      alert('Error saving marks');
    }
  };

  return (
    <div className="manual-marks-entry">
      <h2>Manual Marks Entry</h2>
      
      <div className="entry-config">
        <select value={selectedAssignment} onChange={(e) => setSelectedAssignment(e.target.value)}>
          <option value="">Select Subject</option>
          {assignments.map(assignment => (
            <option key={assignment.id} value={assignment.id}>
              {assignment.subject_code} - {assignment.department} {assignment.year}
            </option>
          ))}
        </select>
        
        <select value={markType} onChange={(e) => setMarkType(e.target.value)}>
          <option value="">Select Mark Type</option>
          {markTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label} ({type.max} marks)
            </option>
          ))}
        </select>
      </div>

      {selectedAssignment && markType && (
        <>
          <div className="students-section">
            <h3>Enrolled Students</h3>
            <table>
              <thead>
                <tr>
                  <th>Reg No</th>
                  <th>Name</th>
                  <th>Marks (/{maxMarks})</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id}>
                    <td>{student.regNo}</td>
                    <td>{student.name}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max={maxMarks}
                        value={student.marks}
                        onChange={(e) => handleStudentMarkChange(student.id, e.target.value)}
                        placeholder="0"
                        style={{ width: '60px' }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="manual-section">
            <div className="section-header">
              <h3>Manual Entry (for students not in list)</h3>
              <button onClick={addManualEntry} className="add-btn">
                <Plus size={16} /> Add Entry
              </button>
            </div>
            
            {manualEntries.map((entry, index) => (
              <div key={index} className="manual-entry-row">
                <input
                  type="text"
                  placeholder="Reg No"
                  value={entry.regNo}
                  onChange={(e) => updateManualEntry(index, 'regNo', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Student Name"
                  value={entry.name}
                  onChange={(e) => updateManualEntry(index, 'name', e.target.value)}
                />
                <input
                  type="number"
                  min="0"
                  max={maxMarks}
                  placeholder="Marks"
                  value={entry.marks}
                  onChange={(e) => updateManualEntry(index, 'marks', e.target.value)}
                />
                <button onClick={() => removeManualEntry(index)} className="remove-btn">
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button onClick={saveMarks} className="save-btn">
            <Save size={16} /> Save All Marks
          </button>
        </>
      )}

      <style jsx>{`
        .manual-marks-entry {
          padding: 20px;
          background: white;
          border-radius: 8px;
        }
        
        .entry-config {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .entry-config select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          min-width: 200px;
        }
        
        .students-section table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        
        .students-section th,
        .students-section td {
          padding: 8px 12px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        
        .students-section th {
          background: #f5f5f5;
          font-weight: 600;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .add-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 8px 12px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .manual-entry-row {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
          align-items: center;
        }
        
        .manual-entry-row input {
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .remove-btn {
          padding: 6px 10px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .save-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
}

export default ManualMarksEntry;