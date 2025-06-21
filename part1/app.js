// app.js - Main server configuration file

const express = require('express');
const path = require('path');
const session = require('express-session');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const walkRoutes = require('./routes/walkRoutes');

dotenv.config(); // Load environment variables from .env

const app = express();

// Enable parsing of URL-encoded form data (for HTML form submissions)
app.use(express.urlencoded({ extended: true }));

// Enable JSON body parsing
app.use(express.json());

// Serve static files from /public (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Configure session middleware
app.use(session({
  secret: 'replace_this_with_a_secure_secret', // Use a secure value in production
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 // 1 hour
  }
}));

// Mount API routes
app.use('/api/users', userRoutes);   // login, logout, register, session info
app.use('/api/walks', walkRoutes);   // walk requests, applications, dogs etc.

// Default route - serve login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

module.exports = app;
