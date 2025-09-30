import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

const BeginnerPortfolio = ({ user, isModal = false, onDownload }) => {
  const [studentData, setStudentData] = useState({
    name: user?.name || 'Loading...',
    regNo: user?.register_no || 'Loading...',
    department: user?.department || 'Loading...',
    year: '3',
    level: 'Beginner',
    points: 45,
    maxPoints: 100
  });

  // Update student data when user prop changes
  useEffect(() => {
    if (user) {
      setStudentData({
        name: user.name,
        regNo: user.register_no,
        department: user.department,
        year: '3',
        level: 'Beginner',
        points: 45,
        maxPoints: 100
      });
    }
  }, [user]);

  const [certificates] = useState([
    { title: 'Workshop on AI', date: 'Jan 2025', status: 'Verified' },
    { title: 'NPTEL Course on DBMS', date: 'Dec 2024', status: 'Verified' }
  ]);

  const [qrData, setQrData] = useState(null);

  useEffect(() => {
    const generateQR = async () => {
      if (qrData) return; // Prevent duplicate calls
      try {
        console.log('🔄 Generating QR code for Beginner portfolio...');
        const response = await fetch('/api/generate-portfolio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ portfolioType: 'Beginner' })
        });
        console.log('📡 Response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('✅ QR data received:', data);
          setQrData(data);
        } else {
          console.error('❌ Response not ok:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('💥 QR generation failed:', error);
      }
    };
    generateQR();
  }, [qrData]);

  const progressPercentage = (studentData.points / studentData.maxPoints) * 100;

  const downloadRef = React.useRef(null);

  downloadRef.current = async () => {
    try {
      console.log('🚀 Starting PDF generation for Beginner Portfolio...');
      console.log('📊 Portfolio data:', { name: studentData.name, certificates: certificates.length, level: studentData.level });
      
      const response = await fetch('/api/generate-beginner-portfolio-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ studentData, certificates })
      });
      
      console.log('⏳ Server processing PDF... Please wait...');
      
      if (response.ok) {
        console.log('✅ PDF generated successfully! Processing download...');
        const blob = await response.blob();
        console.log('📄 PDF size:', (blob.size / 1024).toFixed(2) + ' KB');
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${studentData.name}_Beginner_Portfolio.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        console.log('🎉 Download completed successfully!');
      } else {
        console.error('❌ PDF generation failed with status:', response.status);
        alert('PDF generation failed');
      }
    } catch (error) {
      console.error('💥 PDF generation error:', error);
      alert('PDF generation failed');
    }
  };

  React.useEffect(() => {
    if (onDownload) {
      onDownload(() => downloadRef.current);
    }
  }, [onDownload]);

  return (
    <>
      <style>{`
        @keyframes floatDots {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
        }
        
        @keyframes gentleWave {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(10px); }
        }
      `}</style>
      
      <div style={{
        minHeight: isModal ? 'auto' : '100vh',
        background: isModal ? 'white' : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)',
        padding: isModal ? '0' : '20px',
        fontFamily: 'Roboto, sans-serif',
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        {/* Background Animation */}
        {!isModal && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 0
          }}>
            {Array.from({ length: 12 }, (_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${Math.random() * 8 + 4}px`,
                  height: `${Math.random() * 8 + 4}px`,
                  background: 'linear-gradient(45deg, #065f46, #10b981)',
                  borderRadius: '50%',
                  opacity: 0.4,
                  animation: `floatDots ${Math.random() * 10 + 8}s infinite ease-in-out ${Math.random() * 5}s`
                }}
              />
            ))}
            
            {/* Gentle wave shapes */}
            <div style={{
              position: 'absolute',
              top: '20%',
              right: '10%',
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, rgba(6,95,70,0.1), rgba(16,185,129,0.1))',
              borderRadius: '50%',
              animation: 'gentleWave 8s ease-in-out infinite'
            }} />
            
            <div style={{
              position: 'absolute',
              bottom: '30%',
              left: '8%',
              width: '40px',
              height: '40px',
              background: 'linear-gradient(45deg, rgba(16,185,129,0.1), rgba(34,197,94,0.1))',
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              animation: 'gentleWave 6s ease-in-out infinite 2s'
            }} />
          </div>
        )}
        
        <div style={{
          width: isModal ? '100%' : '210mm',
          maxWidth: '210mm',
          margin: '0 auto',
          background: 'rgba(254, 253, 248, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '2px solid #065f46',
          fontFamily: 'Roboto, sans-serif',
          position: 'relative',
          zIndex: 1,
          boxShadow: '0 8px 32px rgba(6, 95, 70, 0.15)'
        }}>
        
          {/* Header */}
          <div style={{
            padding: '20px',
            borderBottom: '2px solid #065f46',
            textAlign: 'center'
          }}>
            <h1 style={{
              margin: 0,
              fontSize: '24px',
              color: '#065f46',
              fontWeight: 'bold'
            }}>
              Student Portfolio
            </h1>
          </div>

          {/* Student Info */}
          <div style={{
            padding: '20px',
            borderBottom: '1px solid #d6f5d6',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <div>
              <p style={{ margin: '5px 0', fontSize: '16px', color: '#065f46' }}>
                <strong>Student Name:</strong> {studentData.name}
              </p>
              <p style={{ margin: '5px 0', fontSize: '16px', color: '#065f46' }}>
                <strong>Department:</strong> {studentData.department}
              </p>
            </div>
            <div>
              <p style={{ margin: '5px 0', fontSize: '16px', color: '#065f46' }}>
                <strong>Reg No:</strong> {studentData.regNo}
              </p>
              <p style={{ margin: '5px 0', fontSize: '16px', color: '#065f46' }}>
                <strong>Year:</strong> {studentData.year}
              </p>
            </div>
          </div>

          {/* Certificates */}
          <div style={{ padding: '20px', borderBottom: '1px solid #d6f5d6' }}>
            <h2 style={{
              margin: '0 0 15px 0',
              fontSize: '18px',
              color: '#065f46',
              fontWeight: 'bold'
            }}>
              Certificates & Achievements
            </h2>
            
            {certificates.map((cert, index) => (
              <div key={index} style={{
                padding: '15px 0',
                borderBottom: index < certificates.length - 1 ? '1px solid #f0fdf4' : 'none'
              }}>
                <p style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: 'bold', color: '#065f46' }}>
                  - Certificate: "{cert.title}"
                </p>
                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                  Date: {cert.date} &nbsp;&nbsp;&nbsp; Status: {cert.status} <CheckCircle size={14} style={{ color: '#22c55e', display: 'inline', verticalAlign: 'middle' }} />
                </p>
              </div>
            ))}
          </div>

          {/* Level & Progress */}
          <div style={{ padding: '20px', borderBottom: '1px solid #d6f5d6' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 'bold', color: '#065f46' }}>
              Level: {studentData.level} ({studentData.points} Points)
            </p>
            
            <div style={{
              width: '100%',
              height: '20px',
              background: '#f0fdf4',
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progressPercentage}%`,
                height: '100%',
                background: '#065f46',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
            
            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>
              {studentData.points}/{studentData.maxPoints} points to next level
            </p>
          </div>

          {/* QR Code Section */}
          <div style={{
            padding: '20px',
            borderBottom: '1px solid #d6f5d6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h3 style={{ margin: '0 0 5px 0', color: '#065f46', fontSize: '16px' }}>Portfolio Verification</h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Scan QR code to verify authenticity</p>
            </div>
            <div style={{
              padding: '10px',
              background: 'white',
              border: '2px solid #065f46',
              borderRadius: '8px'
            }}>
              {qrData ? (
                <div style={{ textAlign: 'center' }}>
                  <div dangerouslySetInnerHTML={{
                    __html: `<svg width="80" height="80" viewBox="0 0 25 25">
                      <rect width="25" height="25" fill="white"/>
                      <g fill="#065f46">
                        <rect x="0" y="0" width="7" height="7"/>
                        <rect x="18" y="0" width="7" height="7"/>
                        <rect x="0" y="18" width="7" height="7"/>
                        <rect x="2" y="2" width="3" height="3" fill="white"/>
                        <rect x="20" y="2" width="3" height="3" fill="white"/>
                        <rect x="2" y="20" width="3" height="3" fill="white"/>
                        <rect x="8" y="0" width="1" height="1"/>
                        <rect x="10" y="0" width="1" height="1"/>
                        <rect x="12" y="0" width="1" height="1"/>
                        <rect x="14" y="0" width="1" height="1"/>
                        <rect x="16" y="0" width="1" height="1"/>
                        <rect x="8" y="2" width="1" height="1"/>
                        <rect x="10" y="2" width="1" height="1"/>
                        <rect x="12" y="2" width="1" height="1"/>
                        <rect x="14" y="2" width="1" height="1"/>
                        <rect x="16" y="2" width="1" height="1"/>
                        <rect x="8" y="4" width="1" height="1"/>
                        <rect x="10" y="4" width="1" height="1"/>
                        <rect x="12" y="4" width="1" height="1"/>
                        <rect x="14" y="4" width="1" height="1"/>
                        <rect x="16" y="4" width="1" height="1"/>
                        <rect x="8" y="6" width="1" height="1"/>
                        <rect x="10" y="6" width="1" height="1"/>
                        <rect x="12" y="6" width="1" height="1"/>
                        <rect x="14" y="6" width="1" height="1"/>
                        <rect x="16" y="6" width="1" height="1"/>
                      </g>
                    </svg>`
                  }} />
                  <p style={{ margin: '5px 0 0 0', fontSize: '8px', color: '#666' }}>ID: {qrData.portfolioId.slice(-6)}</p>
                </div>
              ) : (
                <div style={{ width: '80px', height: '80px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#999' }}>Loading...</div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={{
            padding: '20px',
            textAlign: 'center',
            background: '#f0fdf4'
          }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              Auto-generated on Smart Student Hub
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default BeginnerPortfolio;