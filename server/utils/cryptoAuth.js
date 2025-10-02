// utils/cryptoAuth.js - Cryptographic authentication utilities
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// College's secret key (in production, use environment variable)
const COLLEGE_PRIVATE_KEY = process.env.PORTFOLIO_SECRET || 'college-secret-key-2024';
const COLLEGE_NAME = 'XYZ College of Engineering';

class CryptoAuth {
  // Generate signed portfolio token
  static generatePortfolioToken(portfolioData) {
    const payload = {
      // Portfolio data
      studentId: portfolioData.studentId,
      studentName: portfolioData.studentName,
      department: portfolioData.department,
      portfolioType: portfolioData.portfolioType,
      achievements: portfolioData.achievements,
      
      // Authentication data (deterministic)
      issuer: COLLEGE_NAME,
      portfolioId: `${portfolioData.studentId}_${portfolioData.portfolioType}`, // Deterministic ID
      
      // Security data
      portfolioHash: this.generateHash(portfolioData)
    };

    // Sign with college's private key (no expiration for deterministic tokens)
    const token = jwt.sign(payload, COLLEGE_PRIVATE_KEY, {
      algorithm: 'HS256'
    });

    return token;
  }

  // Verify portfolio token
  static verifyPortfolioToken(token) {
    try {
      const decoded = jwt.verify(token, COLLEGE_PRIVATE_KEY);
      
      // Additional checks
      if (decoded.issuer !== COLLEGE_NAME) {
        throw new Error('Invalid issuer');
      }

      return {
        valid: true,
        data: decoded,
        message: 'Portfolio verified successfully'
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
        message: 'Portfolio verification failed'
      };
    }
  }

  // Generate hash of portfolio data
  static generateHash(data) {
    const dataString = JSON.stringify(data);
    return crypto.createHash('sha256').update(dataString).digest('hex');
  }

  // Generate verification URL
  static generateVerificationUrl(token) {
    return `http://localhost:5000/api/verify-portfolio?token=${token}`;
  }
}

module.exports = CryptoAuth;