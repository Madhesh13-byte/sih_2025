// routes/auth.js - Authentication routes
const express = require('express');
const AuthController = require('../controllers/authController');
const router = express.Router();

// Initialize controller with database
const initAuthRoutes = (db) => {
  const authController = new AuthController(db);
  
  router.post('/student/login', (req, res) => authController.studentLogin(req, res));
  router.post('/staff/login', (req, res) => authController.staffLogin(req, res));
  router.post('/admin/login', (req, res) => authController.adminLogin(req, res));
  
  return router;
};

module.exports = initAuthRoutes;