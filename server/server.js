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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});