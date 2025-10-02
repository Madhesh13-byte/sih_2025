// routes/classes.js - Classes routes
const express = require('express');
const ClassController = require('../controllers/classController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const initClassRoutes = (db) => {
  const classController = new ClassController(db);
  
  router.get('/', authenticateToken, (req, res) => classController.getAll(req, res));
  router.post('/', authenticateToken, (req, res) => classController.create(req, res));
  router.delete('/:id', authenticateToken, (req, res) => classController.deleteById(req, res));
  
  return router;
};

module.exports = initClassRoutes;