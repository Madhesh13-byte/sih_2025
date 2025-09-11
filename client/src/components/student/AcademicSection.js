import React, { useState, useEffect } from 'react';
import './StudentDashboard.css';
function AcademicSection({ user }) {
  const [activeTab, setActiveTab] = useState('assignment');
  const [grades, setGrades] = useState({ assignments: [], ias: [], semesters: [] });
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrades();
  }, [selectedSemester, selectedYear]);

  const fetchGrades = async () => {
    try {
      let url = 'http://localhost:5000/api/student/grades';
      const params = new URLSearchParams();
      if (selectedSemester) params.append('semester', selectedSemester);
      if (selectedYear) params.append('academic_year', selectedYear);
      if (params.toString()) url += '?' + params.toString();
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setGrades(data);
      }
    } catch (error) {
      console.error('Failed to fetch grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderAssignmentTab = () => (
    <div className="grades-table">
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa' }}>
            <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'left' }}>Subject Code</th>
            <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'left' }}>Subject Name</th>
            <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>Assignment 1</th>
            <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>Assignment 2</th>
            <th style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>Assignment 3</th>
          </tr>
        </thead>
        <tbody>
          {grades.assignments.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
                No assignment marks available
              </td>
            </tr>
          ) : (
            grades.assignments.map((subject, index) => (
              <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa' }}>
                <td style={{ padding: '12px', border: '1px solid #e1e8ed', fontWeight: '500' }}>{subject.subject_code}</td>
                <td style={{ padding: '12px', border: '1px solid #e1e8ed' }}>{subject.subject_name}</td>
                <td style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>
                  {subject.assignment1 !== null ? `${subject.assignment1}/40` : '-'}
                </td>
                <td style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>
                  {subject.assignment2 !== null ? `${subject.assignment2}/40` : '-'}
                </td>
                <td style={{ padding: '12px', border: '1px solid #e1e8ed', textAlign: 'center' }}>
                  {subject.assignment3 !== null ? `${subject.assignment3}/40` : '-'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

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
      

      
      <div className="grade-tabs" style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveTab('assignment')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'assignment' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'assignment' ? 'white' : '#6c757d',
            border: '1px solid #e1e8ed',
            borderRadius: '6px 0 0 6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Assignments
        </button>
        <button 
          onClick={() => setActiveTab('ia')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'ia' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'ia' ? 'white' : '#6c757d',
            border: '1px solid #e1e8ed',
            borderLeft: 'none',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          IA
        </button>
        <button 
          onClick={() => setActiveTab('semester')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'semester' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'semester' ? 'white' : '#6c757d',
            border: '1px solid #e1e8ed',
            borderLeft: 'none',
            borderRadius: '0 6px 6px 0',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Semester
        </button>
      </div>

      <div className="grade-content">
        {activeTab === 'assignment' && renderAssignmentTab()}
        {activeTab === 'ia' && renderIATab()}
        {activeTab === 'semester' && renderSemesterTab()}
      </div>
    </div>
  );
}
export default AcademicSection;