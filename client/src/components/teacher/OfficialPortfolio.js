import React, { useState, useRef } from 'react';
import { Download } from 'lucide-react';
import './Portfolio.css';

const OfficialPortfolio = ({ user, isModal = false }) => {
  const portfolioRef = useRef();
  
  const [studentData] = useState({
    regNo: '20IT101',
    fullName: 'John Doe',
    department: 'Information Technology',
    year: 'III',
    program: 'B.Tech Information Technology',
    cgpa: '8.5',
    attendance: '92%'
  });

  const [semesterResults] = useState([
    { semester: 'I', gpa: '8.2', credits: '24' },
    { semester: 'II', gpa: '8.4', credits: '26' },
    { semester: 'III', gpa: '8.6', credits: '25' },
    { semester: 'IV', gpa: '8.3', credits: '24' },
    { semester: 'V', gpa: '8.7', credits: '23' }
  ]);

  const [achievements] = useState([
    { sl: 1, type: 'Workshop', title: 'AI & Machine Learning Bootcamp', issuer: 'NPTEL', date: '2024-12-15', verified: true },
    { sl: 2, type: 'Internship', title: 'Web Development Intern', issuer: 'TCS Limited', date: '2024-11-20', verified: true },
    { sl: 3, type: 'Competition', title: 'Hackathon - 1st Place', issuer: 'IEEE Student Chapter', date: '2024-10-05', verified: true },
    { sl: 4, type: 'Certification', title: 'Full Stack Development', issuer: 'Coursera', date: '2024-09-12', verified: true },
    { sl: 5, type: 'Leadership', title: 'Technical Club President', issuer: 'College Tech Club', date: '2024-08-01', verified: true }
  ]);

  const handlePrint = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/generate-portfolio-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          studentData,
          semesterResults,
          achievements
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${studentData.fullName}_Portfolio.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('PDF generation failed');
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('PDF generation failed');
    }
  };

  return (
    <div style={{
      minHeight: isModal ? 'auto' : '100vh',
      background: isModal ? 'white' : '#f8f9fa',
      padding: isModal ? '0' : '20px',
      fontFamily: '"Times New Roman", serif'
    }}>
      <div ref={portfolioRef} style={{
        width: isModal ? '100%' : '210mm',
        maxWidth: '210mm',
        margin: '0 auto',
        background: 'white',
        boxShadow: isModal ? 'none' : '0 4px 20px rgba(0,0,0,0.1)',
        border: isModal ? 'none' : '1px solid #e5e7eb',
        transform: isModal ? 'none' : 'scale(0.8)',
        transformOrigin: 'top center'
      }}>
        
        {/* Header Section */}
        <div style={{
          padding: '30px 40px',
          borderBottom: '3px solid #1e3a8a',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: '#1e3a8a',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold',
            margin: '0 auto 20px'
          }}>
            LOGO
          </div>
          <h1 style={{
            margin: '0 0 5px 0',
            fontSize: '24px',
            color: '#1e3a8a',
            fontWeight: 'bold'
          }}>
            XYZ COLLEGE OF ENGINEERING
          </h1>
          <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#6b7280' }}>
            Autonomous Institution | NAAC A+ Accredited
          </p>
          <h2 style={{
            margin: 0,
            fontSize: '20px',
            color: '#1e3a8a',
            fontWeight: 'bold',
            letterSpacing: '1px'
          }}>
            VERIFIED STUDENT ACHIEVEMENT PORTFOLIO
          </h2>
        </div>

        {/* Student Information */}
        <div style={{ padding: '25px 40px', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{
            margin: '0 0 15px 0',
            fontSize: '16px',
            color: '#1e3a8a',
            fontWeight: 'bold',
            borderBottom: '2px solid #1e3a8a',
            paddingBottom: '5px',
            display: 'inline-block'
          }}>
            STUDENT INFORMATION
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>Register Number:</strong> {studentData.regNo}
              </p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>Full Name:</strong> {studentData.fullName}
              </p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>Department:</strong> {studentData.department}
              </p>
            </div>
            <div>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>Year:</strong> {studentData.year}
              </p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>Program:</strong> {studentData.program}
              </p>
            </div>
          </div>
        </div>

        {/* Academic Summary */}
        <div style={{ padding: '25px 40px', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{
            margin: '0 0 15px 0',
            fontSize: '16px',
            color: '#1e3a8a',
            fontWeight: 'bold',
            borderBottom: '2px solid #1e3a8a',
            paddingBottom: '5px',
            display: 'inline-block'
          }}>
            ACADEMIC SUMMARY
          </h3>
          <div style={{ display: 'flex', gap: '30px', marginBottom: '20px' }}>
            <p style={{ margin: 0, fontSize: '14px' }}>
              <strong>CGPA:</strong> {studentData.cgpa}
            </p>
            <p style={{ margin: 0, fontSize: '14px' }}>
              <strong>Attendance:</strong> {studentData.attendance}
            </p>
          </div>
          
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '12px'
          }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'center' }}>Semester</th>
                <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'center' }}>GPA</th>
                <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'center' }}>Credits</th>
              </tr>
            </thead>
            <tbody>
              {semesterResults.map((sem, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'center' }}>{sem.semester}</td>
                  <td style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'center' }}>{sem.gpa}</td>
                  <td style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'center' }}>{sem.credits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Achievements & Certifications */}
        <div style={{ padding: '25px 40px', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{
            margin: '0 0 15px 0',
            fontSize: '16px',
            color: '#1e3a8a',
            fontWeight: 'bold',
            borderBottom: '2px solid #1e3a8a',
            paddingBottom: '5px',
            display: 'inline-block'
          }}>
            VERIFIED ACHIEVEMENTS & CERTIFICATIONS
          </h3>
          
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '11px'
          }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                <th style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'center', width: '8%' }}>Sl. No</th>
                <th style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'center', width: '15%' }}>Activity Type</th>
                <th style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'center', width: '30%' }}>Title / Certificate</th>
                <th style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'center', width: '20%' }}>Issuing Body</th>
                <th style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'center', width: '15%' }}>Date</th>
                <th style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'center', width: '12%' }}>Verified</th>
              </tr>
            </thead>
            <tbody>
              {achievements.map((achievement, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'center' }}>{achievement.sl}</td>
                  <td style={{ border: '1px solid #d1d5db', padding: '6px' }}>{achievement.type}</td>
                  <td style={{ border: '1px solid #d1d5db', padding: '6px' }}>{achievement.title}</td>
                  <td style={{ border: '1px solid #d1d5db', padding: '6px' }}>{achievement.issuer}</td>
                  <td style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'center' }}>{achievement.date}</td>
                  <td style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'center' }}>
                    {achievement.verified ? '✓' : '✗'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer - Signatures */}
        <div style={{ padding: '40px 40px 30px 40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '30px' }}>
            <div style={{ textAlign: 'center', width: '150px' }}>
              <div style={{
                height: '60px',
                borderBottom: '1px solid #000',
                marginBottom: '5px'
              }}></div>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold' }}>Student Signature</p>
            </div>
            <div style={{ textAlign: 'center', width: '150px' }}>
              <div style={{
                height: '60px',
                borderBottom: '1px solid #000',
                marginBottom: '5px'
              }}></div>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold' }}>Faculty Advisor</p>
            </div>
            <div style={{ textAlign: 'center', width: '150px' }}>
              <div style={{
                height: '60px',
                borderBottom: '1px solid #000',
                marginBottom: '5px'
              }}></div>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold' }}>HOD / Principal</p>
            </div>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              border: '2px solid #1e3a8a',
              borderRadius: '50%',
              margin: '0 auto 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              color: '#1e3a8a'
            }}>
              COLLEGE SEAL
            </div>
            <p style={{ margin: 0, fontSize: '11px', fontStyle: 'italic', color: '#6b7280' }}>
              * This portfolio is system-generated and verified by XYZ College of Engineering *
            </p>
          </div>
        </div>
      </div>

      {/* Print/Download Button - Only show when not in modal */}
      {!isModal && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000
        }}>
          <button
            onClick={handlePrint}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: '#1e3a8a',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)'
            }}
          >
            <Download size={16} />
            Download PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default OfficialPortfolio;
