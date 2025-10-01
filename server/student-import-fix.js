// Add this to your server.js file to fix student CSV import

const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const bcrypt = require('bcrypt');

const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Student CSV import endpoint
app.post('/api/admin/import-students', authenticateToken, requireAdmin, upload.single('csvFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No CSV file uploaded' });
  }

  const students = [];
  
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {
      const values = Object.values(data);
      students.push({
        name: values[0] || 'Student',
        email: values[1] || null,
        department: values[2] || 'IT',
        year: values[3] || '25',
        dob: values[4] || '010100'
      });
    })
    .on('end', async () => {
      if (students.length === 0) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: 'No valid students found' });
      }

      let imported = 0;
      
      for (const student of students) {
        try {
          const deptCode = student.department.toUpperCase().substring(0, 2);
          const yearCode = student.year.toString().slice(-2);
          
          const count = await new Promise((resolve, reject) => {
            db.get(`SELECT COUNT(*) as count FROM users WHERE register_no LIKE 'STU${deptCode}${yearCode}%'`, (err, row) => {
              if (err) reject(err);
              else resolve(row.count + 1);
            });
          });
          
          const register_no = `STU${deptCode}${yearCode}${count.toString().padStart(2, '0')}`;
          const password = student.dob.toString().padStart(6, '0');
          const hashedPassword = await bcrypt.hash(password, 10);
          const joiningYear = 2000 + parseInt(student.year);
          
          await new Promise((resolve, reject) => {
            db.run('INSERT INTO users (register_no, name, email, password, role, department, joining_year, current_semester, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [register_no, student.name, student.email, hashedPassword, 'student', student.department, joiningYear, 5, req.user.id],
              function(err) {
                if (err) reject(err);
                else { imported++; resolve(); }
              }
            );
          });
        } catch (error) {
          console.error('Error importing student:', error);
        }
      }
      
      fs.unlinkSync(req.file.path);
      res.json({ message: `${imported} students imported successfully` });
    })
    .on('error', () => {
      fs.unlinkSync(req.file.path);
      res.status(500).json({ error: 'CSV processing failed' });
    });
});