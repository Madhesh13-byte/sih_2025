// routes/cc.js - CC assignment routes
const express = require('express');
const CCController = require('../controllers/ccController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const initCCRoutes = (db) => {
  const ccController = new CCController(db);
  
  router.get('/', authenticateToken, (req, res) => ccController.getAll(req, res));
  router.post('/', authenticateToken, (req, res) => ccController.create(req, res));
  router.delete('/:id', authenticateToken, (req, res) => ccController.deleteById(req, res));
  
  return router;
};

module.exports = initCCRoutes;