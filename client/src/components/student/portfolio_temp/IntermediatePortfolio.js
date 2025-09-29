import React from 'react';
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
  Download,
  Star,
  BookOpen,
  Users
} from "lucide-react";

const IntermediatePortfolio = ({ user, isModal = false, onDownload }) => {
  const progressPercentage = 75;
  
  const [studentData] = React.useState({
    name: 'John Doe',
    regNo: 'CS2021001',
    department: 'Computer Science',
    year: '3rd Year',
    level: 'Intermediate',
    points: 850,
    maxPoints: 1000
  });

  const [achievements] = React.useState({
    academics: [
      { title: 'Data Structures & Algorithms - A Grade', status: 'Completed', date: 'Dec 2024' },
      { title: 'Database Management Systems - A+ Grade', status: 'Completed', date: 'Nov 2024' },
      { title: 'Web Development - A Grade', status: 'Completed', date: 'Oct 2024' },
      { title: 'Machine Learning Basics - B+ Grade', status: 'Completed', date: 'Sep 2024' }
    ],
    extracurricular: [
      { title: 'Coding Club President - 2023', status: 'Active', date: '2023' },
      { title: 'Hackathon Winner - TechFest 2023', status: 'Won', date: 'Mar 2023' },
      { title: 'Volunteer - Community Service Program', status: 'Completed', date: '2023' },
      { title: 'Technical Workshop Organizer', status: 'Organized', date: '2024' }
    ]
  });

  const [badges] = React.useState([
    'Problem Solver', 'Team Leader', 'Innovation Award', 'Best Project'
  ]);

  const downloadRef = React.useRef(null);

  downloadRef.current = async () => {
    try {
      console.log('🚀 Starting PDF generation for Intermediate Portfolio...');
      
      const response = await fetch('http://localhost:5000/api/generate-intermediate-portfolio-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ studentData, achievements, badges })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${studentData.name}_Intermediate_Portfolio.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        console.log('✅ Intermediate PDF downloaded successfully!');
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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 50%, #60a5fa 100%)',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        
        {/* Header Section */}
        <div style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '30px',
            marginBottom: '25px',
            flexWrap: 'wrap'
          }}>
            {/* College Logo */}
            <div style={{
              width: '100px',
              height: '100px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '40px'
            }}>
              <GraduationCap size={50} />
            </div>
            
            {/* Student Photo */}
            <div style={{
              width: '100px',
              height: '100px',
              background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
              borderRadius: '12px',
              border: '2px solid #2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              color: '#64748b',
              textAlign: 'center'
            }}>
              [Student Photo]
            </div>
            
            {/* Student Info */}
            <div style={{ flex: 1 }}>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: 'white',
                margin: '0 0 10px 0'
              }}>
                INTERMEDIATE PORTFOLIO
              </h1>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                marginTop: '15px'
              }}>
                <div>
                  <p style={{ margin: '5px 0', color: 'white', fontWeight: '500' }}>
                    <span style={{ color: '#bfdbfe' }}>Name:</span> John Doe
                  </p>
                  <p style={{ margin: '5px 0', color: 'white', fontWeight: '500' }}>
                    <span style={{ color: '#bfdbfe' }}>Dept:</span> Computer Science
                  </p>
                </div>
                <div>
                  <p style={{ margin: '5px 0', color: 'white', fontWeight: '500' }}>
                    <span style={{ color: '#bfdbfe' }}>Reg No:</span> CS2021001
                  </p>
                  <p style={{ margin: '5px 0', color: 'white', fontWeight: '500' }}>
                    <span style={{ color: '#bfdbfe' }}>Year:</span> 3rd Year
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        <div style={{
          background: 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)',
          borderRadius: '12px',
          padding: '25px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          border: '1px solid #e2e8f0'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Trophy size={24} style={{ color: '#2563eb' }} />
            Achievements
          </h2>
          
          {/* Academic Achievements */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              color: '#475569',
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <BookOpen size={20} style={{ color: '#0ea5e9' }} />
              Academic Courses
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                'Data Structures & Algorithms - A Grade',
                'Database Management Systems - A+ Grade',
                'Web Development - A Grade',
                'Machine Learning Basics - B+ Grade'
              ].map((course, index) => (
                <div key={index} style={{
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #1e40af, #1e3a8a)',
                  borderRadius: '8px',
                  border: '1px solid #3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateX(5px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateX(0px)'}
                >
                  <CheckCircle size={16} style={{ color: '#0ea5e9' }} />
                  <span style={{ color: 'white', fontWeight: '500' }}>{course}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Extracurricular Activities */}
          <div>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              color: '#475569',
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Users size={20} style={{ color: '#1e40af' }} />
              Extracurricular Activities
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                'Coding Club President - 2023',
                'Hackathon Winner - TechFest 2023',
                'Volunteer - Community Service Program',
                'Technical Workshop Organizer'
              ].map((activity, index) => (
                <div key={index} style={{
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #1e40af, #1e3a8a)',
                  borderRadius: '8px',
                  border: '1px solid #6366f1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateX(5px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateX(0px)'}
                >
                  <Award size={16} style={{ color: '#6366f1' }} />
                  <span style={{ color: 'white', fontWeight: '500' }}>{activity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '25px',
            textAlign: 'center'
          }}>
            Level Progress
          </h3>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '40px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            {/* Progress Circle */}
            <div style={{
              position: 'relative',
              width: '150px',
              height: '150px'
            }}>
              <svg width="150" height="150" style={{ transform: 'rotate(-90deg)' }}>
                <circle
                  cx="75"
                  cy="75"
                  r="65"
                  stroke="#e2e8f0"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="75"
                  cy="75"
                  r="65"
                  stroke="#2563eb"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 65}`}
                  strokeDashoffset={`${2 * Math.PI * 65 * (1 - progressPercentage / 100)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
              </svg>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#2563eb'
                }}>
                  {progressPercentage}%
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#64748b',
                  marginTop: '2px'
                }}>
                  Complete
                </div>
              </div>
            </div>
            
            {/* Current Level Info */}
            <div style={{
              background: 'linear-gradient(135deg, #bfdbfe, #93c5fd)',
              padding: '25px',
              borderRadius: '12px',
              border: '2px solid #2563eb',
              textAlign: 'center',
              minWidth: '200px'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1d4ed8',
                marginBottom: '8px'
              }}>
                INTERMEDIATE
              </div>
              <div style={{
                fontSize: '16px',
                color: '#1e293b',
                fontWeight: '600',
                marginBottom: '5px'
              }}>
                Current Points: 850
              </div>
              <div style={{
                fontSize: '14px',
                color: '#64748b'
              }}>
                Next Level: 1000 pts
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '12px',
          padding: '25px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          border: '1px solid #e2e8f0',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: '1.2rem',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '20px'
          }}>
            Let's Connect!
          </h3>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '15px',
            flexWrap: 'wrap'
          }}>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#1d4ed8';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#2563eb';
              e.target.style.transform = 'translateY(0px)';
            }}
            >
              <Mail size={16} />
              Email Me
            </button>
            
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: '#0891b2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#0e7490';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#0891b2';
              e.target.style.transform = 'translateY(0px)';
            }}
            >
              <Linkedin size={16} />
              LinkedIn
            </button>
            
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: 'transparent',
              color: '#1e293b',
              border: '2px solid #1e293b',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#1e293b';
              e.target.style.color = 'white';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#1e293b';
              e.target.style.transform = 'translateY(0px)';
            }}
            >
              <Phone size={16} />
              Call Me
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          background: '#1e293b',
          color: 'white',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}>
            <Download size={16} style={{ color: '#10b981' }} />
            <p style={{
              margin: 0,
              fontSize: '14px',
              fontWeight: '600'
            }}>
              Downloaded via Smart Student Hub
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntermediatePortfolio;