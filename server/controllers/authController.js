// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = 'secret-key';

class AuthController {
  constructor(db) {
    this.userModel = new User(db);
  }

  async studentLogin(req, res) {
    try {
      const { register_no, password } = req.body;
      const user = await this.userModel.findByRegisterNo(register_no);
      
      if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
      
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
      res.json({ 
        token, 
        user: { 
          id: user.id, 
          name: user.name, 
          role: user.role,
          register_no: user.register_no,
          department: user.department
        } 
      });
    } catch (error) {
      res.status(500).json({ error: 'Database error' });
    }
  }

  async staffLogin(req, res) {
    try {
      const { staff_id, password } = req.body;
      const user = await this.userModel.findByStaffId(staff_id);
      
      if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
      
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
      res.json({ 
        token, 
        user: { 
          id: user.id, 
          name: user.name, 
          role: user.role,
          staff_id: user.staff_id,
          department: user.department
        } 
      });
    } catch (error) {
      res.status(500).json({ error: 'Database error' });
    }
  }

  async adminLogin(req, res) {
    try {
      const { admin_id, password } = req.body;
      const user = await this.userModel.findByAdminId(admin_id);
      
      if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
      
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
      res.json({ 
        token, 
        user: { 
          id: user.id, 
          name: user.name, 
          role: user.role,
          admin_id: user.admin_id
        } 
      });
    } catch (error) {
      res.status(500).json({ error: 'Database error' });
    }
  }
}

module.exports = AuthController;