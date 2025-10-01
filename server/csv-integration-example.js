// Add this to your server.js file

// Import the CSV utilities
const { csvHandlers, csvTemplates } = require('./utils/csvHandlers');

// Add these routes to your server.js after your existing routes

// CSV Import Routes
app.post('/api/subjects/import', authenticateToken, requireAdmin, ...csvHandlers.importSubjects(db));
app.post('/api/admin/import-students', authenticateToken, requireAdmin, ...csvHandlers.importStudents(db));
app.post('/api/staff/import', authenticateToken, requireAdmin, ...csvHandlers.importStaff(db));
app.post('/api/student-results/import', authenticateToken, requireAdmin, ...csvHandlers.importStudentResults(db));

// CSV Template Routes
app.get('/api/subjects/template', authenticateToken, requireAdmin, csvTemplates.subjects);
app.get('/api/students/template', authenticateToken, requireAdmin, csvTemplates.students);
app.get('/api/staff/template', authenticateToken, requireAdmin, csvTemplates.staff);
app.get('/api/student-results/template', authenticateToken, requireAdmin, csvTemplates.studentResults);

// That's it! Your CSV functionality is now integrated.