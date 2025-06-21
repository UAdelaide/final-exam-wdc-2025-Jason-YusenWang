const express = require('express');
const mysql = require('mysql2');
const app = express();

app.use(express.json());

const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'DogWalkService'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection error:', err);
        process.exit(1);
    }
    console.log('Connected to MySQL.');

    const seedQueries = [
        `INSERT IGNORE INTO Users (user_id, username, email, password_hash, role) VALUES
            (1, 'alice123', 'alice@example.com', 'hashed1', 'owner'),
            (2, 'bobwalker', 'bob@example.com', 'hashed2', 'walker'),
            (3, 'newwalker', 'new@example.com', 'hashed3', 'walker')`,

        `INSERT IGNORE INTO Dogs (dog_id, owner_id, name, size) VALUES
            (1, 1, 'Max', 'medium'),
            (2, 1, 'Bella', 'small')`,

        `INSERT IGNORE INTO WalkRequests (request_id, dog_id, requested_time, duration_minutes, location, status) VALUES
            (1, 1, '2025-06-10 08:00:00', 30, 'Parklands', 'open'),
            (2, 2, '2025-06-11 08:00:00', 45, 'City Park', 'completed')`,

        `INSERT IGNORE INTO WalkApplications (application_id, request_id, walker_id, status) VALUES
            (1, 2, 2, 'accepted')`,

        `INSERT IGNORE INTO WalkRatings (rating_id, request_id, walker_id, owner_id, rating) VALUES
            (1, 2, 2, 1, 4)`
    ];

    seedQueries.forEach(query => {
        db.query(query, (err) => {
            if (err) console.error('Seed Error:', err.sqlMessage);
        });
    });
});

app.use((req, res, next) => {
    req.db = db;
    next();
});

app.get('/api/dogs', (req, res) => {
    const sql = `
        SELECT d.name AS dog_name, d.size, u.username AS owner_username
        FROM Dogs d
        JOIN Users u ON d.owner_id = u.user_id
    `;
    req.db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch dogs.' });
        res.json(results);
    });
});

app.get('/api/walkrequests/open', (req, res) => {
    const sql = `
        SELECT r.request_id, d.name AS dog_name, r.requested_time, r.duration_minutes, r.location, u.username AS owner_username
        FROM WalkRequests r
        JOIN Dogs d ON r.dog_id = d.dog_id
        JOIN Users u ON d.owner_id = u.user_id
        WHERE r.status = 'open'
    `;
    req.db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch walk requests.' });
        res.json(results);
    });
});

app.get('/api/walkers/summary', (req, res) => {
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
    req.db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch walker summary.' });
        res.json(results);
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

