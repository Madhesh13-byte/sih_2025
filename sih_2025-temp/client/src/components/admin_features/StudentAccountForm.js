import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, RefreshCw, Trash2, User, Mail, Calendar, Hash, Lock } from 'lucide-react';
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
        
        if (field === 'name' && value && !newRow.generatedId) {
          generateStudentId(index);
        }
        
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
          Create Student Account
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
              <h3>Import Students from CSV</h3>
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
                  id="csvStudentFile"
                />
                <motion.label 
                  htmlFor="csvStudentFile" 
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
              <label>Department *</label>
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
            
            <motion.div 
              className="form-group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
            >
              <label>Year of Joining (YY format) *</label>
              <motion.input
                type="text"
                value={batchData.year}
                onChange={(e) => setBatchData({...batchData, year: e.target.value})}
                placeholder="25"
                maxLength="2"
                required
                whileFocus={{ scale: 1.02, boxShadow: "0 0 20px rgba(99, 102, 241, 0.3)" }}
              />
            </motion.div>
            
            <motion.button 
              type="submit" 
              className="submit-btn"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Next: Add Students
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
              Add Students for {batchData.department} - 20{batchData.year}
            </motion.h3>
            
            <AnimatePresence>
              {studentRows.map((row, index) => (
                <motion.div 
                  key={index} 
                  className="student-row"
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
                      onChange={(e) => updateStudentRow(index, 'name', e.target.value)}
                      required
                      whileFocus={{ scale: 1.02, boxShadow: "0 0 20px rgba(99, 102, 241, 0.3)" }}
                    />
                  </motion.div>
                  
                  <motion.div 
                    className="form-group"
                    whileHover={{ x: 5 }}
                  >
                    <label><Calendar size={16} /> Date of Birth (DD/MM/YY) *</label>
                    <div className="dob-inputs">
                      <motion.input
                        type="text"
                        value={row.day}
                        onChange={(e) => updateStudentRow(index, 'day', e.target.value)}
                        placeholder="DD"
                        maxLength="2"
                        required
                        whileFocus={{ scale: 1.05 }}
                      />
                      <span>/</span>
                      <motion.input
                        type="text"
                        value={row.month}
                        onChange={(e) => updateStudentRow(index, 'month', e.target.value)}
                        placeholder="MM"
                        maxLength="2"
                        required
                        whileFocus={{ scale: 1.05 }}
                      />
                      <span>/</span>
                      <motion.input
                        type="text"
                        value={row.dobYear}
                        onChange={(e) => updateStudentRow(index, 'dobYear', e.target.value)}
                        placeholder="YY"
                        maxLength="2"
                        required
                        whileFocus={{ scale: 1.05 }}
                      />
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="form-group"
                    whileHover={{ x: 5 }}
                  >
                    <label><Mail size={16} /> Email (Optional)</label>
                    <motion.input
                      type="email"
                      value={row.email}
                      onChange={(e) => updateStudentRow(index, 'email', e.target.value)}
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
                  
                  {studentRows.length > 1 && (
                    <motion.button 
                      type="button" 
                      className="remove-row-btn" 
                      onClick={() => removeStudentRow(index)}
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
              onClick={addStudentRow}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              + Add Another Student
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
                  'Create All Students'
                )}
              </motion.button>
            </motion.div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default CreateStudentForm;