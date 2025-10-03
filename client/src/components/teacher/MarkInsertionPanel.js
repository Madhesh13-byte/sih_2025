import React, { useState, useEffect, useRef } from 'react';
import { Save, Upload, Download, Plus, Trash2, Edit3, CheckCircle, AlertCircle } from 'lucide-react';

function MarkInsertionPanel({ assignments }) {
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [markType, setMarkType] = useState('');
  const [markCategory, setMarkCategory] = useState('');
  const [customMarkName, setCustomMarkName] = useState('');
  const [maxMarks, setMaxMarks] = useState(50);
  const [students, setStudents] = useState([]);
  const [bulkMarks, setBulkMarks] = useState('');
  const [showBulkEntry, setShowBulkEntry] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [saveStatus, setSaveStatus] = useState('');
  const inputRefs = useRef([]);

  const markTypes = [
    { value: 'IA1', label: 'IA 1', defaultMax: 50 },
    { value: 'IA2', label: 'IA 2', defaultMax: 50 },
    { value: 'IA3', label: 'IA 3', defaultMax: 50 },
    { value: 'Assignment', label: 'Assignment', defaultMax: 40 },
    { value: 'Quiz', label: 'Quiz', defaultMax: 20 },
    { value: 'Project', label: 'Project', defaultMax: 100 },
    { value: 'Lab', label: 'Lab Work', defaultMax: 30 },
    { value: 'Presentation', label: 'Presentation', defaultMax: 25 },
    { value: 'Custom', label: 'Custom', defaultMax: 50 }
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
          marks: '',
          status: 'pending'
        })));
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
      setStudents([]);
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
      setMaxMarks(selectedType.defaultMax);
    }
  }, [markType]);

  const validateMark = (mark, studentId) => {
    const errors = {};
    const numMark = parseFloat(mark);
    
    if (mark && (isNaN(numMark) || numMark < 0 || numMark > maxMarks)) {
      errors[studentId] = `Invalid mark. Must be between 0 and ${maxMarks}`;
    }
    
    return errors;
  };

  const handleMarkChange = (studentId, mark, currentIndex) => {
    const errors = validateMark(mark, studentId);
    setValidationErrors(prev => ({
      ...prev,
      ...errors,
      [studentId]: errors[studentId] || undefined
    }));

    setStudents(students.map(student => 
      student.id === studentId ? { 
        ...student, 
        marks: mark,
        status: errors[studentId] ? 'error' : (mark ? 'filled' : 'pending')
      } : student
    ));
    
    // Auto-advance to next input
    if (mark && !errors[studentId] && currentIndex < students.length - 1) {
      setTimeout(() => {
        inputRefs.current[currentIndex + 1]?.focus();
      }, 100);
    }
  };

  const handleBulkEntry = () => {
    const lines = bulkMarks.split('\n').filter(line => line.trim());
    const updatedStudents = [...students];
    
    lines.forEach(line => {
      const [regNo, mark] = line.split(',').map(item => item.trim());
      const studentIndex = updatedStudents.findIndex(s => s.regNo === regNo);
      
      if (studentIndex !== -1) {
        const errors = validateMark(mark, updatedStudents[studentIndex].id);
        updatedStudents[studentIndex].marks = mark;
        updatedStudents[studentIndex].status = errors[updatedStudents[studentIndex].id] ? 'error' : 'filled';
        
        setValidationErrors(prev => ({
          ...prev,
          [updatedStudents[studentIndex].id]: errors[updatedStudents[studentIndex].id]
        }));
      }
    });
    
    setStudents(updatedStudents);
    setBulkMarks('');
    setShowBulkEntry(false);
  };

  const saveMarks = async () => {
    if (!selectedAssignment || !markType) {
      alert('Please select assignment and mark type');
      return;
    }

    if (Object.keys(validationErrors).some(key => validationErrors[key])) {
      alert('Please fix validation errors before saving');
      return;
    }

    const assignment = assignments.find(a => a.id.toString() === selectedAssignment);
    const markName = markType === 'Custom' ? customMarkName : markType;
    
    try {
      setSaveStatus('saving');
      
      const response = await fetch('http://localhost:5000/api/teacher/marks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          students: students.filter(s => s.marks).map(s => ({ 
            id: s.id, 
            marks: parseFloat(s.marks) || 0
          })),
          subject_code: assignment?.subject_code,
          subject_name: assignment?.subject_name,
          semester: assignment?.semester,
          mark_type: markName,
          mark_category: markCategory,
          max_marks: maxMarks,
          academic_year: new Date().getFullYear().toString()
        })
      });

      if (response.ok) {
        setSaveStatus('success');
        setStudents(students.map(s => ({ ...s, status: s.marks ? 'saved' : 'pending' })));
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus(''), 3000);
      }
    } catch (error) {
      console.error('Error saving marks:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const exportMarks = () => {
    const csvContent = [
      ['Register_No', 'Student_Name', 'Marks', 'Max_Marks'],
      ...students.map(s => [s.regNo, s.name, s.marks || '0', maxMarks])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${markType}_marks_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'saved': return <CheckCircle size={16} className="status-saved" />;
      case 'error': return <AlertCircle size={16} className="status-error" />;
      case 'filled': return <Edit3 size={16} className="status-filled" />;
      default: return null;
    }
  };

  return (
    <div className="mark-insertion-panel">
      <h2>Mark Insertion Panel</h2>
      
      <div className="mark-config">
        <div className="config-row">
          <select 
            value={selectedAssignment} 
            onChange={(e) => setSelectedAssignment(e.target.value)}
            className="config-select"
          >
            <option value="">Select Subject</option>
            {assignments.map(assignment => (
              <option key={assignment.id} value={assignment.id}>
                {assignment.subject_code} - {assignment.department} Year {assignment.year}
              </option>
            ))}
          </select>
          
          <select 
            value={markType} 
            onChange={(e) => setMarkType(e.target.value)}
            className="config-select"
          >
            <option value="">Select Mark Type</option>
            {markTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label} ({type.defaultMax} marks)
              </option>
            ))}
          </select>
          
          <input
            type="number"
            value={maxMarks}
            onChange={(e) => setMaxMarks(parseInt(e.target.value) || 50)}
            placeholder="Max Marks"
            className="config-input"
            min="1"
            max="200"
          />
        </div>
        
        {markType === 'Custom' && (
          <input
            type="text"
            value={customMarkName}
            onChange={(e) => setCustomMarkName(e.target.value)}
            placeholder="Enter custom mark name"
            className="config-input"
          />
        )}
      </div>

      {selectedAssignment && markType && (
        <>
          <div className="action-buttons">
            <button 
              className="bulk-entry-btn"
              onClick={() => setShowBulkEntry(!showBulkEntry)}
            >
              <Plus size={16} />
              Bulk Entry
            </button>
            
            <button className="export-btn" onClick={exportMarks}>
              <Download size={16} />
              Export CSV
            </button>
            
            <button 
              className={`save-btn ${saveStatus}`}
              onClick={saveMarks}
              disabled={saveStatus === 'saving'}
            >
              <Save size={16} />
              {saveStatus === 'saving' ? 'Saving...' : 
               saveStatus === 'success' ? 'Saved!' : 
               saveStatus === 'error' ? 'Error!' : 'Save Marks'}
            </button>
          </div>

          {showBulkEntry && (
            <div className="bulk-entry-section">
              <h4>Bulk Entry (Format: RegNo,Marks)</h4>
              <textarea
                value={bulkMarks}
                onChange={(e) => setBulkMarks(e.target.value)}
                placeholder="21CS001,45&#10;21CS002,42&#10;21CS003,48"
                rows="6"
                className="bulk-textarea"
              />
              <div className="bulk-actions">
                <button onClick={handleBulkEntry} className="apply-bulk-btn">
                  Apply Bulk Entry
                </button>
                <button onClick={() => setShowBulkEntry(false)} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="marks-table-container">
            <h3>
              Enter Marks - {assignments.find(a => a.id.toString() === selectedAssignment)?.subject_code} 
              ({markType === 'Custom' ? customMarkName : markType}) - Max: {maxMarks}
            </h3>
            
            <table className="marks-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Register No</th>
                  <th>Student Name</th>
                  <th>Marks (out of {maxMarks})</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={student.id} className={`student-row ${student.status}`}>
                    <td className="status-cell">
                      {getStatusIcon(student.status)}
                    </td>
                    <td>{student.regNo}</td>
                    <td>{student.name}</td>
                    <td>
                      <input
                        ref={(el) => inputRefs.current[index] = el}
                        type="number"
                        min="0"
                        max={maxMarks}
                        value={student.marks}
                        onChange={(e) => handleMarkChange(student.id, e.target.value, index)}
                        placeholder="0"
                        className={`mark-input ${validationErrors[student.id] ? 'error' : ''}`}
                      />
                      {validationErrors[student.id] && (
                        <div className="error-message">{validationErrors[student.id]}</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      
      <style jsx>{`
        .mark-insertion-panel {
          padding: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .mark-config {
          margin-bottom: 20px;
        }
        
        .config-row {
          display: flex;
          gap: 15px;
          margin-bottom: 15px;
          flex-wrap: wrap;
        }
        
        .config-select, .config-input {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          min-width: 200px;
        }
        
        .action-buttons {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        
        .bulk-entry-btn, .export-btn, .save-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }
        
        .bulk-entry-btn {
          background: #3b82f6;
          color: white;
        }
        
        .export-btn {
          background: #10b981;
          color: white;
        }
        
        .save-btn {
          background: #8b5cf6;
          color: white;
        }
        
        .save-btn.saving {
          background: #6b7280;
          cursor: not-allowed;
        }
        
        .save-btn.success {
          background: #10b981;
        }
        
        .save-btn.error {
          background: #ef4444;
        }
        
        .bulk-entry-section {
          background: #f8fafc;
          padding: 20px;
          border-radius: 6px;
          margin-bottom: 20px;
        }
        
        .bulk-textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: monospace;
          resize: vertical;
        }
        
        .bulk-actions {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }
        
        .apply-bulk-btn, .cancel-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .apply-bulk-btn {
          background: #3b82f6;
          color: white;
        }
        
        .cancel-btn {
          background: #6b7280;
          color: white;
        }
        
        .marks-table-container {
          overflow-x: auto;
        }
        
        .marks-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        
        .marks-table th,
        .marks-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .marks-table th {
          background: #f9fafb;
          font-weight: 600;
        }
        
        .student-row.saved {
          background: #f0fdf4;
        }
        
        .student-row.error {
          background: #fef2f2;
        }
        
        .student-row.filled {
          background: #fffbeb;
        }
        
        .status-cell {
          width: 40px;
          text-align: center;
        }
        
        .status-saved {
          color: #10b981;
        }
        
        .status-error {
          color: #ef4444;
        }
        
        .status-filled {
          color: #f59e0b;
        }
        
        .mark-input {
          width: 80px;
          padding: 6px 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          text-align: center;
        }
        
        .mark-input.error {
          border-color: #ef4444;
          background: #fef2f2;
        }
        
        .error-message {
          color: #ef4444;
          font-size: 12px;
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
}

export default MarkInsertionPanel;