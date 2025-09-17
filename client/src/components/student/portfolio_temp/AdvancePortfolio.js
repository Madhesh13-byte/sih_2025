import React, { useEffect } from 'react';

const AdvancePortfolio = ({ user, isModal = false, onDownload }) => {
  const isDarkMode = false;

  useEffect(() => {
    if (onDownload) {
      onDownload(() => handleDownloadPDF);
    }
  }, [onDownload]);

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/generate-advanced-portfolio-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          studentData: {
            name: user?.name || 'XXXXX',
            regNo: user?.register_no || '12345',
            department: user?.department || 'IT',
            year: '3',
            email: 'email@domain.com',
            level: 'ADVANCED',
            totalPoints: 320
          }
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${user?.name || 'Student'}_Advanced_Portfolio.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('PDF generation error:', error);
    }
  };

  const studentDetails = {
    name: user?.name || "XXXXX",
    title: "Information Technology Student",
    regNo: user?.register_no || "12345",
    dept: user?.department || "IT",
    year: "3",
    email: "email@domain.com",
    phone: "+91 98765 43210",
    linkedin: "linkedin.com/in/link",
    github: "github.com/username"
  };

  const highlightSummary = [
    { text: "Gold Medal in National Coding Contest", icon: "🏅", category: "Achievement" },
    { text: "Research Paper in IEEE Conference", icon: "📄", category: "Research" },
    { text: "Internship at TCS - Data Analyst", icon: "💼", category: "Experience" },
  ];

  const achievementTimeline = [
    { 
      year: "2023", 
      title: "Workshop on AI",
      description: "Workshop on AI → Certified ✅",
      type: "achievement"
    },
    { 
      year: "2024", 
      title: "NPTEL DBMS Course",
      description: "NPTEL DBMS Course → Completed ✅",
      type: "achievement"
    },
    { 
      year: "2025", 
      title: "National Hackathon Winner",
      description: "National Hackathon Winner 🏆",
      type: "achievement"
    }
  ];

  const badges = [
    { name: "Innovator", points: 320 },
    { name: "Leader", points: null },
    { name: "Mentor", points: null },
  ];

  const currentLevel = {
    level: "ADVANCED",
    totalPoints: 320
  };

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: isModal ? '0' : '1rem 1.5rem',
      backgroundColor: '#f8fafc'
    }}>
      <div style={{
        maxWidth: '80rem',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: isModal ? '0' : '1.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        border: '1px solid #e2e8f0'
      }}>
        
        {/* Header Section */}
        <div style={{
          background: 'linear-gradient(135deg, #312e81 0%, #1e293b 100%)',
          color: '#ffffff',
          padding: '2rem 3rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: '900',
              letterSpacing: '-0.025em',
              marginBottom: '1rem',
              margin: 0
            }}>
              {studentDetails.name}
            </h1>
            <p style={{
              fontSize: '1.25rem',
              color: '#a5b4fc',
              fontWeight: '500',
              marginBottom: '1.5rem'
            }}>{studentDetails.title}</p>
            
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '1.5rem',
              fontSize: '0.875rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#a5b4fc' }}>📧</span>
                <span>{studentDetails.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div style={{ padding: '2rem 3rem' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '2rem',
            color: '#1e293b'
          }}>Academic Information</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}>
            <div style={{
              padding: '1.5rem',
              borderRadius: '0.75rem',
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1'
            }}>
              <h3 style={{
                fontWeight: '600',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.5rem',
                color: '#4338ca'
              }}>Registration</h3>
              <p style={{
                fontSize: '1.125rem',
                fontWeight: '700',
                color: '#1e293b',
                margin: 0
              }}>{studentDetails.regNo}</p>
            </div>
            <div style={{
              padding: '1.5rem',
              borderRadius: '0.75rem',
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1'
            }}>
              <h3 style={{
                fontWeight: '600',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.5rem',
                color: '#4338ca'
              }}>Department</h3>
              <p style={{
                fontSize: '1.125rem',
                fontWeight: '700',
                color: '#1e293b',
                margin: 0
              }}>{studentDetails.dept}</p>
            </div>
            <div style={{
              padding: '1.5rem',
              borderRadius: '0.75rem',
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1'
            }}>
              <h3 style={{
                fontWeight: '600',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.5rem',
                color: '#4338ca'
              }}>Academic Year</h3>
              <p style={{
                fontSize: '1.125rem',
                fontWeight: '700',
                color: '#1e293b',
                margin: 0
              }}>{studentDetails.year}</p>
            </div>
            <div style={{
              padding: '1.5rem',
              borderRadius: '0.75rem',
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1'
            }}>
              <h3 style={{
                fontWeight: '600',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.5rem',
                color: '#4338ca'
              }}>Connect</h3>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <a href={`https://${studentDetails.linkedin}`} target="_blank" rel="noopener noreferrer" style={{ color: '#4338ca', fontWeight: '500', textDecoration: 'none' }}>LinkedIn</a>
                <a href={`https://${studentDetails.github}`} target="_blank" rel="noopener noreferrer" style={{ color: '#4338ca', fontWeight: '500', textDecoration: 'none' }}>GitHub</a>
              </div>
            </div>
          </div>
        </div>

        {/* Key Achievements */}
        <div style={{
          padding: '2rem 3rem',
          backgroundColor: '#f1f5f9',
          borderTop: '1px solid #cbd5e1',
          borderBottom: '1px solid #cbd5e1'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '2rem',
            color: '#1e293b'
          }}>Key Achievements</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            {highlightSummary.map((item, index) => (
              <div key={index} style={{
                padding: '1.5rem',
                borderRadius: '0.75rem',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ fontSize: '1.875rem' }}>{item.icon}</div>
                  <div style={{ flex: '1' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      marginBottom: '0.75rem',
                      backgroundColor: '#e0e7ff',
                      color: '#3730a3'
                    }}>
                      {item.category}
                    </span>
                    <p style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      lineHeight: '1.75',
                      color: '#1e293b',
                      margin: 0
                    }}>{item.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Academic Journey */}
        <div style={{ padding: '2rem 3rem' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '2rem',
            color: '#1e293b'
          }}>Academic Journey</h2>
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              left: '1.5rem',
              top: '0',
              height: '100%',
              width: '2px',
              backgroundColor: '#a5b4fc'
            }}></div>
            {achievementTimeline.map((item, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '2rem',
                position: 'relative'
              }}>
                <div style={{
                  flexShrink: '0',
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '0.875rem',
                  zIndex: '10',
                  backgroundColor: '#4338ca',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}>
                  {item.year}
                </div>
                <div style={{
                  marginLeft: '1.5rem',
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  flex: '1',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    marginBottom: '0.5rem',
                    color: '#1e293b',
                    margin: '0 0 0.5rem 0'
                  }}>{item.title}</h3>
                  <p style={{
                    lineHeight: '1.75',
                    color: '#64748b',
                    margin: 0
                  }}>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Badges & Levels */}
        <div style={{
          padding: '2rem 3rem',
          backgroundColor: '#f1f5f9',
          borderTop: '1px solid #cbd5e1'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '2rem',
            color: '#1e293b'
          }}>Badges & Levels</h2>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              justifyContent: 'center',
              marginBottom: '1.5rem'
            }}>
              {badges.map((badge, index) => (
                <div key={index} style={{
                  borderRadius: '9999px',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  backgroundColor: '#e0e7ff',
                  color: '#3730a3',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                  {badge.name}
                  {badge.points && (
                    <span style={{
                      marginLeft: '0.5rem',
                      backgroundColor: '#4338ca',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '9999px'
                    }}>{badge.points} Points</span>
                  )}
                </div>
              ))}
            </div>
            <div style={{
              padding: '1.5rem',
              borderRadius: '0.75rem',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              display: 'inline-block'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                marginBottom: '0.5rem',
                color: '#1e293b',
                margin: '0 0 0.5rem 0'
              }}>Current Level: {currentLevel.level}</h3>
              <p style={{
                color: '#64748b',
                margin: 0
              }}>Total Points: {currentLevel.totalPoints}</p>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div style={{
          textAlign: 'center',
          padding: '1.5rem',
          backgroundColor: '#f1f5f9',
          color: '#64748b',
          borderTop: '1px solid #cbd5e1'
        }}>
          <p style={{
            fontSize: '0.875rem',
            fontWeight: '500',
            margin: 0
          }}>🎓 Digital Portfolio • Verified & Generated via Smart Student Hub</p>
          <p style={{
            fontSize: '0.75rem',
            marginTop: '0.5rem',
            opacity: '0.75',
            margin: '0.5rem 0 0 0'
          }}>Last Updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default AdvancePortfolio;