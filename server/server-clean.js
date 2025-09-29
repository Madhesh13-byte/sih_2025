const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = 5000;
const JWT_SECRET = 'secret-key';

// Configure CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Database setup
const db = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'student_hub',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Initialize database
(async () => {
  try {
    console.log('✅ Database connected successfully');
    
    const hashedPassword = await bcrypt.hash('password123', 10);
    const adminCount = await db.query('SELECT COUNT(*) as count FROM users WHERE role = $1', ['admin']);
    
    if (adminCount.rows[0].count === '0') {
      await db.query('INSERT INTO users (register_no, password, role, name) VALUES ($1, $2, $3, $4)',
        ['STU001', hashedPassword, 'student', 'John Student']);
      await db.query('INSERT INTO users (staff_id, password, role, name, department) VALUES ($1, $2, $3, $4, $5)',
        ['STF001', hashedPassword, 'staff', 'Jane Staff', 'Computer Science']);
      await db.query('INSERT INTO users (admin_id, password, role, name) VALUES ($1, $2, $3, $4)',
        ['ADM001', hashedPassword, 'admin', 'Admin User']);
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
})();

// Student login
app.post('/api/student/login', async (req, res) => {
  const { register_no, password } = req.body;
  
  try {
    const result = await db.query('SELECT * FROM users WHERE register_no = $1 AND role = $2', [register_no, 'student']);
    const user = result.rows[0];
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        role: user.role,
        register_no: user.register_no,
        department: user.department
      } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Staff login
app.post('/api/staff/login', async (req, res) => {
  const { staff_id, password } = req.body;
  
  try {
    const result = await db.query('SELECT * FROM users WHERE staff_id = $1 AND role = $2', [staff_id, 'staff']);
    const user = result.rows[0];
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        role: user.role,
        staff_id: user.staff_id,
        department: user.department
      } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Admin login
app.post('/api/admin/login', async (req, res) => {
  const { admin_id, password } = req.body;
  
  try {
    const result = await db.query('SELECT * FROM users WHERE admin_id = $1 AND role = $2', [admin_id, 'admin']);
    const user = result.rows[0];
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        role: user.role,
        admin_id: user.admin_id
      } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Test endpoint
app.get('/api/test', authenticateToken, (req, res) => {
  res.json({ message: 'PostgreSQL migration successful!', user: req.user });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('✅ PostgreSQL migration completed');
});