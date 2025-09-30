import React, { useState, useEffect } from 'react';
import {
  Trophy,
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  CheckCircle,
  Mail,
  Linkedin,
  Phone,
} from "lucide-react";

const AdvancedPortfolio = ({ user, isModal = false, onDownload }) => {
  const [qrData, setQrData] = useState(null);
  const [studentData, setStudentData] = useState({
    name: user?.name || 'Loading...',
    regNo: user?.register_no || 'Loading...',
    department: user?.department || 'Loading...',
    year: '3rd Year',
    totalPoints: 320
  });

  const downloadRef = React.useRef(null);

  downloadRef.current = async () => {
    try {
      console.log('🚀 Starting PDF generation for Advanced Portfolio...');
      
      const response = await fetch('/api/generate-advanced-portfolio-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ studentData })
      });
      
      if (response.ok) {
        console.log('✅ PDF generated successfully!');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${studentData.name}_Advanced_Portfolio.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('❌ PDF generation failed');
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

  // Update student data when user prop changes
  useEffect(() => {
    if (user) {
      setStudentData({
        name: user.name,
        regNo: user.register_no,
        department: user.department
      });
    }
  }, [user]);

  useEffect(() => {
    const generateQR = async () => {
      if (qrData) return;
      try {
        console.log('🔄 Generating QR code for Advanced portfolio...');
        const response = await fetch('/api/generate-portfolio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ portfolioType: 'Advanced' })
        });
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Advanced QR data received:', data);
          setQrData(data);
        }
      } catch (error) {
        console.error('QR generation failed:', error);
      }
    };
    generateQR();
  }, [qrData]);

  return (
    <>
      <style jsx>{`
        .portfolio-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
          padding: 24px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .portfolio-content {
          max-width: 1024px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
          border: 1px solid #e2e8f0;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(15, 23, 42, 0.1), transparent);
          transition: left 0.6s ease;
        }

        .card:hover::before {
          left: 100%;
        }

        .card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          border-color: #0f172a;
        }

        .card:active {
          transform: translateY(-4px) scale(0.98);
        }

        .card-content {
          padding: 32px;
        }

        .header-card {
          border-left: 4px solid #0f172a;
        }

        .header-section {
          text-align: center;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 24px;
          margin-bottom: 24px;
        }

        .logo-photo-container {
          display: flex;
          justify-content: center;
          gap: 40px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }

        .logo-container, .photo-container {
          text-align: center;
        }

        .logo-placeholder {
          width: 140px;
          height: 140px;
          background: linear-gradient(135deg, #0f172a, #1e293b);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
          color: white;
          transition: all 0.4s ease;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .logo-placeholder::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: all 0.6s ease;
        }

        .logo-placeholder:hover {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 15px 30px rgba(15, 23, 42, 0.4);
          animation: pulse 2s infinite;
        }

        .logo-placeholder:hover::after {
          width: 200px;
          height: 200px;
        }

        .logo-placeholder:active {
          transform: scale(0.95);
        }

        @keyframes pulse {
          0%, 100% { box-shadow: 0 15px 30px rgba(15, 23, 42, 0.4); }
          50% { box-shadow: 0 15px 30px rgba(15, 23, 42, 0.6), 0 0 0 10px rgba(15, 23, 42, 0.1); }
        }

        .photo-placeholder {
          width: 140px;
          height: 140px;
          border-radius: 12px;
          border: 2px solid #0f172a;
          margin-bottom: 12px;
          background: linear-gradient(135deg, #f8fafc, #e2e8f0);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .photo-placeholder:hover {
          transform: scale(1.05);
          border-color: #0891b2;
        }

        .photo-text {
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
        }

        .main-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 8px;
          letter-spacing: -0.025em;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          display: inline-block;
        }

        .main-title:hover {
          transform: scale(1.05);
          color: #0891b2;
          text-shadow: 0 0 20px rgba(8, 145, 178, 0.3);
        }

        .main-title:active {
          transform: scale(0.95);
        }

        .student-details {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 24px;
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
        }

        .student-details h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 20px;
          color: #0f172a;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }

        .details-grid p, .contact-info p {
          margin: 10px 0;
          color: #334155;
          font-weight: 500;
        }

        .details-grid span, .contact-info span {
          color: #64748b;
          margin-right: 8px;
          font-weight: 400;
        }

        .contact-info {
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 24px;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .section-title svg {
          color: #0891b2;
        }

        .achievements {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .achievement-item {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 24px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .achievement-item:hover {
          transform: translateX(12px) scale(1.02);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
        }

        .achievement-item:active {
          transform: translateX(8px) scale(0.98);
        }

        .achievement-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transform: translateX(-100%);
          transition: transform 0.6s ease;
        }

        .achievement-item:hover::before {
          transform: translateX(100%);
        }

        .achievement-item.gold {
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          border-color: #f59e0b;
        }

        .achievement-item.blue {
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          border-color: #3b82f6;
        }

        .achievement-item.green {
          background: linear-gradient(135deg, #d1fae5, #a7f3d0);
          border-color: #10b981;
        }

        .achievement-icon {
          padding: 12px;
          border-radius: 50%;
          background: white;
          border: 2px solid;
          transition: all 0.3s ease;
        }

        .achievement-item.gold .achievement-icon {
          border-color: #f59e0b;
          color: #f59e0b;
        }

        .achievement-item.blue .achievement-icon {
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .achievement-item.green .achievement-icon {
          border-color: #10b981;
          color: #10b981;
        }

        .achievement-item:hover .achievement-icon {
          transform: rotate(360deg) scale(1.2);
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
        }

        .achievement-icon:active {
          transform: scale(0.8);
        }

        .achievement-title {
          font-weight: 600;
          display: block;
          margin-bottom: 6px;
          color: #0f172a;
          font-size: 1.1rem;
        }

        .achievement-item p {
          font-size: 0.9rem;
          color: #64748b;
          margin: 0;
        }

        .timeline {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .timeline-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
        }

        .timeline-item:hover {
          background: white;
          border-color: #0891b2;
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 8px 20px rgba(8, 145, 178, 0.2);
        }

        .timeline-item:active {
          transform: translateY(-2px) scale(0.98);
        }

        .timeline-item::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(8, 145, 178, 0.1), transparent);
          transform: translateX(-100%);
          transition: transform 0.5s ease;
        }

        .timeline-item:hover::after {
          transform: translateX(100%);
        }

        .timeline-item.latest {
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          border-color: #f59e0b;
        }

        .timeline-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .badge {
          background: #0f172a;
          color: white;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .badge:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.3);
        }

        .badge:active {
          transform: scale(0.95);
        }

        .badges .badge:hover {
          animation: bounce 0.6s ease;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0) scale(1.1); }
          40% { transform: translateY(-10px) scale(1.1); }
          60% { transform: translateY(-5px) scale(1.1); }
        }

        .timeline-item.latest .badge {
          background: #f59e0b;
        }

        .timeline-item span:not(.badge) {
          font-weight: 600;
          color: #0f172a;
        }

        .timeline-item p {
          font-size: 0.875rem;
          color: #64748b;
          margin: 4px 0 0 0;
        }

        .check-icon {
          color: #10b981;
        }

        .trophy-icon {
          color: #f59e0b;
        }

        .badges-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .badges {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 12px;
        }

        .badge.success {
          background: #10b981;
          color: white;
        }

        .badge.primary {
          background: #3b82f6;
          color: white;
        }

        .badge.accent {
          background: #0891b2;
          color: white;
        }

        .level-info {
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #3b82f6;
        }

        .level {
          color: #0f172a;
          font-weight: 700;
          font-size: 1.1rem;
        }

        .points {
          color: #64748b;
        }

        .contact-card {
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          border-left: 4px solid #0891b2;
        }

        .contact-card h2 {
          text-align: center;
          color: #0f172a;
          margin-bottom: 24px;
          font-size: 1.5rem;
        }

        .contact-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          justify-content: center;
        }

        .btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.95rem;
          position: relative;
          overflow: hidden;
        }

        .btn.primary {
          background: #0f172a;
          color: white;
        }

        .btn.primary:hover {
          background: #1e293b;
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.3);
        }

        .btn:active {
          transform: translateY(-2px) scale(0.95);
        }

        .btn::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: all 0.4s ease;
        }

        .btn:hover::before {
          width: 300px;
          height: 300px;
        }

        .btn.accent {
          background: #0891b2;
          color: white;
        }

        .btn.accent:hover {
          background: #0e7490;
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 8px 20px rgba(8, 145, 178, 0.3);
        }

        .btn.outline {
          background: transparent;
          color: #0f172a;
          border: 2px solid #0f172a;
        }

        .btn.outline:hover {
          background: #0f172a;
          color: white;
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.3);
        }

        .footer-card {
          background: #0f172a;
          color: white;
        }

        .footer-card .card-content {
          text-align: center;
          padding: 20px;
        }

        .footer-card p {
          font-size: 0.9rem;
          color: #cbd5e1;
          margin: 0;
        }

        .footer-card span {
          font-weight: 600;
          color: white;
        }

        @media (max-width: 768px) {
          .portfolio-container {
            padding: 16px;
          }
          
          .card-content {
            padding: 24px;
          }
          
          .logo-photo-container {
            gap: 20px;
          }
          
          .main-title {
            font-size: 2rem;
          }
          
          .contact-buttons {
            flex-direction: column;
            align-items: center;
          }
          
          .btn {
            width: 100%;
            max-width: 250px;
            justify-content: center;
          }
        }
      `}</style>

      <div className="portfolio-container">
        <div className="portfolio-content">
          {/* Header Section */}
          <div className="card header-card">
            <div className="card-content">
              <div className="header-section">
                <div className="logo-photo-container">
                  <div className="logo-container">
                    <div className="logo-placeholder">
                      <GraduationCap size={64} />
                    </div>
                    <p>[Large College Logo]</p>
                  </div>
                  <div className="photo-container">
                    <div className="photo-placeholder">
                      <div className="photo-text">[Student Photo]</div>
                    </div>
                  </div>
                </div>
                <h1 className="main-title">ADVANCED PORTFOLIO</h1>
              </div>

              {/* Student Details */}
              <div className="student-details">
                <h2>Student Details:</h2>
                <div className="details-grid">
                  <div>
                    <p><span>Name:</span> {studentData.name}</p>
                    <p><span>Dept:</span> {studentData.department}</p>
                  </div>
                  <div>
                    <p><span>Reg No:</span> {studentData.regNo}</p>
                    <p><span>Year:</span> 3</p>
                  </div>
                </div>
                <div className="contact-info">
                  <p><span>Contact:</span> email@domain.com</p>
                  <p><span>LinkedIn:</span> link</p>
                </div>
              </div>
            </div>
          </div>

          {/* Highlight Summary */}
          <div className="card highlight-card">
            <div className="card-content">
              <h2 className="section-title">
                <Trophy size={20} />
                Certifications
              </h2>
              <div className="achievements">
                <div className="achievement-item gold">
                  <div className="achievement-icon">
                    <Trophy size={24} />
                  </div>
                  <div>
                    <span className="achievement-title">Technical Certifications 🏆</span>
                    <p>✅ Programming, Cloud Computing, Database Management</p>
                  </div>
                </div>

                <div className="achievement-item blue">
                  <div className="achievement-icon">
                    <FileText size={24} />
                  </div>
                  <div>
                    <span className="achievement-title">Academic Courses & MOOCs 📄</span>
                    <p>✅ NPTEL, Coursera, edX Completion Certificates</p>
                  </div>
                </div>

                <div className="achievement-item green">
                  <div className="achievement-icon">
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <span className="achievement-title">Professional Training 💼</span>
                    <p>✅ Internship, Workshop & Seminar Certificates</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Achievement Timeline */}
          <div className="card timeline-card">
            <div className="card-content">
              <h2 className="section-title">
                <Award size={20} />
                Achievement Timeline
              </h2>
              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-content">
                    <span className="badge">Year 1</span>
                    <div>
                      <span>Foundation Courses → Completed</span>
                      <p>📜 Programming, Mathematics, Basic IT Skills</p>
                    </div>
                  </div>
                  <CheckCircle size={20} className="check-icon" />
                </div>

                <div className="timeline-item">
                  <div className="timeline-content">
                    <span className="badge">Year 2</span>
                    <div>
                      <span>Core Subject Certifications → Earned</span>
                      <p>📜 Data Structures, DBMS, Web Development</p>
                    </div>
                  </div>
                  <CheckCircle size={20} className="check-icon" />
                </div>

                <div className="timeline-item latest">
                  <div className="timeline-content">
                    <span className="badge">Year 3</span>
                    <div>
                      <span>Advanced Specialization Certificates</span>
                      <p>🏆 Current Focus: AI/ML, Cloud Computing, Projects</p>
                    </div>
                  </div>
                  <Trophy size={20} className="trophy-icon" />
                </div>
              </div>
            </div>
          </div>

          {/* Badges & Levels */}
          <div className="card badges-card">
            <div className="card-content">
              <h2>Badges & Levels</h2>
              <div className="badges-section">
                <div>
                  <p>Earned:</p>
                  <div className="badges">
                    <span className="badge success">Innovator</span>
                    <span className="badge primary">Leader</span>
                    <span className="badge accent">Mentor</span>
                  </div>
                </div>
                <div className="level-info">
                  <p>Current Level: <span className="level">ADVANCED</span> <span className="points">(320 Points)</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Actions */}
          <div className="card contact-card">
            <div className="card-content">
              <h2>Let's Connect!</h2>
              <div className="contact-buttons">
                <button className="btn primary">
                  <Mail size={16} />
                  Contact Me
                </button>
                <button className="btn accent">
                  <Linkedin size={16} />
                  LinkedIn Profile
                </button>
                <button className="btn outline">
                  <Phone size={16} />
                  Call Me
                </button>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="card">
            <div className="card-content">
              <h2 className="section-title">
                <CheckCircle size={20} />
                Portfolio Verification
              </h2>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px',
                background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '18px' }}>Authenticity Verification</h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Scan QR code to verify this portfolio's authenticity</p>
                </div>
                <div style={{
                  padding: '15px',
                  background: 'white',
                  border: '2px solid #0f172a',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.1)'
                }}>
                  {qrData ? (
                    <div style={{ textAlign: 'center' }}>
                      <div dangerouslySetInnerHTML={{
                        __html: `<svg width="100" height="100" viewBox="0 0 25 25">
                          <rect width="25" height="25" fill="white"/>
                          <g fill="#0f172a">
                            <rect x="0" y="0" width="7" height="7"/>
                            <rect x="18" y="0" width="7" height="7"/>
                            <rect x="0" y="18" width="7" height="7"/>
                            <rect x="2" y="2" width="3" height="3" fill="white"/>
                            <rect x="20" y="2" width="3" height="3" fill="white"/>
                            <rect x="2" y="20" width="3" height="3" fill="white"/>
                            <rect x="9" y="9" width="7" height="7"/>
                            <rect x="11" y="11" width="3" height="3" fill="white"/>
                            <rect x="8" y="0" width="1" height="1"/>
                            <rect x="10" y="0" width="1" height="1"/>
                            <rect x="12" y="0" width="1" height="1"/>
                            <rect x="14" y="0" width="1" height="1"/>
                            <rect x="16" y="0" width="1" height="1"/>
                          </g>
                        </svg>`
                      }} />
                      <p style={{ margin: '8px 0 0 0', fontSize: '10px', color: '#64748b', fontWeight: '600' }}>ID: {qrData.portfolioId.slice(-6)}</p>
                    </div>
                  ) : (
                    <div style={{ width: '100px', height: '100px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#0f172a' }}>Loading...</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="card footer-card">
            <div className="card-content">
              <p><span>Footer:</span> Verified & Generated via Smart Student Hub</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdvancedPortfolio;