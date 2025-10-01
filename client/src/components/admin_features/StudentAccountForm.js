import React, { useState } from 'react';
import { ArrowLeft, Upload, RefreshCw, Trash2 } from 'lucide-react';
import './styles/StudentAccountForm.css';

function CreateStudentForm({ setCurrentView, setMessage, setAutoHideMessage }) {
  const [step, setStep] = useState(1);
  const [showImport, setShowImport] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [batchData, setBatchData] = useState({
    department: '',
    year: ''
  });
  const [studentRows, setStudentRows] = useState([{
    name: '',
    email: '',
    day: '',
    month: '',
    dobYear: '',
    generatedId: '',
    generatedPassword: ''
  }]);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleCsvImport = async () => {
    if (!csvFile) {
      setMessage('Please select a CSV file');
      return;
    }

    setIsImporting(true);
    const formData = new FormData();
    formData.append('csvFile', csvFile);

    try {
      const response = await fetch('http://localhost:5000/api/admin/import-students', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const result = await response.json();
      
      if (response.ok) {
        setAutoHideMessage(`✅ ${result.message}`);
        setCsvFile(null);
        setShowImport(false);
      } else {
        setMessage(`❌ ${result.error}`);
      }
    } catch (error) {
      setMessage('Network error during import');
    } finally {
      setIsImporting(false);
    }
  };
  
  const handleBatchSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const addStudentRow = () => {
    setStudentRows([...studentRows, {
      name: '',
      email: '',
      day: '',
      month: '',
      dobYear: '',
      generatedId: '',
      generatedPassword: ''
    }]);
  };

  const removeStudentRow = (index) => {
    setStudentRows(studentRows.filter((_, i) => i !== index));
  };

  const updateStudentRow = (index, field, value) => {
    const updated = studentRows.map((row, i) => {
      if (i === index) {
        const newRow = { ...row, [field]: value };
        
        // Auto-generate ID when name is entered
        if (field === 'name' && value && !newRow.generatedId) {
          generateStudentId(index);
        }
        
        // Auto-generate password when DOB is complete
        if (['day', 'month', 'dobYear'].includes(field) && newRow.day && newRow.month && newRow.dobYear) {
          const password = `${newRow.day}${newRow.month}${newRow.dobYear.toString().slice(-2)}`;
          newRow.generatedPassword = password;
        }
        
        return newRow;
      }
      return row;
    });
    setStudentRows(updated);
  };

  const generateStudentId = async (index) => {
    try {
      const deptCode = batchData.department.toUpperCase().substring(0, 2);
      const yearCode = batchData.year.toString().slice(-2);
      
      const response = await fetch(`http://localhost:5000/api/admin/next-student-number?dept=${deptCode}&year=${yearCode}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const numStr = (data.nextNumber + index).toString().padStart(2, '0');
        const id = `STU${deptCode}${yearCode}${numStr}`;
        
        const updated = studentRows.map((row, i) => 
          i === index ? { ...row, generatedId: id } : row
        );
        setStudentRows(updated);
      }
    } catch (error) {
      console.error('Failed to generate student ID');
    }
  };
  
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    try {
      const validRows = studentRows.filter(row => row.name && row.day && row.month && row.dobYear);
      const promises = validRows.map(row => 
        fetch('http://localhost:5000/api/admin/create-student', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            name: row.name,
            email: row.email,
            day: row.day,
            month: row.month,
            dobYear: row.dobYear,
            register_no: row.generatedId,
            password: row.generatedPassword,
            department: batchData.department,
            year: batchData.year
          })
        })
      );
      
      await Promise.all(promises);
      setMessage(`${validRows.length} student accounts created successfully and auto-assigned to classes!`);
      setStep(1);
      setBatchData({ department: '', year: '' });
      setStudentRows([{ name: '', email: '', day: '', month: '', dobYear: '', generatedId: '', generatedPassword: '' }]);
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="form-container">
      <div className="form-header">
        <button className="back-btn" onClick={() => setCurrentView('main')}>
          <ArrowLeft size={16} />
        </button>
        <h2>Create Student Account</h2>
        <button className="import-btn" onClick={() => setShowImport(!showImport)}>
          <Upload size={16} /> Import CSV
        </button>
      </div>
      
      {showImport && (
        <div className="csv-import-section">
          <div className="import-header">
            <h3>Import Students from CSV</h3>
            <button className="close-btn" onClick={() => setShowImport(false)}>×</button>
          </div>
          
          <div className="import-actions">
            <div className="file-upload">
              <input 
                type="file" 
                accept=".csv" 
                onChange={(e) => setCsvFile(e.target.files[0])}
                id="csvStudentFile"
              />
              <label htmlFor="csvStudentFile" className="file-label">
                {csvFile ? csvFile.name : 'Choose CSV File'}
              </label>
            </div>
            
            <button 
              className="upload-btn" 
              onClick={handleCsvImport}
              disabled={!csvFile || isImporting}
            >
              {isImporting ? 'Importing...' : <><Upload size={16} /> Import</>}
            </button>
          </div>
          
          <div className="import-info">
            <p><strong>CSV Format:</strong> name, email, department, year, dob</p>
            <p><strong>Example:</strong> John Doe, john@email.com, CSE, 25, 150805</p>
            <p><strong>Note:</strong> Register numbers and passwords will be auto-generated</p>
          </div>
        </div>
      )}
      
      {/* Step Indicator */}
      <div className="step-indicator">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
        <div className={`step-connector ${step >= 2 ? 'active' : ''}`}></div>
        <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
      </div>
      
      {step === 1 ? (
        <form onSubmit={handleBatchSubmit} className="admin-form">
          <div className="form-group">
            <label>Dept *</label>
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
          </div>
          
          <div className="form-group">
            <label>Year of Joining (YY format) *</label>
            <input
              type="text"
              value={batchData.year}
              onChange={(e) => setBatchData({...batchData, year: e.target.value})}
              placeholder="25"
              maxLength="2"
              required
            />
          </div>
          
          <button type="submit" className="submit-btn">
            Next: Add Students
          </button>
        </form>
      ) : (
        <form onSubmit={handleFinalSubmit} className="admin-form">
          <h3>Add Students for {batchData.department} - 20{batchData.year}</h3>
          
          {studentRows.map((row, index) => (
            <div key={index} className="student-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={row.name}
                  onChange={(e) => updateStudentRow(index, 'name', e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Date of Birth (DD/MM/YY) *</label>
                <div className="dob-inputs">
                  <input
                    type="text"
                    value={row.day}
                    onChange={(e) => updateStudentRow(index, 'day', e.target.value)}
                    placeholder="DD"
                    maxLength="2"
                    required
                  />
                  <span>/</span>
                  <input
                    type="text"
                    value={row.month}
                    onChange={(e) => updateStudentRow(index, 'month', e.target.value)}
                    placeholder="MM"
                    maxLength="2"
                    required
                  />
                  <span>/</span>
                  <input
                    type="text"
                    value={row.dobYear}
                    onChange={(e) => updateStudentRow(index, 'dobYear', e.target.value)}
                    placeholder="YY"
                    maxLength="2"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Email (Optional)</label>
                <input
                  type="email"
                  value={row.email}
                  onChange={(e) => updateStudentRow(index, 'email', e.target.value)}
                />
              </div>
              
              {row.generatedId && (
                <div className="form-group">
                  <label>Generated ID</label>
                  <input type="text" value={row.generatedId} disabled className="generated-field" />
                </div>
              )}
              
              {row.generatedPassword && (
                <div className="form-group">
                  <label>Generated Password</label>
                  <input type="text" value={row.generatedPassword} disabled className="generated-field" />
                </div>
              )}
              
              {studentRows.length > 1 && (
                <button type="button" className="remove-row-btn" onClick={() => removeStudentRow(index)}>
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          
          <button type="button" className="add-row-btn" onClick={addStudentRow}>
            + Add Another Student
          </button>
          
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => setStep(1)}>Back</button>
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create All Students'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default CreateStudentForm;