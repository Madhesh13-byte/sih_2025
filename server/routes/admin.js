// routes/admin.js - Admin routes
const express = require('express');
const multer = require('multer');
const AdminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ dest: 'uploads/', limits: { fileSize: 5 * 1024 * 1024 } });

const initAdminRoutes = (db) => {
  const adminController = new AdminController(db);
  
  router.get('/accounts', authenticateToken, (req, res) => adminController.getAccounts(req, res));
  router.get('/next-student-number', authenticateToken, (req, res) => adminController.getNextStudentNumber(req, res));
  router.get('/next-staff-number', authenticateToken, (req, res) => adminController.getNextStaffNumber(req, res));
  router.post('/create-student', authenticateToken, requireAdmin, (req, res) => adminController.createStudent(req, res));
  router.post('/create-staff', authenticateToken, requireAdmin, (req, res) => adminController.createStaff(req, res));
  router.post('/import-students', authenticateToken, requireAdmin, upload.single('csvFile'), (req, res) => adminController.importStudents(req, res));
  router.post('/import-staff', authenticateToken, requireAdmin, upload.single('csvFile'), (req, res) => adminController.importStaff(req, res));
  router.post('/calculate-all-gpa', authenticateToken, requireAdmin, (req, res) => {
    // Redirect to student-results route
    req.url = '/calculate-all-gpa';
    req.method = 'POST';
    res.redirect(307, '/api/student-results/calculate-all-gpa');
  });
  router.delete('/delete-account/:userId', authenticateToken, requireAdmin, (req, res) => adminController.deleteAccount(req, res));
  router.put('/reset-password/:userId', authenticateToken, requireAdmin, (req, res) => adminController.resetPassword(req, res));
  
  return router;
};

module.exports = initAdminRoutes;