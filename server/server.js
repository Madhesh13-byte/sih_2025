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
    class_id INTEGER,
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
  
  db.run(`ALTER TABLE staff_assignments ADD COLUMN class_id INTEGER`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding class_id column to staff_assignments:', err);
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
    
    db.run('INSERT INTO users (register_no, name, email, password, role, department, joining_year, class_id, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [register_no, name, email || null, hashedPassword, 'student', department, joiningYear, class_id, req.user.id], 
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
  const { staffId, staffName, subjectCode, subjectName, department, year, semester } = req.body;
  
  try {
    const { validateStaffAssignment } = require('./utils/businessLogic');
    
    // Validate staff assignment
    await validateStaffAssignment(db, { staff_id: staffId, semester });
    
    // Find the class_id based on department and year
    db.get('SELECT id FROM classes WHERE department = ? AND year = ? AND section = ?', 
      [department, year, 'A'], (err, classRow) => {
        const class_id = classRow ? classRow.id : null;
        
        db.run(
          `INSERT INTO staff_assignments (staff_id, staff_name, subject_code, subject_name, department, year, semester, class_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [staffId, staffName, subjectCode, subjectName, department, year, semester, class_id],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }
            res.json({ id: this.lastID, message: 'Staff assignment created successfully' });
          }
        );
      });
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
        
        // Get staff assignments for this class based on department and year
        db.all('SELECT * FROM staff_assignments WHERE department = ? AND year = ?',
          [classInfo.department, classInfo.year], (err, assignments) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            
            // Get CC assignments for this class based on department and year
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

// Get students for staff assignments (for teachers)
app.get('/api/staff/students/:assignmentId', authenticateToken, (req, res) => {
  const { assignmentId } = req.params;
  
  // Get assignment details
  db.get('SELECT * FROM staff_assignments WHERE id = ? AND staff_id = ?', 
    [assignmentId, req.user.staff_id || req.user.id], (err, assignment) => {
      if (err || !assignment) {
        return res.status(404).json({ error: 'Assignment not found' });
      }
      
      // Get students from classes matching the assignment's department and year
      db.all(`SELECT u.id, u.register_no, u.name, u.joining_year, c.section 
              FROM users u 
              JOIN classes c ON u.class_id = c.id 
              WHERE u.role = 'student' AND c.department = ? AND c.year = ?
              ORDER BY c.section, u.register_no`,
        [assignment.department, assignment.year], (err, students) => {
          if (err) return res.status(500).json({ error: 'Database error' });
          
          res.json({
            assignment,
            students
          });
        });
    });
});

// Admin routes
const adminRoutes = require('./routes/admin');
app.use('/api/admin', authenticateToken, requireAdmin, (req, res, next) => {
  req.db = db;
  next();
}, adminRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('✅ Enhanced auto-creation system with:');
  console.log('  - Admin notifications for class creation');
  console.log('  - Department/year validation');
  console.log('  - Proper capacity checking');
  console.log('  - Rollback mechanism');
  console.log('  - Optional auto-creation toggle');
});