// routes/subjects.js - Subject management routes
const express = require('express');
const multer = require('multer');
const SubjectController = require('../controllers/subjectController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ dest: 'uploads/', limits: { fileSize: 5 * 1024 * 1024 } });

// Initialize controller with database
const initSubjectRoutes = (db) => {
  const subjectController = new SubjectController(db);
  
  router.get('/', authenticateToken, (req, res) => subjectController.getAll(req, res));
  router.post('/', authenticateToken, (req, res) => subjectController.create(req, res));
  router.delete('/delete-all', authenticateToken, requireAdmin, (req, res) => subjectController.deleteAll(req, res));
  router.delete('/:id', authenticateToken, requireAdmin, (req, res) => subjectController.deleteById(req, res));
  router.post('/import', authenticateToken, requireAdmin, upload.single('csvFile'), (req, res) => subjectController.importCSV(req, res));
  router.get('/template', authenticateToken, requireAdmin, (req, res) => subjectController.getTemplate(req, res));
  
  return router;
};

module.exports = initSubjectRoutes;