import React, { useState, useCallback } from 'react';
import { FileText, Star, Award, Download } from 'lucide-react';
import BeginnerPortfolio from './portfolio_temp/BeginnerPortfolio';
import IntermediatePortfolio from './portfolio_temp/IntermediatePortfolio';

const PortfolioSection = ({ user }) => {
  const [activePortfolio, setActivePortfolio] = useState('beginner');
  const [downloadFunction, setDownloadFunction] = useState(null);

  const portfolioTypes = [
    { id: 'beginner', label: 'Beginner', icon: FileText, color: '#065f46' },
    { id: 'intermediate', label: 'Intermediate', icon: Star, color: '#0369a1' },
    { id: 'advanced', label: 'Advanced', icon: Award, color: '#7c2d12' }
  ];

  const handleDownloadFunction = useCallback((fn) => {
    setDownloadFunction(() => fn);
  }, []);

  const renderPortfolio = () => {
    switch (activePortfolio) {
      case 'beginner':
        return <BeginnerPortfolio user={user} isModal={false} onDownload={handleDownloadFunction} />;
      case 'intermediate':
        return <IntermediatePortfolio user={user} isModal={false} onDownload={handleDownloadFunction} />;
      case 'advanced':
        return (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #fef3c7 0%, #f59e0b 100%)',
            borderRadius: '12px',
            margin: '20px'
          }}>
            <Award size={64} style={{ color: '#7c2d12', marginBottom: '20px' }} />
            <h2 style={{ color: '#7c2d12', marginBottom: '10px' }}>Advanced Portfolio</h2>
            <p style={{ color: '#92400e' }}>Coming Soon - Premium Advanced Template</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '20px 0'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '30px',
        padding: '0 20px'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#1e293b',
          marginBottom: '10px'
        }}>
          Portfolio Templates
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#64748b',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Choose from our collection of professional portfolio templates
        </p>
      </div>

      {/* Toggle Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '15px',
        marginBottom: '30px',
        padding: '0 20px',
        flexWrap: 'wrap'
      }}>
        {portfolioTypes.map((type) => {
          const Icon = type.icon;
          const isActive = activePortfolio === type.id;
          
          return (
            <button
              key={type.id}
              onClick={() => setActivePortfolio(type.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                border: `2px solid ${type.color}`,
                borderRadius: '25px',
                background: isActive ? type.color : 'white',
                color: isActive ? 'white' : type.color,
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: isActive ? `0 4px 12px ${type.color}40` : '0 2px 8px rgba(0,0,0,0.1)',
                transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                minWidth: '140px',
                justifyContent: 'center'
              }}
              onMouseOver={(e) => {
                if (!isActive) {
                  e.target.style.background = `${type.color}10`;
                  e.target.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseOut={(e) => {
                if (!isActive) {
                  e.target.style.background = 'white';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              <Icon size={18} />
              {type.label}
            </button>
          );
        })}
      </div>

      {/* Portfolio Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {renderPortfolio()}
      </div>

      {/* Centralized Download Button */}
      {downloadFunction && activePortfolio !== 'advanced' && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000
        }}>
          <button
            onClick={async () => {
              if (downloadFunction && typeof downloadFunction === 'function') {
                const actualFunction = downloadFunction();
                if (actualFunction && typeof actualFunction === 'function') {
                  await actualFunction();
                }
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 24px',
              background: activePortfolio === 'beginner' 
                ? 'linear-gradient(135deg, #065f46, #10b981)' 
                : 'linear-gradient(135deg, #0891b2, #0e7490)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '700',
              boxShadow: activePortfolio === 'beginner'
                ? '0 8px 25px rgba(6, 95, 70, 0.4)'
                : '0 8px 25px rgba(8, 145, 178, 0.4)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px) scale(1.05)';
              e.target.style.boxShadow = activePortfolio === 'beginner'
                ? '0 12px 30px rgba(6, 95, 70, 0.5)'
                : '0 12px 30px rgba(8, 145, 178, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = activePortfolio === 'beginner'
                ? '0 8px 25px rgba(6, 95, 70, 0.4)'
                : '0 8px 25px rgba(8, 145, 178, 0.4)';
            }}
          >
            <Download size={18} />
            Download {activePortfolio.charAt(0).toUpperCase() + activePortfolio.slice(1)} PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default PortfolioSection;