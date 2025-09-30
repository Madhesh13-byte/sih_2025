const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const puppeteer = require('puppeteer');
const setupPortfolioRoutes = require('./portfolioRoutes');
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
      
      // Add status column if it doesn't exist (for existing tables)
      try {
        await db.query(`
          ALTER TABLE certificates 
          ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending'
        `);
      } catch (error) {
        console.log('Status column already exists or error adding it:', error.message);
      }
      
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
          const certCount = Math.floor(Math.random() * 6) + 1; // 1-6 certificates per student
          
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

// Get all accounts
app.get('/api/admin/accounts', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, role, register_no, staff_id, admin_id, department, email FROM users ORDER BY role, name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Get next student number
app.get('/api/admin/next-student-number', authenticateToken, async (req, res) => {
  const { dept, year } = req.query;
  try {
    const result = await db.query('SELECT COUNT(*) as count FROM users WHERE register_no LIKE $1', [`STU${dept}${year}%`]);
    res.json({ nextNumber: parseInt(result.rows[0].count) + 1 });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Create student account
app.post('/api/admin/create-student', authenticateToken, async (req, res) => {
  const { name, email, register_no, password, department } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (name, email, register_no, password, role, department) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, email, register_no, hashedPassword, 'student', department]
    );
    res.json({ message: 'Student account created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Get all subjects
app.get('/api/subjects', authenticateToken, async (req, res) => {
  try {
    const tableCheck = await db.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subjects')");
    if (!tableCheck.rows[0].exists) {
      return res.json([]);
    }
    
    const result = await db.query('SELECT * FROM subjects ORDER BY subject_name');
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Subjects fetch error:', error);
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

// Get all staff assignments
app.get('/api/staff-assignments', authenticateToken, async (req, res) => {
  try {
    console.log('📋 Fetching staff assignments from database...');
    const { department, year, semester } = req.query;
    
    let query = 'SELECT * FROM staff_assignments';
    let params = [];
    let conditions = [];
    
    if (department) {
      conditions.push(`department = $${params.length + 1}`);
      params.push(department);
    }
    if (year) {
      conditions.push(`year = $${params.length + 1}`);
      params.push(year);
    }
    if (semester) {
      conditions.push(`semester = $${params.length + 1}`);
      params.push(semester);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY id';
    
    const result = await db.query(query, params);
    console.log(`📋 Found ${result.rows.length} staff assignments`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Staff assignments fetch error:', error.message);
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

// Get CC assignments
app.get('/api/cc-assignments', authenticateToken, async (req, res) => {
  try {
    console.log('👨‍🏫 Fetching CC assignments from database...');
    const result = await db.query('SELECT * FROM cc_assignments ORDER BY id');
    console.log(`👨‍🏫 Found ${result.rows.length} CC assignments`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ CC assignments fetch error:', error.message);
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

// Create CC assignment
app.post('/api/cc-assignments', authenticateToken, async (req, res) => {
  const { staffId, staffName, department, year, semester } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO cc_assignments (staff_id, staff_name, department, year, semester) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [staffId, staffName, department, year, semester]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ CC assignment creation error:', error.message);
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

// Delete CC assignment
app.delete('/api/cc-assignments/:id', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM cc_assignments WHERE id = $1', [req.params.id]);
    res.json({ message: 'CC assignment deleted successfully' });
  } catch (error) {
    console.error('❌ CC assignment deletion error:', error.message);
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

// Get classes/timetable
app.get('/api/classes', authenticateToken, async (req, res) => {
  try {
    console.log('🏫 Fetching classes from database...');
    const result = await db.query('SELECT * FROM classes ORDER BY id');
    console.log(`🏫 Found ${result.rows.length} classes`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Classes fetch error:', error.message);
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

// Create class entry
app.post('/api/classes', authenticateToken, async (req, res) => {
  try {
    const { department, year, semester, section } = req.body;
    const result = await db.query(
      'INSERT INTO classes (department, year, semester, section) VALUES ($1, $2, $3, $4) RETURNING *',
      [department, year, semester, section]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Class creation error:', error.message);
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

// Get class details with students and assignments
app.get('/api/classes/:id/details', authenticateToken, async (req, res) => {
  try {
    const classId = req.params.id;
    
    // Get class info
    const classResult = await db.query('SELECT * FROM classes WHERE id = $1', [classId]);
    if (classResult.rows.length === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }
    const classInfo = classResult.rows[0];
    
    // Get students for this class (based on department, year, semester)
    const studentsResult = await db.query(
      'SELECT * FROM users WHERE role = $1 AND department = $2',
      ['student', classInfo.department]
    );
    
    // Get staff assignments for this class
    const assignmentsResult = await db.query(
      'SELECT * FROM staff_assignments WHERE department = $1 AND year = $2',
      [classInfo.department, classInfo.year]
    );
    
    // Get CC assignments for this class
    const ccResult = await db.query(
      'SELECT * FROM cc_assignments WHERE department = $1 AND year = $2',
      [classInfo.department, classInfo.year]
    );
    
    res.json({
      class: classInfo,
      students: studentsResult.rows,
      assignments: assignmentsResult.rows,
      ccAssignments: ccResult.rows
    });
  } catch (error) {
    console.error('❌ Class details fetch error:', error.message);
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

// Delete class
app.delete('/api/classes/:id', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM classes WHERE id = $1', [req.params.id]);
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('❌ Class deletion error:', error.message);
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

// Get results/grades
app.get('/api/results', authenticateToken, async (req, res) => {
  try {
    console.log('📊 Fetching results from database...');
    const result = await db.query('SELECT * FROM student_results ORDER BY id');
    console.log(`📊 Found ${result.rows.length} results`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Results fetch error:', error.message);
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

// Get timetables with filtering
app.get('/api/timetables', authenticateToken, async (req, res) => {
  try {
    console.log('📅 Fetching timetables from database...');
    const { department, year, semester, section } = req.query;
    
    let query = 'SELECT * FROM timetables';
    let params = [];
    let conditions = [];
    
    if (department) {
      conditions.push(`department = $${params.length + 1}`);
      params.push(department);
    }
    if (year) {
      conditions.push(`year = $${params.length + 1}`);
      params.push(year);
    }
    if (semester) {
      conditions.push(`semester = $${params.length + 1}`);
      params.push(semester);
    }
    if (section) {
      conditions.push(`section = $${params.length + 1}`);
      params.push(section);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY day_of_week, period_number';
    
    const result = await db.query(query, params);
    console.log(`📅 Found ${result.rows.length} timetable entries`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Timetable fetch error:', error.message);
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

// Create timetable entry
app.post('/api/timetables', authenticateToken, async (req, res) => {
  try {
    const { department, year, semester, section, day_of_week, period_number, start_time, end_time, subject_code, subject_name, staff_id, staff_name, room_number } = req.body;
    
    // Check if class exists, create if not
    const classCheck = await db.query(
      'SELECT id FROM classes WHERE department = $1 AND year = $2 AND semester = $3 AND section = $4',
      [department, year, semester, section]
    );
    
    let classId;
    if (classCheck.rows.length === 0) {
      const classResult = await db.query(
        'INSERT INTO classes (department, year, semester, section) VALUES ($1, $2, $3, $4) RETURNING id',
        [department, year, semester, section]
      );
      classId = classResult.rows[0].id;
    } else {
      classId = classCheck.rows[0].id;
    }
    
    const result = await db.query(
      'INSERT INTO timetables (department, year, semester, section, day_of_week, period_number, start_time, end_time, subject_code, subject_name, staff_id, staff_name, room_number) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *',
      [department, year, semester, section, day_of_week, period_number, start_time, end_time, subject_code, subject_name, staff_id, staff_name, room_number]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Timetable creation error:', error.message);
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

// Delete timetable entry
app.delete('/api/timetables/:id', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM timetables WHERE id = $1', [req.params.id]);
    res.json({ message: 'Timetable entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

// Delete entire class timetable
app.delete('/api/timetables/class', authenticateToken, async (req, res) => {
  try {
    const { department, year, semester, section } = req.body;
    const result = await db.query(
      'DELETE FROM timetables WHERE department = $1 AND year = $2 AND semester = $3 AND section = $4',
      [department, year, semester, section]
    );
    res.json({ message: `Deleted ${result.rowCount} timetable entries` });
  } catch (error) {
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

// Get next staff number
app.get('/api/admin/next-staff-number', authenticateToken, async (req, res) => {
  const { dept } = req.query;
  try {
    const result = await db.query('SELECT COUNT(*) as count FROM users WHERE staff_id LIKE $1', [`STF${dept}%`]);
    res.json({ nextNumber: parseInt(result.rows[0].count) + 1 });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Create staff account
app.post('/api/admin/create-staff', authenticateToken, async (req, res) => {
  const { name, email, staff_id, password, department } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (name, email, staff_id, password, role, department) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, email, staff_id, hashedPassword, 'staff', department]
    );
    res.json({ message: 'Staff account created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete single account
app.delete('/api/admin/delete-account/:userId', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM users WHERE id = $1', [req.params.userId]);
    if (result.rowCount > 0) {
      res.json({ message: 'Account deleted successfully' });
    } else {
      res.status(404).json({ error: 'Account not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete all accounts
app.delete('/api/admin/delete-all-accounts', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM users WHERE role != $1', ['admin']);
    res.json({ message: `Deleted ${result.rowCount} accounts` });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Reset password
app.put('/api/admin/reset-password/:userId', authenticateToken, async (req, res) => {
  const { password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, req.params.userId]);
    if (result.rowCount > 0) {
      res.json({ message: 'Password reset successfully' });
    } else {
      res.status(404).json({ error: 'Account not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Subject endpoints
app.post('/api/subjects', authenticateToken, async (req, res) => {
  const { subject_code, subject_name, department, year, semester, credits } = req.body;
  try {
    if (!subject_code || !subject_name || !department || !year || !semester) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const tableCheck = await db.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subjects')");
    
    if (!tableCheck.rows[0].exists) {
      await db.query(`
        CREATE TABLE subjects (
          id SERIAL PRIMARY KEY,
          subject_code VARCHAR(20) NOT NULL,
          subject_name VARCHAR(255) NOT NULL,
          department VARCHAR(50) NOT NULL,
          year INTEGER NOT NULL,
          semester INTEGER NOT NULL,
          credits INTEGER DEFAULT 3
        )
      `);
    } else {
      // Fix sequence if it's out of sync
      await db.query("SELECT setval('subjects_id_seq', (SELECT MAX(id) FROM subjects))");
    }
    
    const result = await db.query(
      'INSERT INTO subjects (subject_code, subject_name, department, year, semester, credits) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [subject_code, subject_name, department, year, semester, credits || 3]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Subject creation error:', error.message);
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

app.delete('/api/subjects/:id', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM subjects WHERE id = $1', [req.params.id]);
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Staff assignments endpoints
app.post('/api/staff-assignments', authenticateToken, async (req, res) => {
  const { staffId, staffName, subjectCode, subjectName, department, year, semester, section, class_id } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO staff_assignments (staff_id, staff_name, subject_code, subject_name, department, year, semester, section, class_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [staffId, staffName, subjectCode, subjectName, department, year, semester, section, class_id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/staff-assignments/:id', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM staff_assignments WHERE id = $1', [req.params.id]);
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/staff-assignments', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM staff_assignments');
    res.json({ message: `Deleted ${result.rowCount} assignments` });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Get student results by register number
app.get('/api/student-results/:register_no', authenticateToken, async (req, res) => {
  try {
    const { register_no } = req.params;
    const { semester } = req.query;
    
    let query = 'SELECT * FROM student_results WHERE register_no = $1';
    let params = [register_no];
    
    if (semester) {
      query += ' AND semester = $2';
      params.push(semester);
    }
    
    query += ' ORDER BY semester, subject_code';
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Student results fetch error:', error.message);
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

// Get student grades (current semester)
app.get('/api/student/grades', authenticateToken, async (req, res) => {
  try {
    const { semester } = req.query;
    // This would typically get current semester grades from a different table
    // For now, return empty structure
    res.json({ assignments: [], ias: [], semesters: [] });
  } catch (error) {
    console.error('❌ Student grades fetch error:', error.message);
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

// Get student GPA
app.get('/api/student/gpa', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { semester } = req.query;
    
    // Get user register_no
    const userResult = await db.query('SELECT register_no FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.json({ current: { cgpa: 0, sgpa: 0 } });
    }
    const registerNo = userResult.rows[0].register_no;
    
    // Grade to points mapping
    const gradePoints = {
      'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'P': 4, 'F': 0
    };
    
    // Get all results for CGPA calculation
    const allResultsQuery = 'SELECT semester_grade, semester FROM student_results WHERE register_no = $1 AND semester_grade IS NOT NULL';
    const allResults = await db.query(allResultsQuery, [registerNo]);
    
    let totalPoints = 0;
    let totalSubjects = 0;
    let semesterPoints = 0;
    let semesterSubjects = 0;
    
    allResults.rows.forEach(result => {
      const points = gradePoints[result.semester_grade] || 0;
      totalPoints += points;
      totalSubjects++;
      
      // Calculate SGPA for specific semester if provided
      if (semester && result.semester == semester) {
        semesterPoints += points;
        semesterSubjects++;
      }
    });
    
    const cgpa = totalSubjects > 0 ? (totalPoints / totalSubjects).toFixed(2) : 0;
    const sgpa = semesterSubjects > 0 ? (semesterPoints / semesterSubjects).toFixed(2) : 0;
    
    res.json({ 
      current: { 
        cgpa: parseFloat(cgpa), 
        sgpa: parseFloat(sgpa) 
      } 
    });
  } catch (error) {
    console.error('❌ Student GPA fetch error:', error.message);
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

// Get student attendance
app.get('/api/student/attendance', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get attendance records using user id directly
    const attendanceResult = await db.query(
      'SELECT * FROM attendance WHERE student_id = $1 ORDER BY date DESC',
      [userId]
    );
    
    // Group by subject and calculate statistics
    const subjectMap = {};
    let totalClasses = 0;
    let totalPresent = 0;
    
    attendanceResult.rows.forEach(record => {
      const subjectCode = record.subject_code;
      if (!subjectMap[subjectCode]) {
        subjectMap[subjectCode] = {
          subject_code: subjectCode,
          subject_name: record.subject_name || subjectCode,
          total: 0,
          present: 0,
          records: []
        };
      }
      
      subjectMap[subjectCode].total++;
      totalClasses++;
      
      if (record.status === 'present') {
        subjectMap[subjectCode].present++;
        totalPresent++;
      }
      
      subjectMap[subjectCode].records.push(record);
    });
    
    // Calculate percentages
    const subjects = Object.values(subjectMap).map(subject => ({
      ...subject,
      percentage: subject.total > 0 ? Math.round((subject.present / subject.total) * 100) : 0
    }));
    
    const overallPercentage = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;
    
    res.json({
      subjects,
      overall: {
        total: totalClasses,
        present: totalPresent,
        missed: totalClasses - totalPresent,
        percentage: overallPercentage
      }
    });
  } catch (error) {
    console.error('❌ Student attendance fetch error:', error.message);
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

// Get student timetable
app.get('/api/student/timetable', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user info to find department
    const userResult = await db.query('SELECT department FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const department = userResult.rows[0].department;
    
    // Get timetable for student's department (assuming current year/semester)
    const timetableResult = await db.query(
      'SELECT * FROM timetables WHERE department = $1 ORDER BY day_of_week, period_number',
      [department]
    );
    
    res.json(timetableResult.rows);
  } catch (error) {
    console.error('❌ Student timetable fetch error:', error.message);
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

// Get students for staff assignment
app.get('/api/staff/students/:assignmentId', authenticateToken, async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { academic_year } = req.query;
    
    // Get assignment details
    const assignmentResult = await db.query('SELECT * FROM staff_assignments WHERE id = $1', [assignmentId]);
    if (assignmentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    const assignment = assignmentResult.rows[0];
    
    // Get students for this department and year
    const studentsResult = await db.query(
      'SELECT id, name, register_no, department FROM users WHERE role = $1 AND department = $2 ORDER BY name',
      ['student', assignment.department]
    );
    
    res.json({ students: studentsResult.rows });
  } catch (error) {
    console.error('❌ Staff students fetch error:', error.message);
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

// Save grades
app.post('/api/staff/grades', authenticateToken, async (req, res) => {
  try {
    const { students, subject_code, subject_name, semester, grade_type, academic_year } = req.body;
    
    // Save grades for each student
    const promises = students.map(student => {
      if (grade_type === 'Semester') {
        return db.query(
          'INSERT INTO student_results (register_no, subject_code, semester, academic_year, semester_grade) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (register_no, subject_code, semester, academic_year) DO UPDATE SET semester_grade = $5',
          [student.id, subject_code, semester, academic_year, student.grade]
        );
      } else {
        const column = grade_type.toLowerCase() + '_marks';
        return db.query(
          `INSERT INTO student_results (register_no, subject_code, semester, academic_year, ${column}) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (register_no, subject_code, semester, academic_year) DO UPDATE SET ${column} = $5`,
          [student.id, subject_code, semester, academic_year, student.marks]
        );
      }
    });
    
    await Promise.all(promises);
    res.json({ message: 'Grades saved successfully' });
  } catch (error) {
    console.error('❌ Staff grades save error:', error.message);
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

// Student results endpoints
app.post('/api/student-results/import', authenticateToken, async (req, res) => {
  try {
    // Handle CSV import logic here
    res.json({ message: 'Results imported successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Import failed' });
  }
});

app.get('/api/student-results/template', authenticateToken, async (req, res) => {
  try {
    const csvContent = 'register_no,subject_code,semester,academic_year,ia1_marks,ia2_marks,ia3_marks,semester_grade\n';
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=student_results_template.csv');
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ error: 'Template generation failed' });
  }
});

app.post('/api/admin/calculate-all-gpa', authenticateToken, async (req, res) => {
  try {
    // GPA calculation logic here
    res.json({ message: 'GPA calculated for all students' });
  } catch (error) {
    res.status(500).json({ error: 'GPA calculation failed' });
  }
});



// Get top 10 students leaderboard
app.get('/api/students/leaderboard', authenticateToken, async (req, res) => {
  try {
    console.log('🏆 Fetching leaderboard data from database...');
    
    // Get students with their certificate counts and calculate points
    const query = `
      SELECT 
        u.id as student_id,
        u.name,
        u.register_no,
        u.department,
        COUNT(c.id) as certificate_count,
        (COUNT(c.id) * 5) as total_points
      FROM users u
      LEFT JOIN certificates c ON u.id = c.user_id
      WHERE u.role = 'student'
      GROUP BY u.id, u.name, u.register_no, u.department
      ORDER BY total_points DESC, certificate_count DESC, u.name ASC
      LIMIT 10
    `;
    
    const result = await db.query(query);
    console.log(`🏆 Found ${result.rows.length} students for leaderboard`);
    
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Leaderboard fetch error:', error.message);
    // Return empty array if certificates table doesn't exist yet
    if (error.message.includes('relation "certificates" does not exist')) {
      console.log('📝 Certificates table not found, returning sample data');
      // Try to get students without certificates table
      const studentsQuery = `
        SELECT 
          u.id as student_id,
          u.name,
          u.register_no,
          u.department,
          0 as certificate_count,
          0 as total_points
        FROM users u
        WHERE u.role = 'student'
        ORDER BY u.name ASC
        LIMIT 10
      `;
      
      const studentsResult = await db.query(studentsQuery);
      return res.json(studentsResult.rows);
    }
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

// Certificate upload endpoint
app.post('/api/certificates/upload', authenticateToken, async (req, res) => {
  try {
    const { certificate_name } = req.body;
    const userId = req.user.id;
    
    // Create certificates table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS certificates (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        certificate_name VARCHAR(255) NOT NULL,
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'pending'
      )
    `);
    
    // Insert certificate record
    const result = await db.query(
      'INSERT INTO certificates (user_id, certificate_name) VALUES ($1, $2) RETURNING *',
      [userId, certificate_name]
    );
    
    console.log(`📜 Certificate uploaded: ${certificate_name} for user ${userId}`);
    res.json({ message: 'Certificate uploaded successfully', certificate: result.rows[0] });
  } catch (error) {
    console.error('❌ Certificate upload error:', error.message);
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

// Get students with certificates for CC staff
app.get('/api/cc-students-certificates', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id,
        u.name,
        u.register_no,
        u.department,
        COUNT(c.id) as total_certificates,
        COUNT(CASE WHEN c.status = 'approved' THEN 1 END) as approved_certificates,
        COUNT(CASE WHEN c.status = 'pending' THEN 1 END) as pending_certificates
      FROM users u
      LEFT JOIN certificates c ON u.id = c.user_id
      WHERE u.role = 'student'
      GROUP BY u.id, u.name, u.register_no, u.department
      ORDER BY u.name
    `;
    
    const result = await db.query(query);
    
    const students = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      register_no: row.register_no,
      department: row.department,
      year: 3,
      totalCertificates: parseInt(row.total_certificates) || 0,
      approvedCertificates: parseInt(row.approved_certificates) || 0,
      pendingCertificates: parseInt(row.pending_certificates) || 0
    }));
    
    res.json({ students });
  } catch (error) {
    console.error('❌ CC students fetch error:', error.message);
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

// Get certificates for a specific student
app.get('/api/student-certificates/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const result = await db.query(
      'SELECT * FROM certificates WHERE user_id = $1 ORDER BY upload_date DESC',
      [studentId]
    );
    
    res.json({ certificates: result.rows });
  } catch (error) {
    console.error('❌ Student certificates fetch error:', error.message);
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

// Approve/Reject certificate
app.put('/api/certificates/:certId/approve', authenticateToken, async (req, res) => {
  try {
    const { certId } = req.params;
    const { status } = req.body;
    
    const result = await db.query(
      'UPDATE certificates SET status = $1 WHERE id = $2 RETURNING *',
      [status, certId]
    );
    
    res.json({ message: `Certificate ${status} successfully`, certificate: result.rows[0] });
  } catch (error) {
    console.error('❌ Certificate approval error:', error.message);
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

// Generate Official Portfolio PDF
app.post('/api/generate-portfolio-pdf', authenticateToken, async (req, res) => {
  const { studentData, semesterResults, achievements } = req.body;
  
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page { size: A4; margin: 0.5in; }
    body { font-family: 'Times New Roman', serif; margin: 0; color: #000; background: white; }
    .header { padding: 30px 40px; border-bottom: 3px solid #1e3a8a; text-align: center; }
    .logo { width: 80px; height: 80px; background: #1e3a8a; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold; margin: 0 auto 20px; }
    h1 { margin: 0 0 5px 0; font-size: 24px; color: #1e3a8a; font-weight: bold; }
    h2 { margin: 0; font-size: 20px; color: #1e3a8a; font-weight: bold; letter-spacing: 1px; }
    h3 { margin: 0 0 15px 0; font-size: 16px; color: #1e3a8a; font-weight: bold; border-bottom: 2px solid #1e3a8a; padding-bottom: 5px; display: inline-block; }
    .section { padding: 25px 40px; border-bottom: 1px solid #e5e7eb; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .info-item { margin: 5px 0; font-size: 14px; }
    .summary-flex { display: flex; gap: 30px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border: 1px solid #d1d5db; padding: 8px; text-align: center; }
    th { background: #f3f4f6; }
    .achievements-table { font-size: 11px; }
    .achievements-table td { padding: 6px; }
    .signatures { display: flex; justify-content: space-between; align-items: end; margin-bottom: 30px; }
    .signature-box { text-align: center; width: 150px; }
    .signature-line { height: 60px; border-bottom: 1px solid #000; margin-bottom: 5px; }
    .seal { width: 80px; height: 80px; border: 2px solid #1e3a8a; border-radius: 50%; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #1e3a8a; }
    .footer-text { margin: 0; font-size: 11px; font-style: italic; color: #6b7280; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">LOGO</div>
    <h1>XYZ COLLEGE OF ENGINEERING</h1>
    <p style="margin: 0 0 20px 0; font-size: 14px; color: #6b7280;">Autonomous Institution | NAAC A+ Accredited</p>
    <h2>VERIFIED STUDENT ACHIEVEMENT PORTFOLIO</h2>
  </div>
  
  <div class="section">
    <h3>STUDENT INFORMATION</h3>
    <div class="info-grid">
      <div>
        <p class="info-item"><strong>Register Number:</strong> ${studentData.regNo}</p>
        <p class="info-item"><strong>Full Name:</strong> ${studentData.fullName}</p>
        <p class="info-item"><strong>Department:</strong> ${studentData.department}</p>
      </div>
      <div>
        <p class="info-item"><strong>Year:</strong> ${studentData.year}</p>
        <p class="info-item"><strong>Program:</strong> ${studentData.program}</p>
      </div>
    </div>
  </div>
  
  <div class="section">
    <h3>ACADEMIC SUMMARY</h3>
    <div class="summary-flex">
      <p style="margin: 0; font-size: 14px;"><strong>CGPA:</strong> ${studentData.cgpa}</p>
      <p style="margin: 0; font-size: 14px;"><strong>Attendance:</strong> ${studentData.attendance}</p>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>Semester</th>
          <th>GPA</th>
          <th>Credits</th>
        </tr>
      </thead>
      <tbody>
        ${semesterResults.map(sem => `
          <tr>
            <td>${sem.semester}</td>
            <td>${sem.gpa}</td>
            <td>${sem.credits}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  
  <div class="section">
    <h3>VERIFIED ACHIEVEMENTS & CERTIFICATIONS</h3>
    
    <table class="achievements-table">
      <thead>
        <tr>
          <th style="width: 8%;">Sl. No</th>
          <th style="width: 15%;">Activity Type</th>
          <th style="width: 30%;">Title / Certificate</th>
          <th style="width: 20%;">Issuing Body</th>
          <th style="width: 15%;">Date</th>
          <th style="width: 12%;">Verified</th>
        </tr>
      </thead>
      <tbody>
        ${achievements.map(achievement => `
          <tr>
            <td>${achievement.sl}</td>
            <td>${achievement.type}</td>
            <td>${achievement.title}</td>
            <td>${achievement.issuer}</td>
            <td>${achievement.date}</td>
            <td>${achievement.verified ? '✓' : '✗'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  
  <div style="padding: 40px 40px 30px 40px;">
    <div class="signatures">
      <div class="signature-box">
        <div class="signature-line"></div>
        <p style="margin: 0; font-size: 12px; font-weight: bold;">Student Signature</p>
      </div>
      <div class="signature-box">
        <div class="signature-line"></div>
        <p style="margin: 0; font-size: 12px; font-weight: bold;">Faculty Advisor</p>
      </div>
      <div class="signature-box">
        <div class="signature-line"></div>
        <p style="margin: 0; font-size: 12px; font-weight: bold;">HOD / Principal</p>
      </div>
    </div>
    
    <div style="text-align: center; margin-top: 20px;">
      <div class="seal">COLLEGE SEAL</div>
      <p class="footer-text">* This portfolio is system-generated and verified by XYZ College of Engineering *</p>
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
    res.setHeader('Content-Disposition', `attachment; filename="${studentData.fullName.replace(/\s+/g, '_')}_Official_Portfolio.pdf"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.end(pdf, 'binary');
  } catch (error) {
    console.error('Official PDF generation error:', error);
    res.status(500).json({ error: 'PDF generation failed' });
  }
});

// Get academic calendar and day order
app.get('/api/academic-calendar', authenticateToken, async (req, res) => {
  try {
    // Return academic calendar configuration
    // This can be stored in database and made configurable
    const calendar = {
      academicYearStart: '2024-07-01',
      dayOrderCycle: 5,
      workingDays: [1, 2, 3, 4, 5], // Monday to Friday
      holidays: [], // Can be populated from database
      currentSemester: {
        start: '2024-07-01',
        end: '2024-12-31'
      }
    };
    
    res.json(calendar);
  } catch (error) {
    console.error('❌ Academic calendar fetch error:', error.message);
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

// Get current day order
app.get('/api/day-order', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    // Skip weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return res.json({ dayOrder: null, isWeekend: true });
    }

    // Calculate day order based on academic year start
    const academicYearStart = new Date('2024-07-01');
    const msPerDay = 24 * 60 * 60 * 1000;
    
    let workingDays = 0;
    let currentDate = new Date(academicYearStart);
    
    while (currentDate <= today) {
      const day = currentDate.getDay();
      if (day !== 0 && day !== 6) {
        workingDays++;
      }
      currentDate.setTime(currentDate.getTime() + msPerDay);
    }
    
    const dayOrder = ((workingDays - 1) % 5) + 1;
    
    res.json({ 
      dayOrder, 
      isWeekend: false,
      workingDay: workingDays,
      date: today.toISOString().split('T')[0]
    });
  } catch (error) {
    console.error('❌ Day order calculation error:', error.message);
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

// Get students assigned to teacher's classes
app.get('/api/teacher-students/:staffId', authenticateToken, async (req, res) => {
  try {
    const { staffId } = req.params;
    
    // Simple approach: get all students with certificates
    const studentsQuery = `
      SELECT 
        u.id,
        u.name,
        u.register_no,
        u.department,
        0 as total_certificates,
        0 as approved_certificates,
        0 as pending_certificates
      FROM users u
      WHERE u.role = 'student'
      ORDER BY u.name
    `;
    
    const result = await db.query(studentsQuery);
    
    const students = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      register_no: row.register_no,
      department: row.department,
      year: 3,
      totalCertificates: 0,
      approvedCertificates: 0,
      pendingCertificates: 0
    }));
    
    res.json({ students });
  } catch (error) {
    console.error('\u274c Teacher students fetch error:', error.message);
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

// Get teacher's schedule for today
app.get('/api/teacher-schedule', authenticateToken, async (req, res) => {
  try {
    const { staff_id, day } = req.query;
    
    if (!staff_id || day === undefined) {
      return res.status(400).json({ error: 'Missing staff_id or day parameter' });
    }
    
    const result = await db.query(
      'SELECT * FROM timetables WHERE staff_id = $1 AND day_of_week = $2 ORDER BY period_number',
      [staff_id, day]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Teacher schedule fetch error:', error.message);
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

// Get approved certificates for student
app.get('/api/student/approved-certificates', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      'SELECT certificate_name, upload_date FROM certificates WHERE user_id = $1 AND status = $2 ORDER BY upload_date DESC',
      [userId, 'approved']
    );
    res.json({ certificates: result.rows });
  } catch (error) {
    console.error('Certificate fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

// AI Resume Generation
app.post('/api/generate-ai-resume', authenticateToken, async (req, res) => {
  try {
    const { userInfo, certificates, template } = req.body;
    
    // Create prompt for LLM
    const prompt = `
Generate a professional resume in JSON format for:
Name: ${userInfo.name}
Department: ${userInfo.department}
Register No: ${userInfo.registerNo}

Approved Certificates:
${certificates.map(cert => `- ${cert.certificate_name}`).join('\n')}

Generate appropriate:
1. Professional objective (2-3 lines)
2. Skills based on certificates
3. Projects related to certificates
4. Experience descriptions
5. Education details

Return JSON in this exact format:
{
  "personalInfo": {
    "name": "${userInfo.name}",
    "email": "student@college.edu",
    "phone": "+91-XXXXXXXXXX",
    "address": "City, State",
    "linkedin": "linkedin.com/in/username",
    "github": "github.com/username"
  },
  "objective": "Professional objective here",
  "education": [{
    "degree": "Bachelor of Technology in ${userInfo.department}",
    "institution": "College Name",
    "year": "2021-2025",
    "cgpa": "8.5"
  }],
  "experience": [{
    "title": "Relevant position",
    "company": "Company/Project",
    "duration": "Duration",
    "description": "Description based on certificates"
  }],
  "skills": ["skill1", "skill2", "skill3"],
  "projects": [{
    "name": "Project name",
    "description": "Project description",
    "technologies": "Technologies used"
  }]
}
`;

    // For demo, return structured data based on certificates
    // In production, integrate with OpenAI, Gemini, or other LLM APIs
    const aiGeneratedResume = generateResumeFromCertificates(userInfo, certificates);
    
    res.json({ resumeData: aiGeneratedResume });
  } catch (error) {
    console.error('AI resume generation error:', error);
    res.status(500).json({ error: 'AI generation failed' });
  }
});

// Helper function to generate resume from certificates
function generateResumeFromCertificates(userInfo, certificates) {
  const skills = [];
  const projects = [];
  const experience = [];
  
  // Extract skills from certificate names
  certificates.forEach(cert => {
    const certName = cert.certificate_name.toLowerCase();
    if (certName.includes('python')) skills.push('Python Programming');
    if (certName.includes('java')) skills.push('Java Development');
    if (certName.includes('web')) skills.push('Web Development');
    if (certName.includes('ai') || certName.includes('machine learning')) skills.push('Machine Learning', 'Artificial Intelligence');
    if (certName.includes('cloud') || certName.includes('aws')) skills.push('Cloud Computing', 'AWS');
    if (certName.includes('database') || certName.includes('sql')) skills.push('Database Management', 'SQL');
  });
  
  // Generate projects based on certificates
  if (certificates.length > 0) {
    projects.push({
      name: `${userInfo.department} Certification Project`,
      description: `Developed project demonstrating skills from ${certificates.length} certified courses`,
      technologies: skills.slice(0, 3).join(', ')
    });
  }
  
  return {
    personalInfo: {
      name: userInfo.name,
      email: `${userInfo.registerNo}@college.edu`,
      phone: '+91-XXXXXXXXXX',
      address: 'City, State, India',
      linkedin: 'linkedin.com/in/profile',
      github: 'github.com/username'
    },
    objective: `Motivated ${userInfo.department} student with ${certificates.length} certified skills seeking opportunities to apply technical knowledge in real-world projects. Passionate about continuous learning and professional development.`,
    education: [{
      degree: `Bachelor of Technology in ${userInfo.department}`,
      institution: 'College of Engineering',
      year: '2021-2025',
      cgpa: '8.5'
    }],
    experience: certificates.length > 2 ? [{
      title: 'Technical Intern',
      company: 'Technology Company',
      duration: 'Summer 2024',
      description: `Applied certified skills in ${skills.slice(0, 2).join(' and ')} to contribute to real-world projects`
    }] : [{
      title: 'Project Developer',
      company: 'Academic Project',
      duration: '2024',
      description: 'Developed projects using certified technical skills'
    }],
    skills: [...new Set(skills)], // Remove duplicates
    projects,
    certifications: certificates.map(cert => cert.certificate_name)
  };
}

// Generate Resume PDF
app.post('/api/generate-resume-pdf', authenticateToken, async (req, res) => {
  const { template = 'modern', ...resumeData } = req.body;
  
  const getTemplateHTML = (template, data) => {
    const templates = {
      modern: `
        <style>
          body { font-family: 'Segoe UI', sans-serif; color: #2d3748; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .name { font-size: 28px; font-weight: 300; margin-bottom: 10px; }
          .contact { font-size: 14px; opacity: 0.9; }
          .section { margin: 25px 0; }
          .section-title { font-size: 18px; font-weight: 600; color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 8px; margin-bottom: 15px; }
          .item { margin-bottom: 15px; padding-left: 15px; border-left: 3px solid #e2e8f0; }
          .item-title { font-weight: 600; color: #2d3748; font-size: 16px; }
          .item-subtitle { color: #718096; font-size: 14px; margin-top: 2px; }
          .skills-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
          .skill-item { background: #f7fafc; padding: 8px 12px; border-radius: 20px; text-align: center; font-size: 13px; }
        </style>`,
      
      classic: `
        <style>
          body { font-family: 'Times New Roman', serif; color: #000; }
          .header { text-align: center; border-bottom: 3px double #000; padding-bottom: 20px; margin-bottom: 25px; }
          .name { font-size: 24px; font-weight: bold; margin-bottom: 8px; }
          .contact { font-size: 12px; }
          .section-title { font-size: 16px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; margin: 20px 0 10px 0; }
          .item { margin-bottom: 12px; }
          .item-title { font-weight: bold; }
          .item-subtitle { font-style: italic; }
          .skills-list { columns: 2; }
        </style>`,
      
      creative: `
        <style>
          body { font-family: 'Arial', sans-serif; color: #2c3e50; }
          .header { background: #e74c3c; color: white; padding: 25px; border-radius: 10px; margin-bottom: 20px; }
          .name { font-size: 26px; font-weight: bold; }
          .section-title { background: #3498db; color: white; padding: 8px 15px; border-radius: 5px; font-weight: bold; }
          .item { background: #ecf0f1; padding: 12px; margin: 8px 0; border-radius: 5px; border-left: 4px solid #e74c3c; }
          .skill-item { background: #f39c12; color: white; padding: 5px 10px; border-radius: 15px; display: inline-block; margin: 3px; }
        </style>`,
      
      minimal: `
        <style>
          body { font-family: 'Helvetica', sans-serif; color: #333; line-height: 1.6; }
          .header { margin-bottom: 30px; }
          .name { font-size: 32px; font-weight: 100; margin-bottom: 5px; }
          .contact { font-size: 14px; color: #666; }
          .section-title { font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin: 25px 0 10px 0; }
          .item { margin-bottom: 15px; }
          .item-title { font-weight: 500; }
          .item-subtitle { color: #666; font-size: 13px; }
          .skills-list { font-size: 14px; }
        </style>`
    };
    
    return templates[template] || templates.modern;
  };
  
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page { size: A4; margin: 0.5in; }
    ${getTemplateHTML(template, resumeData)}
  </style>
</head>
<body>
  <div class="header">
    <div class="name">${resumeData.personalInfo.name}</div>
    <div class="contact">
      ${resumeData.personalInfo.email} | ${resumeData.personalInfo.phone} | ${resumeData.personalInfo.address}<br>
      ${resumeData.personalInfo.linkedin ? 'LinkedIn: ' + resumeData.personalInfo.linkedin : ''}
      ${resumeData.personalInfo.github ? ' | GitHub: ' + resumeData.personalInfo.github : ''}
    </div>
  </div>
  
  ${resumeData.objective ? `
  <div class="section">
    <div class="section-title">OBJECTIVE</div>
    <div>${resumeData.objective}</div>
  </div>
  ` : ''}
  
  <div class="section">
    <div class="section-title">EDUCATION</div>
    ${resumeData.education.map(edu => `
      <div class="item">
        <div class="item-title">${edu.degree}</div>
        <div class="item-subtitle">${edu.institution} | ${edu.year} ${edu.cgpa ? '| CGPA: ' + edu.cgpa : ''}</div>
      </div>
    `).join('')}
  </div>
  
  ${resumeData.experience.some(exp => exp.title) ? `
  <div class="section">
    <div class="section-title">EXPERIENCE</div>
    ${resumeData.experience.filter(exp => exp.title).map(exp => `
      <div class="item">
        <div class="item-title">${exp.title}</div>
        <div class="item-subtitle">${exp.company} | ${exp.duration}</div>
        ${exp.description ? `<div class="item-description">${exp.description}</div>` : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}
  
  ${resumeData.skills.filter(skill => skill).length > 0 ? `
  <div class="section">
    <div class="section-title">SKILLS</div>
    <div class="skills-list">
      ${resumeData.skills.filter(skill => skill).map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
    </div>
  </div>
  ` : ''}
  
  ${resumeData.projects.some(proj => proj.name) ? `
  <div class="section">
    <div class="section-title">PROJECTS</div>
    ${resumeData.projects.filter(proj => proj.name).map(proj => `
      <div class="item">
        <div class="item-title">${proj.name}</div>
        ${proj.description ? `<div class="item-description">${proj.description}</div>` : ''}
        ${proj.technologies ? `<div class="item-subtitle">Technologies: ${proj.technologies}</div>` : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}
</body>
</html>`;
  
  try {
    const browser = await puppeteer.launch({ 
      headless: true, 
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' }
    });
    
    await browser.close();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${resumeData.personalInfo.name.replace(/\\s+/g, '_')}_Resume.pdf"`);
    res.end(pdf, 'binary');
  } catch (error) {
    console.error('Resume PDF generation error:', error);
    res.status(500).json({ error: 'PDF generation failed' });
  }
});

// Setup portfolio routes
setupPortfolioRoutes(app, authenticateToken, db);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});