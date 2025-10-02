// routes/portfolio.js - Portfolio routes
const express = require('express');
const puppeteer = require('puppeteer');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const initPortfolioRoutes = (db) => {
  // Generate QR Code for Portfolio Verification (Cryptographic)
  router.post('/generate-portfolio', authenticateToken, async (req, res) => {
    try {
      const { portfolioType } = req.body;
      const userId = req.user.id;
      
      // Get user details
      const userResult = await db.query('SELECT name, register_no, department FROM users WHERE id = $1', [userId]);
      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const userData = userResult.rows[0];
      
      // Get user's achievements/certificates
      let achievements = [];
      try {
        const certResult = await db.query('SELECT certificate_name, upload_date, status FROM certificates WHERE user_id = $1 AND status = $2', [userId, 'approved']);
        achievements = certResult.rows;
      } catch (error) {
        console.log('No certificates found');
      }
      
      // Prepare portfolio data (deterministic - no timestamps)
      const portfolioData = {
        studentId: userData.register_no,
        studentName: userData.name,
        department: userData.department,
        portfolioType: portfolioType,
        achievements: achievements
      };
      
      // Generate cryptographically signed token
      const CryptoAuth = require('../utils/cryptoAuth');
      const signedToken = CryptoAuth.generatePortfolioToken(portfolioData);
      const verificationUrl = CryptoAuth.generateVerificationUrl(signedToken);
      
      console.log(`🔐 Generated cryptographic portfolio for ${userData.name}`);
      
      res.json({
        portfolioId: `CRYPTO_${userId}`,
        verificationUrl,
        portfolioType,
        signedToken,
        security: 'cryptographically_signed'
      });
    } catch (error) {
      console.error('❌ Cryptographic portfolio generation error:', error.message);
      res.status(500).json({ error: 'Portfolio generation failed: ' + error.message });
    }
  });

  // Verify Portfolio (Cryptographic) - HTML Page
  router.get('/verify-portfolio', async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token) {
        return res.send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Portfolio Verification</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
              .error { background: #fee; border: 1px solid #fcc; padding: 20px; border-radius: 8px; color: #c33; }
            </style>
          </head>
          <body>
            <h1>Portfolio Verification</h1>
            <div class="error">
              <h2>❌ Verification Failed</h2>
              <p>No verification token provided.</p>
            </div>
          </body>
          </html>
        `);
      }
      
      console.log('🔐 Verifying cryptographic portfolio token');
      
      // Verify cryptographic signature
      const CryptoAuth = require('../utils/cryptoAuth');
      const verification = CryptoAuth.verifyPortfolioToken(token);
      
      if (!verification.valid) {
        console.log('❌ Portfolio verification failed:', verification.error);
        return res.send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Portfolio Verification Failed</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
              .error { background: #fee; border: 1px solid #fcc; padding: 20px; border-radius: 8px; color: #c33; }
            </style>
          </head>
          <body>
            <h1>Portfolio Verification</h1>
            <div class="error">
              <h2>❌ Authentication Failed</h2>
              <p><strong>Error:</strong> ${verification.error}</p>
              <p>This portfolio could not be verified. It may be fake, expired, or tampered with.</p>
            </div>
          </body>
          </html>
        `);
      }
      
      const portfolioData = verification.data;
      console.log('✅ Portfolio verified successfully for:', portfolioData.studentName);
      
      // Return HTML verification page
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Portfolio Verified - ${portfolioData.studentName}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; background: #f5f5f5; }
            .container { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .success { background: #efe; border: 1px solid #cfc; padding: 20px; border-radius: 8px; color: #363; margin-bottom: 20px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
            .info-item { background: #f8f9fa; padding: 15px; border-radius: 6px; }
            .achievements { margin-top: 20px; }
            .achievement { background: #e3f2fd; padding: 10px; margin: 5px 0; border-radius: 4px; border-left: 4px solid #2196f3; }
            .security { background: #f3e5f5; padding: 15px; border-radius: 6px; margin-top: 20px; }
            h1 { color: #2c3e50; }
            h2 { color: #34495e; }
            .verified-badge { background: #4caf50; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success">
              <h2>✅ Portfolio Verified Successfully</h2>
              <p>This portfolio has been cryptographically verified and is authentic.</p>
            </div>
            
            <h1>Student Portfolio <span class="verified-badge">VERIFIED</span></h1>
            
            <div class="info-grid">
              <div class="info-item">
                <strong>Student Name:</strong><br>
                ${portfolioData.studentName}
              </div>
              <div class="info-item">
                <strong>Student ID:</strong><br>
                ${portfolioData.studentId}
              </div>
              <div class="info-item">
                <strong>Department:</strong><br>
                ${portfolioData.department}
              </div>
              <div class="info-item">
                <strong>Portfolio Type:</strong><br>
                ${portfolioData.portfolioType.toUpperCase()}
              </div>
            </div>
            
            <div class="info-item">
              <strong>Issued By:</strong> ${portfolioData.issuer}<br>
              <strong>Issue Date:</strong> ${new Date(portfolioData.issuedAt).toLocaleDateString()}
            </div>
            
            ${portfolioData.achievements && portfolioData.achievements.length > 0 ? `
              <div class="achievements">
                <h2>Verified Achievements</h2>
                ${portfolioData.achievements.map(achievement => `
                  <div class="achievement">
                    📜 ${achievement.certificate_name}
                    <small style="float: right; color: #666;">
                      ${new Date(achievement.upload_date).toLocaleDateString()}
                    </small>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            <div class="security">
              <h3>🔐 Security Information</h3>
              <p><strong>Authentication Method:</strong> Cryptographic Digital Signature</p>
              <p><strong>Algorithm:</strong> HS256 (HMAC SHA-256)</p>
              <p><strong>Status:</strong> ✅ Signature Valid</p>
              <p><strong>Tamper Detection:</strong> ✅ No Tampering Detected</p>
            </div>
            
            <p style="text-align: center; color: #666; margin-top: 30px; font-size: 14px;">
              This verification was performed on ${new Date().toLocaleString()}
            </p>
          </div>
        </body>
        </html>
      `);
    } catch (error) {
      console.error('❌ Cryptographic verification error:', error.message);
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Verification Error</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .error { background: #fee; border: 1px solid #fcc; padding: 20px; border-radius: 8px; color: #c33; }
          </style>
        </head>
        <body>
          <h1>Portfolio Verification</h1>
          <div class="error">
            <h2>❌ System Error</h2>
            <p>Verification system encountered an error: ${error.message}</p>
          </div>
        </body>
        </html>
      `);
    }
  });

  // Generate Beginner Portfolio PDF
  router.post('/generate-beginner-portfolio-pdf', authenticateToken, async (req, res) => {
    const { studentData, certificates } = req.body;
    
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page { size: A4; margin: 0.5in; }
    body { font-family: 'Roboto', sans-serif; margin: 0; color: #333; }
    .container { border: 2px solid #065f46; background: #fefdf8; }
    .header { padding: 20px; border-bottom: 2px solid #065f46; text-align: center; }
    h1 { margin: 0; font-size: 24px; color: #065f46; font-weight: bold; }
    .student-info { padding: 20px; border-bottom: 1px solid #d6f5d6; display: flex; justify-content: space-between; }
    .certificates { padding: 20px; border-bottom: 1px solid #d6f5d6; }
    .cert-item { padding: 15px 0; border-bottom: 1px solid #f0fdf4; }
    .cert-item:last-child { border-bottom: none; }
    .progress-section { padding: 20px; border-bottom: 1px solid #d6f5d6; }
    .progress-bar { width: 100%; height: 20px; background: #f0fdf4; border-radius: 10px; overflow: hidden; }
    .progress-fill { height: 100%; background: #065f46; }
    .footer { padding: 20px; text-align: center; background: #f0fdf4; }
    h2 { color: #065f46; }
    p strong { color: #065f46; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Student Portfolio</h1>
    </div>
    
    <div class="student-info">
      <div>
        <p><strong>Student Name:</strong> ${studentData.name}</p>
        <p><strong>Department:</strong> ${studentData.department}</p>
      </div>
      <div>
        <p><strong>Reg No:</strong> ${studentData.regNo}</p>
        <p><strong>Year:</strong> ${studentData.year}</p>
      </div>
    </div>
    
    <div class="certificates">
      <h2 style="margin: 0 0 15px 0; font-size: 18px;">Certificates & Achievements</h2>
      ${certificates.map(cert => `
        <div class="cert-item">
          <p style="margin: 0 0 5px 0; font-weight: bold;">- Certificate: "${cert.title}"</p>
          <p style="margin: 0; font-size: 14px; color: #666;">Date: ${cert.date} &nbsp;&nbsp;&nbsp; Status: ${cert.status} <span style="color: #22c55e; font-weight: bold;">✓</span></p>
        </div>
      `).join('')}
    </div>
    
    <div class="progress-section">
      <p style="margin: 0 0 10px 0; font-weight: bold;">Level: ${studentData.level} (${studentData.points} Points)</p>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${(studentData.points / studentData.maxPoints) * 100}%;"></div>
      </div>
      <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">${studentData.points}/${studentData.maxPoints} points to next level</p>
    </div>
    
    <div class="footer">
      <p style="margin: 0; font-size: 14px; color: #666;">Auto-generated on Smart Student Hub</p>
    </div>
  </div>
</body>
</html>`;
    
    try {
      const browser = await puppeteer.launch({ 
        headless: true, 
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        timeout: 60000
      });
      const page = await browser.newPage();
      page.setDefaultTimeout(60000);
      
      await page.setContent(htmlContent, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });
      
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' }
      });
      
      await browser.close();
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${studentData.name.replace(/\\s+/g, '_')}_Beginner_Portfolio.pdf"`);
      res.end(pdf, 'binary');
    } catch (error) {
      console.error('Beginner PDF generation error:', error);
      res.status(500).json({ error: 'PDF generation failed' });
    }
  });

  return router;
};

module.exports = initPortfolioRoutes;