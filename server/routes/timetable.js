// routes/timetable.js - Timetable management routes
const express = require('express');
const TimetableModel = require('../models/Timetable');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const initTimetableRoutes = (db) => {
  const timetableModel = new TimetableModel(db);
  
  // Initialize timetable tables
  timetableModel.initializeTables().catch(console.error);

  // Create timetable entry (Admin only)
  router.post('/entries', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const entry = await timetableModel.createTimetableEntry(req.body);
      res.json({ message: 'Timetable entry created successfully', entry });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get teacher's timetable
  router.get('/teacher/:staffId', authenticateToken, async (req, res) => {
    try {
      const { staffId } = req.params;
      const { academic_year = new Date().getFullYear(), semester = 1 } = req.query;
      
      const timetable = await timetableModel.getTeacherTimetable(staffId, academic_year, semester);
      res.json(timetable);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch teacher timetable' });
    }
  });

  // Get current teacher's timetable
  router.get('/my-timetable', authenticateToken, async (req, res) => {
    try {
      const staffId = req.user.staff_id;
      if (!staffId) {
        return res.status(400).json({ error: 'Staff ID not found' });
      }
      
      const { academic_year = new Date().getFullYear(), semester = 1 } = req.query;
      const timetable = await timetableModel.getTeacherTimetable(staffId, academic_year, semester);
      res.json(timetable);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch timetable' });
    }
  });

  // Get batch timetable
  router.get('/batch/:batchId', authenticateToken, async (req, res) => {
    try {
      const { batchId } = req.params;
      const { academic_year = new Date().getFullYear(), semester = 1 } = req.query;
      
      const timetable = await timetableModel.getBatchTimetable(batchId, academic_year, semester);
      res.json(timetable);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch batch timetable' });
    }
  });

  // Get teacher workload
  router.get('/workload/:staffId', authenticateToken, async (req, res) => {
    try {
      const { staffId } = req.params;
      const { academic_year = new Date().getFullYear(), semester = 1 } = req.query;
      
      const workload = await timetableModel.getTeacherWorkload(staffId, academic_year, semester);
      res.json(workload);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch workload' });
    }
  });

  // Check conflicts before creating entry
  router.post('/check-conflicts', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { staffId, batchId, dayOfWeek, timeSlotId, roomNumber, academicYear, semester } = req.body;
      const conflicts = await timetableModel.checkConflicts(staffId, batchId, dayOfWeek, timeSlotId, roomNumber, academicYear, semester);
      res.json({ conflicts, hasConflicts: conflicts.length > 0 });
    } catch (error) {
      res.status(500).json({ error: 'Failed to check conflicts' });
    }
  });

  // Get time slots
  router.get('/time-slots', authenticateToken, async (req, res) => {
    try {
      const result = await db.query('SELECT * FROM time_slots ORDER BY slot_order');
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch time slots' });
    }
  });

  // Bulk create timetable (for CSV import)
  router.post('/bulk-create', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { entries } = req.body;
      const results = [];
      const errors = [];

      for (const entry of entries) {
        try {
          const created = await timetableModel.createTimetableEntry(entry);
          results.push(created);
        } catch (error) {
          errors.push({ entry, error: error.message });
        }
      }

      res.json({
        message: `${results.length} entries created successfully`,
        created: results.length,
        errors: errors.length,
        errorDetails: errors
      });
    } catch (error) {
      res.status(500).json({ error: 'Bulk creation failed' });
    }
  });

  return router;
};

module.exports = initTimetableRoutes;