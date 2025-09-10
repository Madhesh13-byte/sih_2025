import React, { useState, useEffect } from 'react';
import { GraduationCap, Users, Eye, ArrowLeft, RefreshCw, Trash2, BookOpen, UserCheck, BarChart3, Settings, Calendar, Filter, Hash, Building2 } from 'lucide-react';
import './styles/SubjectManagement.css';
function SubjectManagement({ setCurrentView, setMessage }) {
  const [subjects, setSubjects] = useState([]);
  const [step, setStep] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [batchData, setBatchData] = useState({
    department: '', year: '', semester: ''
  });
  const [subjectRows, setSubjectRows] = useState([
    { code: '', name: '', credits: '' }
  ]);
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    // Refresh subjects after CSV import
    const interval = setInterval(fetchSubjects, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/subjects', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      }
    } catch (error) {
      console.error('Failed to fetch subjects');
    }
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const addSubjectRow = () => {
    setSubjectRows([...subjectRows, { code: '', name: '', credits: '' }]);
  };

  const removeSubjectRow = (index) => {
    if (subjectRows.length > 1) {
      setSubjectRows(subjectRows.filter((_, i) => i !== index));
    }
  };

  const updateSubjectRow = (index, field, value) => {
    const updated = subjectRows.map((row, i) => 
      i === index ? { ...row, [field]: value } : row
    );
    setSubjectRows(updated);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    const validRows = subjectRows.filter(row => row.code && row.name && row.credits);
    if (validRows.length === 0) {
      setMessage('Please add at least one complete subject');
      return;
    }

    const newSubjects = validRows.map(row => ({
      id: Date.now() + Math.random(),
      code: row.code,
      name: row.name,
      credits: parseInt(row.credits),
      department: batchData.department,
      year: batchData.year,
      semester: batchData.semester
    }));

    // Save to database via API
    try {
      const yearMap = { 'I': '1', 'II': '2', 'III': '3', 'IV': '4' };
      const promises = newSubjects.map(subject => 
        fetch('http://localhost:5000/api/subjects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            subject_code: subject.code,
            subject_name: subject.name,
            department: subject.department,
            year: yearMap[subject.year] || subject.year,
            semester: subject.semester,
            credits: subject.credits
          })
        })
      );
      
      await Promise.all(promises);
      fetchSubjects(); // Refresh list
    } catch (error) {
      setMessage('Error creating subjects');
    }
    
    // Reset form
    setStep(1);
    setBatchData({ department: '', year: '', semester: '' });
    setSubjectRows([{ code: '', name: '', credits: '' }]);
    setShowForm(false);
    setMessage(`${newSubjects.length} subjects created successfully!`);
  };

  const handleCsvImport = async () => {
    if (!csvFile) {
      setMessage('Please select a CSV file');
      return;
    }

    setIsImporting(true);
    const formData = new FormData();
    formData.append('csvFile', csvFile);

    // Verify token
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Authentication token missing. Please log in again.');
      setIsImporting(false);
      return;
    }

    try {
      // Test server connection first
      try {
        const testResponse = await fetch('http://localhost:5000/api/subjects', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!testResponse.ok) {
          throw new Error('Server connection test failed');
        }
      } catch (error) {
        throw new Error('Cannot connect to server. Please ensure the server is running.');
      }

      // Log the file being sent
      console.log('Sending file:', csvFile.name, 'Size:', csvFile.size, 'Type:', csvFile.type);

      const response = await fetch('http://localhost:5000/api/subjects/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
        timeout: 30000 // 30 second timeout
      });

      // Log the response status
      console.log('Response status:', response.status);
      
      const result = await response.json();
      console.log('Import result:', result);
      
      if (response.ok) {
        if (result.errors && result.errors.length > 0) {
          // Show error details if any
          setMessage(`Import completed with issues:\n${result.errors.join('\n')}`);
        } else {
          setMessage(`✅ ${result.message}`);
        }
        setCsvFile(null);
        setShowImport(false);
        fetchSubjects(); // Refresh subjects list
        setTimeout(() => setMessage(''), 5000);
      } else {
        // Show detailed error message
        const errorMessage = result.details 
          ? `Import failed: ${result.error}\nDetails: ${result.details}` 
          : result.error || 'Import failed';
        setMessage(errorMessage);
      }
    } catch (error) {
      console.error('Import error:', error);
      
      // Handle different types of errors
      if (!navigator.onLine) {
        setMessage('You are offline. Please check your internet connection.');
      } else if (error.message.includes('Cannot connect to server')) {
        setMessage('Server connection failed. Please ensure the server is running at http://localhost:5000');
      } else if (error.name === 'AbortError') {
        setMessage('The request timed out. Please try again.');
      } else if (error.message.includes('Failed to fetch')) {
        setMessage('Connection to server failed. Please ensure the server is running and try again.');
      } else {
        setMessage(`Import failed: ${error.message}. Please try again.`);
      }
      
      // Log detailed error information
      console.error('Detailed error info:', {
        error: error,
        fileName: csvFile?.name,
        fileSize: csvFile?.size,
        fileType: csvFile?.type,
        serverUrl: 'http://localhost:5000/api/subjects/import'
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="subject-management">
      <div className="form-header">
        <button className="back-btn" onClick={() => setCurrentView('main')}>
          <ArrowLeft size={16} />
        </button>
        <h2>Subject Management</h2>
        <div className="header-actions">
          <button className="import-btn" onClick={() => setShowImport(!showImport)}>
            📁 Import CSV
          </button>
          <button className="add-btn" onClick={() => setShowForm(!showForm)}>
            + Add Subject
          </button>
        </div>
      </div>
      
      {showImport && (
        <div className="csv-import-section">
          <div className="import-header">
            <h3>Import Subjects from CSV</h3>
            <button className="close-btn" onClick={() => setShowImport(false)}>×</button>
          </div>
          
          <div className="import-actions">
            <div className="file-upload">
              <input 
                type="file" 
                accept=".csv" 
                onChange={(e) => setCsvFile(e.target.files[0])}
                id="csvFile"
              />
              <label htmlFor="csvFile" className="file-label">
                {csvFile ? csvFile.name : 'Choose CSV File'}
              </label>
            </div>
            
            <button 
              className="upload-btn" 
              onClick={handleCsvImport}
              disabled={!csvFile || isImporting}
            >
              {isImporting ? 'Importing...' : '📤 Import'}
            </button>
          </div>
          
          <div className="import-info">
            <p><strong>CSV Format:</strong> subject_code, subject_name, department, year, semester, credits</p>
            <p><strong>Example:</strong> CS101, Programming, CSE, 1, 1, 4</p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="form-overlay">
          {step === 1 ? (
            <form onSubmit={handleStep1Submit} className="modern-form subject-form">
              <div className="form-header-modern">
                <h3>Step 1: Select Department & Semester</h3>
                <button type="button" className="close-btn" onClick={() => setShowForm(false)}>×</button>
              </div>
              
              <div className="form-body">
                <div className="form-row">
                  <div className="select-group-modern">
                    <select
                      value={batchData.department}
                      onChange={(e) => setBatchData({...batchData, department: e.target.value})}
                      required
                    >
                      <option value="">Select Dept</option>
                      <option value="IT">Information Technology</option>
                      <option value="CSE">Computer Science Engineering</option>
                      <option value="AIDS">Artificial Intelligence & Data Science</option>
                      <option value="MECH">Mechanical Engineering</option>
                      <option value="EEE">Electrical & Electronics Engineering</option>
                      <option value="ECE">Electronics & Communication Engineering</option>
                      <option value="CIVIL">Civil Engineering</option>
                    </select>
                    <label>Department</label>
                  </div>
                  
                  <div className="select-group-modern">
                    <select
                      value={batchData.year}
                      onChange={(e) => setBatchData({...batchData, year: e.target.value, semester: ''})}
                      required
                    >
                      <option value="">Select Year</option>
                      <option value="I">I Year</option>
                      <option value="II">II Year</option>
                      <option value="III">III Year</option>
                      <option value="IV">IV Year</option>
                    </select>
                    <label>Year</label>
                  </div>
                  
                  <div className="select-group-modern">
                    <select
                      value={batchData.semester}
                      onChange={(e) => setBatchData({...batchData, semester: e.target.value})}
                      required
                      disabled={!batchData.year}
                    >
                      <option value="">Select Semester</option>
                      {batchData.year === 'I' && (
                        <>
                          <option value="1">Semester 1</option>
                          <option value="2">Semester 2</option>
                        </>
                      )}
                      {batchData.year === 'II' && (
                        <>
                          <option value="3">Semester 3</option>
                          <option value="4">Semester 4</option>
                        </>
                      )}
                      {batchData.year === 'III' && (
                        <>
                          <option value="5">Semester 5</option>
                          <option value="6">Semester 6</option>
                        </>
                      )}
                      {batchData.year === 'IV' && (
                        <>
                          <option value="7">Semester 7</option>
                          <option value="8">Semester 8</option>
                        </>
                      )}
                    </select>
                    <label>Semester</label>
                  </div>
                </div>
              </div>
              
              <div className="form-actions-modern">
                <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="create-btn">Next: Add Subjects</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleFinalSubmit} className="modern-form subject-form bulk-subjects">
              <div className="form-header-modern">
                <h3>Step 2: Add Subjects for {batchData.department} - Year {batchData.year} - Sem {batchData.semester}</h3>
                <button type="button" className="close-btn" onClick={() => setShowForm(false)}>×</button>
              </div>
              
              <div className="form-body">
                <div className="subjects-bulk">
                  {subjectRows.map((row, index) => (
                    <div key={index} className="subject-row">
                      <div className="input-group-modern">
                        <input
                          type="text"
                          value={row.code}
                          onChange={(e) => updateSubjectRow(index, 'code', e.target.value)}
                          required
                        />
                        <label>Subject Code</label>
                      </div>
                      
                      <div className="input-group-modern">
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) => updateSubjectRow(index, 'name', e.target.value)}
                          required
                        />
                        <label>Subject Name</label>
                      </div>
                      
                      <div className="input-group-modern credits-input">
                        <input
                          type="number"
                          value={row.credits}
                          onChange={(e) => updateSubjectRow(index, 'credits', e.target.value)}
                          min="1"
                          max="6"
                          required
                        />
                        <label>Credits</label>
                      </div>
                      
                      {subjectRows.length > 1 && (
                        <button type="button" className="remove-row-btn" onClick={() => removeSubjectRow(index)}>×</button>
                      )}
                    </div>
                  ))}
                  
                  <button type="button" className="add-row-btn" onClick={addSubjectRow}>
                    + Add Another Subject
                  </button>
                </div>
              </div>
              
              <div className="form-actions-modern">
                <button type="button" className="cancel-btn" onClick={() => setStep(1)}>Back</button>
                <button type="submit" className="create-btn">Create All Subjects</button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="subject-filters-enhanced">
        <div className="filter-header">
          <div className="filter-title">
            <Filter size={20} />
            <h3>Filter Subjects</h3>
          </div>
          <div className="filter-count">
            <Hash size={16} />
            {subjects.filter(subject => {
              if (filterDepartment && subject.department !== filterDepartment) return false;
              if (filterYear && subject.year != filterYear) return false;
              if (filterSemester && subject.semester != filterSemester) return false;
              return true;
            }).length} subjects found
          </div>
        </div>
        
        <div className="filter-controls">
          <div className="department-filter">
            <label className="filter-label">
              <Building2 size={16} />
              Department
            </label>
            <div className="dept-buttons">
              <button 
                className={`dept-btn ${filterDepartment === '' ? 'active' : ''}`}
                onClick={() => { setFilterDepartment(''); setFilterYear(''); setFilterSemester(''); }}
              >
                All Departments
              </button>
              {['IT', 'CSE', 'AIDS', 'MECH', 'EEE', 'ECE', 'CIVIL'].map(dept => (
                <button
                  key={dept}
                  className={`dept-btn ${filterDepartment === dept ? 'active' : ''}`}
                  onClick={() => { setFilterDepartment(dept); setFilterYear(''); setFilterSemester(''); }}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>
          
          <div className="year-filter">
            <label className="filter-label">
              <Calendar size={16} />
              Academic Year
            </label>
            <div className="year-buttons">
              <button 
                className={`year-btn ${filterYear === '' ? 'active' : ''}`}
                onClick={() => { setFilterYear(''); setFilterSemester(''); }}
                disabled={!filterDepartment}
              >
                All Years
              </button>
              {[{display: 'I', value: '1'}, {display: 'II', value: '2'}, {display: 'III', value: '3'}, {display: 'IV', value: '4'}].map(year => (
                <button
                  key={year.value}
                  className={`year-btn ${filterYear === year.value ? 'active' : ''}`}
                  onClick={() => { setFilterYear(year.value); setFilterSemester(''); }}
                  disabled={!filterDepartment}
                >
                  {year.display} Year
                </button>
              ))}
            </div>
          </div>
          
          {filterYear && (
            <div className="semester-filter">
              <label className="filter-label">
                <BookOpen size={16} />
                Semester
              </label>
              <div className="semester-buttons">
                <button 
                  className={`sem-btn ${filterSemester === '' ? 'active' : ''}`}
                  onClick={() => setFilterSemester('')}
                >
                  All Semesters
                </button>
                {filterYear === '1' && (
                  <>
                    <button className={`sem-btn ${filterSemester === '1' ? 'active' : ''}`} onClick={() => setFilterSemester('1')}>Sem 1</button>
                    <button className={`sem-btn ${filterSemester === '2' ? 'active' : ''}`} onClick={() => setFilterSemester('2')}>Sem 2</button>
                  </>
                )}
                {filterYear === '2' && (
                  <>
                    <button className={`sem-btn ${filterSemester === '3' ? 'active' : ''}`} onClick={() => setFilterSemester('3')}>Sem 3</button>
                    <button className={`sem-btn ${filterSemester === '4' ? 'active' : ''}`} onClick={() => setFilterSemester('4')}>Sem 4</button>
                  </>
                )}
                {filterYear === '3' && (
                  <>
                    <button className={`sem-btn ${filterSemester === '5' ? 'active' : ''}`} onClick={() => setFilterSemester('5')}>Sem 5</button>
                    <button className={`sem-btn ${filterSemester === '6' ? 'active' : ''}`} onClick={() => setFilterSemester('6')}>Sem 6</button>
                  </>
                )}
                {filterYear === '4' && (
                  <>
                    <button className={`sem-btn ${filterSemester === '7' ? 'active' : ''}`} onClick={() => setFilterSemester('7')}>Sem 7</button>
                    <button className={`sem-btn ${filterSemester === '8' ? 'active' : ''}`} onClick={() => setFilterSemester('8')}>Sem 8</button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="subjects-table">
        <table>
          <thead>
            <tr>
              <th>Subject Code</th>
              <th>Subject Name</th>
              <th>Dept</th>
              <th>Year</th>
              <th>Semester</th>
              <th>Credits</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects
              .filter(subject => {
                if (filterDepartment && subject.department !== filterDepartment) return false;
                if (filterYear && subject.year != filterYear) return false;
                if (filterSemester && subject.semester != filterSemester) return false;
                return true;
              })
              .map(subject => (
                <tr key={subject.id}>
                  <td>{subject.subject_code}</td>
                  <td>{subject.subject_name}</td>
                  <td>{subject.department}</td>
                  <td>{subject.year}</td>
                  <td>{subject.semester}</td>
                  <td>
                    <span className="credits-badge">{subject.credits || 3}</span>
                  </td>
                  <td>
                    <button className="delete-btn" onClick={async () => {
                      try {
                        const response = await fetch(`http://localhost:5000/api/subjects/${subject.id}`, {
                          method: 'DELETE',
                          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                        });
                        if (response.ok) {
                          fetchSubjects();
                          setMessage('Subject deleted successfully!');
                        }
                      } catch (error) {
                        setMessage('Failed to delete subject');
                      }
                    }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default SubjectManagement;