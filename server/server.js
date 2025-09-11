const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'secret-key';

// Configure CORS with specific options
app.use(cors({
  origin: 'http://localhost:3000', // React app's URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Database setup
const db = new sqlite3.Database('./database.db');

db.serialize(() => {
  // Create table only if it doesn't exist
  db.run(`CREATE TABLE IF NOT EXISTS users (
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

  // Staff assignments table
  db.run(`CREATE TABLE IF NOT EXISTS staff_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    staff_id TEXT NOT NULL,
    staff_name TEXT NOT NULL,
    subject_code TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    department TEXT NOT NULL,
    year TEXT NOT NULL,
    semester TEXT NOT NULL,
    section TEXT DEFAULT 'A',
    credits INTEGER DEFAULT 3,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // CC assignments table
  db.run(`CREATE TABLE IF NOT EXISTS cc_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    staff_id TEXT NOT NULL,
    staff_name TEXT NOT NULL,
    department TEXT NOT NULL,
    year TEXT NOT NULL,
    semester TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Classes table
  db.run(`CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    department TEXT NOT NULL,
    year TEXT NOT NULL,
    section TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create subjects table if it doesn't exist
  db.run(`CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_code TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    department TEXT NOT NULL,
    year TEXT NOT NULL,
    semester TEXT NOT NULL,
    credits INTEGER DEFAULT 3,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(subject_code, department, year, semester)
  )`);

  // Admin notifications table
  db.run(`CREATE TABLE IF NOT EXISTS admin_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    related_id INTEGER,
    read_status INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Admin settings table
  db.run(`CREATE TABLE IF NOT EXISTS admin_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Timetables table
  db.run(`CREATE TABLE IF NOT EXISTS timetables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    department TEXT NOT NULL,
    year TEXT NOT NULL,
    semester TEXT NOT NULL,
    section TEXT NOT NULL,
    day_of_week INTEGER NOT NULL,
    period_number INTEGER NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    subject_code TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    staff_id TEXT NOT NULL,
    staff_name TEXT NOT NULL,
    room_number TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(department, year, semester, section, day_of_week, period_number)
  )`);

  // Attendance table
  db.run(`CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    staff_id TEXT NOT NULL,
    subject_code TEXT NOT NULL,
    department TEXT NOT NULL,
    year TEXT NOT NULL,
    semester TEXT NOT NULL,
    day_of_week INTEGER NOT NULL,
    period_number INTEGER NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL,
    marked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, subject_code, date, period_number)
  )`);

  // Insert default settings
  db.run(`INSERT OR IGNORE INTO admin_settings (setting_key, setting_value) VALUES (?, ?)`,
    ['auto_create_classes', 'true']);

  // Add columns if they don't exist
  db.run(`ALTER TABLE cc_assignments ADD COLUMN semester TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding semester column:', err);
    }
  });
  
  db.run(`ALTER TABLE users ADD COLUMN class_id INTEGER`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding class_id column to users:', err);
    }
  });
  
  db.run(`ALTER TABLE users ADD COLUMN joining_year INTEGER`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding joining_year column to users:', err);
    }
  });
  
  db.run(`ALTER TABLE users ADD COLUMN current_semester INTEGER`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding current_semester column to users:', err);
    }
  });
  
  db.run(`ALTER TABLE users ADD COLUMN academic_year TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding academic_year column to users:', err);
    }
  });
  
  db.run(`ALTER TABLE grades ADD COLUMN academic_year TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding academic_year column to grades:', err);
    }
  });
  
  db.run(`ALTER TABLE staff_assignments ADD COLUMN section TEXT DEFAULT 'A'`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding section column to staff_assignments:', err);
    }
  });
  
  db.run(`ALTER TABLE staff_assignments ADD COLUMN credits INTEGER DEFAULT 3`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding credits column to staff_assignments:', err);
    }
  });
  
  // Migrate existing subjects from staff_assignments to subjects table (admin will set credits)
  db.all('SELECT DISTINCT subject_code, subject_name, department, year, semester FROM staff_assignments', (err, assignments) => {
    if (!err && assignments && assignments.length > 0) {
      assignments.forEach(assignment => {
        db.run('INSERT OR IGNORE INTO subjects (subject_code, subject_name, department, year, semester, credits) VALUES (?, ?, ?, ?, ?, ?)',
          [assignment.subject_code, assignment.subject_name, assignment.department, assignment.year, assignment.semester, 3],
          (err) => {
            if (err && !err.message.includes('UNIQUE constraint failed')) {
              console.error('Migration error for subject:', assignment.subject_code, err);
            }
          }
        );
      });
      console.log('✅ Migrated', assignments.length, 'subjects - Admin needs to set proper credits');
    }
  });
  
  // Insert default users only if they don't exist
  const hashedPassword = bcrypt.hashSync('password123', 10);
  
  // Check if admin exists, if not create default users
  db.get('SELECT COUNT(*) as count FROM users WHERE role = ?', ['admin'], (err, row) => {
    if (!err && row.count === 0) {
      // Student
      db.run('INSERT INTO users (register_no, password, role, name) VALUES (?, ?, ?, ?)',
        ['STU001', hashedPassword, 'student', 'John Student']);
      
      // Staff
      db.run('INSERT INTO users (staff_id, password, role, name, department) VALUES (?, ?, ?, ?, ?)',
        ['STF001', hashedPassword, 'staff', 'Jane Staff', 'Computer Science']);
      
      // Admin
      db.run('INSERT INTO users (admin_id, password, role, name) VALUES (?, ?, ?, ?)',
        ['ADM001', hashedPassword, 'admin', 'Admin User']);
    }
  });
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
        register_no: user.register_no,
        department: user.department
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
  const { register_no, name, email, password, department, year } = req.body;
  
  if (!register_no || !name || !password) {
    return res.status(400).json({ error: 'Register No, Name, and Password are required' });
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const joiningYear = year ? 2000 + parseInt(year) : null;
  
  try {
    const { autoAssignStudentClass, rollbackClassCreation } = require('./utils/businessLogic');
    
    // Check auto-creation setting
    const autoCreateEnabled = await new Promise((resolve, reject) => {
      db.get('SELECT setting_value FROM admin_settings WHERE setting_key = ?', 
        ['auto_create_classes'], (err, row) => {
          if (err) reject(err);
          else resolve(row ? row.setting_value === 'true' : true);
        });
    });
    
    // Auto-assign to appropriate class with enhanced validation
    let class_id = null;
    let classCreated = false;
    if (joiningYear && department) {
      const result = await autoAssignStudentClass(db, 
        { department, joining_year: joiningYear }, 
        { autoCreateEnabled, adminId: req.user.id }
      );
      class_id = result.classId;
      classCreated = result.created;
    }
    
    db.run('INSERT INTO users (register_no, name, email, password, role, department, joining_year, class_id, current_semester, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [register_no, name, email || null, hashedPassword, 'student', department, joiningYear, class_id, 5, req.user.id], 
      async function(err) {
        if (err) {
          // Rollback class creation if student creation failed
          if (classCreated && class_id) {
            try {
              await rollbackClassCreation(db, class_id);
            } catch (rollbackErr) {
              console.error('Rollback failed:', rollbackErr);
            }
          }
          
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Register number already exists' });
          }
          return res.status(500).json({ error: 'Failed to create student account' });
        }
        
        const message = classCreated ? 
          'Student account created and assigned to new class' : 
          'Student account created and assigned to existing class';
        
        res.json({ message, studentId: this.lastID, classCreated });
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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

// Get next staff number for department
app.get('/api/admin/next-staff-number', authenticateToken, requireAdmin, (req, res) => {
  const { dept } = req.query;
  
  if (!dept) {
    return res.status(400).json({ error: 'Department is required' });
  }
  
  const pattern = `STF${dept}%`;
  
  db.all('SELECT staff_id FROM users WHERE staff_id LIKE ? AND role = ? ORDER BY staff_id',
    [pattern, 'staff'], (err, staff) => {
      if (err) return res.status(500).json({ error: 'Failed to get staff count' });
      
      // Find the next available number
      let nextNumber = 1;
      if (staff.length > 0) {
        // Extract numbers from existing staff IDs
        const existingNumbers = staff.map(s => {
          const match = s.staff_id.match(/STF[A-Z]+0*(\d+)$/);
          return match ? parseInt(match[1]) : 0;
        }).filter(num => num > 0);
        
        if (existingNumbers.length > 0) {
          nextNumber = Math.max(...existingNumbers) + 1;
        }
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

// Staff assignments endpoints
app.post('/api/staff-assignments', authenticateToken, requireAdmin, async (req, res) => {
  const { staffId, staffName, subjectCode, subjectName, department, year, semester, section, credits } = req.body;
  
  try {
    const { validateStaffAssignment } = require('./utils/businessLogic');
    
    // Validate staff assignment
    await validateStaffAssignment(db, { staff_id: staffId, semester });

    // Convert numeric year to Roman numeral
    const yearToRoman = {
      '1': 'I',
      '2': 'II',
      '3': 'III',
      '4': 'IV'
    };
    
    const romanYear = yearToRoman[year] || year;
    const assignmentSection = section || 'A';
    
    // Insert staff assignment directly with section
    db.run(
      `INSERT INTO staff_assignments (staff_id, staff_name, subject_code, subject_name, department, year, semester, section, credits) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [staffId, staffName, subjectCode, subjectName, department, year, semester, assignmentSection, credits || 3],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json({ id: this.lastID, message: 'Staff assignment created successfully' });
      }
    );
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/staff-assignments', authenticateToken, (req, res) => {
  db.all('SELECT * FROM staff_assignments ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.delete('/api/staff-assignments/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM staff_assignments WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Staff assignment deleted successfully' });
  });
});

// Delete all staff assignments
app.delete('/api/staff-assignments', authenticateToken, requireAdmin, (req, res) => {
  db.run('DELETE FROM staff_assignments', function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: `${this.changes} staff assignments deleted successfully` });
  });
});

// CC assignments endpoints
app.post('/api/cc-assignments', authenticateToken, requireAdmin, (req, res) => {
  const { staffId, staffName, department, year, semester } = req.body;
  console.log('CC Assignment request:', { staffId, staffName, department, year, semester });
  
  db.run(
    `INSERT INTO cc_assignments (staff_id, staff_name, department, year, semester) VALUES (?, ?, ?, ?, ?)`,
    [staffId, staffName, department, year, semester],
    function(err) {
      if (err) {
        console.error('CC Assignment DB error:', err);
        return res.status(500).json({ error: 'Database error: ' + err.message });
      }
      console.log('CC Assignment created successfully');
      res.json({ id: this.lastID, message: 'CC assignment created successfully' });
    }
  );
});

app.get('/api/cc-assignments', authenticateToken, (req, res) => {
  db.all('SELECT * FROM cc_assignments ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.delete('/api/cc-assignments/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM cc_assignments WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'CC assignment deleted successfully' });
  });
});

// Classes endpoints
app.post('/api/classes', authenticateToken, requireAdmin, (req, res) => {
  const { department, year, section } = req.body;
  
  db.run(
    `INSERT INTO classes (department, year, section) VALUES (?, ?, ?)`,
    [department, year, section],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: this.lastID, message: 'Class created successfully' });
    }
  );
});

app.get('/api/classes', authenticateToken, (req, res) => {
  db.all('SELECT * FROM classes ORDER BY department, year, section', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.delete('/api/classes/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM classes WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Class deleted successfully' });
  });
});

// Update student with class assignment
app.put('/api/admin/assign-student-class/:id', authenticateToken, requireAdmin, (req, res) => {
  const { class_id } = req.body;
  const userId = req.params.id;
  
  db.run('UPDATE users SET class_id = ? WHERE id = ? AND role = ?',
    [class_id, userId, 'student'], function(err) {
      if (err) return res.status(500).json({ error: 'Failed to assign class' });
      if (this.changes === 0) return res.status(404).json({ error: 'Student not found' });
      res.json({ message: 'Student assigned to class successfully' });
    });
});

// Get students by class
app.get('/api/classes/:class_id/students', authenticateToken, (req, res) => {
  db.all('SELECT id, register_no, name, joining_year FROM users WHERE class_id = ? AND role = ?',
    [req.params.class_id, 'student'], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(rows);
    });
});

// Get class details with students and staff assignments
app.get('/api/classes/:class_id/details', authenticateToken, (req, res) => {
  const classId = req.params.class_id;
  
  // Get class info
  db.get('SELECT * FROM classes WHERE id = ?', [classId], (err, classInfo) => {
    if (err || !classInfo) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    // Get students in this class
    db.all('SELECT id, register_no, name, joining_year FROM users WHERE class_id = ? AND role = ?',
      [classId, 'student'], (err, students) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        
        // Get staff assignments for this class based on department, year, and section
        db.all('SELECT sa.*, s.subject_name as full_subject_name FROM staff_assignments sa LEFT JOIN subjects s ON (sa.subject_code = s.subject_code AND sa.department = s.department AND sa.year = s.year) WHERE sa.department = ? AND sa.year = ? AND sa.section = ?',
          [classInfo.department, classInfo.year, classInfo.section], (err, assignments) => {
            if (err) return res.status(500).json({ error: 'Database error' });            // Get CC assignments for this class based on department and year
            db.all('SELECT * FROM cc_assignments WHERE department = ? AND year = ?',
              [classInfo.department, classInfo.year], (err, ccAssignments) => {
                if (err) return res.status(500).json({ error: 'Database error' });
                
                res.json({
                  class: classInfo,
                  students,
                  assignments,
                  ccAssignments
                });
              });
          });
      });
  });
});

// Admin settings endpoints
app.get('/api/admin/settings', authenticateToken, requireAdmin, (req, res) => {
  db.all('SELECT * FROM admin_settings', (err, settings) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch settings' });
    
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.setting_key] = setting.setting_value;
    });
    
    res.json(settingsObj);
  });
});

app.put('/api/admin/settings', authenticateToken, requireAdmin, (req, res) => {
  const { auto_create_classes } = req.body;
  
  if (auto_create_classes !== undefined) {
    db.run('UPDATE admin_settings SET setting_value = ?, updated_at = datetime(\'now\') WHERE setting_key = ?',
      [auto_create_classes.toString(), 'auto_create_classes'], function(err) {
        if (err) return res.status(500).json({ error: 'Failed to update settings' });
        res.json({ message: 'Settings updated successfully' });
      });
  } else {
    res.status(400).json({ error: 'No valid settings provided' });
  }
});

// Admin notifications endpoints
app.get('/api/admin/notifications', authenticateToken, requireAdmin, (req, res) => {
  db.all('SELECT * FROM admin_notifications WHERE admin_id = ? ORDER BY created_at DESC LIMIT 50',
    [req.user.id], (err, notifications) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch notifications' });
      res.json(notifications);
    });
});

app.put('/api/admin/notifications/:id/read', authenticateToken, requireAdmin, (req, res) => {
  db.run('UPDATE admin_notifications SET read_status = 1 WHERE id = ? AND admin_id = ?',
    [req.params.id, req.user.id], function(err) {
      if (err) return res.status(500).json({ error: 'Failed to mark notification as read' });
      res.json({ message: 'Notification marked as read' });
    });
});

// Timetable endpoints
app.post('/api/timetables', authenticateToken, requireAdmin, (req, res) => {
  const { department, year, semester, section, day_of_week, period_number, start_time, end_time, subject_code, subject_name, staff_id, staff_name, room_number } = req.body;
  
  db.run(
    `INSERT INTO timetables (department, year, semester, section, day_of_week, period_number, start_time, end_time, subject_code, subject_name, staff_id, staff_name, room_number) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [department, year, semester, section, day_of_week, period_number, start_time, end_time, subject_code, subject_name, staff_id, staff_name, room_number],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Time slot already occupied' });
        }
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({ id: this.lastID, message: 'Timetable entry created successfully' });
    }
  );
});

app.get('/api/timetables', authenticateToken, (req, res) => {
  const { department, year, semester, section } = req.query;
  
  let query = 'SELECT * FROM timetables';
  let params = [];
  
  if (department || year || semester || section) {
    query += ' WHERE ';
    const conditions = [];
    if (department) { conditions.push('department = ?'); params.push(department); }
    if (year) { conditions.push('year = ?'); params.push(year); }
    if (semester) { conditions.push('semester = ?'); params.push(semester); }
    if (section) { conditions.push('section = ?'); params.push(section); }
    query += conditions.join(' AND ');
  }
  
  query += ' ORDER BY day_of_week, period_number';
  
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

app.delete('/api/timetables/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM timetables WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ message: 'Timetable entry deleted successfully' });
  });
});

// Delete all timetable entries for a specific class
app.delete('/api/timetables/class', authenticateToken, requireAdmin, (req, res) => {
  const { department, year, semester, section } = req.body;
  
  console.log('Delete request received:', { department, year, semester, section });
  
  if (!department || !year || !semester || !section) {
    console.log('Missing required fields');
    return res.status(400).json({ error: 'Department, year, semester, and section are required' });
  }
  
  db.run(
    'DELETE FROM timetables WHERE department = ? AND year = ? AND semester = ? AND section = ?',
    [department, year, semester, section],
    function(err) {
      if (err) {
        console.error('Delete error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      const deletedCount = this.changes;
      console.log('Deleted', deletedCount, 'timetable entries');
      
      res.json({ 
        message: `${deletedCount} timetable entries deleted successfully for ${department} ${year} Semester ${semester} Section ${section}`,
        deletedCount: deletedCount
      });
    }
  );
});

// Get current period for staff based on timetable (non-realtime)
app.get('/api/staff/current-period', authenticateToken, (req, res) => {
  // Get staff info first
  db.get('SELECT staff_id FROM users WHERE id = ?', [req.user.id], (err, staffInfo) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    
    const staffId = staffInfo?.staff_id || req.user.staff_id;
    
    // Get first available timetable entry for this staff (non-realtime)
    db.get(`SELECT t.* FROM timetables t 
            WHERE t.staff_id = ? 
            ORDER BY t.day_of_week, t.period_number 
            LIMIT 1`,
      [staffId], (err, timetableEntry) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        
        if (!timetableEntry) {
          return res.json({ 
            message: `No timetable entries found for staff: ${staffId}`,
            debug: { staffId }
          });
        }
        
        // Get period info
        const periods = [
          { number: 1, start: '09:15', end: '10:05' },
          { number: 2, start: '10:05', end: '10:55' },
          { number: 3, start: '11:05', end: '11:55' },
          { number: 4, start: '11:55', end: '12:45' },
          { number: 5, start: '13:25', end: '14:10' },
          { number: 6, start: '14:10', end: '15:05' },
          { number: 7, start: '15:15', end: '16:00' },
          { number: 8, start: '16:00', end: '16:45' }
        ];
        
        const periodInfo = periods[timetableEntry.period_number - 1];
        
        // Find the class based on department and year
        db.get('SELECT id FROM classes WHERE department = ? AND year = ? AND section = ?',
          [timetableEntry.department, timetableEntry.year, 'A'], (err, classInfo) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            
            res.json({
              currentPeriod: timetableEntry.period_number,
              timeSlot: `${periodInfo.start}-${periodInfo.end}`,
              subject: timetableEntry.subject_name,
              subjectCode: timetableEntry.subject_code,
              department: timetableEntry.department,
              year: timetableEntry.year,
              semester: timetableEntry.semester,
              room: timetableEntry.room_number,
              classId: classInfo?.id
            });
          });
      });
  });
});

// Mark attendance for current period
app.post('/api/staff/attendance', authenticateToken, (req, res) => {
  const { students, subject_code, department, year, semester, day_of_week, period_number, academic_year } = req.body;
  const date = new Date().toISOString().split('T')[0];
  const staff_id = req.user.staff_id || req.user.id;
  
  console.log('Saving attendance:', { students: students.length, subject_code, date, staff_id, academic_year });
  
  // For historical academic years, use students who had grades in that period
  if (academic_year && academic_year !== new Date().getFullYear().toString()) {
    // Get students who had grades in this subject and academic year
    db.all(`SELECT DISTINCT u.id, u.register_no, u.name 
            FROM users u 
            JOIN grades g ON u.id = g.student_id 
            WHERE g.subject_code = ? AND g.academic_year = ? AND g.staff_id = ?`,
      [subject_code, academic_year, staff_id], (err, historicalStudents) => {
        if (err) {
          console.error('Historical students query error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        // Filter students to only those who existed in that academic year
        const validStudents = students.filter(student => 
          historicalStudents.some(hs => hs.id === student.id)
        );
        
        const promises = validStudents.map(student => 
          new Promise((resolve, reject) => {
            console.log('Saving historical attendance for student:', student.id, student.status);
            db.run(`INSERT OR REPLACE INTO attendance 
                    (student_id, staff_id, subject_code, department, year, semester, day_of_week, period_number, date, status) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [student.id, staff_id, subject_code, department, year, semester, day_of_week, period_number, date, student.status],
              function(err) {
                if (err) {
                  console.error('Attendance save error:', err);
                  reject(err);
                } else {
                  console.log('Attendance saved for student:', student.id, 'Row ID:', this.lastID);
                  resolve();
                }
              }
            );
          })
        );
        
        Promise.all(promises)
          .then(() => {
            console.log('All historical attendance records saved successfully');
            res.json({ message: 'Attendance marked successfully' });
          })
          .catch(err => {
            console.error('Failed to save attendance:', err);
            res.status(500).json({ error: 'Failed to mark attendance' });
          });
      });
  } else {
    // Current year logic remains the same
    const promises = students.map(student => 
      new Promise((resolve, reject) => {
        console.log('Saving for student:', student.id, student.status);
        db.run(`INSERT OR REPLACE INTO attendance 
                (student_id, staff_id, subject_code, department, year, semester, day_of_week, period_number, date, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [student.id, staff_id, subject_code, department, year, semester, day_of_week, period_number, date, student.status],
          function(err) {
            if (err) {
              console.error('Attendance save error:', err);
              reject(err);
            } else {
              console.log('Attendance saved for student:', student.id, 'Row ID:', this.lastID);
              resolve();
            }
          }
        );
      })
    );
    
    Promise.all(promises)
      .then(() => {
        console.log('All attendance records saved successfully');
        res.json({ message: 'Attendance marked successfully' });
      })
      .catch(err => {
        console.error('Failed to save attendance:', err);
        res.status(500).json({ error: 'Failed to mark attendance' });
      });
  }
});

// Get attendance for a specific date and period
app.get('/api/staff/attendance', authenticateToken, (req, res) => {
  const { subject_code, date, period_number, academic_year } = req.query;
  const staff_id = req.user.staff_id || req.user.id;
  
  let query = `SELECT a.*, u.name, u.register_no FROM attendance a 
               JOIN users u ON a.student_id = u.id 
               WHERE a.staff_id = ? AND a.subject_code = ? AND a.date = ? AND a.period_number = ?`;
  let params = [staff_id, subject_code, date, period_number];
  
  // For historical data, also filter by students who had grades in that academic year
  if (academic_year && academic_year !== new Date().getFullYear().toString()) {
    query = `SELECT a.*, u.name, u.register_no FROM attendance a 
             JOIN users u ON a.student_id = u.id 
             JOIN grades g ON u.id = g.student_id 
             WHERE a.staff_id = ? AND a.subject_code = ? AND a.date = ? AND a.period_number = ? 
             AND g.subject_code = ? AND g.academic_year = ? AND g.staff_id = ?
             GROUP BY a.id`;
    params = [staff_id, subject_code, date, period_number, subject_code, academic_year, staff_id];
  }
  
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Get students for staff assignments (for teachers)
app.get('/api/staff/students/:assignmentId', authenticateToken, (req, res) => {
  const { assignmentId } = req.params;
  const { academic_year } = req.query;
  
  // Get staff info first
  db.get('SELECT staff_id FROM users WHERE id = ?', [req.user.id], (err, staffInfo) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    
    const staffId = staffInfo?.staff_id || req.user.staff_id || req.user.id;
    console.log('Looking for assignment:', assignmentId, 'for staff:', staffId, 'academic year:', academic_year);
    
    // Get assignment details
    db.get('SELECT * FROM staff_assignments WHERE id = ? AND staff_id = ?', 
      [assignmentId, staffId], (err, assignment) => {
        if (err) {
          console.error('Assignment query error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (!assignment) {
          console.log('Assignment not found for ID:', assignmentId, 'Staff:', staffId);
          return res.status(404).json({ error: 'Assignment not found' });
        }
        
        console.log('Found assignment:', assignment);
        
        // For historical academic years, get students who have grades in that year
        if (academic_year && academic_year !== new Date().getFullYear().toString()) {
          db.all(`SELECT DISTINCT u.id, u.register_no, u.name, u.joining_year, 'A' as section 
                  FROM users u 
                  JOIN grades g ON u.id = g.student_id 
                  WHERE g.subject_code = ? AND g.academic_year = ? AND g.staff_id = ?
                  ORDER BY u.register_no`,
            [assignment.subject_code, academic_year, staffId], (err, historicalStudents) => {
              if (err) {
                console.error('Historical students query error:', err);
                return res.status(500).json({ error: 'Database error' });
              }
              
              console.log('Found historical students:', historicalStudents.length);
              
              res.json({
                assignment,
                students: historicalStudents,
                isHistorical: true
              });
            });
        } else {
          // For current year, use existing logic
          db.all(`SELECT u.id, u.register_no, u.name, u.joining_year, c.section 
                  FROM users u 
                  LEFT JOIN classes c ON u.class_id = c.id 
                  WHERE u.role = 'student' AND (c.department = ? AND c.year = ? OR u.department = ?)
                  ORDER BY c.section, u.register_no`,
            [assignment.department, assignment.year, assignment.department], (err, students) => {
              if (err) {
                console.error('Students query error:', err);
                return res.status(500).json({ error: 'Database error' });
              }
              
              console.log('Found current students:', students.length);
              
              // If no students found with class matching, get all students from same department
              if (students.length === 0) {
                db.all(`SELECT u.id, u.register_no, u.name, u.joining_year, 'A' as section 
                        FROM users u 
                        WHERE u.role = 'student' AND u.department = ?
                        ORDER BY u.register_no`,
                  [assignment.department], (err, allStudents) => {
                    if (err) return res.status(500).json({ error: 'Database error' });
                    
                    console.log('Fallback: Found students from department:', allStudents.length);
                    
                    res.json({
                      assignment,
                      students: allStudents,
                      isHistorical: false
                    });
                  });
              } else {
                res.json({
                  assignment,
                  students,
                  isHistorical: false
                });
              }
            });
        }
      });
  });
});

// Debug endpoint to check data
app.get('/api/debug/data', authenticateToken, (req, res) => {
  const now = new Date();
  const currentDay = now.getDay() - 1;
  const currentTime = now.toTimeString().slice(0, 5);
  
  const queries = {
    users: 'SELECT id, register_no, staff_id, name, role, department, class_id, joining_year FROM users',
    classes: 'SELECT * FROM classes',
    timetables: 'SELECT * FROM timetables',
    staff_assignments: 'SELECT * FROM staff_assignments'
  };
  
  const results = {
    currentTime: currentTime,
    currentDay: currentDay,
    userInfo: req.user
  };
  let completed = 0;
  
  Object.keys(queries).forEach(key => {
    db.all(queries[key], (err, rows) => {
      if (err) {
        results[key] = { error: err.message };
      } else {
        results[key] = rows;
      }
      completed++;
      
      if (completed === Object.keys(queries).length) {
        res.json(results);
      }
    });
  });
});

// Simple endpoint to get all students (for debugging)
app.get('/api/debug/students', authenticateToken, (req, res) => {
  db.all('SELECT * FROM users WHERE role = "student"', (err, students) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(students);
  });
});

// Debug endpoint to check all attendance records
app.get('/api/debug/attendance', authenticateToken, (req, res) => {
  db.all('SELECT * FROM attendance ORDER BY date DESC, period_number', (err, records) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(records);
  });
});

// Create grades table
db.run(`CREATE TABLE IF NOT EXISTS grades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  staff_id TEXT NOT NULL,
  subject_code TEXT NOT NULL,
  department TEXT NOT NULL,
  year TEXT NOT NULL,
  semester TEXT NOT NULL,
  grade_type TEXT NOT NULL,
  grade_category TEXT,
  marks REAL NOT NULL,
  max_marks REAL NOT NULL,
  academic_year TEXT DEFAULT '2024',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, subject_code, grade_type, grade_category, academic_year)
)`);

// Create semester results table
db.run(`CREATE TABLE IF NOT EXISTS semester_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  semester INTEGER NOT NULL,
  academic_year TEXT NOT NULL,
  sgpa REAL,
  cgpa REAL,
  total_credits INTEGER DEFAULT 0,
  earned_credits INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, semester, academic_year)
)`);

// Save grades endpoint
app.post('/api/staff/grades', authenticateToken, (req, res) => {
  const { students, subject_code, department, year, semester, grade_type, grade_category, max_marks, academic_year } = req.body;
  const staff_id = req.user.staff_id || req.user.id;
  const finalAcademicYear = academic_year || new Date().getFullYear().toString();
  
  console.log('Saving grades:', { students: students.length, subject_code, grade_type, grade_category, academic_year: finalAcademicYear });
  
  const promises = students.map(student => 
    new Promise((resolve, reject) => {
      console.log('Saving grade for student:', student.id, 'marks:', student.marks, 'academic_year:', finalAcademicYear);
      db.run(`INSERT OR REPLACE INTO grades 
              (student_id, staff_id, subject_code, department, year, semester, grade_type, grade_category, marks, max_marks, academic_year) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [student.id, staff_id, subject_code, department, year, semester, grade_type, grade_category, student.marks, max_marks, finalAcademicYear],
        function(err) {
          if (err) {
            console.error('Grade save error:', err);
            reject(err);
          } else {
            console.log('Grade saved for student:', student.id, 'Row ID:', this.lastID);
            resolve();
          }
        }
      );
    })
  );
  
  Promise.all(promises)
    .then(() => {
      console.log('All grades saved successfully');
      res.json({ message: 'Grades saved successfully' });
    })
    .catch(err => {
      console.error('Failed to save grades:', err);
      res.status(500).json({ error: 'Failed to save grades' });
    });
});

// Get grades for a subject
app.get('/api/staff/grades/:assignmentId', authenticateToken, (req, res) => {
  const { assignmentId } = req.params;
  const { grade_type, grade_category, academic_year } = req.query;
  
  db.get('SELECT * FROM staff_assignments WHERE id = ?', [assignmentId], (err, assignment) => {
    if (err || !assignment) return res.status(404).json({ error: 'Assignment not found' });
    
    let query = `SELECT g.*, u.name, u.register_no 
                 FROM grades g 
                 JOIN users u ON g.student_id = u.id 
                 WHERE g.subject_code = ? AND g.grade_type = ? AND g.grade_category = ?`;
    let params = [assignment.subject_code, grade_type, grade_category];
    
    if (academic_year) {
      query += ` AND g.academic_year = ?`;
      params.push(academic_year);
    }
    
    query += ` ORDER BY u.register_no`;
    
    db.all(query, params, (err, grades) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ assignment, grades });
    });
  });
});

// Get student attendance records
app.get('/api/student/attendance', authenticateToken, (req, res) => {
  const studentId = req.user.id;
  const { semester, academic_year } = req.query;
  
  console.log('Fetching attendance for student ID:', studentId, 'semester:', semester, 'academic_year:', academic_year);
  
  // First get student info to match with their department/year
  db.get('SELECT * FROM users WHERE id = ?', [studentId], (err, student) => {
    if (err || !student) {
      return res.status(500).json({ error: 'Student not found' });
    }
    
    console.log('Student info:', { id: student.id, department: student.department, class_id: student.class_id });
    
    // Build query with filters
    let query = `SELECT a.*, sa.subject_name, sa.subject_code as sa_subject_code
                 FROM attendance a 
                 LEFT JOIN staff_assignments sa ON (a.subject_code = sa.subject_code AND a.department = sa.department AND a.year = sa.year)
                 WHERE a.student_id = ?`;
    let params = [studentId];
    
    if (semester) {
      query += ` AND a.semester = ?`;
      params.push(semester);
    }
    
    // For historical academic years, only show attendance for subjects where student had grades
    if (academic_year && academic_year !== new Date().getFullYear().toString()) {
      query = `SELECT a.*, sa.subject_name, sa.subject_code as sa_subject_code
               FROM attendance a 
               LEFT JOIN staff_assignments sa ON (a.subject_code = sa.subject_code AND a.department = sa.department AND a.year = sa.year)
               JOIN grades g ON (a.student_id = g.student_id AND a.subject_code = g.subject_code)
               WHERE a.student_id = ? AND g.academic_year = ?`;
      params = [studentId, academic_year];
      
      if (semester) {
        query += ` AND a.semester = ?`;
        params.push(semester);
      }
    }
    
    query += ` ORDER BY a.date DESC, a.period_number`;
    
    // Get attendance records for this student
    db.all(query, params, (err, records) => {
      if (err) {
        console.error('Student attendance fetch error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      console.log('Found attendance records:', records.length);
      if (records.length > 0) {
        console.log('Sample record:', records[0]);
      }
      
      // Group by subject and calculate percentages
      const subjectStats = {};
      
      records.forEach(record => {
        const subjectKey = record.subject_code;
        if (!subjectStats[subjectKey]) {
          subjectStats[subjectKey] = {
            subject_code: record.subject_code,
            subject_name: record.subject_name || record.subject_code,
            total: 0,
            present: 0,
            records: []
          };
        }
        
        subjectStats[subjectKey].total++;
        if (record.status === 'present') {
          subjectStats[subjectKey].present++;
        }
        subjectStats[subjectKey].records.push(record);
      });
      
      // Calculate percentages
      const subjects = Object.values(subjectStats).map(subject => ({
        ...subject,
        percentage: subject.total > 0 ? Math.round((subject.present / subject.total) * 100) : 0
      }));
      
      // Overall stats
      const totalClasses = records.length;
      const totalPresent = records.filter(r => r.status === 'present').length;
      const overallPercentage = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;
      
      console.log('Returning subjects:', subjects.length, 'Overall:', overallPercentage + '%');
      
      res.json({
        subjects,
        overall: {
          total: totalClasses,
          present: totalPresent,
          missed: totalClasses - totalPresent,
          percentage: overallPercentage
        },
        records,
        studentInfo: {
          id: student.id,
          name: student.name,
          department: student.department,
          class_id: student.class_id
        }
      });
    });
  });
});

// Get student grades
app.get('/api/student/grades', authenticateToken, (req, res) => {
  const studentId = req.user.id;
  const { semester, academic_year } = req.query;
  
  console.log('Fetching grades for student ID:', studentId, 'semester:', semester, 'academic_year:', academic_year);
  
  // Get student info first
  db.get('SELECT * FROM users WHERE id = ?', [studentId], (err, student) => {
    if (err || !student) {
      return res.status(500).json({ error: 'Student not found' });
    }
    
    console.log('Student info:', { id: student.id, department: student.department, register_no: student.register_no });
    
    // Build query with filters
    let query = `SELECT g.*, sa.subject_name 
                 FROM grades g 
                 LEFT JOIN staff_assignments sa ON (g.subject_code = sa.subject_code AND g.department = sa.department AND g.year = sa.year)
                 WHERE g.student_id = ?`;
    let params = [studentId];
    
    if (semester) {
      query += ` AND g.semester = ?`;
      params.push(semester);
    }
    
    if (academic_year) {
      query += ` AND g.academic_year = ?`;
      params.push(academic_year);
    }
    
    query += ` ORDER BY g.subject_code, g.grade_type, g.grade_category`;
    
    // Get all grades for this student
    db.all(query, params, (err, grades) => {
      if (err) {
        console.error('Grades fetch error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      console.log('Found grades:', grades.length);
      if (grades.length > 0) {
        console.log('Sample grade:', grades[0]);
      }
      
      // Group grades by subject and type
      const subjectGrades = {};
      
      grades.forEach(grade => {
        const key = grade.subject_code;
        if (!subjectGrades[key]) {
          subjectGrades[key] = {
            subject_code: grade.subject_code,
            subject_name: grade.subject_name || grade.subject_code,
            assignment1: null,
            assignment2: null,
            assignment3: null,
            ia1: null,
            ia2: null,
            ia3: null,
            grade: null
          };
        }
        
        if (grade.grade_type === 'Assignment') {
          if (grade.grade_category === 'Assignment 1') subjectGrades[key].assignment1 = grade.marks;
          if (grade.grade_category === 'Assignment 2') subjectGrades[key].assignment2 = grade.marks;
          if (grade.grade_category === 'Assignment 3') subjectGrades[key].assignment3 = grade.marks;
        } else if (grade.grade_type === 'IA') {
          if (grade.grade_category === 'IA 1') subjectGrades[key].ia1 = grade.marks;
          if (grade.grade_category === 'IA 2') subjectGrades[key].ia2 = grade.marks;
          if (grade.grade_category === 'IA 3') subjectGrades[key].ia3 = grade.marks;
        } else if (grade.grade_type === 'Semester') {
          subjectGrades[key].grade = grade.marks;
        }
      });
      
      const subjects = Object.values(subjectGrades);
      
      console.log('Returning subjects with grades:', subjects.length);
      
      res.json({
        assignments: subjects,
        ias: subjects,
        semesters: subjects,
        debug: {
          studentId,
          totalGrades: grades.length,
          rawGrades: grades
        }
      });
    });
  });
});

// Debug endpoint to check all grades
app.get('/api/debug/grades', authenticateToken, (req, res) => {
  db.all('SELECT * FROM grades ORDER BY created_at DESC', (err, grades) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(grades);
  });
});

// Subjects management endpoints
app.post('/api/subjects', authenticateToken, requireAdmin, (req, res) => {
  const { subject_code, subject_name, department, year, semester, credits } = req.body;
  
  db.run(
    `INSERT INTO subjects (subject_code, subject_name, department, year, semester, credits) VALUES (?, ?, ?, ?, ?, ?)`,
    [subject_code, subject_name, department, year, semester, credits || 3],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Subject code already exists' });
        }
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: this.lastID, message: 'Subject created successfully' });
    }
  );
});

app.get('/api/subjects', authenticateToken, (req, res) => {
  const { department, year, semester } = req.query;
  
  let query = 'SELECT * FROM subjects';
  let params = [];
  
  if (department || year || semester) {
    query += ' WHERE ';
    const conditions = [];
    if (department) { conditions.push('department = ?'); params.push(department); }
    if (year) { conditions.push('year = ?'); params.push(year); }
    if (semester) { conditions.push('semester = ?'); params.push(semester); }
    query += conditions.join(' AND ');
  }
  
  query += ' ORDER BY department, year, semester, subject_code';
  
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

app.delete('/api/subjects/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM subjects WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ message: 'Subject deleted successfully' });
  });
});

// Clear all subjects
app.delete('/api/subjects', authenticateToken, requireAdmin, (req, res) => {
  db.run('DELETE FROM subjects', function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ message: `${this.changes} subjects deleted successfully` });
  });
});

// Delete all students
app.delete('/api/students', authenticateToken, requireAdmin, (req, res) => {
  db.run('DELETE FROM users WHERE role = "student"', function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ message: `${this.changes} students deleted successfully` });
  });
});

// Delete all accounts (students and staff)
app.delete('/api/admin/delete-all-accounts', authenticateToken, requireAdmin, (req, res) => {
  db.run('DELETE FROM users WHERE role IN ("student", "staff")', function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ message: `${this.changes} accounts deleted successfully` });
  });
});

// Get subjects assigned to student
app.get('/api/student/subjects', authenticateToken, (req, res) => {
  const studentId = req.user.id;
  const { semester } = req.query;
  
  db.get('SELECT * FROM users WHERE id = ?', [studentId], (err, student) => {
    if (err || !student) {
      return res.status(500).json({ error: 'Student not found' });
    }
    
    let query = `SELECT DISTINCT s.subject_code, s.subject_name, s.credits, sa.staff_name, s.department, s.year, s.semester
                 FROM subjects s
                 LEFT JOIN staff_assignments sa ON (s.subject_code = sa.subject_code AND s.department = sa.department AND s.year = sa.year)
                 WHERE s.department = ?`;
    let params = [student.department];
    
    // Filter by current semester by default, or specified semester
    const filterSemester = semester || student.current_semester || '1';
    query += ` AND s.semester = ?`;
    params.push(filterSemester);
    
    query += ` ORDER BY s.subject_code`;
    
    db.all(query, params, (err, subjects) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json(subjects);
    });
  });
});

// CSV upload configuration
const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Bulk import subjects from CSV
app.post('/api/subjects/import', authenticateToken, requireAdmin, (req, res, next) => {
  console.log('Received import request');
  upload.single('csvFile')(req, res, (err) => {
    if (err) {
      console.error('File upload error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          error: 'File is too large',
          details: 'Maximum file size is 5MB'
        });
      }
      return res.status(400).json({ 
        error: 'File upload failed',
        details: err.message
      });
    }
    next();
  });
}, (req, res) => {
  console.log('Processing uploaded file');
    if (!req.file) {
      console.error('No file received in request');
      return res.status(400).json({ 
        error: 'No CSV file uploaded',
        details: 'Please select a valid CSV file'
      });
    }
    
    // Continue with CSV processing
    console.log('File received:', req.file.originalname, 'Size:', req.file.size);
    
    // Rest of the existing import code...  const subjects = [];
  const errors = [];
  let rowNum = 0;
  
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {
      rowNum++;
      console.log('Processing row:', rowNum, 'Data:', data);
      
      // Validate required fields
      if (!data.subject_code) errors.push(`Row ${rowNum}: Missing subject code`);
      if (!data.subject_name) errors.push(`Row ${rowNum}: Missing subject name`);
      if (!data.department) errors.push(`Row ${rowNum}: Missing department`);
      if (!data.year) errors.push(`Row ${rowNum}: Missing year`);
      if (!data.semester) errors.push(`Row ${rowNum}: Missing semester`);
      
      if (data.subject_code && data.subject_name && data.department && data.year && data.semester) {
        const subject = [
          data.subject_code.trim(),
          data.subject_name.trim(), 
          data.department.trim(),
          data.year.trim(),
          data.semester.trim(),
          parseInt(data.credits) || 3
        ];
        subjects.push(subject);
        console.log('Added subject:', subject);
      }
    })
    .on('end', () => {
      if (subjects.length === 0) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ 
          error: 'No valid subjects found',
          details: errors
        });
      }

      let imported = 0;
      let duplicates = 0;
      
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        const stmt = db.prepare('INSERT INTO subjects (subject_code, subject_name, department, year, semester, credits) VALUES (?, ?, ?, ?, ?, ?)');
        
        subjects.forEach(subject => {
          stmt.run(subject, function(err) {
            if (err) {
              if (err.message.includes('UNIQUE constraint failed')) {
                duplicates++;
                console.log('Duplicate subject:', subject[0]);
              } else {
                errors.push(`Error importing ${subject[0]}: ${err.message}`);
                console.error('Import error for subject:', subject[0], err);
              }
            } else {
              imported++;
              console.log('Successfully imported subject:', subject[0]);
            }
          });
        });
        
        stmt.finalize();
        
        db.run('COMMIT', (err) => {
          fs.unlinkSync(req.file.path);
          
          if (err) {
            console.error('Transaction error:', err);
            return res.status(500).json({ 
              error: 'Import failed',
              details: errors
            });
          }
          
          // Get actual count from database
          db.get('SELECT COUNT(*) as total FROM subjects', (err, result) => {
            const response = {
              message: `${imported} new subjects added, ${duplicates} duplicates skipped, ${result.total} total in database`,
              imported,
              duplicates,
              total: result.total
            };
            
            if (errors.length > 0) {
              response.errors = errors;
            }
            
            console.log('Import completed:', response);
            res.json(response);
          });
        });
      });
    })
    .on('error', (err) => {
      console.error('CSV processing error:', err);
      fs.unlinkSync(req.file.path);
      res.status(500).json({ 
        error: 'CSV processing failed',
        details: err.message
      });
    });
});

// Get CSV templates
app.get('/api/subjects/template', authenticateToken, requireAdmin, (req, res) => {
  const csvContent = 'subject_code,subject_name,department,year,semester,credits\n' +
                    'CS101,Programming Fundamentals,Computer Science,1,1,4\n' +
                    'CS102,Data Structures,Computer Science,1,2,4\n' +
                    'CS103,Database Systems,Computer Science,2,1,3\n' +
                    'CS104L,Programming Lab,Computer Science,1,1,2';
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=subjects_template.csv');
  res.send(csvContent);
});

app.get('/api/students/template', authenticateToken, requireAdmin, (req, res) => {
  const csvContent = 'name,email,department,year,dob\n' +
                    'John Doe,john@email.com,CSE,25,150805\n' +
                    'Jane Smith,jane@email.com,IT,25,221204\n' +
                    'Mike Johnson,mike@email.com,AIDS,25,100306';
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=students_template.csv');
  res.send(csvContent);
});

app.get('/api/staff/template', authenticateToken, requireAdmin, (req, res) => {
  const csvContent = 'name,email,department\n' +
                    'John Teacher,john@email.com,CSE\n' +
                    'Jane Professor,jane@email.com,IT\n' +
                    'Mike Lecturer,mike@email.com,AIDS';
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=staff_template.csv');
  res.send(csvContent);
});

// Bulk import students from CSV
app.post('/api/students/import', authenticateToken, requireAdmin, upload.single('csvFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No CSV file uploaded' });
  }

  const students = [];
  
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {
      console.log('Raw CSV data:', JSON.stringify(data));
      console.log('Available keys:', Object.keys(data));
      const values = Object.values(data);
      const student = {
        name: values[0] || 'Student',
        email: values[1] || null,
        department: values[2] || 'IT',
        year: values[3] || '25',
        dob: values[4] || '010100'
      };
      console.log('Parsed student:', student);
      students.push(student);
    })
    .on('end', async () => {
      console.log('Total students parsed:', students.length);
      if (students.length === 0) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: 'No valid students found' });
      }

      let imported = 0;
      const errors = [];
      
      for (let i = 0; i < students.length; i++) {
        const student = students[i];
        
        console.log('Processing student:', student);
        
        try {
          // Get next student number
          const deptCode = student.department.toUpperCase().substring(0, 2);
          const yearCode = student.year.toString().slice(-2);
          
          const response = await new Promise((resolve, reject) => {
            db.get(`SELECT COUNT(*) as count FROM users WHERE register_no LIKE 'STU${deptCode}${yearCode}%'`, (err, row) => {
              if (err) reject(err);
              else resolve(row.count + 1);
            });
          });
          
          const numStr = (response).toString().padStart(2, '0');
          const register_no = `STU${deptCode}${yearCode}${numStr}`;
          const password = student.dob.toString().padStart(6, '0');
          console.log('Generated password for', student.name, ':', password);
          const hashedPassword = await bcrypt.hash(password, 10);
          const joiningYear = 2000 + parseInt(student.year);
          
          // Check auto-creation setting
          const autoCreateEnabled = await new Promise((resolve, reject) => {
            db.get('SELECT setting_value FROM admin_settings WHERE setting_key = ?', 
              ['auto_create_classes'], (err, row) => {
                if (err) reject(err);
                else resolve(row ? row.setting_value === 'true' : true);
              });
          });
          
          // Auto-assign to class
          let classResult = null;
          if (autoCreateEnabled) {
            // For semester 5, students should be in 3rd year (III)
            const yearRoman = 'III';
            
            classResult = await new Promise((resolve, reject) => {
              db.get('SELECT id FROM classes WHERE department = ? AND year = ? AND section = ?',
                [student.department, yearRoman, 'A'], (err, classRow) => {
                  if (err) reject(err);
                  else resolve(classRow ? classRow.id : null);
                }
              );
            });
            
            // Create class if it doesn't exist
            if (!classResult) {
              classResult = await new Promise((resolve, reject) => {
                db.run('INSERT INTO classes (department, year, section) VALUES (?, ?, ?)',
                  [student.department, yearRoman, 'A'], function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                  }
                );
              });
            }
          }
          
          await new Promise((resolve, reject) => {
            console.log('Creating user:', { register_no, name: student.name, password, hashedPassword: hashedPassword.substring(0, 10) + '...' });
            db.run('INSERT INTO users (register_no, name, email, password, role, department, joining_year, class_id, current_semester, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [register_no, student.name, student.email, hashedPassword, 'student', student.department, joiningYear, classResult, 5, req.user.id],
              function(err) {
                if (err) reject(err);
                else { imported++; resolve(); }
              }
            );
          });
        } catch (error) {
          errors.push(`Row ${i + 1}: ${error.message}`);
        }
      }
      
      fs.unlinkSync(req.file.path);
      console.log('Final result:', { imported, errors: errors.length, totalStudents: students.length });
      res.json({
        message: `${imported} students imported, ${errors.length} errors`,
        imported,
        errors: errors.slice(0, 5)
      });
    })
    .on('error', () => {
      fs.unlinkSync(req.file.path);
      res.status(500).json({ error: 'CSV processing failed' });
    });
});

// Bulk import staff from CSV
app.post('/api/staff/import', authenticateToken, requireAdmin, upload.single('csvFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No CSV file uploaded' });
  }

  const staff = [];
  
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {
      console.log('CSV row data:', data);
      const values = Object.values(data);
      const staffMember = {
        name: values[0] || 'Staff',
        email: values[1] || null,
        department: values[2] || 'IT'
      };
      console.log('Parsed staff:', staffMember);
      staff.push(staffMember);
    })
    .on('end', async () => {
      if (staff.length === 0) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: 'No valid staff found' });
      }

      let imported = 0;
      const errors = [];
      
      for (let i = 0; i < staff.length; i++) {
        const member = staff[i];
        
        try {
          // Get next staff number
          const deptCode = member.department.toUpperCase().substring(0, 3);
          
          const response = await new Promise((resolve, reject) => {
            db.get(`SELECT COUNT(*) as count FROM users WHERE staff_id LIKE 'STF${deptCode}%'`, (err, row) => {
              if (err) reject(err);
              else resolve(row.count + 1);
            });
          });
          
          const numStr = response.toString().padStart(3, '0');
          const staff_id = `STF${deptCode}${numStr}`;
          const name = member.name.toLowerCase().replace(/\s+/g, '');
          const dept = member.department.toLowerCase();
          const password = `${name}@${dept}`;
          const hashedPassword = await bcrypt.hash(password, 10);
          
          await new Promise((resolve, reject) => {
            db.run('INSERT INTO users (staff_id, name, email, password, role, department, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [staff_id, member.name, member.email, hashedPassword, 'staff', member.department, req.user.id],
              function(err) {
                if (err) reject(err);
                else { imported++; resolve(); }
              }
            );
          });
        } catch (error) {
          errors.push(`Row ${i + 1}: ${error.message}`);
        }
      }
      
      fs.unlinkSync(req.file.path);
      res.json({
        message: `${imported} staff imported, ${errors.length} errors`,
        imported,
        errors: errors.slice(0, 5)
      });
    })
    .on('error', () => {
      fs.unlinkSync(req.file.path);
      res.status(500).json({ error: 'CSV processing failed' });
    });
});

// Get all subjects for admin
app.get('/api/admin/subjects', authenticateToken, requireAdmin, (req, res) => {
  db.all('SELECT * FROM subjects ORDER BY department, year, semester, subject_code', (err, subjects) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch subjects' });
    res.json(subjects);
  });
});

// Move students to correct class based on semester
app.put('/api/admin/fix-student-classes', authenticateToken, requireAdmin, (req, res) => {
  // Move semester 5 students to III year class
  db.run(`UPDATE users SET class_id = (
    SELECT c.id FROM classes c WHERE c.department = users.department AND c.year = 'III' AND c.section = 'A'
  ) WHERE role = 'student' AND current_semester = 5`, function(err) {
    if (err) return res.status(500).json({ error: 'Failed to update student classes' });
    res.json({ message: `${this.changes} students moved to correct classes` });
  });
});

// Admin routes (commented out as routes/admin doesn't exist)
// const adminRoutes = require('./routes/admin');
// app.use('/api/admin', authenticateToken, requireAdmin, (req, res, next) => {
//   req.db = db;
//   next();
// }, adminRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('✅ Subject management system ready');
  console.log('  - Subjects migrated with default 3 credits');
  console.log('  - Admin can update credits via Subject Management');
});