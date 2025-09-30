import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, FileText, Download, Eye, Check, X } from 'lucide-react';
import OfficialPortfolio from './OfficialPortfolio';

function CertificatesSection({ user }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showCertificates, setShowCertificates] = useState(false);
  const [studentCertificates, setStudentCertificates] = useState([]);
  
  useEffect(() => {
    fetchStudentsWithCertificates();
  }, []);
  
  const fetchStudentsWithCertificates = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/teacher-students/${user?.staff_id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePortfolio = (student) => {
    setSelectedStudent(student);
    setShowPortfolio(true);
  };

  const viewCertificates = async (student) => {
    try {
      const response = await fetch(`http://localhost:5000/api/student-certificates/${student.id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStudentCertificates(data.certificates || []);
        setSelectedStudent(student);
        setShowCertificates(true);
      }
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
    }
  };

  const approveCertificate = async (certId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/certificates/${certId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'approved' })
      });
      if (response.ok) {
        setStudentCertificates(studentCertificates.map(cert => 
          cert.id === certId ? { ...cert, status: 'approved' } : cert
        ));
        fetchStudentsWithCertificates();
      }
    } catch (error) {
      console.error('Failed to approve certificate:', error);
    }
  };

  const rejectCertificate = async (certId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/certificates/${certId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'rejected' })
      });
      if (response.ok) {
        setStudentCertificates(studentCertificates.map(cert => 
          cert.id === certId ? { ...cert, status: 'rejected' } : cert
        ));
        fetchStudentsWithCertificates();
      }
    } catch (error) {
      console.error('Failed to reject certificate:', error);
    }
  };

  const totalPending = students.reduce((sum, student) => sum + student.pendingCertificates, 0);
  const totalApproved = students.reduce((sum, student) => sum + student.approvedCertificates, 0);

  return (
    <div className="certificates-section">
      <h2>Certificate Approval Panel</h2>

      {/* Dashboard Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div style={{ padding: '20px', backgroundColor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock style={{ color: '#856404' }} size={24} />
            <div>
              <h3 style={{ margin: 0, color: '#856404' }}>{totalPending}</h3>
              <p style={{ margin: 0, color: '#856404', fontSize: '14px' }}>Pending Certificates</p>
            </div>
          </div>
        </div>
        
        <div style={{ padding: '20px', backgroundColor: '#d4edda', borderRadius: '8px', border: '1px solid #c3e6cb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle style={{ color: '#155724' }} size={24} />
            <div>
              <h3 style={{ margin: 0, color: '#155724' }}>{totalApproved}</h3>
              <p style={{ margin: 0, color: '#155724', fontSize: '14px' }}>Approved Certificates</p>
            </div>
          </div>
        </div>
        
        <div style={{ padding: '20px', backgroundColor: '#e2e3e5', borderRadius: '8px', border: '1px solid #d6d8db' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText style={{ color: '#383d41' }} size={24} />
            <div>
              <h3 style={{ margin: 0, color: '#383d41' }}>{students.length}</h3>
              <p style={{ margin: 0, color: '#383d41', fontSize: '14px' }}>Total Students</p>
            </div>
          </div>
        </div>
      </div>

      {/* Students Table */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Loading students...</p>
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f8f9fa' }}>
              <tr>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #e1e8ed', fontWeight: '600' }}>Student Details</th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #e1e8ed', fontWeight: '600' }}>Approved</th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #e1e8ed', fontWeight: '600' }}>Pending</th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #e1e8ed', fontWeight: '600' }}>Total</th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #e1e8ed', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.id} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa' }}>
                  <td style={{ padding: '15px', borderBottom: '1px solid #e1e8ed' }}>
                    <div>
                      <div style={{ fontWeight: '500', fontSize: '16px' }}>{student.name}</div>
                      <div style={{ fontSize: '14px', color: '#6c757d' }}>{student.register_no}</div>
                      <div style={{ fontSize: '12px', color: '#6c757d' }}>{student.department} - Year {student.year}</div>
                    </div>
                  </td>
                  <td style={{ padding: '15px', borderBottom: '1px solid #e1e8ed', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      backgroundColor: '#d4edda',
                      color: '#155724'
                    }}>
                      {student.approvedCertificates}
                    </span>
                  </td>
                  <td style={{ padding: '15px', borderBottom: '1px solid #e1e8ed', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      backgroundColor: student.pendingCertificates > 0 ? '#fff3cd' : '#e2e3e5',
                      color: student.pendingCertificates > 0 ? '#856404' : '#6c757d'
                    }}>
                      {student.pendingCertificates}
                    </span>
                  </td>
                  <td style={{ padding: '15px', borderBottom: '1px solid #e1e8ed', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      backgroundColor: '#e2e3e5',
                      color: '#383d41'
                    }}>
                      {student.totalCertificates}
                    </span>
                  </td>
                  <td style={{ padding: '15px', borderBottom: '1px solid #e1e8ed', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => viewCertificates(student)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '6px 12px',
                          background: '#6b7280',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        <Eye size={12} />
                        View
                      </button>
                      <button
                        onClick={() => generatePortfolio(student)}
                        disabled={student.approvedCertificates === 0}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '6px 12px',
                          background: student.approvedCertificates > 0 ? 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' : '#d1d5db',
                          color: student.approvedCertificates > 0 ? 'white' : '#6b7280',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: student.approvedCertificates > 0 ? 'pointer' : 'not-allowed',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        <Download size={12} />
                        Portfolio
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {students.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
              <FileText size={48} style={{ marginBottom: '15px' }} />
              <h3>No students found</h3>
              <p>No students are assigned to your classes.</p>
            </div>
          )}
        </div>
      )}

      {/* Certificates View Modal */}
      {showCertificates && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '800px',
            maxHeight: '80vh',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              padding: '20px 30px',
              borderBottom: '1px solid #e1e8ed',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f8f9fa'
            }}>
              <h3 style={{ margin: 0, color: '#1e3a8a', fontWeight: '600' }}>Certificates - {selectedStudent?.name}</h3>
              <button 
                onClick={() => setShowCertificates(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6c757d',
                  padding: '4px'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ padding: '20px', maxHeight: '60vh', overflow: 'auto' }}>
              {studentCertificates.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                  <FileText size={48} style={{ marginBottom: '15px' }} />
                  <h3>No certificates found</h3>
                  <p>This student hasn't uploaded any certificates yet.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '15px' }}>
                  {studentCertificates.map((cert, index) => (
                    <div key={cert.id} style={{
                      padding: '15px',
                      border: '1px solid #e1e8ed',
                      borderRadius: '8px',
                      backgroundColor: cert.status === 'approved' ? '#f0f9ff' : cert.status === 'pending' ? '#fffbeb' : '#fef2f2'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>{cert.certificate_name}</h4>
                          <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#6b7280' }}>Uploaded: {new Date(cert.upload_date).toLocaleDateString()}</p>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: cert.status === 'approved' ? '#dcfce7' : cert.status === 'pending' ? '#fef3c7' : '#fee2e2',
                            color: cert.status === 'approved' ? '#166534' : cert.status === 'pending' ? '#92400e' : '#991b1b'
                          }}>
                            {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                          </span>
                        </div>
                        {cert.status === 'pending' && (
                          <div style={{ display: 'flex', gap: '8px', marginLeft: '15px' }}>
                            <button
                              onClick={() => approveCertificate(cert.id)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '6px 12px',
                                background: '#22c55e',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '500'
                              }}
                            >
                              <Check size={12} />
                              Approve
                            </button>
                            <button
                              onClick={() => rejectCertificate(cert.id)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '6px 12px',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '500'
                              }}
                            >
                              <X size={12} />
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Generation Modal */}
      {showPortfolio && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '900px',
            height: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              padding: '20px 30px',
              borderBottom: '1px solid #e1e8ed',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f8f9fa'
            }}>
              <h3 style={{ margin: 0, color: '#1e3a8a', fontWeight: '600' }}>Official Student Portfolio</h3>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('http://localhost:5000/api/generate-portfolio-pdf', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify({
                          studentData: { 
                            regNo: selectedStudent?.register_no || '20IT101', 
                            fullName: selectedStudent?.name || 'John Doe', 
                            department: selectedStudent?.department || 'Information Technology', 
                            year: 'III', 
                            program: 'B.Tech Information Technology', 
                            cgpa: '8.5', 
                            attendance: '92%' 
                          },
                          semesterResults: [
                            { semester: 'I', gpa: '8.2', credits: '24' }, 
                            { semester: 'II', gpa: '8.4', credits: '26' }, 
                            { semester: 'III', gpa: '8.6', credits: '25' }, 
                            { semester: 'IV', gpa: '8.3', credits: '24' }, 
                            { semester: 'V', gpa: '8.7', credits: '23' }
                          ],
                          achievements: [
                            { sl: 1, type: 'Workshop', title: 'AI & Machine Learning Bootcamp', issuer: 'NPTEL', date: '2024-12-15', verified: true }, 
                            { sl: 2, type: 'Internship', title: 'Web Development Intern', issuer: 'TCS Limited', date: '2024-11-20', verified: true }, 
                            { sl: 3, type: 'Competition', title: 'Hackathon - 1st Place', issuer: 'IEEE Student Chapter', date: '2024-10-05', verified: true }, 
                            { sl: 4, type: 'Certification', title: 'Full Stack Development', issuer: 'Coursera', date: '2024-09-12', verified: true }, 
                            { sl: 5, type: 'Leadership', title: 'Technical Club President', issuer: 'College Tech Club', date: '2024-08-01', verified: true }
                          ]
                        })
                      });
                      if (response.ok) {
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${selectedStudent?.name || 'Student'}_Portfolio.pdf`;
                        a.click();
                        window.URL.revokeObjectURL(url);
                      }
                    } catch (error) {
                      console.error('PDF generation error:', error);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    background: '#1e3a8a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  <Download size={14} />
                  Download PDF
                </button>
                <button 
                  onClick={() => setShowPortfolio(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#6c757d',
                    padding: '4px'
                  }}
                >
                  ×
                </button>
              </div>
            </div>
            
            <div style={{ flex: 1, overflow: 'auto' }}>
              <OfficialPortfolio user={selectedStudent || { name: 'John Doe', register_no: '20IT101' }} isModal={true} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CertificatesSection;