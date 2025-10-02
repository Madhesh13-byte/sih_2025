const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const initCalendarRoutes = (db) => {
  const router = express.Router();

// Get working days for a specific month/year
router.get('/working-days', authenticateToken, async (req, res) => {
  try {
    const { year, month, academicYear } = req.query;
    
    let query = 'SELECT * FROM working_days WHERE EXTRACT(YEAR FROM date) = $1 AND EXTRACT(MONTH FROM date) = $2';
    let params = [year, month];
    
    if (academicYear) {
      query += ' AND academic_year = $3';
      params.push(academicYear);
    }
    
    query += ' ORDER BY date';
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create or update working day
router.post('/working-days', authenticateToken, async (req, res) => {
  try {
    const { date, type, description, academicYear, semester } = req.body;
    
    if (!['working', 'holiday', 'exam', 'break'].includes(type)) {
      return res.status(400).json({ message: 'Invalid day type' });
    }
    
    const result = await db.query(
      `INSERT INTO working_days (date, type, description, academic_year, semester, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       ON CONFLICT (date) DO UPDATE SET 
       type = $2, description = $3, academic_year = $4, semester = $5, updated_at = NOW() 
       RETURNING *`,
      [date, type, description, academicYear, semester, req.user.id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Bulk create working days
router.post('/working-days/bulk', authenticateToken, async (req, res) => {
  try {
    const { dates, type, description, academicYear, semester } = req.body;
    
    if (!Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({ message: 'Dates array is required' });
    }
    
    let created = 0, modified = 0;
    
    for (const date of dates) {
      const existing = await db.query('SELECT id FROM working_days WHERE date = $1', [date]);
      
      if (existing.rows.length > 0) {
        await db.query(
          'UPDATE working_days SET type = $1, description = $2, academic_year = $3, semester = $4, updated_at = NOW() WHERE date = $5',
          [type, description, academicYear, semester, date]
        );
        modified++;
      } else {
        await db.query(
          'INSERT INTO working_days (date, type, description, academic_year, semester, created_by) VALUES ($1, $2, $3, $4, $5, $6)',
          [date, type, description, academicYear, semester, req.user.id]
        );
        created++;
      }
    }
    
    res.json({ 
      message: 'Bulk operation completed',
      modified,
      created
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete working day
router.delete('/working-days/:id', authenticateToken, async (req, res) => {
  try {
    await db.query('DELETE FROM working_days WHERE id = $1', [req.params.id]);
    res.json({ message: 'Working day deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get calendar statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { academicYear } = req.query;
    
    let query = 'SELECT type, COUNT(*) as count FROM working_days';
    let params = [];
    
    if (academicYear) {
      query += ' WHERE academic_year = $1';
      params.push(academicYear);
    }
    
    query += ' GROUP BY type';
    
    const result = await db.query(query, params);
    
    const stats = {
      working: 0,
      holiday: 0,
      exam: 0,
      break: 0
    };
    
    result.rows.forEach(row => {
      stats[row.type] = parseInt(row.count);
    });
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

  return router;
};

module.exports = initCalendarRoutes;