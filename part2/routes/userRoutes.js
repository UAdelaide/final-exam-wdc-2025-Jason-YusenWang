const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Route to get all users (for testing purposes only)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, role FROM Users');
    res.json(rows);
  } catch (error) {
    // Return error if query fails
    res.status(500).json({ error: 'Could not retrieve users from database' });
  }
});

// Optional: Route to register a test user (not used in production)
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

// Route to get the currently logged-in user from session
router.get('/me', (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'No user session found' });
  }
  res.json(req.session.user);
});

// Login route - uses form submission (not fetch) and redirects by role
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Look up user with matching credentials
    const [rows] = await db.query(
      `SELECT user_id, username, role FROM Users
       WHERE username = ? AND password_hash = ?`,
      [username, password]
    );

    // If no user found, redirect to login page with error
    if (rows.length === 0) {
      return res.redirect('/?error=1');
    }

    // Save user to session
    req.session.user = rows[0];

    // Redirect based on role
    if (rows[0].role === 'owner') {
      return res.redirect('/owner-dashboard.html');
    } if (rows[0].role === 'walker') {
      return res.redirect('/walker-dashboard.html');
    }
      return res.status(403).send('Unknown role');

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send('Unable to process login');
  }
});

// Logout route - destroys session and returns to homepage
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
