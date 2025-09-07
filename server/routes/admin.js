const express = require('express');
const router = express.Router();

// Semester promotion endpoint
router.post('/promote-students', async (req, res) => {
  try {
    const { promoteStudents } = require('../utils/businessLogic');
    const promotedCount = await promoteStudents(req.db);
    res.json({ 
      message: `Successfully promoted ${promotedCount} students`,
      promotedCount 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Class capacity check
router.get('/class-capacity/:classId', async (req, res) => {
  try {
    const { checkClassCapacity } = require('../utils/businessLogic');
    const hasCapacity = await checkClassCapacity(req.db, req.params.classId);
    
    // Get current count
    req.db.get('SELECT COUNT(*) as count FROM users WHERE class_id = ? AND role = ?',
      [req.params.classId, 'student'], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        
        res.json({
          currentCount: result.count,
          maxCapacity: 60,
          hasCapacity,
          availableSlots: 60 - result.count
        });
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Staff workload check
router.get('/staff-workload/:staffId', (req, res) => {
  req.db.all('SELECT * FROM staff_assignments WHERE staff_id = ?',
    [req.params.staffId], (err, assignments) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      
      const workloadBySemester = assignments.reduce((acc, assignment) => {
        acc[assignment.semester] = (acc[assignment.semester] || 0) + 1;
        return acc;
      }, {});
      
      res.json({
        totalAssignments: assignments.length,
        workloadBySemester,
        assignments
      });
    });
});

module.exports = router;