const express = require('express');
const mysql = require('mysql2');
const app = express();

app.use(express.json());

// Establish a database connection
const dbConn = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'DogWalkService'
});

// Initialize database connection and seed sample records
dbConn.connect(function(dbErr) {
    if (dbErr) {
        console.log('❌ Failed to connect to MySQL:', dbErr.message);
        process.exit(1);
    }
    console.log('✅ MySQL connection established.');

    const insertSamples = [
        'INSERT IGNORE INTO Users (user_id, username, email, password_hash, role) VALUES (1, "alice123", "alice@example.com", "hashed1", "owner"), (2, "bobwalker", "bob@example.com", "hashed2", "walker"), (3, "newwalker", "new@example.com", "hashed3", "walker")',
        'INSERT IGNORE INTO Dogs (dog_id, owner_id, name, size) VALUES (1, 1, "Max", "medium"), (2, 1, "Bella", "small")',
        'INSERT IGNORE INTO WalkRequests (request_id, dog_id, requested_time, duration_minutes, location, status) VALUES (1, 1, "2025-06-10 08:00:00", 30, "Parklands", "open"), (2, 2, "2025-06-11 08:00:00", 45, "City Park", "completed")',
        'INSERT IGNORE INTO WalkApplications (application_id, request_id, walker_id, status) VALUES (1, 2, 2, "accepted")',
        'INSERT IGNORE INTO WalkRatings (rating_id, request_id, walker_id, owner_id, rating) VALUES (1, 2, 2, 1, 4)'
    ];

    insertSamples.forEach(function(stmt) {
        dbConn.query(stmt, function(seedErr) {
            if (seedErr) {
                console.log('⚠️ Seeding error:', seedErr.sqlMessage || seedErr.message);
            }
        });
    });
});

// Middleware to make DB accessible in routes
app.use(function(req, res, next) {
    req.db = dbConn;
    next();
});

// API: List all dogs with size and owner username
app.get('/api/dogs', (req, res) => {
    const sql = `
        SELECT d.name AS dog_name, d.size, u.username AS owner_username
        FROM Dogs d
        JOIN Users u ON d.owner_id = u.user_id
    `;
    req.db.query(sql, (err, results) => {
        if (err) {
            console.error('🐶 Error in /api/dogs:', err.sqlMessage || err);
            return res.status(500).json({ error: 'Failed to get dogs.' });
        }
        res.json(results);
    });
});

// API: List open walk requests with dog, owner, time, and location
app.get('/api/walkrequests/open', function(req, res) {
    const sql = `
        SELECT r.request_id, d.name AS dog_name, r.requested_time, r.duration_minutes, r.location, u.username AS owner_username
        FROM WalkRequests r
        JOIN Dogs d ON r.dog_id = d.dog_id
        JOIN Users u ON d.owner_id = u.user_id
        WHERE r.status = 'open'
    `;
    req.db.query(sql, function(error, data) {
        if (error) {
            console.log('📦 Error in /api/walkrequests/open:', error.sqlMessage || error.message);
            return res.status(500).json({ error: 'Failed to load open walk requests.' });
        }
        return res.json(data);
    });
});

// API: Summary of walkers including their rating and completed walks
app.get('/api/walkers/summary', function(req, res) {
    const sql = `
        SELECT u.username AS walker_username,
               COUNT(r.rating_id) AS total_ratings,
               IFNULL(AVG(r.rating), 0) AS average_rating,
               SUM(CASE WHEN wr.status = 'completed' THEN 1 ELSE 0 END) AS completed_walks
        FROM Users u
        LEFT JOIN WalkRatings r ON u.user_id = r.walker_id
        LEFT JOIN WalkApplications wa ON wa.walker_id = u.user_id AND wa.status = 'accepted'
        LEFT JOIN WalkRequests wr ON wr.request_id = wa.request_id
        WHERE u.role = 'walker'
        GROUP BY u.user_id
    `;
    req.db.query(sql, function(error, summary) {
        if (error) {
            console.log('👟 Error in /api/walkers/summary:', error.sqlMessage || error.message);
            return res.status(500).json({ error: 'Failed to generate walker summary.' });
        }
        return res.json(summary);
    });
});

// Start the Express server
const PORT = 3000;
app.listen(PORT, function() {
    console.log(`🚀 Server active on port ${PORT}`);
});
