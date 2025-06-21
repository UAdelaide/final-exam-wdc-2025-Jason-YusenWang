const express = require('express');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const app = express();

// === Middleware Setup ===

// Allow JSON payloads (for APIs like /api/users/login)
app.use(express.json());

// Allow URL-encoded form submissions (e.g. <form method="POST">)
app.use(express.urlencoded({ extended: true }));

// Configure session middleware to store login status
app.use(session({
  secret: 'replace-this-secret',        // Replace with an actual secret in production
  resave: false,
  saveUninitialized: false
}));

// Serve static files like HTML, CSS, JS under /public
app.use(express.static(path.join(__dirname, 'public')));

// === Route Handlers ===
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

// Prefix API endpoints
app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

// === Root Route ===
// Serve login page (index.html) when visiting the root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// === Start Server if this is not being used as a module ===
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

// Export app for testing or if used with another file
module.exports = app;
