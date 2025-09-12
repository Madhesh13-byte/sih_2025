import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, Trash2, BookOpen, User, Mail, Hash, Lock, Building2 } from 'lucide-react';
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
        
        if (field === 'name' && value && !newRow.generatedId) {
          generateStaffId(index);
        }
        
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
    <motion.div 
      className="form-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div 
        className="form-header"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <motion.button 
          className="back-btn" 
          onClick={() => setCurrentView('main')}
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={16} />
        </motion.button>
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Create Staff Account
        </motion.h2>
        <motion.button 
          className="import-btn" 
          onClick={() => setShowImport(!showImport)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{ rotate: showImport ? 180 : 0 }}
        >
          <BookOpen size={16} /> Import CSV
        </motion.button>
      </motion.div>
      
      <AnimatePresence>
        {showImport && (
          <motion.div 
            className="csv-import-section"
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="import-header">
              <h3>Import Staff from CSV</h3>
              <motion.button 
                className="close-btn" 
                onClick={() => setShowImport(false)}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                ×
              </motion.button>
            </div>
            
            <motion.div 
              className="import-actions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="file-upload">
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={(e) => setCsvFile(e.target.files[0])}
                  id="csvStaffFile"
                />
                <motion.label 
                  htmlFor="csvStaffFile" 
                  className="file-label"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {csvFile ? csvFile.name : 'Choose CSV File'}
                </motion.label>
              </div>
              
              <motion.button 
                className="upload-btn" 
                onClick={handleCsvImport}
                disabled={!csvFile || isImporting}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={isImporting ? { rotate: 360 } : {}}
                transition={{ duration: 1, repeat: isImporting ? Infinity : 0 }}
              >
                {isImporting ? 'Importing...' : <><RefreshCw size={16} /> Import</>}
              </motion.button>
            </motion.div>
            
            <div className="import-info">
              <p><strong>CSV Format:</strong> name, email, department</p>
              <p><strong>Example:</strong> John Teacher, john@email.com, CSE</p>
              <p><strong>Note:</strong> Staff IDs and passwords will be auto-generated</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.form 
            key="step1"
            onSubmit={handleBatchSubmit} 
            className="admin-form"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="form-group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <label><Building2 size={16} /> Department *</label>
              <motion.select
                value={batchData.department}
                onChange={(e) => setBatchData({...batchData, department: e.target.value})}
                required
                whileFocus={{ scale: 1.02, boxShadow: "0 0 20px rgba(99, 102, 241, 0.3)" }}
              >
                <option value="">Select Department</option>
                <option value="IT">Information Technology</option>
                <option value="CSE">Computer Science Engineering</option>
                <option value="AIDS">Artificial Intelligence & Data Science</option>
                <option value="MECH">Mechanical Engineering</option>
                <option value="EEE">Electrical & Electronics Engineering</option>
                <option value="ECE">Electronics & Communication Engineering</option>
                <option value="CIVIL">Civil Engineering</option>
              </motion.select>
            </motion.div>
            
            <motion.button 
              type="submit" 
              className="submit-btn"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Next: Add Staff
            </motion.button>
          </motion.form>
        ) : (
          <motion.form 
            key="step2"
            onSubmit={handleFinalSubmit} 
            className="admin-form"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h3
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Add Staff for {batchData.department}
            </motion.h3>
            
            <AnimatePresence>
              {staffRows.map((row, index) => (
                <motion.div 
                  key={index} 
                  className="staff-row"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <motion.div 
                    className="form-group"
                    whileHover={{ x: 5 }}
                  >
                    <label><User size={16} /> Full Name *</label>
                    <motion.input
                      type="text"
                      value={row.name}
                      onChange={(e) => updateStaffRow(index, 'name', e.target.value)}
                      required
                      whileFocus={{ scale: 1.02, boxShadow: "0 0 20px rgba(99, 102, 241, 0.3)" }}
                    />
                  </motion.div>
                  
                  <motion.div 
                    className="form-group"
                    whileHover={{ x: 5 }}
                  >
                    <label><Mail size={16} /> Email (Optional)</label>
                    <motion.input
                      type="email"
                      value={row.email}
                      onChange={(e) => updateStaffRow(index, 'email', e.target.value)}
                      whileFocus={{ scale: 1.02, boxShadow: "0 0 20px rgba(99, 102, 241, 0.3)" }}
                    />
                  </motion.div>
                  
                  <AnimatePresence>
                    {row.generatedId && (
                      <motion.div 
                        className="form-group"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <label><Hash size={16} /> Generated ID</label>
                        <input type="text" value={row.generatedId} disabled className="generated-field" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <AnimatePresence>
                    {row.generatedPassword && (
                      <motion.div 
                        className="form-group"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <label><Lock size={16} /> Generated Password</label>
                        <input type="text" value={row.generatedPassword} disabled className="generated-field" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {staffRows.length > 1 && (
                    <motion.button 
                      type="button" 
                      className="remove-row-btn" 
                      onClick={() => removeStaffRow(index)}
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            <motion.button 
              type="button" 
              className="add-row-btn" 
              onClick={addStaffRow}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              + Add Another Staff
            </motion.button>
            
            <motion.div 
              className="form-actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <motion.button 
                type="button" 
                className="cancel-btn" 
                onClick={() => setStep(1)}
                whileHover={{ scale: 1.05, x: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                Back
              </motion.button>
              <motion.button 
                type="submit" 
                className={`submit-btn ${isLoading ? 'loading' : ''}`} 
                disabled={isLoading}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                animate={isLoading ? { scale: [1, 1.02, 1] } : {}}
                transition={{ duration: 0.5, repeat: isLoading ? Infinity : 0 }}
              >
                {isLoading ? (
                  <>
                    <motion.div 
                      className="spinner"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Creating...
                  </>
                ) : (
                  'Create All Staff'
                )}
              </motion.button>
            </motion.div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default CreateStaffForm;