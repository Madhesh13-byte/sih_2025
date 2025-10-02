// routes/teacher.js - Teacher-specific routes
const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const initTeacherRoutes = (db) => {
  
  // Get teacher's assignments
  router.get('/assignments', authenticateToken, async (req, res) => {
    try {
      const staffId = req.user.staff_id;
      if (!staffId) {
        return res.json([]);
      }
      
      const query = `
        SELECT sa.*, s.subject_name, c.class_name
        FROM staff_assignments sa
        LEFT JOIN subjects s ON sa.subject_code = s.subject_code
        LEFT JOIN classes c ON sa.class_id = c.id
        WHERE sa.staff_id = $1
        ORDER BY sa.semester, sa.subject_code
      `;
      
      const result = await db.query(query, [staffId]);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching teacher assignments:', error);
      res.status(500).json({ error: 'Failed to fetch assignments' });
    }
  });

  // Get students for teacher's classes
  router.get('/students', authenticateToken, async (req, res) => {
    try {
      const staffId = req.user.staff_id;
      const { subject_code, semester, department, year } = req.query;
      
      let query = `
        SELECT DISTINCT u.id, u.register_no, u.name, u.department, u.year
        FROM users u
        JOIN staff_assignments sa ON (u.department = sa.department AND u.year = sa.year)
        WHERE sa.staff_id = $1 AND u.role = 'student'
      `;
      const params = [staffId];
      
      if (subject_code) {
        query += ' AND sa.subject_code = $' + (params.length + 1);
        params.push(subject_code);
      }
      if (semester) {
        query += ' AND sa.semester = $' + (params.length + 1);
        params.push(parseInt(semester));
      }
      if (department) {
        query += ' AND u.department = $' + (params.length + 1);
        params.push(department);
      }
      if (year) {
        query += ' AND u.year = $' + (params.length + 1);
        params.push(parseInt(year));
      }
      
      query += ' ORDER BY u.register_no';
      
      const result = await db.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).json({ error: 'Failed to fetch students' });
    }
  });

  // Save grades
  router.post('/grades', authenticateToken, async (req, res) => {
    try {
      const { students, subject_code, semester, grade_type, academic_year } = req.body;
      
      // Create grades table if not exists
      await db.query(`
        CREATE TABLE IF NOT EXISTS student_grades (
          id SERIAL PRIMARY KEY,
          student_id INTEGER REFERENCES users(id),
          subject_code VARCHAR(20),
          semester INTEGER,
          grade_type VARCHAR(20),
          marks INTEGER,
          grade VARCHAR(5),
          academic_year VARCHAR(10),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(student_id, subject_code, semester, grade_type, academic_year)
        )
      `);
      
      let saved = 0;
      for (const student of students) {
        await db.query(`
          INSERT INTO student_grades (student_id, subject_code, semester, grade_type, marks, grade, academic_year)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (student_id, subject_code, semester, grade_type, academic_year)
          DO UPDATE SET marks = $5, grade = $6
        `, [student.id, subject_code, semester, grade_type, student.marks, student.grade, academic_year]);
        saved++;
      }
      
      res.json({ message: `${saved} grades saved successfully` });
    } catch (error) {
      console.error('Error saving grades:', error);
      res.status(500).json({ error: 'Failed to save grades' });
    }
  });

  // Get teacher's timetable (redirect to timetable API)
  router.get('/timetable', authenticateToken, async (req, res) => {
    try {
      const staffId = req.user.staff_id;
      if (!staffId) {
        return res.json([]);
      }
      
      const { academic_year = new Date().getFullYear(), semester = 1 } = req.query;
      
      // Forward to timetable API
      const TimetableModel = require('../models/Timetable');
      const timetableModel = new TimetableModel(db);
      const timetable = await timetableModel.getTeacherTimetable(staffId, academic_year, semester);
      
      res.json(timetable);
    } catch (error) {
      console.error('Error fetching timetable:', error);
      res.status(500).json({ error: 'Failed to fetch timetable' });
    }
  });

  return router;
};

module.exports = initTeacherRoutes;