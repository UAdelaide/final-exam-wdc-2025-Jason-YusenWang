const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Get all users (for testing only)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, role FROM Users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Could not retrieve users from database' });
  }
});

// Optional: Register route for adding test users
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO Users (username, email, password_hash, role)
       VALUES (?, ?, ?, ?)`,
      [username, email, password, role]
    );
    res.status(201).json({ message: 'User successfully created', user_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Error occurred during registration' });
  }
});

// Get current session user
router.get('/me', (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'No user session found' });
  }
  res.json(req.session.user);
});

// Login route - matches by username, not email
router.post('/login', async (req, res) => {
  const { username, password } = req.body; // Use 'username' field

  try {
    const [rows] = await db.query(
      `SELECT user_id, username, role FROM Users
       WHERE username = ? AND password_hash = ?`,
      [username, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Incorrect login credentials' });
    }

    // Save user data into session
    req.session.user = rows[0];

    res.json({ message: 'User logged in successfully', user: rows[0] });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Unable to process login' });
  }
});

// Logout route - ends session and clears cookie
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error occurred:', err);
      return res.status(500).send('Logout failed');
    }

    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

module.exports = router;
