const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Route: Get all users (for testing or admin use)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, role FROM Users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Could not retrieve users from database' });
  }
});

// Route: Create a new user entry
router.post('/register', async (req, res) => {
  const {
 username, email, password, role
} = req.body;

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

// Route: Get session data for currently authenticated user
router.get('/me', (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'No user session found' });
  }
  res.json(req.session.user);
});

// Route: Authenticate user and initiate session
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query(
      `SELECT user_id, username, role FROM Users
       WHERE email = ? AND password_hash = ?`,
      [email, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Incorrect login credentials' });
    }

    // Save user details in session for later verification
    req.session.user = rows[0];

    res.json({ message: 'User logged in successfully', user: rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Unable to process login' });
  }
});

// Route: Logout — terminate session and clear cookie
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error occurred:', err);
      return res.status(500).send('Logout failed');
    }

    res.clearCookie('connect.sid'); // Remove cookie to clear session on client
    res.redirect('/'); // Redirect back to login form
  });
});

module.exports = router;

