// routes/index.js - Main router
const express = require('express');
const initAuthRoutes = require('./auth');
const initAdminRoutes = require('./admin');
const initSubjectRoutes = require('./subjects');
const initClassRoutes = require('./classes');
const initStaffRoutes = require('./staff');
const initStudentResultsRoutes = require('./studentResults');
const initCCRoutes = require('./cc');

const initRoutes = (db) => {
  const router = express.Router();
  
  // Initialize routes with database connection
  router.use('/', initAuthRoutes(db));
  router.use('/admin', initAdminRoutes(db));
  router.use('/subjects', initSubjectRoutes(db));
  router.use('/classes', initClassRoutes(db));
  router.use('/staff', initStaffRoutes(db));
  router.use('/student-results', initStudentResultsRoutes(db));
  router.use('/cc-assignments', initCCRoutes(db));
  
  return router;
};

module.exports = initRoutes;