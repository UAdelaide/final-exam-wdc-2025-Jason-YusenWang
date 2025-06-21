const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
const port = process.env.PORT || 3000;

let db;

(async () => {
  try {
    db = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: '',
      database: 'DogWalkService'
    });

    // Insert users
    await db.query("DELETE FROM WalkRatings");
    await db.query("DELETE FROM WalkApplications");
    await db.query("DELETE FROM WalkRequests");
    await db.query("DELETE FROM Dogs");
    await db.query("DELETE FROM Users");

    await db.query(`
      INSERT INTO Users (username, email, password_hash, role) VALUES
      ('alice123', 'alice@example.com', 'pass', 'owner'),
      ('carol123', 'carol@example.com', 'pass', 'owner'),
      ('bobwalker', 'bob@example.com', 'pass', 'walker'),
      ('newwalker', 'new@example.com', 'pass', 'walker')
    `);

    await db.query(`
      INSERT INTO Dogs (name, size, owner_id) VALUES
      ('Max', 'medium', 1),
      ('Bella', 'small', 2)
    `);

    await db.query(`
      INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status)
      VALUES
      (1, '2025-06-10 08:00:00', 30, 'Parklands', 'open'),
      (1, '2025-06-11 09:00:00', 60, 'Downtown', 'completed'),
      (2, '2025-06-12 10:30:00', 45, 'Suburb Park', 'completed')
    `);

    await db.query(`
      UPDATE WalkRequests SET status='completed' WHERE request_id IN (2,3);
    `);

    await db.query(`
      INSERT INTO WalkRatings (request_id, walker_id, owner_id, rating, comments)
      VALUES
      (2, 3, 1, 5, 'Great walk!'),
      (3, 3, 2, 4, 'Nice walk')
    `);

    console.log('Test data inserted.');
  } catch (err) {
    console.error('Database setup failed:', err.message);
  }
})();

// /api/dogs
app.get('/api/dogs', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT Dogs.name AS dog_name, Dogs.size, Users.username AS owner_username
      FROM Dogs JOIN Users ON Dogs.owner_id = Users.user_id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get dogs.' });
  }
});

// /api/walkrequests/open
app.get('/api/walkrequests/open', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT WalkRequests.request_id, Dogs.name AS dog_name, WalkRequests.requested_time,
             WalkRequests.duration_minutes, WalkRequests.location, Users.username AS owner_username
      FROM WalkRequests
      JOIN Dogs ON WalkRequests.dog_id = Dogs.dog_id
      JOIN Users ON Dogs.owner_id = Users.user_id
      WHERE WalkRequests.status = 'open'
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get walk requests.' });
  }
});

// /api/walkers/summary
app.get('/api/walkers/summary', async (req, res) => {
  try {
    const [walkers] = await db.query(`SELECT user_id, username FROM Users WHERE role = 'walker'`);
    const result = [];

    for (const walker of walkers) {
      const [ratings] = await db.query(`
        SELECT rating FROM WalkRatings WHERE walker_id = ?
      `, [walker.user_id]);

      const totalRatings = ratings.length;
      const avgRating = totalRatings > 0
        ? parseFloat((ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1))
        : null;

      result.push({
        walker_username: walker.username,
        total_ratings: totalRatings,
        average_rating: avgRating,
        completed_walks: totalRatings
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get walkers summary.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

