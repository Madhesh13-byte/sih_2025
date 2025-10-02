// server-new.js - Restructured main server file (MVC Pattern)
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const puppeteer = require('puppeteer');
const setupPortfolioRoutes = require('./portfolioRoutes');
require('dotenv').config();

const db = require('./config/database');
const initRoutes = require('./routes');

const app = express();
const PORT = 5000;

// Configure CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Database initialization
(async () => {
  try {
    console.log('✅ Database connected successfully');
    
    const hashedPassword = await bcrypt.hash('password123', 10);
    const adminCount = await db.query('SELECT COUNT(*) as count FROM users WHERE role = $1', ['admin']);
    
    if (adminCount.rows[0].count === '0') {
      // Create sample students
      const students = [
        ['STU001', 'John Student', 'Computer Science'],
        ['STU002', 'Alice Johnson', 'Information Technology'],
        ['STU003', 'Bob Smith', 'Electronics'],
        ['STU004', 'Carol Davis', 'Computer Science'],
        ['STU005', 'David Wilson', 'Information Technology'],
        ['STU006', 'Emma Brown', 'Mechanical'],
        ['STU007', 'Frank Miller', 'Civil'],
        ['STU008', 'Grace Lee', 'Computer Science'],
        ['STU009', 'Henry Taylor', 'Electronics'],
        ['STU010', 'Ivy Chen', 'Information Technology']
      ];
      
      for (const [regNo, name, dept] of students) {
        await db.query('INSERT INTO users (register_no, password, role, name, department) VALUES ($1, $2, $3, $4, $5)',
          [regNo, hashedPassword, 'student', name, dept]);
      }
      
      await db.query('INSERT INTO users (staff_id, password, role, name, department) VALUES ($1, $2, $3, $4, $5)',
        ['STF001', hashedPassword, 'staff', 'Jane Staff', 'Computer Science']);
      await db.query('INSERT INTO users (admin_id, password, role, name) VALUES ($1, $2, $3, $4)',
        ['ADM001', hashedPassword, 'admin', 'Admin User']);
        
      // Create certificates table and add sample certificates
      await db.query(`
        CREATE TABLE IF NOT EXISTS certificates (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          certificate_name VARCHAR(255) NOT NULL,
          upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          status VARCHAR(20) DEFAULT 'pending'
        )
      `);
      
      // Add sample certificates for some students
      const userIds = await db.query('SELECT id FROM users WHERE role = $1 ORDER BY id', ['student']);
      if (userIds.rows.length > 0) {
        const certificates = [
          'AWS Cloud Practitioner',
          'Google Analytics Certified',
          'Microsoft Azure Fundamentals',
          'Python Programming Certificate',
          'React Development Course',
          'Data Science Fundamentals',
          'Cybersecurity Basics',
          'Machine Learning Certificate'
        ];
        
        // Distribute certificates randomly among students
        for (let i = 0; i < userIds.rows.length; i++) {
          const userId = userIds.rows[i].id;
          const certCount = Math.floor(Math.random() * 6) + 1;
          
          for (let j = 0; j < certCount; j++) {
            const certName = certificates[Math.floor(Math.random() * certificates.length)];
            await db.query(
              'INSERT INTO certificates (user_id, certificate_name) VALUES ($1, $2)',
              [userId, `${certName} - ${j + 1}`]
            );
          }
        }
      }
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
})();

// Initialize routes with database connection
app.use('/api', initRoutes(db));

// Setup portfolio routes
setupPortfolioRoutes(app, require('./middleware/auth').authenticateToken, db);

app.listen(PORT, () => {
  console.log(`✅ MVC Server running on port ${PORT}`);
});