const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET all users (for testing/admin purposes)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, role FROM Users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST: Register a new user
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO Users (username, email, password_hash, role)
       VALUES (?, ?, ?, ?)`,
      [username, email, password, role]
    );

    res.status(201).json({ message: 'User registered successfully', user_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// GET: Fetch currently logged-in user info
router.get('/me', (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'User not logged in' });
  }
  res.json(req.session.user);
});

// POST: User login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query(
      `SELECT user_id, username, role FROM Users
       WHERE email = ? AND password_hash = ?`,
      [email, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Store user info in session
    req.session.user = rows[0];

    res.json({ message: 'Login successful', user: rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET: Logout route — ends session and clears cookie
router.get('/logout', (req, res) => {
  req.session.destroy(error => {
    if (error) {
      console.warn('Issue occurred while logging out:', error);
      return res.status(500).send('Logout process encountered an error.');
    }

    res.clearCookie('connect.sid'); // Remove session cookie from browser
    res.redirect('/'); // Redirect to home/login screen
  });
});

module.exports = router;
