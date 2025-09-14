import React, { useState, useEffect, useRef } from 'react';
import { Save } from 'lucide-react';

function GradesSection({ assignments }) {
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [gradeType, setGradeType] = useState('');
  const [gradeCategory, setGradeCategory] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [students, setStudents] = useState([]);
  const inputRefs = useRef([]);
  
  const fetchStudents = async (assignmentId) => {
    try {
      const url = academicYear ? 
        `http://localhost:5000/api/staff/students/${assignmentId}?academic_year=${academicYear}` :
        `http://localhost:5000/api/staff/students/${assignmentId}`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students.map(student => ({
          id: student.id,
          name: student.name,
          regNo: student.register_no,
          section: student.section,
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
  }, [selectedAssignment, academicYear]);

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
    
    try {
      const response = await fetch('http://localhost:5000/api/staff/grades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          students: students.map(s => ({ 
            id: s.id, 
            marks: gradeType === 'Semester' ? null : parseFloat(s.marks) || 0,
            grade: gradeType === 'Semester' ? s.marks : null
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
      return ['Assignment 1', 'Assignment 2', 'Assignment 3'];
    } else if (gradeType === 'IA') {
      return ['IA 1', 'IA 2', 'IA 3'];
    } else if (gradeType === 'Semester') {
      return ['Semester Exam'];
    }
    return [];
  };

  const getMaxMarks = () => {
    if (gradeType === 'Assignment') return 40;
    if (gradeType === 'IA1' || gradeType === 'IA2' || gradeType === 'IA3') return 50;
    if (gradeType === 'Semester') return 'Grade';
    return 50;
  };

  const getGradeOptions = () => {
    return ['O', 'A+', 'A', 'B+', 'B', 'C', 'RA', 'Ab'];
  };

  return (
    <div className="grades-section">
      <h2>Grade Management</h2>
      
      <div className="grade-filters" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '20px' }}>
        <select value={selectedAssignment} onChange={(e) => setSelectedAssignment(e.target.value)}>
          <option value="">Select Subject Assignment</option>
          {assignments.map(assignment => (
            <option key={assignment.id} value={assignment.id}>
              {assignment.subject_code} - {assignment.department} {assignment.year}
            </option>
          ))}
        </select>
        
        <select value={gradeType} onChange={(e) => setGradeType(e.target.value)}>
          <option value="">Select Grade Type</option>
          <option value="IA1">IA 1 (50 marks)</option>
          <option value="IA2">IA 2 (50 marks)</option>
          <option value="IA3">IA 3 (50 marks)</option>
          <option value="Semester">Semester Grade</option>
        </select>
      </div>

      {selectedAssignment && gradeType && (
        <div className="grades-table">
          <h3>Enter {gradeType === 'Semester' ? 'Grades' : 'Marks'} - {assignments.find(a => a.id.toString() === selectedAssignment)?.subject_code} ({gradeType}) - Max: {getMaxMarks()}</h3>
          <table>
            <thead>
              <tr>
                <th>Register No</th>
                <th>Student Name</th>
                <th>{gradeType === 'Semester' ? 'Grade' : `Marks (out of ${getMaxMarks()})`}</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.id}>
                  <td>{student.regNo}</td>
                  <td>{student.name}</td>
                  <td>
                    {gradeType === 'Semester' ? (
                      <select
                        value={student.marks}
                        onChange={(e) => handleMarksChange(student.id, e.target.value, index)}
                        style={{ width: '100px' }}
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
                        placeholder="0"
                        style={{ width: '80px' }}
                        className="no-spinner"
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="save-btn" onClick={saveGrades}>
            <Save size={16} /> Save Grades
          </button>
        </div>
      )}
    </div>
  );
}

export default GradesSection;