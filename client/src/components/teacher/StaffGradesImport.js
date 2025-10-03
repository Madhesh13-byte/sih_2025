import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Download, Save } from 'lucide-react';

function StaffGradesImport() {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [gradeType, setGradeType] = useState('');
  const [students, setStudents] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/teacher/assignments', {
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
      setStudents([]);
    }
  };

  useEffect(() => {
    if (selectedAssignment) {
      fetchStudents(selectedAssignment);
    }
  }, [selectedAssignment]);

  const handleCSVImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target.result;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const regNoIndex = headers.findIndex(h => h.toLowerCase().includes('register') || h.toLowerCase().includes('reg'));
        const marksIndex = headers.findIndex(h => h.toLowerCase().includes('marks') || h.toLowerCase().includes('score'));
        
        if (regNoIndex === -1 || marksIndex === -1) {
          alert('CSV must contain Register_No and Marks columns');
          return;
        }

        const updatedStudents = [...students];
        
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',').map(cell => cell.trim());
          if (row.length < 2) continue;
          
          const regNo = row[regNoIndex];
          const marks = row[marksIndex];
          
          if (parseFloat(marks) > 50) {
            alert(`Invalid marks for ${regNo}! Maximum allowed is 50`);
            continue;
          }
          
          const studentIndex = updatedStudents.findIndex(s => s.regNo === regNo);
          if (studentIndex !== -1) {
            updatedStudents[studentIndex].marks = marks;
          }
        }
        
        setStudents(updatedStudents);
        setShowImportModal(false);
        alert('CSV imported successfully!');
      } catch (error) {
        console.error('Error parsing CSV:', error);
        alert('Error parsing CSV file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      ['Register_No', 'Student_Name', 'Marks'],
      ['21CS001', 'Sample Student 1', '45'],
      ['21CS002', 'Sample Student 2', '42'],
      ['21CS003', 'Sample Student 3', '48']
    ];
    
    const csvContent = sampleData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_ia_marks.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const saveGrades = async () => {
    if (!selectedAssignment || !gradeType) {
      alert('Please select assignment and grade type');
      return;
    }

    const assignment = assignments.find(a => a.id.toString() === selectedAssignment);
    
    try {
      const response = await fetch('http://localhost:5000/api/teacher/grades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          students: students.map(s => ({ 
            id: s.id, 
            marks: parseFloat(s.marks) || 0
          })),
          subject_code: assignment?.subject_code,
          subject_name: assignment?.subject_name,
          semester: assignment?.semester,
          grade_type: gradeType,
          academic_year: new Date().getFullYear().toString()
        })
      });

      if (response.ok) {
        alert('Grades saved successfully!');
        setStudents(students.map(s => ({ ...s, marks: '' })));
      } else {
        alert('Failed to save grades');
      }
    } catch (error) {
      console.error('Error saving grades:', error);
      alert('Error saving grades');
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: '30px', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Upload size={24} />
          Staff Grades Import - IA Marks
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#495057' }}>
              Select Subject Assignment
            </label>
            <select 
              value={selectedAssignment} 
              onChange={(e) => setSelectedAssignment(e.target.value)}
              style={{ width: '100%', padding: '12px', border: '2px solid #e9ecef', borderRadius: '8px', fontSize: '14px' }}
            >
              <option value="">Choose Subject...</option>
              {assignments.map(assignment => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.subject_code} - {assignment.department} {assignment.year}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#495057' }}>
              Select IA Type
            </label>
            <select 
              value={gradeType} 
              onChange={(e) => setGradeType(e.target.value)}
              style={{ width: '100%', padding: '12px', border: '2px solid #e9ecef', borderRadius: '8px', fontSize: '14px' }}
            >
              <option value="">Choose IA Type...</option>
              <option value="IA1">IA 1 (50 marks)</option>
              <option value="IA2">IA 2 (50 marks)</option>
              <option value="IA3">IA 3 (50 marks)</option>
            </select>
          </div>
        </div>

        {selectedAssignment && gradeType && (
          <>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', alignItems: 'center' }}>
              <button 
                onClick={() => setShowImportModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <Upload size={16} />
                Import CSV File
              </button>
              
              <button 
                onClick={downloadSampleCSV}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <Download size={16} />
                Download Sample
              </button>
            </div>

            {students.length > 0 && (
              <div>
                <h3 style={{ marginBottom: '20px', color: '#495057' }}>
                  Students - {assignments.find(a => a.id.toString() === selectedAssignment)?.subject_code} ({gradeType})
                </h3>
                <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9fa' }}>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Register No</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Student Name</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Marks (out of 50)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id}>
                          <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{student.regNo}</td>
                          <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{student.name}</td>
                          <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                            <input
                              type="number"
                              min="0"
                              max="50"
                              value={student.marks}
                              onChange={(e) => {
                                const newStudents = students.map(s => 
                                  s.id === student.id ? { ...s, marks: e.target.value } : s
                                );
                                setStudents(newStudents);
                              }}
                              style={{ width: '80px', padding: '6px', border: '1px solid #ced4da', borderRadius: '4px' }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <button 
                  onClick={saveGrades}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    marginTop: '20px'
                  }}
                >
                  <Save size={16} />
                  Save All Grades
                </button>
              </div>
            )}
          </>
        )}

        {showImportModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '500px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
            }}>
              <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={20} />
                Import IA Marks from CSV
              </h3>
              
              <p style={{ marginBottom: '20px', color: '#6c757d' }}>
                Upload a CSV file with Register_No and Marks columns to automatically fill the marks.
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleCSVImport}
                style={{ display: 'none' }}
              />
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Upload size={16} />
                  Choose CSV File
                </button>
                
                <button
                  onClick={() => setShowImportModal(false)}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StaffGradesImport;