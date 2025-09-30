import React, { useState, useCallback, useEffect } from 'react';
import { Upload, Award, Star, Trophy, CheckCircle, Clock, FileText, Image, Shield, Crown, Zap, Sparkles, Target } from 'lucide-react';
import './StudentDashboard.css';

function CertificatesSection({ user }) {
  const [certificates, setCertificates] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [userLevel, setUserLevel] = useState({ level: 'Beginner', points: 20, nextLevel: 100 });
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/students/leaderboard', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const students = await response.json();
        const leaderboardData = students.map((student, index) => ({
          rank: index + 1,
          name: student.name || `Student ${student.student_id}`,
          points: student.total_points || 0,
          level: student.total_points >= 200 ? 'Advanced' : student.total_points >= 100 ? 'Intermediate' : 'Beginner',
          avatar: student.name ? student.name.charAt(0).toUpperCase() : 'S',
          certificates: student.certificate_count || 0
        }));
        setLeaderboard(leaderboardData);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      setLeaderboard([]);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFiles = (files) => {
    Array.from(files).forEach(file => {
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        uploadFile(file);
      } else {
        alert('Please upload only PDF or image files');
      }
    });
  };

  const uploadFile = async (file) => {
    setUploading(true);
    
    const newCert = {
      id: Date.now(),
      name: file.name,
      type: file.type,
      size: file.size,
      progress: 0,
      status: 'uploading'
    };
    
    setCertificates(prev => [...prev, newCert]);
    
    try {
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setCertificates(prev => prev.map(cert => 
          cert.id === newCert.id ? { ...cert, progress: i } : cert
        ));
      }
      
      const response = await fetch('http://localhost:5000/api/certificates/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          certificate_name: file.name.replace(/\.[^/.]+$/, '')
        })
      });
      
      if (response.ok) {
        setCertificates(prev => prev.map(cert => 
          cert.id === newCert.id ? { ...cert, status: 'completed' } : cert
        ));
        
        const newPoints = userLevel.points + 5;
        let newLevel = userLevel.level;
        let nextLevel = userLevel.nextLevel;
        
        if (newPoints >= 200) {
          newLevel = 'Advanced';
          nextLevel = 300;
        } else if (newPoints >= 100) {
          newLevel = 'Intermediate';
          nextLevel = 200;
        }
        
        if (newLevel !== userLevel.level) {
          setShowLevelUp(true);
        }
        
        setUserLevel({ level: newLevel, points: newPoints, nextLevel });
        
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        setTimeout(() => setShowLevelUp(false), 5000);
        
        fetchLeaderboard();
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      setCertificates(prev => prev.map(cert => 
        cert.id === newCert.id ? { ...cert, status: 'error' } : cert
      ));
      alert('Upload failed. Please try again.');
    }
    
    setUploading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle style={{ color: '#28a745' }} size={20} />;
      case 'uploading': return <Clock style={{ color: '#007bff' }} size={20} />;
      default: return <FileText style={{ color: '#6c757d' }} size={20} />;
    }
  };

  const getLevelBadge = (level) => {
    switch (level) {
      case 'Beginner':
        return { icon: <Shield size={20} />, color: '#28a745' };
      case 'Intermediate':
        return { icon: <Zap size={20} />, color: '#007bff' };
      case 'Advanced':
        return { icon: <Crown size={20} />, color: '#ffc107' };
      default:
        return { icon: <Shield size={20} />, color: '#6c757d' };
    }
  };

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #8e44ad 100%)', 
      minHeight: '100vh', 
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Gradient */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(142, 68, 173, 0.2) 0%, transparent 50%)',
        animation: 'pulse 8s ease-in-out infinite',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      {/* Animated Background Elements */}
      {/* Floating Bubbles */}
      {[...Array(15)].map((_, i) => (
        <div key={`bubble-${i}`} style={{
          position: 'absolute',
          width: `${20 + Math.random() * 60}px`,
          height: `${20 + Math.random() * 60}px`,
          borderRadius: '50%',
          background: `rgba(${Math.random() > 0.5 ? '255, 255, 255' : '102, 126, 234'}, ${0.1 + Math.random() * 0.2})`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animation: `float ${4 + Math.random() * 6}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 3}s`,
          pointerEvents: 'none',
          zIndex: 0,
          backdropFilter: 'blur(2px)'
        }} />
      ))}
      
      {/* Geometric Shapes */}
      {[...Array(8)].map((_, i) => (
        <div key={`shape-${i}`} style={{
          position: 'absolute',
          width: `${15 + Math.random() * 30}px`,
          height: `${15 + Math.random() * 30}px`,
          background: `linear-gradient(45deg, rgba(118, 75, 162, 0.2), rgba(102, 126, 234, 0.2))`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animation: `rotate ${8 + Math.random() * 12}s linear infinite`,
          animationDelay: `${Math.random() * 2}s`,
          pointerEvents: 'none',
          zIndex: 0,
          borderRadius: i % 2 === 0 ? '50%' : '0',
          transform: `rotate(${Math.random() * 360}deg)`
        }} />
      ))}
      
      {/* Sparkle Effects */}
      {[...Array(20)].map((_, i) => (
        <div key={`sparkle-${i}`} style={{
          position: 'absolute',
          width: '3px',
          height: '3px',
          background: '#ffd700',
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animation: `sparkle ${2 + Math.random() * 3}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 4}s`,
          pointerEvents: 'none',
          zIndex: 0,
          borderRadius: '50%',
          boxShadow: '0 0 6px #ffd700'
        }} />
      ))}
      
      {/* Gradient Orbs */}
      {[...Array(5)].map((_, i) => (
        <div key={`orb-${i}`} style={{
          position: 'absolute',
          width: `${80 + Math.random() * 120}px`,
          height: `${80 + Math.random() * 120}px`,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(${Math.random() > 0.5 ? '102, 126, 234' : '118, 75, 162'}, 0.1) 0%, transparent 70%)`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animation: `drift ${15 + Math.random() * 20}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 5}s`,
          pointerEvents: 'none',
          zIndex: 0,
          filter: 'blur(1px)'
        }} />
      ))}

      <style jsx>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) scale(1); 
            opacity: 0.3; 
          }
          25% { 
            transform: translateY(-20px) translateX(10px) scale(1.05); 
            opacity: 0.5; 
          }
          50% { 
            transform: translateY(-40px) translateX(-5px) scale(1.1); 
            opacity: 0.7; 
          }
          75% { 
            transform: translateY(-20px) translateX(-10px) scale(1.05); 
            opacity: 0.5; 
          }
        }
        @keyframes rotate {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.2); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes sparkle {
          0%, 100% { 
            opacity: 0; 
            transform: scale(0) rotate(0deg); 
          }
          20% { 
            opacity: 1; 
            transform: scale(1) rotate(90deg); 
          }
          80% { 
            opacity: 1; 
            transform: scale(1.5) rotate(270deg); 
          }
        }
        @keyframes drift {
          0%, 100% { 
            transform: translateX(0px) translateY(0px) scale(1); 
          }
          25% { 
            transform: translateX(30px) translateY(-20px) scale(1.1); 
          }
          50% { 
            transform: translateX(-20px) translateY(-40px) scale(0.9); 
          }
          75% { 
            transform: translateX(-30px) translateY(20px) scale(1.05); 
          }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(255,215,0,0.5); }
          50% { box-shadow: 0 0 40px rgba(255,215,0,0.8); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
        }
      `}</style>

      {!showLeaderboard ? (
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '30px',
            marginBottom: '30px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '15px',
                  padding: '15px'
                }}>
                  <Award size={32} style={{ color: 'white' }} />
                </div>
                <div>
                  <h1 style={{ 
                    margin: 0, 
                    fontSize: '28px', 
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    Certificate Hub
                  </h1>
                  <p style={{ margin: '5px 0 0 0', color: '#6c757d', fontSize: '16px' }}>
                    Showcase your achievements and climb the leaderboard
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkles size={20} style={{ color: '#ffd700' }} />
                <span style={{ fontSize: '14px', color: '#6c757d' }}>Gamified Learning</span>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '30px',
            marginBottom: '30px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ 
              margin: '0 0 30px 0', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              fontSize: '22px',
              fontWeight: '600'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                borderRadius: '12px',
                padding: '8px'
              }}>
                <Trophy style={{ color: 'white' }} size={20} />
              </div>
              Progress Roadmap
              <div style={{
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                Level {userLevel.level}
              </div>
            </h3>

            {/* Level Progress */}
            <div style={{ position: 'relative', marginBottom: '30px' }}>
              <div style={{
                position: 'absolute',
                top: '25px',
                left: '25px',
                right: '25px',
                height: '6px',
                background: '#e1e8ed',
                borderRadius: '10px'
              }}>
                <div style={{
                  width: userLevel.level === 'Beginner' ? '16%' : userLevel.level === 'Intermediate' ? '58%' : '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, #28a745 0%, #20c997 50%, #17a2b8 100%)',
                  borderRadius: '10px',
                  transition: 'width 0.8s ease'
                }} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {['Beginner', 'Intermediate', 'Advanced'].map((level, index) => (
                  <div key={level} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: userLevel.level === level || (userLevel.level === 'Advanced' && index < 2) ? 
                        'linear-gradient(135deg, #28a745 0%, #20c997 100%)' : '#e1e8ed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '12px',
                      border: '4px solid white',
                      boxShadow: '0 8px 25px rgba(40, 167, 69, 0.3)',
                      transform: userLevel.level === level ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.3s ease'
                    }}>
                      {getLevelBadge(level).icon}
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#28a745' }}>{level}</span>
                    <span style={{ fontSize: '12px', color: '#6c757d' }}>
                      {index === 0 ? '0-99 XP' : index === 1 ? '100-199 XP' : '200+ XP'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Level & Leaderboard Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                padding: '15px 25px',
                background: 'rgba(255,255,255,0.9)',
                borderRadius: '50px',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  background: getLevelBadge(userLevel.level).color,
                  borderRadius: '50%',
                  padding: '8px'
                }}>
                  <span style={{ color: 'white' }}>
                    {getLevelBadge(userLevel.level).icon}
                  </span>
                </div>
                <div>
                  <div style={{ fontWeight: '700', color: '#495057', fontSize: '16px' }}>
                    {userLevel.level}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', color: '#6c757d' }}>
                    <Star style={{ color: '#ffd700' }} size={14} />
                    {userLevel.points} XP
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setShowLeaderboard(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '15px 25px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                }}
              >
                <Trophy size={16} />
                View Leaderboard
              </button>
            </div>
          </div>

          {/* Upload Section */}
          <div 
            style={{
              background: dragActive ? 
                'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)' : 
                'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: dragActive ? '3px solid #667eea' : '2px dashed rgba(102, 126, 234, 0.3)',
              borderRadius: '25px',
              padding: '60px 40px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.4s ease',
              marginBottom: '30px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
              transform: dragActive ? 'scale(1.02) translateY(-5px)' : 'scale(1) translateY(0)'
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput').click()}
          >
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: dragActive ? 
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 
                'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              marginBottom: '25px',
              transition: 'all 0.4s ease',
              transform: dragActive ? 'rotate(10deg) scale(1.1)' : 'rotate(0deg) scale(1)'
            }}>
              <Upload size={42} style={{ 
                color: dragActive ? 'white' : '#6c757d',
                transition: 'color 0.3s ease'
              }} />
            </div>
            
            <h3 style={{ 
              margin: '0 0 15px 0', 
              color: dragActive ? '#667eea' : '#495057',
              fontSize: '24px',
              fontWeight: '700'
            }}>
              Upload Certificates
            </h3>
            
            <p style={{ 
              color: dragActive ? '#667eea' : '#6c757d', 
              marginBottom: '25px',
              fontSize: '16px'
            }}>
              {dragActive ? '✨ Release to upload and earn XP!' : 'Drag & drop files or click to browse'}
            </p>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '15px',
              marginBottom: '20px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: 'rgba(40, 167, 69, 0.1)',
                borderRadius: '25px',
                fontSize: '13px',
                color: '#28a745',
                fontWeight: '600',
                border: '1px solid rgba(40, 167, 69, 0.2)'
              }}>
                <FileText size={16} />
                PDF Files
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: 'rgba(102, 126, 234, 0.1)',
                borderRadius: '25px',
                fontSize: '13px',
                color: '#667eea',
                fontWeight: '600',
                border: '1px solid rgba(102, 126, 234, 0.2)'
              }}>
                <Image size={16} />
                Images
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '13px',
              color: '#868e96'
            }}>
              <Target size={14} />
              <span>Maximum file size: 5MB per file</span>
              <div style={{
                padding: '2px 8px',
                background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                borderRadius: '10px',
                fontSize: '11px',
                color: 'white',
                fontWeight: '600'
              }}>
                +5 XP
              </div>
            </div>
            
            <input
              id="fileInput"
              type="file"
              multiple
              accept=".pdf,image/*"
              style={{ display: 'none' }}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          {/* Upload Queue */}
          {certificates.length > 0 && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '20px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <h3 style={{ marginBottom: '15px', color: '#495057' }}>Upload Queue</h3>
              {certificates.map(cert => (
                <div key={cert.id} style={{ 
                  padding: '15px', 
                  border: '1px solid #e1e8ed', 
                  borderRadius: '8px', 
                  marginBottom: '10px',
                  backgroundColor: 'white'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {cert.type.startsWith('image/') ? <Image size={20} /> : <FileText size={20} />}
                      <span style={{ fontWeight: '500' }}>{cert.name}</span>
                      {getStatusIcon(cert.status)}
                    </div>
                    <span style={{ fontSize: '12px', color: '#6c757d' }}>
                      {(cert.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  
                  {cert.status === 'uploading' && (
                    <div style={{ width: '100%', backgroundColor: '#e1e8ed', borderRadius: '4px', height: '6px' }}>
                      <div 
                        style={{ 
                          width: `${cert.progress}%`, 
                          backgroundColor: '#007bff', 
                          borderRadius: '4px', 
                          height: '100%',
                          transition: 'width 0.1s ease'
                        }}
                      />
                    </div>
                  )}
                  
                  {cert.status === 'completed' && (
                    <div style={{ color: '#28a745', fontSize: '12px', fontWeight: '500' }}>
                      ✓ Upload completed successfully
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Leaderboard View */
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          padding: '20px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(25px)',
            borderRadius: '30px',
            padding: '30px',
            boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            width: '700px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: 'white' }}>
                🏆 Leaderboard
              </h2>
              <button 
                onClick={() => setShowLeaderboard(false)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  padding: '10px 20px',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                ← Back
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {leaderboard.slice(0, 10).map((student, index) => (
                <div key={student.rank} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  padding: '15px 20px',
                  background: student.rank <= 3 ? 
                    'rgba(255,215,0,0.1)' : 
                    'rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: student.rank <= 3 ? '#ffd700' : '#667eea',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: '700',
                    color: 'white'
                  }}>
                    {student.rank}
                  </div>
                  
                  <div style={{
                    width: '45px',
                    height: '45px',
                    borderRadius: '50%',
                    background: '#ffd700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#1a1a2e'
                  }}>
                    {student.avatar}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: 'white' }}>
                      {student.name}
                    </div>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                      {student.points} XP • {student.certificates} certificates • {student.level}
                    </div>
                  </div>
                  
                  <div style={{ fontSize: '20px' }}>
                    {student.rank === 1 ? '🥇' : student.rank === 2 ? '🥈' : student.rank === 3 ? '🥉' : ''}
                  </div>
                </div>
              ))}
              
              {leaderboard.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '16px'
                }}>
                  No students found in database
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {showSuccess && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#28a745',
          color: 'white',
          padding: '15px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Award size={20} />
            <span style={{ fontWeight: '500' }}>+5 XP earned! Certificate uploaded successfully!</span>
          </div>
        </div>
      )}

      {/* Level Up Modal */}
      {showLevelUp && (
        <>
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1000
          }} />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            zIndex: 1001,
            textAlign: 'center',
            minWidth: '300px'
          }}>
            <Trophy size={48} style={{ color: '#ffd700', marginBottom: '15px' }} />
            <h2 style={{ margin: '0 0 10px 0', color: '#495057' }}>Level Up!</h2>
            <p style={{ margin: '0 0 20px 0', color: '#6c757d' }}>Congratulations! You've reached {userLevel.level} level!</p>
            <button 
              onClick={() => setShowLevelUp(false)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Awesome!
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default CertificatesSection;