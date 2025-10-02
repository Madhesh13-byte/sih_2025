// routes/staff.js - Staff routes
const express = require('express');
const multer = require('multer');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ dest: 'uploads/', limits: { fileSize: 5 * 1024 * 1024 } });

const initStaffRoutes = (db) => {
  // Staff CSV import endpoint
  router.post('/import', authenticateToken, requireAdmin, upload.single('csvFile'), async (req, res) => {
    const csv = require('csv-parser');
    const fs = require('fs');
    const bcrypt = require('bcryptjs');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file uploaded' });
    }

    const staff = [];
    
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => {
        const values = Object.values(data);
        staff.push({
          name: values[0] || 'Staff',
          email: values[1] || null,
          department: values[2] || 'IT'
        });
      })
      .on('end', async () => {
        if (staff.length === 0) {
          fs.unlinkSync(req.file.path);
          return res.status(400).json({ error: 'No valid staff found' });
        }

        let imported = 0;
        
        for (const member of staff) {
          try {
            const deptCode = member.department.toUpperCase().substring(0, 3);
            
            const countResult = await db.query(`SELECT COUNT(*) as count FROM users WHERE staff_id LIKE $1`, [`STF${deptCode}%`]);
            
            const staff_id = `STF${deptCode}${(parseInt(countResult.rows[0].count) + 1).toString().padStart(3, '0')}`;
            const name = member.name.toLowerCase().replace(/\s+/g, '');
            const dept = member.department.toLowerCase();
            const password = `${name}@${dept}`;
            const hashedPassword = await bcrypt.hash(password, 10);
            
            await db.query('INSERT INTO users (staff_id, name, email, password, role, department) VALUES ($1, $2, $3, $4, $5, $6)',
              [staff_id, member.name, member.email, hashedPassword, 'staff', member.department]
            );
            imported++;
          } catch (error) {
            console.error('Error importing staff:', error);
          }
        }
        
        fs.unlinkSync(req.file.path);
        res.json({ message: `${imported} staff imported successfully` });
      })
      .on('error', (error) => {
        fs.unlinkSync(req.file.path);
        res.status(500).json({ error: 'CSV processing failed' });
      });
  });

  // Staff CSV template
  router.get('/template', authenticateToken, requireAdmin, (req, res) => {
    const csvContent = 'name,email,department\n' +
                      'John Teacher,john@email.com,CSE\n' +
                      'Jane Professor,jane@email.com,IT\n' +
                      'Mike Lecturer,mike@email.com,AIDS';
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=staff_template.csv');
    res.send(csvContent);
  });
  
  return router;
};

module.exports = initStaffRoutes;