// controllers/adminController.js
const bcrypt = require('bcryptjs');
const User = require('../models/User');

class AdminController {
  constructor(db) {
    this.userModel = new User(db);
    this.db = db;
  }

  async getAccounts(req, res) {
    try {
      console.log('Fetching accounts...');
      const accounts = await this.userModel.getAllAccounts();
      console.log('Found accounts:', accounts.length);
      res.json(accounts);
    } catch (error) {
      console.error('Get accounts error:', error);
      res.status(500).json({ error: 'Database error: ' + error.message });
    }
  }

  async getNextStudentNumber(req, res) {
    try {
      const { dept, year } = req.query;
      const result = await this.db.query('SELECT COUNT(*) as count FROM users WHERE register_no LIKE $1', [`STU${dept}${year}%`]);
      res.json({ nextNumber: parseInt(result.rows[0].count) + 1 });
    } catch (error) {
      res.status(500).json({ error: 'Database error' });
    }
  }

  async getNextStaffNumber(req, res) {
    try {
      const { dept } = req.query;
      const result = await this.db.query('SELECT COUNT(*) as count FROM users WHERE staff_id LIKE $1', [`STF${dept}%`]);
      res.json({ nextNumber: parseInt(result.rows[0].count) + 1 });
    } catch (error) {
      res.status(500).json({ error: 'Database error' });
    }
  }

  async createStudent(req, res) {
    try {
      const { name, email, register_no, password, department } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const student = await this.userModel.createStudent({
        name, email, register_no, password: hashedPassword, department
      });
      
      res.json({ message: 'Student account created successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Database error' });
    }
  }

  async importStudents(req, res) {
    const csv = require('csv-parser');
    const fs = require('fs');
    
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
            
            const countResult = await this.db.query(`SELECT COUNT(*) as count FROM users WHERE register_no LIKE $1`, [`STU${deptCode}${yearCode}%`]);
            
            const register_no = `STU${deptCode}${yearCode}${(parseInt(countResult.rows[0].count) + 1).toString().padStart(2, '0')}`;
            const password = student.dob.toString().padStart(6, '0');
            const hashedPassword = await bcrypt.hash(password, 10);
            const joiningYear = 2000 + parseInt(student.year);
            
            await this.db.query('INSERT INTO users (register_no, name, email, password, role, department, joining_year) VALUES ($1, $2, $3, $4, $5, $6, $7)',
              [register_no, student.name, student.email, hashedPassword, 'student', student.department, joiningYear]
            );
            imported++;
          } catch (error) {
            console.error('Error importing student:', error);
          }
        }
        
        fs.unlinkSync(req.file.path);
        res.json({ message: `${imported} students imported successfully` });
      })
      .on('error', (error) => {
        fs.unlinkSync(req.file.path);
        res.status(500).json({ error: 'CSV processing failed' });
      });
  }

  async importStaff(req, res) {
    const csv = require('csv-parser');
    const fs = require('fs');
    
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
            
            const countResult = await this.db.query(`SELECT COUNT(*) as count FROM users WHERE staff_id LIKE $1`, [`STF${deptCode}%`]);
            
            const staff_id = `STF${deptCode}${(parseInt(countResult.rows[0].count) + 1).toString().padStart(3, '0')}`;
            const name = member.name.toLowerCase().replace(/\s+/g, '');
            const dept = member.department.toLowerCase();
            const password = `${name}@${dept}`;
            const hashedPassword = await bcrypt.hash(password, 10);
            
            await this.db.query('INSERT INTO users (staff_id, name, email, password, role, department) VALUES ($1, $2, $3, $4, $5, $6)',
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
  }

  async createStaff(req, res) {
    try {
      const { name, email, staff_id, password, department } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const staff = await this.userModel.createStaff({
        name, email, staff_id, password: hashedPassword, department
      });
      
      res.json({ message: 'Staff account created successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Database error' });
    }
  }

  async deleteAccount(req, res) {
    try {
      const deleted = await this.userModel.deleteById(req.params.userId);
      if (deleted) {
        res.json({ message: 'Account deleted successfully' });
      } else {
        res.status(404).json({ error: 'Account not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Database error' });
    }
  }

  async resetPassword(req, res) {
    try {
      const { password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const updated = await this.userModel.updatePassword(req.params.userId, hashedPassword);
      if (updated) {
        res.json({ message: 'Password reset successfully' });
      } else {
        res.status(404).json({ error: 'Account not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Database error' });
    }
  }
}

module.exports = AdminController;