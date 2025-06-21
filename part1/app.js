const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Simulated test data (in-memory)
const users = [
  { id: 1, username: 'alice123', password: 'pass1', role: 'owner' },
  { id: 2, username: 'carol123', password: 'pass2', role: 'owner' },
  { id: 3, username: 'bobwalker', password: 'pass3', role: 'walker' },
  { id: 4, username: 'newwalker', password: 'pass4', role: 'walker' }
];

const dogs = [
  { id: 1, name: 'Max', size: 'medium', ownerId: 1 },
  { id: 2, name: 'Bella', size: 'small', ownerId: 2 },
  { id: 3, name: 'Rocky', size: 'large', ownerId: 1 }
];

const requests = [
  {
    id: 1,
    dogId: 1,
    time: '2025-06-10T08:00:00.000Z',
    location: 'Parklands',
    duration: 30,
    walkerId: 3,
    status: 'completed',
    rating: 5
  },
  {
    id: 2,
    dogId: 2,
    time: '2025-06-11T09:30:00.000Z',
    location: 'City Center',
    duration: 45,
    walkerId: 3,
    status: 'completed',
    rating: 4
  },
  {
    id: 3,
    dogId: 3,
    time: '2025-06-12T07:00:00.000Z',
    location: 'Parklands',
    duration: 20,
    walkerId: null,
    status: 'open',
    rating: null
  }
];

// /api/dogs route
app.get('/api/dogs', (req, res) => {
  try {
    const result = dogs.map(dog => {
      const owner = users.find(u => u.id === dog.ownerId);
      if (!owner) throw new Error(`Owner not found for dog ${dog.id}`);
      return {
        dog_name: dog.name,
        size: dog.size,
        owner_username: owner.username
      };
    });
    res.json(result);
  } catch (err) {
    console.error('Error in /api/dogs:', err.message);
    res.status(500).json({ error: 'Failed to get dogs.' });
  }
});

// /api/walkrequests/open route
app.get('/api/walkrequests/open', (req, res) => {
  try {
    const open = requests.filter(r => r.status === 'open');
    const result = open.map(r => {
      const dog = dogs.find(d => d.id === r.dogId);
      const owner = users.find(u => u.id === dog.ownerId);
      return {
        request_id: r.id,
        dog_name: dog.name,
        requested_time: r.time,
        duration_minutes: r.duration,
        location: r.location,
        owner_username: owner ? owner.username : null
      };
    });
    res.json(result);
  } catch (err) {
    console.error('Error in /api/walkrequests/open:', err.message);
    res.status(500).json({ error: 'Failed to get open walk requests.' });
  }
});

// /api/walkers/summary route
app.get('/api/walkers/summary', (req, res) => {
  try {
    const walkers = users.filter(u => u.role === 'walker');
    const result = walkers.map(walker => {
      const completed = requests.filter(r => r.walkerId === walker.id && r.status === 'completed');
      const ratings = completed.filter(r => r.rating !== null).map(r => r.rating);
      const avg = ratings.length > 0 ? parseFloat((ratings.reduce((a, b) => a + b) / ratings.length).toFixed(1)) : null;
      return {
        walker_username: walker.username,
        total_ratings: ratings.length,
        average_rating: avg,
        completed_walks: completed.length
      };
    });
    res.json(result);
  } catch (err) {
    console.error('Error in /api/walkers/summary:', err.message);
    res.status(500).json({ error: 'Failed to get walker summary.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
