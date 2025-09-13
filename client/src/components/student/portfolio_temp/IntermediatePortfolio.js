import React, { useState, useEffect } from 'react';
import { Download, BookOpen, Trophy, Users, Award, Star, Zap, Target, Share2, CheckCircle, Sparkles, BarChart3, User, TrendingUp, Calendar } from 'lucide-react';

const getStatusIcon = (iconName) => {
  const icons = {
    CheckCircle,
    Award,
    Zap
  };
  return icons[iconName] || CheckCircle;
};

// Particle component for floating effects
const FloatingParticles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10
  }));

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 0
    }}>
      {particles.map(particle => (
        <div
          key={particle.id}
          style={{
            position: 'absolute',
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: 'linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899)',
            borderRadius: '50%',
            opacity: 0.4,
            animation: `floatParticle ${particle.duration}s infinite ease-in-out`
          }}
        />
      ))}
    </div>
  );
};

// Geometric shapes background
const GeometricBackground = () => (
  <div style={{
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: 0
  }}>
    <div style={{
      position: 'absolute',
      top: '15%',
      right: '10%',
      width: '120px',
      height: '120px',
      background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))',
      borderRadius: '50%',
      transform: 'rotate(45deg)',
      animation: 'geometricFloat 8s ease-in-out infinite'
    }} />
    <div style={{
      position: 'absolute',
      bottom: '25%',
      left: '5%',
      width: '90px',
      height: '90px',
      background: 'linear-gradient(45deg, rgba(16,185,129,0.1), rgba(59,130,246,0.1))',
      clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
      animation: 'geometricFloat 6s ease-in-out infinite 2s'
    }} />
    <div style={{
      position: 'absolute',
      top: '60%',
      left: '3%',
      width: '70px',
      height: '70px',
      background: 'linear-gradient(90deg, rgba(139,92,246,0.1), rgba(236,72,153,0.1))',
      transform: 'rotate(30deg)',
      animation: 'geometricFloat 10s ease-in-out infinite 4s'
    }} />
  </div>
);

const IntermediatePortfolio = ({ user, isModal = false, onDownload }) => {
  const [studentData] = useState({
    name: 'Jane Smith',
    regNo: '20IT102',
    department: 'Information Technology',
    year: '3',
    level: 'Intermediate',
    points: 150,
    maxPoints: 230
  });

  const [achievements] = useState({
    academics: [
      { title: 'NPTEL DBMS Course', status: 'Verified', statusIcon: 'CheckCircle', date: 'Dec 2024' },
      { title: 'College Hackathon', status: '2nd Place', statusIcon: 'Award', date: 'Nov 2024' }
    ],
    extracurricular: [
      { title: 'NSS Blood Camp Volunteer', status: 'Completed', statusIcon: 'CheckCircle', date: 'Oct 2024' },
      { title: 'Coding Club Member', status: 'Active', statusIcon: 'Zap', date: 'Sep 2024' }
    ]
  });

  const [badges] = useState(['Quick Learner', 'Active Participant', 'Team Player']);

  const progressPercentage = (studentData.points / studentData.maxPoints) * 100;
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progressPercentage);
    }, 500);
    return () => clearTimeout(timer);
  }, [progressPercentage]);

  const downloadRef = React.useRef(null);

  downloadRef.current = async () => {
    try {
      console.log('🚀 Starting PDF generation for Intermediate Portfolio...');
      console.log('📊 Portfolio data:', { name: studentData.name, achievements: achievements.academics.length + achievements.extracurricular.length, badges: badges.length });
      
      const response = await fetch('http://localhost:5000/api/generate-intermediate-portfolio-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ studentData, achievements, badges })
      });
      
      console.log('⏳ Server processing PDF... This may take 10-15 seconds for complex layouts.');
      
      if (response.ok) {
        console.log('✅ PDF generated successfully! Processing download...');
        const blob = await response.blob();
        console.log('📄 PDF size:', (blob.size / 1024).toFixed(2) + ' KB');
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${studentData.name}_Intermediate_Portfolio.pdf`;
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

  const CircularProgress = ({ percentage }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

    return (
      <div style={{ position: 'relative', width: '140px', height: '140px' }}>
        <div style={{
          position: 'absolute',
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          background: 'conic-gradient(from 0deg, #06b6d4, #0891b2, #0e7490, #06b6d4)',
          animation: 'spin 3s linear infinite',
          opacity: 0.1
        }}></div>
        <svg width="140" height="140" style={{ transform: 'rotate(-90deg)', position: 'relative', zIndex: 2 }}>
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#0891b2" />
              <stop offset="100%" stopColor="#0e7490" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke="#e0f2fe"
            strokeWidth="10"
            fill="transparent"
          />
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke="url(#progressGradient)"
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter="url(#glow)"
            style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 3
        }}>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#0891b2', textShadow: '0 2px 4px rgba(8,145,178,0.3)' }}>
            {Math.round(animatedProgress)}%
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>to Advanced</div>
          <Zap size={16} style={{ color: '#f59e0b', marginTop: '4px' }} />
        </div>
      </div>
    );
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800;900&display=swap');
          
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          @keyframes floatParticle {
            0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.4; }
            50% { transform: translateY(-30px) rotate(180deg); opacity: 0.8; }
          }
          
          @keyframes geometricFloat {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          
          @keyframes shimmer {
            0% { background-position: -200px 0; }
            100% { background-position: 200px 0; }
          }
          
          @keyframes textGlow {
            0%, 100% { text-shadow: 0 6px 12px rgba(0,0,0,0.4); }
            50% { text-shadow: 0 6px 12px rgba(0,0,0,0.4), 0 0 20px rgba(255,255,255,0.3); }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .achievement-card {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
          }
          
          .achievement-card:hover {
            transform: translateY(-12px) scale(1.03);
            box-shadow: 0 25px 50px rgba(0,0,0,0.2);
          }
          
          .achievement-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: -200px;
            width: 200px;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
            animation: shimmer 3s infinite;
            z-index: 1;
          }
          
          .badge-item {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
          }
          
          .badge-item:hover {
            transform: scale(1.15) rotate(8deg);
            box-shadow: 0 12px 24px rgba(236, 72, 153, 0.3);
          }
        `}
      </style>
      
      <div style={{
        minHeight: isModal ? 'auto' : '100vh',
        background: isModal ? 'white' : 'linear-gradient(135deg, #667eea 0%, #764ba2 30%, #f093fb 70%, #f5576c 100%)',
        padding: isModal ? '0' : '20px',
        fontFamily: 'Inter, sans-serif',
        position: 'relative'
      }}>
        <FloatingParticles />
        <GeometricBackground />
        <div style={{
          width: isModal ? '100%' : '210mm',
          maxWidth: '210mm',
          margin: '0 auto',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 32px 64px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
          position: 'relative',
          zIndex: 1
        }}>
          
          {/* Gradient Overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(59,130,246,0.03) 0%, rgba(139,92,246,0.03) 50%, rgba(236,72,153,0.03) 100%)',
            borderRadius: '24px',
            pointerEvents: 'none',
            zIndex: 0
          }} />
          
          {/* Premium Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #ea580c 100%)',
            padding: '14px 28px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '14px',
            fontWeight: '700',
            position: 'relative',
            zIndex: 1
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={16} />
              <span>Premium Intermediate Template</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={12} />
                <span style={{ fontSize: '11px', opacity: 0.9 }}>Enhanced</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Star size={12} />
                <span style={{ fontSize: '11px', opacity: 0.9 }}>Visual</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <BarChart3 size={12} />
                <span style={{ fontSize: '11px', opacity: 0.9 }}>Analytics</span>
              </div>
            </div>
          </div>
          
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 30%, #155e75 70%, #0c4a6e 100%)',
            padding: '35px',
            color: 'white',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            zIndex: 1
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.05) 0%, transparent 50%)',
              animation: 'float 6s ease-in-out infinite'
            }}></div>
            

            <h1 style={{
              margin: 0,
              fontSize: '36px',
              fontWeight: '900',
              fontFamily: 'Playfair Display, serif',
              textShadow: '0 6px 12px rgba(0,0,0,0.4)',
              position: 'relative',
              zIndex: 2,
              background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'textGlow 3s ease-in-out infinite alternate'
            }}>
              Student Portfolio - Intermediate
            </h1>
          </div>

          {/* Two Column Layout */}
          <div style={{ display: 'flex', minHeight: '500px' }}>
            
            {/* Left Column - Student Info & Progress */}
            <div style={{
              flex: '1',
              padding: '32px',
              background: 'linear-gradient(180deg, rgba(248,250,252,0.8) 0%, rgba(241,245,249,0.8) 100%)',
              backdropFilter: 'blur(10px)',
              borderRight: '2px solid rgba(226,232,240,0.5)',
              position: 'relative',
              zIndex: 1
            }}>
              
              {/* Student Info */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(15px)',
                padding: '28px',
                borderRadius: '20px',
                marginBottom: '28px',
                boxShadow: '0 12px 40px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.3)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.05), rgba(139,92,246,0.05))',
                  borderRadius: '20px',
                  pointerEvents: 'none'
                }} />
                <h3 style={{ 
                  margin: '0 0 24px 0', 
                  fontSize: '22px', 
                  fontWeight: '800',
                  fontFamily: 'Playfair Display, serif',
                  background: 'linear-gradient(135deg, #0891b2, #3b82f6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  position: 'relative',
                  zIndex: 1
                }}>Student Information</h3>
                <p style={{ margin: '14px 0', fontSize: '16px', color: '#1f2937', fontWeight: '600', position: 'relative', zIndex: 1 }}>
                  <strong style={{ 
                    background: 'linear-gradient(135deg, #0891b2, #3b82f6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>Name:</strong> {studentData.name}
                </p>
                <p style={{ margin: '14px 0', fontSize: '16px', color: '#1f2937', fontWeight: '600', position: 'relative', zIndex: 1 }}>
                  <strong style={{ 
                    background: 'linear-gradient(135deg, #0891b2, #3b82f6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>Reg No:</strong> {studentData.regNo}
                </p>
                <p style={{ margin: '14px 0', fontSize: '16px', color: '#1f2937', fontWeight: '600', position: 'relative', zIndex: 1 }}>
                  <strong style={{ 
                    background: 'linear-gradient(135deg, #0891b2, #3b82f6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>Department:</strong> {studentData.department}
                </p>
                <p style={{ margin: '14px 0', fontSize: '16px', color: '#1f2937', fontWeight: '600', position: 'relative', zIndex: 1 }}>
                  <strong style={{ 
                    background: 'linear-gradient(135deg, #0891b2, #3b82f6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>Year:</strong> {studentData.year}
                </p>
              </div>

              {/* Progress Section */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(15px)',
                padding: '28px',
                borderRadius: '20px',
                textAlign: 'center',
                boxShadow: '0 12px 40px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.3)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.05), rgba(236,72,153,0.05))',
                  borderRadius: '20px',
                  pointerEvents: 'none'
                }} />
                <h3 style={{ 
                  margin: '0 0 24px 0', 
                  fontSize: '22px', 
                  fontWeight: '800',
                  fontFamily: 'Playfair Display, serif',
                  background: 'linear-gradient(135deg, #0891b2, #8b5cf6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  position: 'relative',
                  zIndex: 1
                }}>Progress</h3>
                <p style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700', color: '#374151' }}>
                  Level: <span style={{ color: '#0891b2' }}>{studentData.level}</span>
                </p>
                <CircularProgress percentage={progressPercentage} />
                <p style={{ margin: '20px 0 0 0', fontSize: '15px', color: '#6b7280', fontWeight: '600' }}>
                  {studentData.points}/{studentData.maxPoints} points
                </p>
              </div>
            </div>

            {/* Right Column - Achievements */}
            <div style={{ 
              flex: '1.5', 
              padding: '32px',
              position: 'relative',
              zIndex: 1
            }}>
              
              {/* Academics */}
              <div className="achievement-card" style={{
                background: 'rgba(254, 243, 199, 0.6)',
                backdropFilter: 'blur(15px)',
                padding: '28px',
                borderRadius: '20px',
                marginBottom: '24px',
                border: '2px solid rgba(245, 158, 11, 0.3)',
                boxShadow: '0 12px 40px rgba(245, 158, 11, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '15px',
                  background: 'rgba(255,255,255,0.9)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'float 3s ease-in-out infinite'
                }}>
                  <Star size={20} style={{ color: '#f59e0b' }} />
                </div>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(251,191,36,0.1))',
                  borderRadius: '20px',
                  pointerEvents: 'none'
                }} />
                <h3 style={{ 
                  margin: '0 0 18px 0', 
                  fontSize: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontWeight: '800',
                  fontFamily: 'Playfair Display, serif',
                  background: 'linear-gradient(135deg, #92400e, #d97706)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <BookOpen size={24} style={{ filter: 'drop-shadow(0 2px 4px rgba(245,158,11,0.3))' }} /> Academics
                </h3>
                {achievements.academics.map((item, index) => (
                  <div key={index} style={{ 
                    marginBottom: '16px',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.4)',
                    borderRadius: '12px',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    <p style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '700', color: '#78350f' }}>
                      • {item.title}
                    </p>
                    <p style={{ margin: 0, fontSize: '14px', color: '#a16207', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {React.createElement(getStatusIcon(item.statusIcon), { size: 14, style: { color: '#22c55e' } })}
                      {item.status} - {item.date}
                    </p>
                  </div>
                ))}
              </div>

              {/* Extracurricular */}
              <div className="achievement-card" style={{
                background: 'rgba(220, 252, 231, 0.6)',
                backdropFilter: 'blur(15px)',
                padding: '28px',
                borderRadius: '20px',
                marginBottom: '24px',
                border: '2px solid rgba(34, 197, 94, 0.3)',
                boxShadow: '0 12px 40px rgba(34, 197, 94, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '15px',
                  background: 'rgba(255,255,255,0.9)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'float 3s ease-in-out infinite 1s'
                }}>
                  <Target size={20} style={{ color: '#22c55e' }} />
                </div>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(16,185,129,0.1))',
                  borderRadius: '20px',
                  pointerEvents: 'none'
                }} />
                <h3 style={{ 
                  margin: '0 0 18px 0', 
                  fontSize: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontWeight: '800',
                  fontFamily: 'Playfair Display, serif',
                  background: 'linear-gradient(135deg, #166534, #22c55e)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <Users size={24} style={{ filter: 'drop-shadow(0 2px 4px rgba(34,197,94,0.3))' }} /> Extracurricular
                </h3>
                {achievements.extracurricular.map((item, index) => (
                  <div key={index} style={{ 
                    marginBottom: '16px',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.4)',
                    borderRadius: '12px',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    <p style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '700', color: '#14532d' }}>
                      • {item.title}
                    </p>
                    <p style={{ margin: 0, fontSize: '14px', color: '#16a34a', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {React.createElement(getStatusIcon(item.statusIcon), { size: 14, style: { color: item.statusIcon === 'Zap' ? '#f59e0b' : '#22c55e' } })}
                      {item.status} - {item.date}
                    </p>
                  </div>
                ))}
              </div>

              {/* Badges */}
              <div className="achievement-card" style={{
                background: 'rgba(252, 231, 243, 0.6)',
                backdropFilter: 'blur(15px)',
                padding: '28px',
                borderRadius: '20px',
                border: '2px solid rgba(236, 72, 153, 0.3)',
                boxShadow: '0 12px 40px rgba(236, 72, 153, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '15px',
                  background: 'rgba(255,255,255,0.9)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'pulse 2s ease-in-out infinite'
                }}>
                  <Trophy size={20} style={{ color: '#ec4899' }} />
                </div>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(236,72,153,0.1), rgba(219,39,119,0.1))',
                  borderRadius: '20px',
                  pointerEvents: 'none'
                }} />
                <h3 style={{ 
                  margin: '0 0 18px 0', 
                  fontSize: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontWeight: '800',
                  fontFamily: 'Playfair Display, serif',
                  background: 'linear-gradient(135deg, #be185d, #ec4899)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <Trophy size={24} style={{ filter: 'drop-shadow(0 2px 4px rgba(236,72,153,0.3))' }} /> Badges Earned
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', position: 'relative', zIndex: 1 }}>
                  {badges.map((badge, index) => (
                    <span key={index} className="badge-item" style={{
                      background: 'rgba(255, 255, 255, 0.6)',
                      backdropFilter: 'blur(10px)',
                      padding: '10px 18px',
                      borderRadius: '30px',
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#be185d',
                      border: '2px solid rgba(236, 72, 153, 0.3)',
                      boxShadow: '0 6px 16px rgba(236, 72, 153, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}>
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Achievement Summary */}
          <div style={{
            padding: '24px 28px',
            background: 'linear-gradient(135deg, rgba(224,242,254,0.8) 0%, rgba(186,230,253,0.8) 100%)',
            backdropFilter: 'blur(10px)',
            borderTop: '2px solid rgba(8,145,178,0.3)',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1
          }}>
            {[
              { 
                label: 'Achievements', 
                value: achievements.academics.length + achievements.extracurricular.length, 
                icon: Trophy,
                color: '#f59e0b'
              },
              { 
                label: 'Badges', 
                value: badges.length, 
                icon: Star,
                color: '#8b5cf6'
              },
              { 
                label: 'Progress', 
                value: `${Math.round(progressPercentage)}%`, 
                icon: TrendingUp,
                color: '#10b981'
              }
            ].map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} style={{ 
                  textAlign: 'center',
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${stat.color}30`,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = `0 8px 20px ${stat.color}40`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = 'none';
                }}>
                  <IconComponent size={20} style={{ color: stat.color, marginBottom: '8px' }} />
                  <div style={{ 
                    fontSize: '22px', 
                    fontWeight: '900',
                    background: `linear-gradient(135deg, ${stat.color}, ${stat.color}80)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569', fontWeight: '700' }}>{stat.label}</div>
                </div>
              );
            })}
          </div>
          
          {/* Footer */}
          <div style={{
            padding: '18px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(248,250,252,0.8) 0%, rgba(241,245,249,0.8) 100%)',
            backdropFilter: 'blur(10px)',
            position: 'relative',
            zIndex: 1
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Sparkles size={16} style={{ 
                color: '#8b5cf6',
                filter: 'drop-shadow(0 2px 4px rgba(139,92,246,0.3))'
              }} />
              <p style={{ 
                margin: 0, 
                fontSize: '14px', 
                fontWeight: '700',
                background: 'linear-gradient(135deg, #6b7280, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Generated via Smart Student Hub
              </p>
            </div>
          </div>
        </div>

        {/* Share Button */}
        {!isModal && (
          <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000
          }}>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: 'My Portfolio', url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied!');
                }
              }}
              style={{
                width: '50px',
                height: '50px',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(34,197,94,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.1) rotate(5deg)';
                e.target.style.boxShadow = '0 8px 25px rgba(34,197,94,0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1) rotate(0deg)';
                e.target.style.boxShadow = '0 6px 20px rgba(34,197,94,0.4), inset 0 1px 0 rgba(255,255,255,0.2)';
              }}
            >
              <Share2 size={20} />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default IntermediatePortfolio;