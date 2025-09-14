import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, FileText, Check, X, Download } from 'lucide-react';
import OfficialPortfolio from './OfficialPortfolio';

function CertificatesSection({ user }) {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchCertificates();
  }, []);
  
  const fetchCertificates = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/cc-certificates', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCertificates(data.certificates || []);
      }
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const [filteredCertificates, setFilteredCertificates] = useState(certificates);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('uploadDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showPreview, setShowPreview] = useState(false);
  const [previewCert, setPreviewCert] = useState(null);
  const [remarks, setRemarks] = useState({});
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Filter and sort certificates
  useEffect(() => {
    let filtered = certificates;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(cert => cert.status === statusFilter);
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(cert => cert.category === categoryFilter);
    }
    
    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(cert => 
        cert.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.certificateName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'uploadDate' || sortBy === 'issueDate') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    setFilteredCertificates(filtered);
  }, [certificates, statusFilter, categoryFilter, searchTerm, sortBy, sortOrder]);

  const handleApproval = async (certId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/certificates/${certId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status, remarks: remarks[certId] || '' })
      });
      
      if (response.ok) {
        setCertificates(certificates.map(cert => 
          cert.id === certId ? { ...cert, status } : cert
        ));
        const message = status === 'approved' ? 'Certificate approved successfully!' : 'Certificate rejected successfully!';
        alert(message);
      } else {
        alert('Failed to update certificate status');
      }
    } catch (error) {
      console.error('Error updating certificate:', error);
      alert('Error updating certificate');
    }
  };

  const handleRemarkChange = (certId, remark) => {
    setRemarks({ ...remarks, [certId]: remark });
  };

  const openPreview = (cert) => {
    setPreviewCert(cert);
    setShowPreview(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#28a745';
      case 'rejected': return '#dc3545';
      case 'pending': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const pendingCount = certificates.filter(c => c.status === 'pending').length;
  const approvedToday = certificates.filter(c => 
    c.status === 'approved' && 
    new Date(c.uploadDate).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="certificates-section">
      <h2>Certificate Approval Panel</h2>
      
      {/* Generate Portfolio Button */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => setShowPortfolio(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 16px rgba(30, 58, 138, 0.4)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(30, 58, 138, 0.3)';
          }}
        >
          <Download size={16} />
          Generate Portfolio
        </button>
      </div>

      {/* Dashboard Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div style={{ padding: '20px', backgroundColor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock style={{ color: '#856404' }} size={24} />
            <div>
              <h3 style={{ margin: 0, color: '#856404' }}>{pendingCount}</h3>
              <p style={{ margin: 0, color: '#856404', fontSize: '14px' }}>Pending Certificates</p>
            </div>
          </div>
        </div>
        
        <div style={{ padding: '20px', backgroundColor: '#d4edda', borderRadius: '8px', border: '1px solid #c3e6cb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle style={{ color: '#155724' }} size={24} />
            <div>
              <h3 style={{ margin: 0, color: '#155724' }}>{approvedToday}</h3>
              <p style={{ margin: 0, color: '#155724', fontSize: '14px' }}>Approved Today</p>
            </div>
          </div>
        </div>
        
        <div style={{ padding: '20px', backgroundColor: '#e2e3e5', borderRadius: '8px', border: '1px solid #d6d8db' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText style={{ color: '#383d41' }} size={24} />
            <div>
              <h3 style={{ margin: 0, color: '#383d41' }}>{certificates.length}</h3>
              <p style={{ margin: 0, color: '#383d41', fontSize: '14px' }}>Total Submissions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(5, 1fr)', 
        gap: '15px', 
        marginBottom: '20px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <input
          type="text"
          placeholder="Search students or certificates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
        
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px' }}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        
        <select 
          value={categoryFilter} 
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px' }}
        >
          <option value="all">All Categories</option>
          <option value="Technical">Technical</option>
          <option value="Sports">Sports</option>
          <option value="Cultural">Cultural</option>
          <option value="Volunteer">Volunteer</option>
        </select>
        
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px' }}
        >
          <option value="uploadDate">Sort by Upload Date</option>
          <option value="studentName">Sort by Student Name</option>
          <option value="certificateName">Sort by Certificate</option>
          <option value="issueDate">Sort by Issue Date</option>
        </select>
        
        <select 
          value={sortOrder} 
          onChange={(e) => setSortOrder(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px' }}
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>

      {/* Certificates Table */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Loading certificates...</p>
        </div>
      ) : (
      <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f8f9fa' }}>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #e1e8ed', fontWeight: '600' }}>Student</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #e1e8ed', fontWeight: '600' }}>Certificate</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #e1e8ed', fontWeight: '600' }}>Organization</th>
              <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #e1e8ed', fontWeight: '600' }}>Upload Date</th>
              <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #e1e8ed', fontWeight: '600' }}>Status</th>
              <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #e1e8ed', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCertificates.map((cert, index) => (
              <tr key={cert.id} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa' }}>
                <td style={{ padding: '15px', borderBottom: '1px solid #e1e8ed' }}>
                  <div>
                    <div style={{ fontWeight: '500' }}>{cert.studentName}</div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>{cert.regNo}</div>
                  </div>
                </td>
                <td style={{ padding: '15px', borderBottom: '1px solid #e1e8ed' }}>
                  <div>
                    <div style={{ fontWeight: '500' }}>{cert.certificateName}</div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>{cert.category}</div>
                  </div>
                </td>
                <td style={{ padding: '15px', borderBottom: '1px solid #e1e8ed' }}>
                  <div>
                    <div>{cert.organization}</div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>Issued: {cert.issueDate}</div>
                  </div>
                </td>
                <td style={{ padding: '15px', borderBottom: '1px solid #e1e8ed', textAlign: 'center' }}>
                  {cert.uploadDate}
                </td>
                <td style={{ padding: '15px', borderBottom: '1px solid #e1e8ed', textAlign: 'center' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: getStatusColor(cert.status) + '20',
                    color: getStatusColor(cert.status)
                  }}>
                    {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                  </span>
                </td>
                <td style={{ padding: '15px', borderBottom: '1px solid #e1e8ed', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                    <button 
                      onClick={() => openPreview(cert)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <FileText size={14} /> Preview
                    </button>
                    
                    {cert.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleApproval(cert.id, 'approved')}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button 
                          onClick={() => handleApproval(cert.id, 'rejected')}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <X size={14} /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredCertificates.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
            <FileText size={48} style={{ marginBottom: '15px' }} />
            <h3>No certificates found</h3>
            <p>No certificates match your current filters.</p>
          </div>
        )}
      </div>
      )}

      {/* Preview Modal */}
      {showPreview && previewCert && (
        <>
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '30px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>Certificate Preview</h3>
                <button 
                  onClick={() => setShowPreview(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#6c757d'
                  }}
                >
                  ×
                </button>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <h4>{previewCert.certificateName}</h4>
                <p><strong>Student:</strong> {previewCert.studentName} ({previewCert.regNo})</p>
                <p><strong>Organization:</strong> {previewCert.organization}</p>
                <p><strong>Issue Date:</strong> {previewCert.issueDate}</p>
                <p><strong>Category:</strong> {previewCert.category}</p>
              </div>
              
              <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '4px', textAlign: 'center' }}>
                <FileText size={48} style={{ color: '#6c757d', marginBottom: '10px' }} />
                <p style={{ margin: 0, color: '#6c757d' }}>Certificate preview would appear here</p>
                <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#6c757d' }}>PDF/Image viewer integration needed</p>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Remarks:</label>
                <textarea
                  placeholder="Add your remarks here..."
                  value={remarks[previewCert.id] || ''}
                  onChange={(e) => handleRemarkChange(previewCert.id, e.target.value)}
                  rows="3"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              
              {previewCert.status === 'pending' && (
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={() => {
                      handleApproval(previewCert.id, 'approved');
                      setShowPreview(false);
                    }}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Check size={16} /> Approve Certificate
                  </button>
                  <button 
                    onClick={() => {
                      handleApproval(previewCert.id, 'rejected');
                      setShowPreview(false);
                    }}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <X size={16} /> Reject Certificate
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Portfolio Generation Modal */}
      {showPortfolio && (
        <>
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
                      console.log('Download PDF button clicked');
                      try {
                        console.log('Sending request to server...');
                        const response = await fetch('http://localhost:5000/api/generate-portfolio-pdf', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                          },
                          body: JSON.stringify({
                            studentData: { regNo: '20IT101', fullName: 'John Doe', department: 'Information Technology', year: 'III', program: 'B.Tech Information Technology', cgpa: '8.5', attendance: '92%' },
                            semesterResults: [{ semester: 'I', gpa: '8.2', credits: '24' }, { semester: 'II', gpa: '8.4', credits: '26' }, { semester: 'III', gpa: '8.6', credits: '25' }, { semester: 'IV', gpa: '8.3', credits: '24' }, { semester: 'V', gpa: '8.7', credits: '23' }],
                            achievements: [{ sl: 1, type: 'Workshop', title: 'AI & Machine Learning Bootcamp', issuer: 'NPTEL', date: '2024-12-15', verified: true }, { sl: 2, type: 'Internship', title: 'Web Development Intern', issuer: 'TCS Limited', date: '2024-11-20', verified: true }, { sl: 3, type: 'Competition', title: 'Hackathon - 1st Place', issuer: 'IEEE Student Chapter', date: '2024-10-05', verified: true }, { sl: 4, type: 'Certification', title: 'Full Stack Development', issuer: 'Coursera', date: '2024-09-12', verified: true }, { sl: 5, type: 'Leadership', title: 'Technical Club President', issuer: 'College Tech Club', date: '2024-08-01', verified: true }]
                          })
                        });
                        console.log('Response status:', response.status);
                        if (response.ok) {
                          console.log('Creating blob...');
                          const blob = await response.blob();
                          console.log('Blob size:', blob.size, 'Type:', blob.type);
                          
                          if (blob.size === 0) {
                            alert('PDF file is empty');
                            return;
                          }
                          
                          const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'John_Doe_Portfolio.pdf';
                          a.style.display = 'none';
                          document.body.appendChild(a);
                          a.click();
                          
                          setTimeout(() => {
                            window.URL.revokeObjectURL(url);
                            document.body.removeChild(a);
                          }, 100);
                          
                          console.log('Download initiated');
                        } else {
                          const errorText = await response.text();
                          console.error('Server error:', errorText);
                          alert('PDF generation failed: ' + response.status);
                        }
                      } catch (error) {
                        console.error('PDF generation error:', error);
                        alert('PDF generation failed: ' + error.message);
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
              
              <div style={{ 
                flex: 1, 
                overflow: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}>
                <style>
                  {`
                    .portfolio-modal ::-webkit-scrollbar {
                      display: none;
                    }
                    @media print {
                      .portfolio-modal {
                        position: static !important;
                        width: 100% !important;
                        height: auto !important;
                        overflow: visible !important;
                      }
                      body * {
                        visibility: hidden;
                      }
                      .portfolio-modal, .portfolio-modal * {
                        visibility: visible;
                      }
                      .portfolio-modal {
                        position: absolute;
                        left: 0;
                        top: 0;
                      }
                    }
                  `}
                </style>
                <div className="portfolio-modal">
                  <OfficialPortfolio user={{ name: 'John Doe', register_no: '20IT101' }} isModal={true} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CertificatesSection;
