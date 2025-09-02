const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 5000;
const JWT_SECRET = 'secret-key';

app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./database.db');

db.serialize(() => {
  // Drop existing table and recreate with correct structure
  db.run('DROP TABLE IF EXISTS users');
  
  db.run(`CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    register_no TEXT UNIQUE,
    staff_id TEXT UNIQUE,
    admin_id TEXT UNIQUE,
    password TEXT,
    role TEXT,
    name TEXT,
    department TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  // Insert default users
  const hashedPassword = bcrypt.hashSync('password123', 10);
  
  // Student
  db.run('INSERT INTO users (register_no, password, role, name) VALUES (?, ?, ?, ?)',
    ['STU001', hashedPassword, 'student', 'John Student']);
  
  // Staff
  db.run('INSERT INTO users (staff_id, password, role, name, department) VALUES (?, ?, ?, ?, ?)',
    ['STF001', hashedPassword, 'staff', 'Jane Staff', 'Computer Science']);
  
  // Admin
  db.run('INSERT INTO users (admin_id, password, role, name) VALUES (?, ?, ?, ?)',
    ['ADM001', hashedPassword, 'admin', 'Admin User']);
});

// Student login
app.post('/api/student/login', (req, res) => {
  const { register_no, password } = req.body;
  
  db.get('SELECT * FROM users WHERE register_no = ? AND role = ?', [register_no, 'student'], async (err, user) => {
    if (err || !user) {
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
        register_no: user.register_no
      } 
    });
  });
});

// Staff login
app.post('/api/staff/login', (req, res) => {
  const { staff_id, password } = req.body;
  
  db.get('SELECT * FROM users WHERE staff_id = ? AND role = ?', [staff_id, 'staff'], async (err, user) => {
    if (err || !user) {
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
  });
});

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { admin_id, password } = req.body;
  
  db.get('SELECT * FROM users WHERE admin_id = ? AND role = ?', [admin_id, 'admin'], async (err, user) => {
    if (err || !user) {
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
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});