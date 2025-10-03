// routes/student.js - Student-specific routes
const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const initStudentRoutes = (db) => {
  
  // Get student's class timetable using batch timetable endpoint
  router.get('/class-timetable', authenticateToken, async (req, res) => {
    try {
      // Get student's class information
      const userQuery = await db.query(
        'SELECT class_id, department, current_semester FROM users WHERE id = $1', 
        [req.user.id]
      );
      
      const student = userQuery.rows[0];
      if (!student || !student.class_id) {
        return res.json([]);
      }
      
      const { academic_year = new Date().getFullYear(), semester = student.current_semester || 1 } = req.query;
      
      // Use the existing timetable model to get batch timetable
      const TimetableModel = require('../models/Timetable');
      const timetableModel = new TimetableModel(db);
      
      const timetable = await timetableModel.getBatchTimetable(student.class_id, academic_year, semester);
      res.json(timetable);
    } catch (error) {
      console.error('Error fetching class timetable:', error);
      res.status(500).json({ error: 'Failed to fetch class timetable' });
    }
  });
  
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
      // Get student's class information
      const userQuery = await db.query(
        'SELECT class_id, department, current_semester FROM users WHERE id = $1', 
        [req.user.id]
      );
      
      const student = userQuery.rows[0];
      if (!student || !student.class_id) {
        return res.json([]);
      }
      
      const { academic_year = new Date().getFullYear(), semester = student.current_semester || 1 } = req.query;
      
      // Get timetable for student's batch
      const timetableQuery = `
        SELECT te.*, ts.slot_name, ts.start_time, ts.end_time, ts.slot_order,
               s.subject_name, u.name as teacher_name
        FROM timetable_entries te
        JOIN time_slots ts ON te.time_slot_id = ts.id
        LEFT JOIN subjects s ON te.subject_code = s.subject_code
        LEFT JOIN users u ON te.staff_id = u.staff_id
        WHERE te.batch_id = $1 AND te.academic_year = $2 AND te.semester = $3
        ORDER BY te.day_of_week, ts.slot_order
      `;
      
      const result = await db.query(timetableQuery, [student.class_id, academic_year, semester]);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching timetable:', error);
      res.status(500).json({ error: 'Failed to fetch timetable' });
    }
  });

  // Generate timetable PDF
  router.get('/timetable/pdf', authenticateToken, async (req, res) => {
    try {
      const puppeteer = require('puppeteer');
      
      // Get student info and timetable data
      const userQuery = await db.query(
        'SELECT id, name, class_id, department, current_semester, register_no FROM users WHERE id = $1', 
        [req.user.id]
      );
      
      const student = userQuery.rows[0];
      if (!student || !student.class_id) {
        return res.status(404).json({ error: 'Student data not found' });
      }
      
      const { academic_year = new Date().getFullYear(), semester = student.current_semester || 1 } = req.query;
      
      const timetableQuery = `
        SELECT te.*, ts.slot_name, ts.start_time, ts.end_time, ts.slot_order,
               s.subject_name, u.name as teacher_name
        FROM timetable_entries te
        JOIN time_slots ts ON te.time_slot_id = ts.id
        LEFT JOIN subjects s ON te.subject_code = s.subject_code
        LEFT JOIN users u ON te.staff_id = u.staff_id
        WHERE te.batch_id = $1 AND te.academic_year = $2 AND te.semester = $3
        ORDER BY te.day_of_week, ts.slot_order
      `;
      
      const timetableResult = await db.query(timetableQuery, [student.class_id, academic_year, semester]);
      const timetable = timetableResult.rows;
      
      // Group timetable by day
      const groupedTimetable = {};
      const dayNames = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      timetable.forEach(entry => {
        const day = dayNames[entry.day_of_week];
        if (!groupedTimetable[day]) groupedTimetable[day] = [];
        groupedTimetable[day].push(entry);
      });
      
      // Generate HTML for PDF
      const html = generateTimetableHTML(student, groupedTimetable, academic_year, semester);
      
      // Generate PDF
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.setContent(html);
      
      const pdf = await page.pdf({
        format: 'A4',
        landscape: true,
        margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
        printBackground: true
      });
      
      await browser.close();
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Timetable_${student.name}_${academic_year}.pdf"`);
      res.send(pdf);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      res.status(500).json({ error: 'Failed to generate PDF' });
    }
  });

  return router;
};

// Helper function to generate HTML for PDF
function generateTimetableHTML(student, groupedTimetable, academicYear, semester) {
  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Timetable - ${student.name}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 15px; }
        .header h1 { margin: 0 0 10px 0; font-size: 28px; }
        .student-info { display: flex; justify-content: space-around; margin: 10px 0; }
        .student-info div { font-size: 14px; }
        .timetable-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
        .day-column { border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
        .day-header { background: #333; color: white; padding: 10px; text-align: center; font-weight: bold; }
        .day-entries { padding: 10px; }
        .entry { margin-bottom: 10px; padding: 8px; border-left: 3px solid #007bff; background: #f8f9fa; }
        .entry-time { font-size: 12px; color: #666; margin-bottom: 4px; }
        .entry-subject { font-weight: bold; margin-bottom: 2px; }
        .entry-teacher { font-size: 12px; color: #666; }
        .entry-room { font-size: 12px; color: #666; }
        .empty { text-align: center; color: #999; padding: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Class Timetable</h1>
        <div class="student-info">
          <div><strong>Student:</strong> ${student.name}</div>
          <div><strong>Register No:</strong> ${student.register_no || 'N/A'}</div>
          <div><strong>Department:</strong> ${student.department}</div>
          <div><strong>Semester:</strong> ${semester}</div>
          <div><strong>Academic Year:</strong> ${academicYear}</div>
        </div>
      </div>
      
      <div class="timetable-grid">
        ${dayOrder.map(day => {
          const entries = groupedTimetable[day] || [];
          return `
            <div class="day-column">
              <div class="day-header">${day}</div>
              <div class="day-entries">
                ${entries.length > 0 ? entries.map(entry => `
                  <div class="entry">
                    <div class="entry-time">${entry.start_time} - ${entry.end_time}</div>
                    <div class="entry-subject">${entry.subject_code} - ${entry.subject_name || ''}</div>
                    <div class="entry-teacher">${entry.teacher_name || ''}</div>
                    ${entry.room_number ? `<div class="entry-room">Room: ${entry.room_number}</div>` : ''}
                  </div>
                `).join('') : '<div class="empty">No classes</div>'}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </body>
    </html>
  `;
}

module.exports = initStudentRoutes;