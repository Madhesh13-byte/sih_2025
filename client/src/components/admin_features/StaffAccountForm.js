import React, { useState } from 'react';
import { ArrowLeft, BookOpen, RefreshCw, Trash2, Upload, Users, FileSpreadsheet, Download, Sparkles } from 'lucide-react';
import './styles/StudentAccountForm.css';
import './styles/FloatingForms.css';

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
      const response = await fetch('http://localhost:5000/api/students/import', {
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
    <div className="floating-container">
      <div className="form-header">
        <button className="back-btn" onClick={() => setCurrentView('main')}>
          <ArrowLeft size={16} />
        </button>
        <h2>Create Student Account</h2>
        <button className="floating-btn student-import-csv-btn" onClick={() => setShowImport(!showImport)}>
          <FileSpreadsheet size={16} />
          <span>Bulk Import</span>
          <Sparkles size={12} className="sparkle-icon" />
        </button>
      </div>
      
      {showImport && (
        <div className="floating-section student-import-section">
          <div className="floating-section-header">
            <div className="floating-icon student-import-icon">
              <Users size={20} />
            </div>
            <h3>Bulk Student Import</h3>
            <button className="floating-btn floating-btn-secondary" onClick={() => setShowImport(false)} style={{ padding: '0.5rem', borderRadius: '50%', minWidth: 'auto' }}>
              ×
            </button>
          </div>
          
          <div className="student-import-content">
            <div className="import-steps">
              <div className="import-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Download Template</h4>
                  <p>Get the CSV template with correct format</p>
                  <button className="floating-btn template-download-btn">
                    <Download size={14} />
                    Download Template
                  </button>
                </div>
              </div>
              
              <div className="import-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Upload Your File</h4>
                  <p>Select your completed CSV file</p>
                  <div className="file-upload-zone">
                    <input 
                      type="file" 
                      accept=".csv" 
                      onChange={(e) => setCsvFile(e.target.files[0])}
                      id="csvStudentFile"
                      className="file-input-hidden"
                    />
                    <label htmlFor="csvStudentFile" className="file-upload-label">
                      <div className="upload-icon">
                        <FileSpreadsheet size={24} />
                      </div>
                      <div className="upload-text">
                        {csvFile ? (
                          <>
                            <span className="file-name">{csvFile.name}</span>
                            <span className="file-size">{(csvFile.size / 1024).toFixed(1)} KB</span>
                          </>
                        ) : (
                          <>
                            <span className="upload-title">Drop CSV file here</span>
                            <span className="upload-subtitle">or click to browse</span>
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="import-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Import Students</h4>
                  <p>Process and create student accounts</p>
                  <button 
                    className="floating-btn student-process-btn"
                    onClick={handleCsvImport}
                    disabled={!csvFile || isImporting}
                  >
                    {isImporting ? (
                      <>
                        <RefreshCw size={14} className="spinning" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload size={14} />
                        Import Students
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="import-format-info">
              <div className="format-header">
                <FileSpreadsheet size={16} />
                <span>CSV Format Requirements</span>
              </div>
              <div className="format-details">
                <div className="format-row">
                  <span className="format-label">Columns:</span>
                  <span className="format-value">name, email, department, year, dob</span>
                </div>
                <div className="format-row">
                  <span className="format-label">Example:</span>
                  <span className="format-value">John Doe, john@email.com, CSE, 25, 150805</span>
                </div>
                <div className="format-row">
                  <span className="format-label">Auto-Generated:</span>
                  <span className="format-value">Register numbers & passwords</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
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
            <button type="submit" className={`submit-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Creating...
                </>
              ) : (
                'Create All Students'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default CreateStudentForm;