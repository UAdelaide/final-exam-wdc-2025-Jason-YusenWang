const express = require('express');
const mysql = require('mysql2');
const app = express();

// Setup connection to the MySQL database
const db = mysql.createConnection({
    host: '127.0.0.1',  // changed from 'localhost' to fix ECONNREFUSED error
    user: 'root',
    password: '', // if you set a password, put it here
    database: 'DogWalkService'
});

// Connect to the database
db.connect(err => {
    if (err) {
        console.error('Database connection error:', err);
        process.exit(1);
    } else {
        console.log('Connected to MySQL.');
    }
});

// Provide shared DB connection to all routes
app.use((req, res, next) => {
    req.db = db;
    next();
});

// Route: return all dogs with their size and owner's username
// Route: return all dogs with their size and owner's username
// Route: return all dogs with their size and owner's username
app.get('/api/dogs', (req, res) => {
    const query = `
        SELECT d.name AS dog_name, d.size, u.username AS owner_username
        FROM Dogs d
        JOIN Users u ON d.owner_id = u.user_id
    `;
    req.db.query(query, (err, results) => {
        if (err) {
            console.error('SQL Error:', err); 
            return res.status(500).json({ error: 'Failed to get dogs.' });
        }
        res.json(results);
    });
});



// Route: return all open walk requests with dog name, time, location, and owner
app.get('/api/walkrequests/open', (req, res) => {
    const query = `
        SELECT r.request_id, d.name AS dog_name, r.request_time, r.duration_minutes, r.location, u.username AS owner_username
        FROM WalkRequests r
        JOIN Dogs d ON r.dog_id = d.dog_id
        JOIN Users u ON d.owner_id = u.user_id
        WHERE r.status = 'open'
    `;
    req.db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to get open requests.' });
        res.json(results);
    });
});

// Route: return summary of walkers with their average rating and completed walks
app.get('/api/walkers/summary', (req, res) => {
    const query = `
        SELECT u.username AS walker_username,
               COUNT(r.rating_id) AS total_ratings,
               IFNULL(AVG(r.rating), 0) AS average_rating,
               SUM(CASE WHEN wr.status = 'completed' THEN 1 ELSE 0 END) AS completed_walks
        FROM Users u
        LEFT JOIN WalkRatings r ON u.user_id = r.walker_id
        LEFT JOIN WalkRequests wr ON wr.walker_id = u.user_id
        WHERE u.role = 'walker'
        GROUP BY u.username
    `;
    req.db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to get walker summary.' });
        res.json(results);
    });
});

// Start the Express server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
