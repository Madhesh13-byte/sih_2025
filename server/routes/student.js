// routes/student.js - Student-specific routes
const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const initStudentRoutes = (db) => {
  
  // Get student grades (IA marks and results)
  router.get('/grades', authenticateToken, async (req, res) => {
    try {
      // Get register_no from users table
      const userQuery = await db.query('SELECT register_no FROM users WHERE id = $1', [req.user.id]);
      const registerNo = userQuery.rows[0]?.register_no;
      
      if (!registerNo) {
        return res.json({ assignments: [], ias: [], semesters: [] });
      }
      
      const semester = req.query.semester;
      
      let query = `
        SELECT sr.*, s.subject_name 
        FROM student_results sr
        LEFT JOIN subjects s ON sr.subject_code = s.subject_code
        WHERE sr.register_no = $1
      `;
      const params = [registerNo];
      
      if (semester) {
        query += ' AND sr.semester = $2';
        params.push(parseInt(semester));
      }
      
      query += ' ORDER BY sr.semester, sr.subject_code';
      
      const result = await db.query(query, params);
      
      res.json({
        assignments: result.rows,
        ias: result.rows,
        semesters: result.rows
      });
    } catch (error) {
      console.error('Error fetching grades:', error);
      res.status(500).json({ error: 'Failed to fetch grades' });
    }
  });

  // Get student GPA/CGPA
  router.get('/gpa', authenticateToken, async (req, res) => {
    try {
      // Get register_no from users table using user id
      const userQuery = await db.query('SELECT register_no FROM users WHERE id = $1', [req.user.id]);
      const registerNo = userQuery.rows[0]?.register_no;
      
      if (!registerNo) {
        return res.json({ current: { sgpa: 0, cgpa: 0 } });
      }
      
      const semester = req.query.semester;
      let query, params;
      
      if (semester) {
        query = `
          SELECT sgpa, cgpa, semester 
          FROM student_gpa 
          WHERE register_no = $1 AND semester = $2
        `;
        params = [registerNo, parseInt(semester)];
      } else {
        query = `
          SELECT sgpa, cgpa, semester 
          FROM student_gpa 
          WHERE register_no = $1
          ORDER BY semester DESC
        `;
        params = [registerNo];
      }
      
      const result = await db.query(query, params);
      console.log('GPA query result:', result.rows);
      
      if (result.rows.length > 0) {
        const latest = result.rows[0]; // Latest semester
        res.json({
          current: {
            sgpa: parseFloat(latest.sgpa || 0),
            cgpa: parseFloat(latest.cgpa || 0)
          },
          all_semesters: result.rows.map(row => ({
            semester: row.semester,
            sgpa: parseFloat(row.sgpa || 0),
            cgpa: parseFloat(row.cgpa || 0)
          }))
        });
      } else {
        res.json({ current: { sgpa: 0, cgpa: 0 }, all_semesters: [] });
      }
    } catch (error) {
      console.error('Error fetching GPA:', error);
      res.status(500).json({ error: 'Failed to fetch GPA' });
    }
  });

  // Get student attendance
  router.get('/attendance', authenticateToken, async (req, res) => {
    try {
      // Mock attendance data for now
      res.json({
        overall: { percentage: 85 },
        subjects: []
      });
    } catch (error) {
      console.error('Error fetching attendance:', error);
      res.status(500).json({ error: 'Failed to fetch attendance' });
    }
  });

  // Get student timetable
  router.get('/timetable', authenticateToken, async (req, res) => {
    try {
      // Mock timetable data for now
      res.json([]);
    } catch (error) {
      console.error('Error fetching timetable:', error);
      res.status(500).json({ error: 'Failed to fetch timetable' });
    }
  });

  return router;
};

module.exports = initStudentRoutes;