import React, { useState, useEffect } from 'react';
import { GraduationCap, Users, Eye, ArrowLeft, RefreshCw, Trash2, BookOpen, UserCheck, BarChart3, Settings, Calendar, Filter, Hash, Building2 } from 'lucide-react';
import './styles/StaffAccountForm.css';
function CreateStaffForm({ setCurrentView, setMessage }) {
  const [step, setStep] = useState(1);
  const [showImport, setShowImport] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [batchData, setBatchData] = useState({
    department: ''
  });
  const [staffRows, setStaffRows] = useState([{
    name: '',
    email: '',
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
      const response = await fetch('http://localhost:5000/api/staff/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const result = await response.json();
      
      if (response.ok) {
        setMessage(`✅ ${result.message}`);
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

  const addStaffRow = () => {
    setStaffRows([...staffRows, {
      name: '',
      email: '',
      generatedId: '',
      generatedPassword: ''
    }]);
  };

  const removeStaffRow = (index) => {
    setStaffRows(staffRows.filter((_, i) => i !== index));
  };

  const updateStaffRow = (index, field, value) => {
    const updated = staffRows.map((row, i) => {
      if (i === index) {
        const newRow = { ...row, [field]: value };
        
        // Auto-generate ID when name is entered
        if (field === 'name' && value && !newRow.generatedId) {
          generateStaffId(index);
        }
        
        // Auto-generate password when name is entered
        if (field === 'name' && value) {
          const name = value.toLowerCase().replace(/\s+/g, '');
          const dept = batchData.department.toLowerCase();
          newRow.generatedPassword = `${name}@${dept}`;
        }
        
        return newRow;
      }
      return row;
    });
    setStaffRows(updated);
  };

  const generateStaffId = async (index) => {
    try {
      const deptCode = batchData.department.toUpperCase().substring(0, 3);
      
      const response = await fetch(`http://localhost:5000/api/admin/next-staff-number?dept=${deptCode}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const numStr = (data.nextNumber + index).toString().padStart(3, '0');
        const id = `STF${deptCode}${numStr}`;
        
        const updated = staffRows.map((row, i) => 
          i === index ? { ...row, generatedId: id } : row
        );
        setStaffRows(updated);
      }
    } catch (error) {
      console.error('Failed to generate staff ID');
    }
  };
  
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    try {
      const validRows = staffRows.filter(row => row.name);
      const promises = validRows.map(row => 
        fetch('http://localhost:5000/api/admin/create-staff', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            name: row.name,
            email: row.email,
            staff_id: row.generatedId,
            password: row.generatedPassword,
            department: batchData.department
          })
        })
      );
      
      await Promise.all(promises);
      setMessage(`${validRows.length} staff accounts created successfully!`);
      setStep(1);
      setBatchData({ department: '' });
      setStaffRows([{ name: '', email: '', generatedId: '', generatedPassword: '' }]);
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
        <h2>Create Staff Account</h2>
        <button className="import-btn" onClick={() => setShowImport(!showImport)}>
          📁 Import CSV
        </button>
      </div>
      
      {showImport && (
        <div className="csv-import-section">
          <div className="import-header">
            <h3>Import Staff from CSV</h3>
            <button className="close-btn" onClick={() => setShowImport(false)}>×</button>
          </div>
          
          <div className="import-actions">
            <div className="file-upload">
              <input 
                type="file" 
                accept=".csv" 
                onChange={(e) => setCsvFile(e.target.files[0])}
                id="csvStaffFile"
              />
              <label htmlFor="csvStaffFile" className="file-label">
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
            <p><strong>CSV Format:</strong> name, email, department</p>
            <p><strong>Example:</strong> John Teacher, john@email.com, CSE</p>
            <p><strong>Note:</strong> Staff IDs and passwords will be auto-generated</p>
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
          
          <button type="submit" className="submit-btn">
            Next: Add Staff
          </button>
        </form>
      ) : (
        <form onSubmit={handleFinalSubmit} className="admin-form">
          <h3>Add Staff for {batchData.department}</h3>
          
          {staffRows.map((row, index) => (
            <div key={index} className="staff-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={row.name}
                  onChange={(e) => updateStaffRow(index, 'name', e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Email (Optional)</label>
                <input
                  type="email"
                  value={row.email}
                  onChange={(e) => updateStaffRow(index, 'email', e.target.value)}
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
              
              {staffRows.length > 1 && (
                <button type="button" className="remove-row-btn" onClick={() => removeStaffRow(index)}>
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          
          <button type="button" className="add-row-btn" onClick={addStaffRow}>
            + Add Another Staff
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
                'Create All Staff'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
export default CreateStaffForm;