import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const QRCodeGenerator = ({ user, portfolioType = 'Academic' }) => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateQR = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ portfolioType })
      });

      if (response.ok) {
        const data = await response.json();
        setQrData(data);
      } else {
        console.error('Failed to generate portfolio');
      }
    } catch (error) {
      console.error('Error generating QR:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (portfolioType && !qrData) {
      generateQR();
    }
  }, [portfolioType]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div style={{ color: '#666' }}>Generating QR Code...</div>
      </div>
    );
  }

  if (!qrData) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <button 
          onClick={generateQR}
          style={{
            padding: '10px 20px',
            background: '#065f46',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Generate QR Code
        </button>
      </div>
    );
  }

  return (
    <div style={{
      textAlign: 'center',
      padding: '15px',
      background: 'white',
      border: '2px solid #065f46',
      borderRadius: '10px',
      margin: '10px 0'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#065f46', fontSize: '14px' }}>
        Verification QR Code
      </h4>
      <QRCodeSVG 
        value={qrData.verificationUrl}
        size={120}
        level="M"
        includeMargin={true}
      />
      <p style={{ 
        margin: '10px 0 5px 0', 
        fontSize: '11px', 
        color: '#666',
        wordBreak: 'break-all'
      }}>
        ID: {qrData.portfolioId}
      </p>
      <p style={{ 
        margin: '0', 
        fontSize: '10px', 
        color: '#888'
      }}>
        Scan to verify authenticity
      </p>
    </div>
  );
};

export default QRCodeGenerator;