import React, { useState, useCallback } from 'react';
import { Upload, Award, Star, Trophy, CheckCircle, Clock, FileText, Image, Shield, Crown, Zap, FolderOpen, Users, Medal, Sparkles, Target, TrendingUp } from 'lucide-react';
import './StudentDashboard.css';


function CertificatesSection({ user }) {
  const [certificates, setCertificates] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [userLevel, setUserLevel] = useState({ level: 'Beginner', points: 20, nextLevel: 100 });
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const [leaderboard] = useState([
    { rank: 1, name: 'Alice Johnson', points: 450, level: 'Advanced', avatar: 'AJ' },
    { rank: 2, name: 'Bob Smith', points: 380, level: 'Advanced', avatar: 'BS' },
    { rank: 3, name: 'Carol Davis', points: 320, level: 'Intermediate', avatar: 'CD' },
    { rank: 4, name: 'David Wilson', points: 280, level: 'Intermediate', avatar: 'DW' },
    { rank: 5, name: 'Eva Brown', points: 240, level: 'Intermediate', avatar: 'EB' },
    { rank: 6, name: 'Frank Miller', points: 200, level: 'Intermediate', avatar: 'FM' },
    { rank: 7, name: 'Grace Lee', points: 180, level: 'Intermediate', avatar: 'GL' },
    { rank: 8, name: 'Henry Clark', points: 160, level: 'Intermediate', avatar: 'HC' },
    { rank: 9, name: 'Ivy Taylor', points: 140, level: 'Intermediate', avatar: 'IT' },
    { rank: 10, name: 'Jack White', points: 120, level: 'Intermediate', avatar: 'JW' }
  ]);

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
    
    // Simulate progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setCertificates(prev => prev.map(cert => 
        cert.id === newCert.id ? { ...cert, progress: i } : cert
      ));
    }
    
    setCertificates(prev => prev.map(cert => 
      cert.id === newCert.id ? { ...cert, status: 'completed' } : cert
    ));
    
    setUploading(false);
    setShowSuccess(true);
    
    // Award points
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
    
    setTimeout(() => setShowSuccess(false), 3000);
    setTimeout(() => setShowLevelUp(false), 5000);
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
        return {
          icon: <Shield size={20} />,
          color: '#28a745',
          bgColor: '#d4edda',
          borderColor: '#c3e6cb'
        };
      case 'Intermediate':
        return {
          icon: <Zap size={20} />,
          color: '#007bff',
          bgColor: '#d1ecf1',
          borderColor: '#bee5eb'
        };
      case 'Advanced':
        return {
          icon: <Crown size={20} />,
          color: '#ffc107',
          bgColor: '#fff3cd',
          borderColor: '#ffeaa7'
        };
      default:
        return {
          icon: <Shield size={20} />,
          color: '#6c757d',
          bgColor: '#f8f9fa',
          borderColor: '#e1e8ed'
        };
    }
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          @keyframes confetti {
            0% { transform: translateY(0) rotate(0deg); }
            100% { transform: translateY(-20px) rotate(360deg); }
          }
          @keyframes champagne {
            0%, 100% { opacity: 0; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.2); }
          }
          .certificates-section ::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
      <div className="certificates-section" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh', padding: '20px' }}>
      
      {!showLeaderboard ? (
      <>
      {/* Header Section */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '30px',
        marginBottom: '30px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '15px',
              padding: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
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
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
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
      
      {/* Progress Roadmap */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Floating particles background */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 20%, rgba(102, 126, 234, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.1) 0%, transparent 50%)',
            pointerEvents: 'none'
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
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
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
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
          
          <div style={{ position: 'relative' }}>
            {/* Enhanced Progress Line */}
            <div style={{
              position: 'absolute',
              top: '25px',
              left: '25px',
              right: '25px',
              height: '6px',
              background: 'linear-gradient(90deg, #e1e8ed 0%, #e1e8ed 100%)',
              borderRadius: '10px',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                width: userLevel.level === 'Beginner' ? '16%' : userLevel.level === 'Intermediate' ? '58%' : '100%',
                height: '100%',
                background: 'linear-gradient(90deg, #28a745 0%, #20c997 50%, #17a2b8 100%)',
                borderRadius: '10px',
                transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 2px 10px rgba(40, 167, 69, 0.3)',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                  borderRadius: '10px',
                  animation: 'shimmer 2s infinite'
                }} />
              </div>
            </div>
            
            {/* Level Milestones */}
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
              {/* Beginner */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                  border: '4px solid white',
                  boxShadow: '0 8px 25px rgba(40, 167, 69, 0.3)',
                  position: 'relative',
                  transform: userLevel.level === 'Beginner' ? 'scale(1.1)' : 'scale(1)',
                  transition: 'transform 0.3s ease'
                }}>
                  <Shield size={22} style={{ color: 'white' }} />
                  {userLevel.level === 'Beginner' && (
                    <div style={{
                      position: 'absolute',
                      top: '-5px',
                      right: '-5px',
                      width: '20px',
                      height: '20px',
                      background: '#ffd700',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Star size={12} style={{ color: 'white' }} />
                    </div>
                  )}
                </div>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#28a745' }}>Beginner</span>
                <span style={{ fontSize: '12px', color: '#6c757d' }}>0-99 XP</span>
              </div>
              
              {/* Intermediate */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: userLevel.level === 'Intermediate' || userLevel.level === 'Advanced' ? 
                    'linear-gradient(135deg, #007bff 0%, #0056b3 100%)' : 'linear-gradient(135deg, #e1e8ed 0%, #ced4da 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                  border: '4px solid white',
                  boxShadow: userLevel.level === 'Intermediate' || userLevel.level === 'Advanced' ? 
                    '0 8px 25px rgba(0, 123, 255, 0.3)' : '0 4px 15px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  transform: userLevel.level === 'Intermediate' ? 'scale(1.1)' : 'scale(1)'
                }}>
                  <Zap size={22} style={{ color: userLevel.level === 'Intermediate' || userLevel.level === 'Advanced' ? 'white' : '#6c757d' }} />
                  {userLevel.level === 'Intermediate' && (
                    <div style={{
                      position: 'absolute',
                      top: '-5px',
                      right: '-5px',
                      width: '20px',
                      height: '20px',
                      background: '#ffd700',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Star size={12} style={{ color: 'white' }} />
                    </div>
                  )}
                </div>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: userLevel.level === 'Intermediate' || userLevel.level === 'Advanced' ? '#007bff' : '#6c757d'
                }}>Intermediate</span>
                <span style={{ fontSize: '12px', color: '#6c757d' }}>100-199 XP</span>
              </div>
              
              {/* Advanced */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: userLevel.level === 'Advanced' ? 
                    'linear-gradient(135deg, #ffc107 0%, #ff8c00 100%)' : 'linear-gradient(135deg, #e1e8ed 0%, #ced4da 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                  border: '4px solid white',
                  boxShadow: userLevel.level === 'Advanced' ? 
                    '0 8px 25px rgba(255, 193, 7, 0.4)' : '0 4px 15px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  transform: userLevel.level === 'Advanced' ? 'scale(1.1)' : 'scale(1)'
                }}>
                  <Crown size={22} style={{ color: userLevel.level === 'Advanced' ? 'white' : '#6c757d' }} />
                  {userLevel.level === 'Advanced' && (
                    <div style={{
                      position: 'absolute',
                      top: '-5px',
                      right: '-5px',
                      width: '20px',
                      height: '20px',
                      background: '#ffd700',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Star size={12} style={{ color: 'white' }} />
                    </div>
                  )}
                </div>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: userLevel.level === 'Advanced' ? '#ffc107' : '#6c757d'
                }}>Advanced</span>
                <span style={{ fontSize: '12px', color: '#6c757d' }}>200+ XP</span>
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              padding: '15px 25px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '50px',
              boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                background: getLevelBadge(userLevel.level).color,
                borderRadius: '50%',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
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
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                transform: 'translateY(0)'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
              }}
            >
              <Trophy size={16} />
              View Leaderboard
            </button>
          </div>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
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
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          marginBottom: '30px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: dragActive ? 
            '0 25px 50px rgba(102, 126, 234, 0.25)' : 
            '0 20px 40px rgba(0, 0, 0, 0.1)',
          transform: dragActive ? 'scale(1.02) translateY(-5px)' : 'scale(1) translateY(0)'
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('fileInput').click()}
      >
        {/* Animated background pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: dragActive ? 0.15 : 0.05,
          backgroundImage: `
            radial-gradient(circle at 20% 20%, #667eea 3px, transparent 3px),
            radial-gradient(circle at 80% 80%, #764ba2 3px, transparent 3px),
            radial-gradient(circle at 40% 60%, #ffd700 2px, transparent 2px)
          `,
          backgroundSize: '40px 40px, 35px 35px, 25px 25px',
          animation: dragActive ? 'float 3s ease-in-out infinite' : 'none',
          transition: 'opacity 0.3s ease'
        }} />
        
        {/* Floating orbs */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '20px',
          height: '20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '50%',
          opacity: dragActive ? 0.6 : 0.2,
          animation: 'float 4s ease-in-out infinite',
          transition: 'opacity 0.3s ease'
        }} />
        <div style={{
          position: 'absolute',
          top: '70%',
          right: '15%',
          width: '15px',
          height: '15px',
          background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
          borderRadius: '50%',
          opacity: dragActive ? 0.7 : 0.3,
          animation: 'float 3s ease-in-out infinite reverse',
          transition: 'opacity 0.3s ease'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
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
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: dragActive ? 'rotate(10deg) scale(1.1)' : 'rotate(0deg) scale(1)',
            boxShadow: dragActive ? 
              '0 15px 35px rgba(102, 126, 234, 0.4)' : 
              '0 8px 25px rgba(0, 0, 0, 0.1)',
            position: 'relative'
          }}>
            <Upload size={42} style={{ 
              color: dragActive ? 'white' : '#6c757d',
              transition: 'color 0.3s ease'
            }} />
            {dragActive && (
              <div style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                width: '25px',
                height: '25px',
                background: '#ffd700',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'pulse 1s infinite'
              }}>
                <Sparkles size={14} style={{ color: 'white' }} />
              </div>
            )}
          </div>
          
          <h3 style={{ 
            margin: '0 0 15px 0', 
            color: dragActive ? '#667eea' : '#495057',
            fontSize: '24px',
            fontWeight: '700',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transform: dragActive ? 'scale(1.05)' : 'scale(1)'
          }}>
            {dragActive ? (
              <>
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '8px',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Star size={18} style={{ color: 'white' }} />
                </div>
                Drop your files here!
              </>
            ) : (
              <>
                <div style={{
                  background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
                  borderRadius: '8px',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FolderOpen size={18} style={{ color: 'white' }} />
                </div>
                Upload Certificates
              </>
            )}
          </h3>
          
          <p style={{ 
            color: dragActive ? '#667eea' : '#6c757d', 
            marginBottom: '25px',
            fontSize: '16px',
            fontWeight: '500',
            transition: 'color 0.3s ease'
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
              background: 'linear-gradient(135deg, rgba(40, 167, 69, 0.1) 0%, rgba(32, 201, 151, 0.1) 100%)',
              borderRadius: '25px',
              fontSize: '13px',
              color: '#28a745',
              fontWeight: '600',
              border: '1px solid rgba(40, 167, 69, 0.2)',
              transition: 'transform 0.2s ease',
              cursor: 'pointer'
            }}>
              <FileText size={16} />
              PDF Files
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              borderRadius: '25px',
              fontSize: '13px',
              color: '#667eea',
              fontWeight: '600',
              border: '1px solid rgba(102, 126, 234, 0.2)',
              transition: 'transform 0.2s ease',
              cursor: 'pointer'
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
            color: '#868e96',
            margin: 0
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
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '15px' }}>Upload Queue</h3>
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

      {/* Success Toast */}
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

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <>
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%)',
            backdropFilter: 'blur(10px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }} onClick={() => setShowLeaderboard(false)} />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            padding: '0',
            borderRadius: '25px',
            boxShadow: '0 30px 80px rgba(0,0,0,0.3)',
            zIndex: 1001,
            width: '90%',
            maxWidth: '600px',
            maxHeight: '95vh',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }} onClick={(e) => e.stopPropagation()}>

            
            {/* F1 Style Podium - Victory Celebration */}
            <div style={{ padding: '20px', background: 'radial-gradient(circle at center, #ffd700 0%, #ff8f00 30%, #e65100 100%)', position: 'relative', overflow: 'hidden' }}>
              {/* Back Button */}
              <button 
                onClick={() => setShowLeaderboard(false)}
                style={{
                  position: 'absolute',
                  top: '15px',
                  left: '15px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  zIndex: 10
                }}
                onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
                onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
              >
                ←
              </button>
              {/* Confetti particles */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `
                  radial-gradient(circle at 15% 25%, #ffd700 2px, transparent 2px),
                  radial-gradient(circle at 85% 15%, #ff6b35 1px, transparent 1px),
                  radial-gradient(circle at 25% 75%, #ffd700 1.5px, transparent 1.5px),
                  radial-gradient(circle at 75% 85%, #ff8f00 2px, transparent 2px),
                  radial-gradient(circle at 45% 35%, #ffd700 1px, transparent 1px),
                  radial-gradient(circle at 65% 65%, #ff6b35 1.5px, transparent 1.5px)
                `,
                backgroundSize: '50px 50px, 40px 40px, 60px 60px, 45px 45px, 35px 35px, 55px 55px',
                animation: 'confetti 4s linear infinite'
              }} />
              
              {/* Champagne spray effect */}
              <div style={{
                position: 'absolute',
                top: '10%',
                left: '10%',
                width: '80%',
                height: '20%',
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 20%, rgba(255,255,255,0.1) 40%, transparent 60%)',
                borderRadius: '50%',
                animation: 'champagne 3s ease-in-out infinite'
              }} />
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'end', gap: '8px', marginBottom: '15px' }}>
                  {/* 2nd Place - Left */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', order: 1 }}>
                    <div style={{
                      width: '45px',
                      height: '45px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #c0c0c0 0%, #a8a8a8 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '8px',
                      border: '3px solid #fff',
                      boxShadow: '0 8px 25px rgba(192, 192, 192, 0.4)',
                      position: 'relative'
                    }}>
                      <span style={{ fontSize: '16px', fontWeight: '700', color: 'white' }}>
                        {leaderboard[1]?.avatar}
                      </span>
                      <div style={{
                        position: 'absolute',
                        top: '-6px',
                        right: '-6px',
                        background: 'linear-gradient(135deg, #c0c0c0 0%, #a8a8a8 100%)',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid white'
                      }}>
                        <span style={{ fontSize: '10px', fontWeight: '700', color: 'white' }}>2</span>
                      </div>
                    </div>
                    <div style={{
                      background: 'linear-gradient(135deg, #c0c0c0 0%, #a8a8a8 100%)',
                      height: '55px',
                      width: '55px',
                      borderRadius: '8px 8px 0 0',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '700',
                      border: '2px solid rgba(255,255,255,0.3)',
                      position: 'relative'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '5px',
                        fontSize: '8px',
                        opacity: 0.7
                      }}>2ND</div>
                      <Medal size={16} />
                    </div>
                  </div>
                  
                  {/* 1st Place - Center */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', order: 2 }}>
                    <div style={{
                      width: '55px',
                      height: '55px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '8px',
                      border: '4px solid #fff',
                      boxShadow: '0 12px 35px rgba(255, 215, 0, 0.5)',
                      position: 'relative',
                      animation: 'pulse 2s infinite'
                    }}>
                      <span style={{ fontSize: '20px', fontWeight: '700', color: 'white' }}>
                        {leaderboard[0]?.avatar}
                      </span>
                      <div style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid white'
                      }}>
                        <Crown size={12} style={{ color: 'white' }} />
                      </div>
                    </div>
                    <div style={{
                      background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                      height: '70px',
                      width: '65px',
                      borderRadius: '8px 8px 0 0',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '700',
                      border: '3px solid rgba(255,255,255,0.4)',
                      position: 'relative',
                      boxShadow: '0 8px 25px rgba(255, 215, 0, 0.3)'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '5px',
                        fontSize: '9px',
                        opacity: 0.8
                      }}>WINNER</div>
                      <Trophy size={20} />
                    </div>
                  </div>
                  
                  {/* 3rd Place - Right */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', order: 3 }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #cd7f32 0%, #b8691a 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '8px',
                      border: '3px solid #fff',
                      boxShadow: '0 6px 20px rgba(205, 127, 50, 0.4)',
                      position: 'relative'
                    }}>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: 'white' }}>
                        {leaderboard[2]?.avatar}
                      </span>
                      <div style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        background: 'linear-gradient(135deg, #cd7f32 0%, #b8691a 100%)',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid white'
                      }}>
                        <span style={{ fontSize: '9px', fontWeight: '700', color: 'white' }}>3</span>
                      </div>
                    </div>
                    <div style={{
                      background: 'linear-gradient(135deg, #cd7f32 0%, #b8691a 100%)',
                      height: '45px',
                      width: '50px',
                      borderRadius: '8px 8px 0 0',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '700',
                      border: '2px solid rgba(255,255,255,0.3)',
                      position: 'relative'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '4px',
                        fontSize: '7px',
                        opacity: 0.7
                      }}>3RD</div>
                      <Medal size={14} />
                    </div>
                  </div>
                </div>
                
                {/* F1 Style Names Display */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
                  <div style={{ textAlign: 'center', width: '65px', order: 1 }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#c0c0c0', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif' }}>
                      {leaderboard[1]?.name.split(' ')[0]}
                    </div>
                    <div style={{ fontSize: '9px', color: 'rgba(192, 192, 192, 0.7)', fontFamily: 'Montserrat, sans-serif' }}>
                      {leaderboard[1]?.points} XP
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', width: '75px', order: 2 }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#ffd700', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif' }}>
                      {leaderboard[0]?.name.split(' ')[0]}
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255, 215, 0, 0.8)', fontWeight: '600', fontFamily: 'Montserrat, sans-serif' }}>
                      {leaderboard[0]?.points} XP
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', width: '60px', order: 3 }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#8b4513', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif' }}>
                      {leaderboard[2]?.name.split(' ')[0]}
                    </div>
                    <div style={{ fontSize: '9px', color: 'rgba(139, 69, 19, 0.8)', fontFamily: 'Montserrat, sans-serif' }}>
                      {leaderboard[2]?.points} XP
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Scrolling Rankings */}
            <div style={{ 
              padding: '15px 20px', 
              maxHeight: '350px', 
              overflowY: 'auto',
              background: 'white',
              borderTop: '1px solid #e1e8ed',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}>
              {/* <div style={{ 
                position: 'sticky',
                top: 0,
                background: 'white',
                paddingBottom: '15px',
                marginBottom: '10px',
                borderBottom: '1px solid #f1f3f4',
                zIndex: 10
              }}>
              </div> */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '6px',
                paddingRight: '8px'
              }}>
              {leaderboard.slice(3).map((student, index) => {
                const actualIndex = index + 3;
                const isTopThree = false;
                
                return (
                  <div key={student.rank} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    background: 'rgba(248, 249, 250, 0.6)',
                    borderRadius: '10px',
                    border: '1px solid #e1e8ed',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    position: 'relative',
                    marginBottom: '2px'
                  }}>
                    {/* Smooth scroll indicator */}
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '3px',
                      background: 'transparent',
                      borderRadius: '0 10px 10px 0'
                    }} />
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: 'linear-gradient(135deg, #e1e8ed 0%, #ced4da 100%)',
                      fontSize: '11px',
                      fontWeight: '700',
                      color: '#6c757d',
                      marginLeft: '3px'
                    }}>
                      #{student.rank}
                    </div>
                    
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: 'white',
                      border: '2px solid white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      {student.avatar}
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#495057', 
                        marginBottom: '1px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontFamily: 'Montserrat, sans-serif'
                      }}>
                        {student.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6c757d' }}>
                        <Star size={10} style={{ color: '#ffd700' }} />
                        {student.points} XP
                      </div>
                    </div>
                    
                    <div style={{
                      padding: '4px 8px',
                      borderRadius: '10px',
                      fontSize: '10px',
                      fontWeight: '600',
                      background: getLevelBadge(student.level).bgColor,
                      color: getLevelBadge(student.level).color,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      border: `1px solid ${getLevelBadge(student.level).borderColor}`,
                      minWidth: 'fit-content'
                    }}>
                      <span style={{ fontSize: '8px' }}>
                        {getLevelBadge(student.level).icon}
                      </span>
                      {student.level.slice(0, 3)}
                    </div>
                    

                  </div>
                );
              })}
              </div>
            </div>
          </div>
        </>
      )}

      </>
      ) : (
        <div>Leaderboard content here</div>
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
    </>
  );
}
export default CertificatesSection;