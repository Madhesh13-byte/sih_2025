import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const PortfolioVerification = () => {
  const portfolioId = window.location.pathname.split('/verify/')[1];
  const [verificationStatus, setVerificationStatus] = useState('verifying');
  const [portfolioData, setPortfolioData] = useState(null);

  useEffect(() => {
    const verifyPortfolio = async () => {
      try {
        const response = await fetch(`/api/verify-portfolio/${portfolioId}`);
        if (response.ok) {
          const data = await response.json();
          setPortfolioData(data);
          setVerificationStatus('verified');
        } else {
          setVerificationStatus('invalid');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setVerificationStatus('invalid');
      }
    };

    if (portfolioId) {
      verifyPortfolio();
    } else {
      setVerificationStatus('invalid');
    }
  }, [portfolioId]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%'
      }}>
        {verificationStatus === 'verifying' && (
          <>
            <div style={{
              width: '60px',
              height: '60px',
              border: '4px solid #065f46',
              borderTop: '4px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <h2 style={{ color: '#065f46', marginBottom: '10px' }}>Verifying Portfolio</h2>
            <p style={{ color: '#666' }}>Please wait while we verify the portfolio authenticity...</p>
          </>
        )}

        {verificationStatus === 'verified' && portfolioData && (
          <>
            <CheckCircle size={60} style={{ color: '#10b981', margin: '0 auto 20px' }} />
            <h2 style={{ color: '#065f46', marginBottom: '10px' }}>Portfolio Verified ✓</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              This portfolio has been successfully verified as authentic.
            </p>
            <div style={{
              background: '#f0fdf4',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #bbf7d0',
              textAlign: 'left'
            }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#065f46' }}>
                <strong>Student Name:</strong> {portfolioData.userName}
              </p>
              <p style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#065f46' }}>
                <strong>Portfolio Level:</strong> {portfolioData.portfolioType}
              </p>
              <p style={{ margin: 0, fontSize: '14px', color: '#065f46' }}>
                <strong>Portfolio ID:</strong> {portfolioId}
              </p>
            </div>
          </>
        )}

        {verificationStatus === 'invalid' && (
          <>
            <XCircle size={60} style={{ color: '#ef4444', margin: '0 auto 20px' }} />
            <h2 style={{ color: '#dc2626', marginBottom: '10px' }}>Invalid Portfolio</h2>
            <p style={{ color: '#666' }}>
              This portfolio ID could not be verified. Please check the QR code and try again.
            </p>
          </>
        )}

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default PortfolioVerification;