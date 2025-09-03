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
    email TEXT,
    department TEXT,
    created_by INTEGER,
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

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Create student account
app.post('/api/admin/create-student', authenticateToken, requireAdmin, async (req, res) => {
  const { register_no, name, email, password, department } = req.body;
  
  if (!register_no || !name || !password) {
    return res.status(400).json({ error: 'Register No, Name, and Password are required' });
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  db.run('INSERT INTO users (register_no, name, email, password, role, department, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [register_no, name, email || null, hashedPassword, 'student', department, req.user.id], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Register number already exists' });
        }
        return res.status(500).json({ error: 'Failed to create student account' });
      }
      res.json({ message: 'Student account created successfully', studentId: this.lastID });
    });
});

// Create staff account
app.post('/api/admin/create-staff', authenticateToken, requireAdmin, async (req, res) => {
  const { staff_id, name, email, password, department } = req.body;
  
  if (!staff_id || !name || !password) {
    return res.status(400).json({ error: 'Staff ID, Name, and Password are required' });
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  db.run('INSERT INTO users (staff_id, name, email, password, role, department, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [staff_id, name, email || null, hashedPassword, 'staff', department || null, req.user.id], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Staff ID already exists' });
        }
        return res.status(500).json({ error: 'Failed to create staff account' });
      }
      res.json({ message: 'Staff account created successfully', staffId: this.lastID });
    });
});

// Get next staff number for department and year
app.get('/api/admin/next-staff-number', authenticateToken, requireAdmin, (req, res) => {
  const { dept, year } = req.query;
  
  if (!dept || !year) {
    return res.status(400).json({ error: 'Department and year are required' });
  }
  
  const yearCode = year.toString().slice(-2);
  const pattern = `STF${dept}${yearCode}%`;
  
  db.all('SELECT staff_id FROM users WHERE staff_id LIKE ? AND role = ? ORDER BY staff_id',
    [pattern, 'staff'], (err, staff) => {
      if (err) return res.status(500).json({ error: 'Failed to get staff count' });
      
      // Find the next available number
      let nextNumber = 1;
      if (staff.length > 0) {
        const lastStaff = staff[staff.length - 1];
        const lastNumber = parseInt(lastStaff.staff_id.slice(-2));
        nextNumber = lastNumber + 1;
      }
      
      res.json({ nextNumber });
    });
});

// Get next student number for department and year
app.get('/api/admin/next-student-number', authenticateToken, requireAdmin, (req, res) => {
  const { dept, year } = req.query;
  
  if (!dept || !year) {
    return res.status(400).json({ error: 'Department and year are required' });
  }
  
  const yearCode = year.toString().slice(-2);
  const pattern = `STU${dept}${yearCode}%`;
  
  db.all('SELECT register_no FROM users WHERE register_no LIKE ? AND role = ? ORDER BY register_no',
    [pattern, 'student'], (err, students) => {
      if (err) return res.status(500).json({ error: 'Failed to get student count' });
      
      // Find the next available number
      let nextNumber = 1;
      if (students.length > 0) {
        const lastStudent = students[students.length - 1];
        const lastNumber = parseInt(lastStudent.register_no.slice(-2));
        nextNumber = lastNumber + 1;
      }
      
      res.json({ nextNumber });
    });
});

// Get all accounts
app.get('/api/admin/accounts', authenticateToken, requireAdmin, (req, res) => {
  db.all('SELECT id, register_no, staff_id, name, email, role, department, created_at FROM users WHERE role IN (?, ?)',
    ['student', 'staff'], (err, accounts) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch accounts' });
      res.json(accounts);
    });
});

// Delete account
app.delete('/api/admin/delete-account/:id', authenticateToken, requireAdmin, (req, res) => {
  const userId = req.params.id;
  
  db.run('DELETE FROM users WHERE id = ? AND role IN (?, ?)',
    [userId, 'student', 'staff'], function(err) {
      if (err) return res.status(500).json({ error: 'Failed to delete account' });
      if (this.changes === 0) return res.status(404).json({ error: 'Account not found' });
      res.json({ message: 'Account deleted successfully' });
    });
});

// Edit account
app.put('/api/admin/edit-account/:id', authenticateToken, requireAdmin, (req, res) => {
  const { name, email, department } = req.body;
  const userId = req.params.id;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  db.run('UPDATE users SET name = ?, email = ?, department = ? WHERE id = ? AND role IN (?, ?)',
    [name, email || null, department || null, userId, 'student', 'staff'], function(err) {
      if (err) return res.status(500).json({ error: 'Failed to update account' });
      if (this.changes === 0) return res.status(404).json({ error: 'Account not found' });
      res.json({ message: 'Account updated successfully' });
    });
});

// Reset password
app.put('/api/admin/reset-password/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { password } = req.body;
  const userId = req.params.id;
  
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  db.run('UPDATE users SET password = ? WHERE id = ? AND role IN (?, ?)',
    [hashedPassword, userId, 'student', 'staff'], function(err) {
      if (err) return res.status(500).json({ error: 'Failed to reset password' });
      if (this.changes === 0) return res.status(404).json({ error: 'User not found' });
      res.json({ message: 'Password reset successfully' });
    });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});