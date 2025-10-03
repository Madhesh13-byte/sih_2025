import React, { useState, useEffect, useRef } from 'react';
import { Save, Upload, FileText, Edit, Download, Eye, AlertTriangle, CheckCircle, User } from 'lucide-react';

function GradesSection({ assignments }) {
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [gradeType, setGradeType] = useState('');
  const [showMarkEntry, setShowMarkEntry] = useState(false);
  const [students, setStudents] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showIndividualEntry, setShowIndividualEntry] = useState(false);
  const inputRefs = useRef([]);
  const fileInputRef = useRef(null);
  
  const departments = ['CSE', 'ECE', 'IT', 'MECH', 'CIVIL', 'EEE'];
  
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
  
  useEffect(() => {
    // Reset views when selections change
    setSelectedStudent(null);
  }, [selectedDepartment, selectedAssignment, gradeType]);
  
  const handleRowClick = (studentId) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      // Focus on the input field for this student
      const index = students.findIndex(s => s.id === studentId);
      setTimeout(() => {
        inputRefs.current[index]?.focus();
      }, 100);
    }
  };
  
  useEffect(() => {
    if (selectedAssignment) {
      fetchStudents(selectedAssignment);
    }
  }, [selectedAssignment]);

  const handleMarksChange = (studentId, marks, currentIndex) => {
    const maxMarks = getMaxMarks();
    if (marks && parseFloat(marks) > maxMarks) {
      alert(`Invalid marks! Maximum allowed is ${maxMarks}`);
      return;
    }
    setStudents(students.map(student => 
      student.id === studentId ? { ...student, marks } : student
    ));
    
    // Auto-advance to next input if 2 digits entered and not last input
    if (marks && marks.length === 2 && currentIndex < students.length - 1) {
      setTimeout(() => {
        inputRefs.current[currentIndex + 1]?.focus();
      }, 50);
    }
  };

  const saveGrades = async () => {
    if (!selectedAssignment || !gradeType) {
      alert('Please fill all required fields');
      return;
    }

    const assignment = assignments.find(a => a.id.toString() === selectedAssignment);
    const maxMarks = getMaxMarks();
    
    // Get imported data if available
    const importedData = JSON.parse(localStorage.getItem(`imported_marks_${selectedAssignment}_${gradeType}`) || '[]');
    
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
            name: s.name,
            regNo: s.regNo,
            marks: gradeType === 'Semester' ? null : parseFloat(s.marks) || 0,
            grade: gradeType === 'Semester' ? s.marks : null
          })),
          imported_data: importedData,
          subject_code: assignment?.subject_code,
          subject_name: assignment?.subject_name,
          semester: assignment?.semester,
          grade_type: gradeType,
          academic_year: new Date().getFullYear().toString()
        })
      });

      if (response.ok) {
        alert('Grades saved successfully!');
        // Clear imported data after successful save
        localStorage.removeItem(`imported_marks_${selectedAssignment}_${gradeType}`);
      } else {
        alert('Failed to save grades');
      }
    } catch (error) {
      console.error('Error saving grades:', error);
      alert('Error saving grades');
    }
  };

  const getCategoryOptions = () => {
    if (gradeType === 'Assignment') {
      return ['Assignment 1', 'Assignment 2', 'Assignment 3', 'Assignment 4', 'Assignment 5'];
    } else if (gradeType === 'IA') {
      return ['IA 1', 'IA 2', 'IA 3'];
    } else if (gradeType === 'Quiz') {
      return ['Quiz 1', 'Quiz 2', 'Quiz 3', 'Quiz 4', 'Quiz 5'];
    } else if (gradeType === 'Project') {
      return ['Mini Project', 'Major Project', 'Lab Project'];
    } else if (gradeType === 'Semester') {
      return ['Semester Exam'];
    }
    return [];
  };

  const getMaxMarks = () => {
    if (gradeType === 'Assignment') return 40;
    if (gradeType === 'IA1' || gradeType === 'IA2' || gradeType === 'IA3') return 50;
    if (gradeType === 'Quiz') return 20;
    if (gradeType === 'Project') return 100;
    if (gradeType === 'Semester') return 'Grade';
    return 50;
  };

  const getGradeOptions = () => {
    return ['O', 'A+', 'A', 'B+', 'B', 'C', 'RA', 'Ab'];
  };

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
        const nameIndex = headers.findIndex(h => h.toLowerCase().includes('name'));
        const marksIndex = headers.findIndex(h => h.toLowerCase().includes('marks') || h.toLowerCase().includes('score'));
        
        if (regNoIndex === -1 || marksIndex === -1) {
          alert('CSV must contain Register_No and Marks columns');
          return;
        }

        const preview = [];
        const errors = [];
        const maxMarks = getMaxMarks();
        
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',').map(cell => cell.trim());
          if (row.length < 2) continue;
          
          const regNo = row[regNoIndex];
          const studentName = nameIndex !== -1 ? row[nameIndex] : '';
          const marks = row[marksIndex];
          
          let error = null;
          
          // Validation
          const studentExists = students.find(s => s.regNo === regNo);
          if (!studentExists) {
            error = 'Student ID not found';
            errors.push(`Student ${regNo} not found in database`);
          } else if (gradeType !== 'Semester' && parseFloat(marks) > maxMarks) {
            error = `Marks exceed maximum (${maxMarks})`;
            errors.push(`Invalid marks for ${regNo}: ${marks} exceeds maximum ${maxMarks}`);
          } else if (isNaN(parseFloat(marks))) {
            error = 'Invalid marks format';
            errors.push(`Invalid marks format for ${regNo}: ${marks}`);
          }
          
          preview.push({ regNo, name: studentName, marks, error });
        }
        
        setPreviewData(preview);
        setValidationErrors(errors);
        setShowImportModal(false);
        setShowPreview(true);
      } catch (error) {
        console.error('Error parsing CSV:', error);
        alert('Error parsing CSV file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };
  
  const confirmUpload = () => {
    const updatedStudents = [...students];
    const importedData = [];
    
    previewData.forEach(row => {
      if (!row.error) {
        const studentIndex = updatedStudents.findIndex(s => s.regNo === row.regNo);
        if (studentIndex !== -1) {
          updatedStudents[studentIndex].marks = row.marks;
        }
        importedData.push(row);
      }
    });
    
    localStorage.setItem(`imported_marks_${selectedAssignment}_${gradeType}`, JSON.stringify(importedData));
    setStudents(updatedStudents);
    setShowPreview(false);
    alert('CSV uploaded successfully!');
  };
  
  const saveIndividualMarks = async (student) => {
    if (!student.marks) {
      alert('Please enter marks for the student');
      return;
    }
    
    const assignment = assignments.find(a => a.id.toString() === selectedAssignment);
    
    try {
      const response = await fetch('http://localhost:5000/api/teacher/individual-marks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          student: {
            id: student.id,
            name: student.name,
            regNo: student.regNo,
            marks: parseFloat(student.marks)
          },
          subject_code: assignment?.subject_code,
          subject_name: assignment?.subject_name,
          department: selectedDepartment,
          grade_type: gradeType,
          academic_year: new Date().getFullYear().toString()
        })
      });

      if (response.ok) {
        alert(`Marks saved for ${student.name}!`);
        setSelectedStudent(null);
      } else {
        alert('Failed to save marks');
      }
    } catch (error) {
      console.error('Error saving individual marks:', error);
      alert('Error saving marks');
    }
  };
  
  const downloadMarkSheet = () => {
    const assignment = assignments.find(a => a.id.toString() === selectedAssignment);
    const csvContent = [
      ['Department', 'Subject_Code', 'Subject_Name', 'Grade_Type', 'Register_No', 'Student_Name', 'Marks', 'Max_Marks', 'Date'],
      ...students.map(s => [
        selectedDepartment,
        assignment?.subject_code,
        assignment?.subject_name,
        gradeType,
        s.regNo,
        s.name,
        s.marks || '0',
        getMaxMarks(),
        new Date().toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedDepartment}_${gradeType}_marks_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
    a.download = `sample_${gradeType}_marks.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="grades-section">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="title-section">
            <h1>Assessment Management</h1>
            <p>Manage student grades and assessments efficiently</p>
          </div>
          <div className="stats-section">
            <div className="stat-item">
              <span className="stat-number">{students.length}</span>
              <span className="stat-label">Students</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{assignments.length}</span>
              <span className="stat-label">Subjects</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-card">
        <h3>Assessment Configuration</h3>
        <div className="filters-grid">
          <div className="filter-item">
            <label>Department</label>
            <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-item">
            <label>Assessment Type</label>
            <select value={gradeType} onChange={(e) => setGradeType(e.target.value)}>
              <option value="">Select Assessment</option>
              <option value="IA1">Internal Assessment 1 (50 marks)</option>
              <option value="IA2">Internal Assessment 2 (50 marks)</option>
              <option value="IA3">Internal Assessment 3 (50 marks)</option>
              <option value="Assignment">Assignment (40 marks)</option>
              <option value="Quiz">Quiz (20 marks)</option>
              <option value="Project">Project (100 marks)</option>
              <option value="Semester">Semester Grade</option>
            </select>
          </div>
          
          <div className="filter-item">
            <label>Subject</label>
            <select value={selectedAssignment} onChange={(e) => setSelectedAssignment(e.target.value)}>
              <option value="">Select Subject</option>
              {assignments.filter(a => !selectedDepartment || a.department === selectedDepartment).map(assignment => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.subject_code} - {assignment.department} Year {assignment.year}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {selectedDepartment && gradeType && selectedAssignment && (
          <div className="action-buttons">
            {gradeType !== 'Semester' && (
              <button className="btn btn-primary" onClick={() => setShowImportModal(true)}>
                <Upload size={18} />
                Bulk Upload
              </button>
            )}
            <button className="btn btn-secondary" onClick={downloadMarkSheet}>
              <Download size={18} />
              Export Report
            </button>
          </div>
        )}
      </div>

      {showIndividualEntry && (
        <div className="individual-entry-section">
          <h3>Individual Student Entry - {gradeType}</h3>
          <div className="student-selector">
            <select 
              value={selectedStudent || ''} 
              onChange={(e) => setSelectedStudent(e.target.value)}
            >
              <option value="">Select Student</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.regNo} - {student.name}
                </option>
              ))}
            </select>
          </div>
          
          {selectedStudent && (
            <div className="individual-marks-entry">
              {(() => {
                const student = students.find(s => s.id === selectedStudent);
                return (
                  <div className="student-card">
                    <h4>{student?.name} ({student?.regNo})</h4>
                    <div className="marks-input-section">
                      <label>Enter {gradeType} Marks (Max: {getMaxMarks()}):</label>
                      <input
                        type="number"
                        min="0"
                        max={getMaxMarks()}
                        value={student?.marks || ''}
                        onChange={(e) => handleMarksChange(student.id, e.target.value, 0)}
                        placeholder="0"
                        className="individual-marks-input"
                      />
                      <button 
                        className="save-individual-btn"
                        onClick={() => saveIndividualMarks(student)}
                      >
                        <Save size={16} /> Save & Update
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}
      
      {selectedDepartment && gradeType && selectedAssignment && (
        <div className="assessment-card">
          <div className="card-header">
            <div className="header-info">
              <h3>{assignments.find(a => a.id.toString() === selectedAssignment)?.subject_code} - {gradeType}</h3>
              <p>Maximum Marks: {getMaxMarks()}</p>
            </div>
            <div className="progress-info">
              <span className="progress-text">
                {students.filter(s => s.marks).length} of {students.length} completed
              </span>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${students.length ? (students.filter(s => s.marks).length / students.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="table-wrapper">
            <table className="assessment-table">
              <thead>
                <tr>
                  <th>Register No</th>
                  <th>Student Name</th>
                  <th>{gradeType === 'Semester' ? 'Grade' : `Marks (/${getMaxMarks()})`}</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr 
                    key={student.id} 
                    className={`student-row ${student.marks ? 'completed' : 'pending'}`}
                    onClick={() => handleRowClick(student.id)}
                  >
                    <td className="reg-no">{student.regNo}</td>
                    <td className="student-name">{student.name}</td>
                    <td className="marks-cell">
                      {gradeType === 'Semester' ? (
                        <select
                          className="grade-select"
                          value={student.marks}
                          onChange={(e) => handleMarksChange(student.id, e.target.value, index)}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="">Select Grade</option>
                          {getGradeOptions().map(grade => (
                            <option key={grade} value={grade}>{grade}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          ref={(el) => inputRefs.current[index] = el}
                          type="number"
                          min="0"
                          max={getMaxMarks()}
                          value={student.marks}
                          onChange={(e) => handleMarksChange(student.id, e.target.value, index)}
                          placeholder="Enter marks"
                          className="marks-input"
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${student.marks ? 'completed' : 'pending'}`}>
                        {student.marks ? (
                          <><CheckCircle size={14} /> Completed</>
                        ) : (
                          <>⏳ Pending</>
                        )}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="save-btn-small"
                        onClick={(e) => {
                          e.stopPropagation();
                          saveIndividualMarks(student);
                        }}
                        disabled={!student.marks}
                        title="Save marks"
                      >
                        <Save size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="card-footer">
            <div className="summary">
              <span className="summary-item">
                <strong>{students.filter(s => s.marks).length}</strong> Completed
              </span>
              <span className="summary-item">
                <strong>{students.length - students.filter(s => s.marks).length}</strong> Pending
              </span>
            </div>
            <button className="btn btn-success btn-large" onClick={saveGrades}>
              <Save size={18} />
              Save All Assessments
            </button>
          </div>
        </div>
      )}
      
      {showPreview && (
        <div className="preview-modal">
          <div className="preview-content">
            <h3>
              <Eye size={20} />
              Preview CSV Upload - {gradeType}
            </h3>
            
            {validationErrors.length > 0 && (
              <div className="validation-errors">
                <h4><AlertTriangle size={16} /> Validation Errors:</h4>
                <ul>
                  {validationErrors.map((error, index) => (
                    <li key={index} className="error-item">{error}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="preview-table">
              <table>
                <thead>
                  <tr>
                    <th>Register No</th>
                    <th>Student Name</th>
                    <th>Marks</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, index) => (
                    <tr key={index} className={row.error ? 'error-row' : 'valid-row'}>
                      <td>{row.regNo}</td>
                      <td>{row.name}</td>
                      <td>{row.marks}</td>
                      <td>
                        {row.error ? (
                          <span className="error-status">{row.error}</span>
                        ) : (
                          <CheckCircle size={16} className="valid-status" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="preview-actions">
              <button 
                className="confirm-upload-btn"
                onClick={confirmUpload}
                disabled={validationErrors.length > 0}
              >
                <Save size={16} /> Confirm Upload
              </button>
              <button 
                className="cancel-preview-btn"
                onClick={() => setShowPreview(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showImportModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>
              <FileText size={20} />
              Import {gradeType} Marks from CSV
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <p style={{ marginBottom: '12px', color: '#666' }}>
                Upload a CSV file with Register_No and Marks columns to automatically fill the marks.
              </p>
              
              <button 
                onClick={downloadSampleCSV}
                className="sample-csv-btn"
              >
                Download Sample CSV
              </button>
              
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
                  className="file-upload-btn"
                >
                  <Upload size={16} />
                  Choose CSV File
                </button>
                
                <button
                  onClick={() => setShowImportModal(false)}
                  className="modal-cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .grades-section {
          background: #f8fafc;
          min-height: 100vh;
          padding: 1.5rem;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* Header */
        .page-header {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .title-section h1 {
          font-size: 1.875rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 0.5rem 0;
        }

        .title-section p {
          color: #64748b;
          margin: 0;
          font-size: 0.95rem;
        }

        .stats-section {
          display: flex;
          gap: 2rem;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          display: block;
          font-size: 2rem;
          font-weight: 700;
          color: #2563eb;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #64748b;
          font-weight: 500;
        }

        /* Filters Card */
        .filters-card {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
        }

        .filters-card h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 1.5rem 0;
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .filter-item label {
          display: block;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .filter-item select {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          font-size: 0.95rem;
          color: #374151;
          transition: all 0.2s ease;
        }

        .filter-item select:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        /* Buttons */
        .btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .btn-primary {
          background: #2563eb;
          color: white;
        }

        .btn-primary:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: #f1f5f9;
          color: #475569;
          border: 2px solid #e2e8f0;
        }

        .btn-secondary:hover {
          background: #e2e8f0;
        }

        .btn-success {
          background: #16a34a;
          color: white;
        }

        .btn-success:hover {
          background: #15803d;
          transform: translateY(-1px);
        }

        .btn-large {
          padding: 1rem 2rem;
          font-size: 1rem;
        }

        /* Assessment Card */
        .assessment-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .header-info h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 0.25rem 0;
        }

        .header-info p {
          color: #64748b;
          margin: 0;
          font-size: 0.9rem;
        }

        .progress-info {
          text-align: right;
        }

        .progress-text {
          font-size: 0.9rem;
          color: #64748b;
          margin-bottom: 0.5rem;
          display: block;
        }

        .progress-bar {
          width: 200px;
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #16a34a;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        /* Table */
        .table-wrapper {
          overflow-x: auto;
        }

        .assessment-table {
          width: 100%;
          border-collapse: collapse;
        }

        .assessment-table thead {
          background: #f8fafc;
        }

        .assessment-table th {
          padding: 1.25rem 1.5rem;
          text-align: left;
          font-weight: 600;
          color: #374151;
          font-size: 0.9rem;
          border-bottom: 2px solid #e2e8f0;
        }

        .assessment-table td {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .student-row {
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .student-row:hover {
          background: #f8fafc;
        }

        .student-row.completed {
          background: rgba(22, 163, 74, 0.05);
        }

        .student-row.pending {
          background: rgba(245, 158, 11, 0.05);
        }

        .reg-no {
          font-weight: 600;
          color: #475569;
        }

        .student-name {
          font-weight: 500;
          color: #1e293b;
        }

        .marks-cell {
          width: 150px;
        }

        .marks-input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e2e8f0;
          border-radius: 6px;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }

        .marks-input:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .grade-select {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e2e8f0;
          border-radius: 6px;
          background: white;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }

        .grade-select:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.75rem;
          border-radius: 16px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .status-badge.completed {
          background: #dcfce7;
          color: #166534;
        }

        .status-badge.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .save-btn-small {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 6px;
          background: #dbeafe;
          color: #2563eb;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .save-btn-small:hover:not(:disabled) {
          background: #2563eb;
          color: white;
        }

        .save-btn-small:disabled {
          background: #f1f5f9;
          color: #9ca3af;
          cursor: not-allowed;
        }

        /* Card Footer */
        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem;
          border-top: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .summary {
          display: flex;
          gap: 2rem;
        }

        .summary-item {
          font-size: 0.9rem;
          color: #64748b;
        }

        .summary-item strong {
          color: #1e293b;
          font-size: 1.1rem;
        }

        /* Individual Entry Section */
        .individual-entry-section {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
        }

        .student-selector select {
          width: 100%;
          max-width: 400px;
          padding: 0.875rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          font-size: 0.95rem;
          margin-bottom: 1.5rem;
        }

        .student-card {
          background: #f8fafc;
          padding: 2rem;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .marks-input-section {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 1.5rem;
          flex-wrap: wrap;
        }

        .individual-marks-input {
          padding: 0.875rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          width: 120px;
          font-size: 0.95rem;
        }

        .save-individual-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .save-individual-btn:hover {
          background: #1d4ed8;
        }

        /* Modals */
        .preview-modal, .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .preview-content, .modal-content {
          background: white;
          padding: 2.5rem;
          border-radius: 12px;
          max-width: 90vw;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        .validation-errors {
          background: #fef2f2;
          border: 1px solid #fecaca;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        .error-item {
          color: #dc2626;
          margin: 0.5rem 0;
          font-size: 0.9rem;
        }

        .preview-table table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }

        .preview-table th,
        .preview-table td {
          padding: 1rem 1.5rem;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }

        .preview-table th {
          background: #f8fafc;
          font-weight: 600;
          color: #374151;
        }

        .error-row {
          background: #fef2f2;
        }

        .valid-row {
          background: #f0fdf4;
        }

        .error-status {
          color: #dc2626;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .valid-status {
          color: #16a34a;
        }

        .preview-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
        }

        .confirm-upload-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          background: #16a34a;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .confirm-upload-btn:hover:not(:disabled) {
          background: #15803d;
        }

        .confirm-upload-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .cancel-preview-btn, .modal-cancel-btn {
          padding: 0.875rem 1.5rem;
          background: #f1f5f9;
          color: #6b7280;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cancel-preview-btn:hover, .modal-cancel-btn:hover {
          background: #e2e8f0;
        }

        .sample-csv-btn, .file-upload-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 1rem;
        }

        .sample-csv-btn:hover, .file-upload-btn:hover {
          background: #1d4ed8;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .grades-section {
            padding: 1rem;
          }

          .header-content {
            flex-direction: column;
            gap: 1.5rem;
            align-items: flex-start;
          }

          .stats-section {
            width: 100%;
            justify-content: space-around;
          }

          .filters-grid {
            grid-template-columns: 1fr;
          }

          .action-buttons {
            flex-direction: column;
          }

          .card-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .progress-info {
            text-align: left;
            width: 100%;
          }

          .progress-bar {
            width: 100%;
          }

          .card-footer {
            flex-direction: column;
            gap: 1.5rem;
          }

          .summary {
            width: 100%;
            justify-content: space-around;
          }
        }
      `}</style>
    </div>
  );
}

export default GradesSection;