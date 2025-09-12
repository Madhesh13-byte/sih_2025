import React, { useState } from 'react';
import { ArrowLeft, Upload, Download } from 'lucide-react';

function StudentResultsManagement({ setCurrentView, setMessage }) {
  const [uploading, setUploading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [message, setLocalMessage] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log('Starting upload:', file.name);
    setUploading(true);
    const formData = new FormData();
    formData.append('csvFile', file);

    try {
      const response = await fetch('http://localhost:5000/api/student-results/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);
      
      if (response.ok) {
        setLocalMessage(`✅ ${result.message}`);
        setMessage(`✅ ${result.message}`);
      } else {
        setLocalMessage(`❌ ${result.error || 'Upload failed'}`);
        setMessage(`❌ ${result.error || 'Upload failed'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setLocalMessage(`❌ Error uploading file: ${error.message}`);
      setMessage(`❌ Error uploading file: ${error.message}`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/student-results/template', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'student_results_template.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      setMessage('❌ Error downloading template');
    }
  };

  const calculateGPA = async () => {
    setCalculating(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/calculate-all-gpa', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      if (response.ok) {
        setLocalMessage(`✅ ${result.message}`);
        setMessage(`✅ ${result.message}`);
      } else {
        setLocalMessage(`❌ ${result.error}`);
        setMessage(`❌ ${result.error}`);
      }
    } catch (error) {
      setLocalMessage(`❌ Error calculating GPA: ${error.message}`);
      setMessage(`❌ Error calculating GPA: ${error.message}`);
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setCurrentView('main')} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: 'white', cursor: 'pointer' }}>
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ margin: 0, color: '#2c3e50' }}>Student Results Management</h2>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Import Previous Semester Results</h3>
        <p style={{ color: '#6c757d', marginBottom: '20px' }}>
          Upload CSV file containing student results for previous semesters. This data will be used for GPA/CGPA calculations.
        </p>

        <div style={{ display: 'grid', gap: '20px', marginBottom: '30px' }}>
          <div style={{ padding: '20px', backgroundColor: '#e8f4fd', borderRadius: '8px', border: '1px solid #bee5eb' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#0c5460' }}>CSV Format Required:</h4>
            <code style={{ fontSize: '12px', color: '#495057' }}>
              register_no, subject_code, semester, academic_year, ia1_marks, ia2_marks, ia3_marks, semester_grade
            </code>
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#6c757d' }}>
              <strong>Grade Points:</strong> Calculated automatically (O=10, A+=9, A=8, B+=7, B=6, C=5, P=4, F=0)
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <button onClick={downloadTemplate} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              <Download size={16} /> Download Template
            </button>
            
            <div style={{ position: 'relative' }}>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={uploading}
                style={{ display: 'none' }}
                id="csvUpload"
              />
              <label htmlFor="csvUpload" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: uploading ? '#6c757d' : '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: uploading ? 'not-allowed' : 'pointer' }}>
                <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload CSV'}
              </label>
            </div>
            
            <button onClick={calculateGPA} disabled={calculating} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: calculating ? '#6c757d' : '#ffc107', color: calculating ? 'white' : '#212529', border: 'none', borderRadius: '8px', cursor: calculating ? 'not-allowed' : 'pointer' }}>
              {calculating ? 'Calculating...' : 'Calculate GPA'}
            </button>
          </div>
        </div>

        {message && (
          <div style={{ padding: '15px', marginBottom: '20px', borderRadius: '8px', backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da', border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`, color: message.includes('✅') ? '#155724' : '#721c24' }}>
            {message}
          </div>
        )}

        <div style={{ padding: '20px', backgroundColor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>Important Notes:</h4>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#856404' }}>
            <li>Ensure register numbers exist in the system</li>
            <li>Subject codes should match existing subjects</li>
            <li>Use numeric values for semester (1-8)</li>
            <li>Academic year format: 2023, 2024, etc.</li>
            <li>IA marks are optional (can be empty)</li>
            <li>Semester grade is required (grade points calculated automatically)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default StudentResultsManagement;