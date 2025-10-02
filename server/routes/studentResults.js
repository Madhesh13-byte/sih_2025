// routes/studentResults.js - Student results routes
const express = require('express');
const multer = require('multer');
const StudentResultsController = require('../controllers/studentResultsController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ dest: 'uploads/', limits: { fileSize: 5 * 1024 * 1024 } });

const initStudentResultsRoutes = (db) => {
  const studentResultsController = new StudentResultsController(db);
  
  router.post('/import', authenticateToken, requireAdmin, upload.single('csvFile'), (req, res) => studentResultsController.importResults(req, res));
  router.get('/template', authenticateToken, (req, res) => studentResultsController.getTemplate(req, res));
  router.post('/calculate-all-gpa', authenticateToken, requireAdmin, (req, res) => studentResultsController.calculateAllGPA(req, res));
  
  return router;
};

module.exports = initStudentResultsRoutes;