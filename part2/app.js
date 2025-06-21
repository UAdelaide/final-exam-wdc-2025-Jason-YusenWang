// app.js - Main server configuration file

const express = require('express');
const path = require('path');
const session = require('express-session');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const walkRoutes = require('./routes/walkRoutes');

// Load environment variables from .env file if present
dotenv.config();

const app = express();

// Enable parsing of URL-encoded form data (for HTML form submissions)
app.use(express.urlencoded({ extended: true }));

// Enable JSON body parsing for incoming requests
app.use(express.json());

// Serve static files (HTML, CSS, JS) from /public directory
app.use(express.static(path.join(__dirname, 'public')));

// Configure session middleware to manage user sessions
app.use(session({
  secret: 'replace_this_with_a_secure_secret', // Replace with strong secret in production
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 // 1 hour session
  }
}));

// Mount route modules
app.use('/api/users', userRoutes);
app.use('/api/walks', walkRoutes);

// Export the app for use in bin/www or testing
module.exports = app;


// Mount API routes under /api prefix
app.use('/api/users', userRoutes);  // Handles login, logout, session, user-related logic
app.use('/api/walks', walkRoutes);  // Handles walk requests, applications, dog info, etc.

// Default route - redirect to homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

module.exports = app;
