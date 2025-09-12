import React, { useState, useEffect } from 'react';
import './StudentDashboard.css';
function AcademicSection({ user }) {
  const [activeTab, setActiveTab] = useState('assignment');
  const [grades, setGrades] = useState({ assignments: [], ias: [], semesters: [], gpa: 0, sgpa: 0 });
  const [previousResults, setPreviousResults] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrades();
    fetchPreviousResults();
  }, [selectedSemester]);

  const fetchGrades = async () => {
    try {
      let url = 'http://localhost:5000/api/student/grades';
      const params = new URLSearchParams();
      if (selectedSemester) params.append('semester', selectedSemester);
      if (params.toString()) url += '?' + params.toString();
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Current semester grades data:', data);
        
        // Fetch GPA data with semester filter
        let gpaUrl = 'http://localhost:5000/api/student/gpa';
        if (selectedSemester) gpaUrl += `?semester=${selectedSemester}`;
        
        const gpaResponse = await fetch(gpaUrl, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (gpaResponse.ok) {
          const gpaData = await gpaResponse.json();
          data.gpa = gpaData.current?.cgpa || 0;
          data.sgpa = gpaData.current?.sgpa || 0;
        }
        
        setGrades(data);
      }
    } catch (error) {
      console.error('Failed to fetch grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreviousResults = async () => {
    try {
      let url = `http://localhost:5000/api/student-results/${user.register_no}`;
      const params = new URLSearchParams();
      if (selectedSemester) params.append('semester', selectedSemester);
      if (params.toString()) url += '?' + params.toString();
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Previous results data:', data);
        setPreviousResults(data);
      } else {
        console.log('Failed to fetch previous results:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch previous results:', error);
    }
  };



  const renderAssignmentTab = () => {
    // Combine current semester grades and previous results
    const currentSemesterGrades = grades.assignments || [];
    const allResults = [...currentSemesterGrades, ...previousResults];
    
    return (
      <div className="grades-table">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'left' }}>Subject Code</th>
              <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'left' }}>Subject Name</th>
              <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>IA 1</th>
              <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>IA 2</th>
              <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>IA 3</th>
              <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>Semester</th>
              <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>Grade</th>
            </tr>
          </thead>
          <tbody>
            {allResults.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
                  No results available
                </td>
              </tr>
            ) : (
              allResults.map((subject, index) => (
                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa' }}>
                  <td style={{ padding: '12px', border: '1px solid #e1e8ed', fontWeight: '500' }}>{subject.subject_code}</td>
                  <td style={{ padding: '12px', border: '1px solid #e1e8ed' }}>{subject.subject_name || subject.subject_code}</td>
                  <td style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>
                    {subject.ia1_marks !== null && subject.ia1_marks !== undefined ? `${subject.ia1_marks}/50` : 
                     subject.ia1 !== null && subject.ia1 !== undefined ? `${subject.ia1}/50` : 
                     subject.assignment1 !== null && subject.assignment1 !== undefined ? `${subject.assignment1}/50` : '-'}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>
                    {subject.ia2_marks !== null && subject.ia2_marks !== undefined ? `${subject.ia2_marks}/50` : 
                     subject.ia2 !== null && subject.ia2 !== undefined ? `${subject.ia2}/50` : 
                     subject.assignment2 !== null && subject.assignment2 !== undefined ? `${subject.assignment2}/50` : '-'}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>
                    {subject.ia3_marks !== null && subject.ia3_marks !== undefined ? `${subject.ia3_marks}/50` : 
                     subject.ia3 !== null && subject.ia3 !== undefined ? `${subject.ia3}/50` : 
                     subject.assignment3 !== null && subject.assignment3 !== undefined ? `${subject.assignment3}/50` : '-'}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>
                    {subject.semester || subject.academic_year || 'Current'}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>
                    {subject.semester_grade || subject.grade ? (
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontWeight: '600',
                        backgroundColor: (subject.semester_grade || subject.grade).startsWith('O') ? '#d4edda' : 
                                       (subject.semester_grade || subject.grade).startsWith('A') ? '#cce5ff' :
                                       (subject.semester_grade || subject.grade).startsWith('B') ? '#fff3cd' :
                                       (subject.semester_grade || subject.grade).startsWith('C') ? '#ffeaa7' : '#f8d7da',
                        color: (subject.semester_grade || subject.grade).startsWith('O') ? '#155724' :
                               (subject.semester_grade || subject.grade).startsWith('A') ? '#004085' :
                               (subject.semester_grade || subject.grade).startsWith('B') ? '#856404' :
                               (subject.semester_grade || subject.grade).startsWith('C') ? '#b7791f' : '#721c24'
                      }}>
                        {subject.semester_grade || subject.grade}
                      </span>
                    ) : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderIATab = () => (
    <div className="grades-table">
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa' }}>
            <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'left' }}>Subject Code</th>
            <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'left' }}>Subject Name</th>
            <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>IA 1</th>
            <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>IA 2</th>
            <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>IA 3</th>
          </tr>
        </thead>
        <tbody>
          {grades.ias.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
                No IA marks available
              </td>
            </tr>
          ) : (
            grades.ias.map((subject, index) => (
              <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa' }}>
                <td style={{ padding: '12px', border: '1px solid #e1e8ed', fontWeight: '500' }}>{subject.subject_code}</td>
                <td style={{ padding: '12px', border: '1px solid #e1e8ed' }}>{subject.subject_name}</td>
                <td style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>
                  {subject.ia1 !== null ? `${subject.ia1}/50` : '-'}
                </td>
                <td style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>
                  {subject.ia2 !== null ? `${subject.ia2}/50` : '-'}
                </td>
                <td style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>
                  {subject.ia3 !== null ? `${subject.ia3}/50` : '-'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const renderSemesterTab = () => (
    <div className="grades-table">
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa' }}>
            <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'left' }}>Subject Code</th>
            <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'left' }}>Subject Name</th>
            <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>Semester Grade</th>
          </tr>
        </thead>
        <tbody>
          {grades.semesters.length === 0 ? (
            <tr>
              <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
                No semester grades available
              </td>
            </tr>
          ) : (
            grades.semesters.map((subject, index) => (
              <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa' }}>
                <td style={{ padding: '12px', border: '1px solid #e1e8ed', fontWeight: '500' }}>{subject.subject_code}</td>
                <td style={{ padding: '12px', border: '1px solid #e1e8ed' }}>{subject.subject_name}</td>
                <td style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>
                  {subject.grade ? (
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontWeight: '600',
                      backgroundColor: subject.grade.startsWith('O') ? '#d4edda' : 
                                     subject.grade.startsWith('A') ? '#cce5ff' :
                                     subject.grade.startsWith('B') ? '#fff3cd' :
                                     subject.grade.startsWith('C') ? '#ffeaa7' : '#f8d7da',
                      color: subject.grade.startsWith('O') ? '#155724' :
                             subject.grade.startsWith('A') ? '#004085' :
                             subject.grade.startsWith('B') ? '#856404' :
                             subject.grade.startsWith('C') ? '#b7791f' : '#721c24'
                    }}>
                      {subject.grade}
                    </span>
                  ) : '-'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading grades...</div>;
  }

  return (
    <div className="academic-section">
      <h2>Academic Performance</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Filter by Semester:</label>
        <select 
          value={selectedSemester} 
          onChange={(e) => setSelectedSemester(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px' }}
        >
          <option value="">All Semesters</option>
          {Array.from({ length: user.current_semester || 5 }, (_, i) => (
            <option key={i + 1} value={i + 1}>Semester {i + 1}</option>
          ))}
        </select>
      </div>

      <div className="grade-tabs" style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveTab('assignment')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'assignment' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'assignment' ? 'white' : '#6c757d',
            border: '1px solid #e1e8ed',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          All Results
        </button>
        

      </div>

      {(grades.gpa > 0 || grades.sgpa > 0) && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '8px', border: '1px solid #28a745' }}>
          <div style={{ display: 'flex', gap: '30px' }}>
            {grades.sgpa > 0 && (
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#155724' }}>SGPA: {grades.sgpa}</h4>
                <p style={{ margin: 0, color: '#155724', fontSize: '12px' }}>Semester GPA</p>
              </div>
            )}
            {grades.gpa > 0 && (
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#155724' }}>CGPA: {grades.gpa}</h4>
                <p style={{ margin: 0, color: '#155724', fontSize: '12px' }}>Cumulative GPA</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grade-content">
        {renderAssignmentTab()}
      </div>
    </div>
  );
}
export default AcademicSection;