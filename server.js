const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 5000;
const JWT_SECRET = 'secret-key';

app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./database.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT,
    name TEXT
  )`);
  
  // Insert default users
  const hashedPassword = bcrypt.hashSync('password123', 10);
  db.run('INSERT OR IGNORE INTO users (email, password, role, name) VALUES (?, ?, ?, ?)',
    ['student@example.com', hashedPassword, 'student', 'John Student']);
  db.run('INSERT OR IGNORE INTO users (email, password, role, name) VALUES (?, ?, ?, ?)',
    ['staff@example.com', hashedPassword, 'staff', 'Jane Staff']);
});

// Login route
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err || !user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        role: user.role,
        email: user.email 
      } 
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});