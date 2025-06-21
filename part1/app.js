const express = require('express');
const server = express();
const port = process.env.PORT || 3000;

// Dummy memory data for testing
const people = [
  { id: 1, username: 'alice123', password: 'pass1', role: 'owner' },
  { id: 2, username: 'carol123', password: 'pass2', role: 'owner' },
  { id: 3, username: 'bobwalker', password: 'pass3', role: 'walker' },
  { id: 4, username: 'newwalker', password: 'pass4', role: 'walker' }
];

const pets = [
  { id: 1, name: 'Max', size: 'medium', ownerRef: 1 },
  { id: 2, name: 'Bella', size: 'small', ownerRef: 2 },
  { id: 3, name: 'Rocky', size: 'large', ownerRef: 1 }
];

const bookings = [
  {
    id: 1,
    petId: 1,
    time: '2025-06-10T08:00:00.000Z',
    location: 'Parklands',
    duration: 30,
    walkerId: 3,
    status: 'completed',
    rating: 5
  },
  {
    id: 2,
    petId: 2,
    time: '2025-06-11T09:30:00.000Z',
    location: 'City Center',
    duration: 45,
    walkerId: 3,
    status: 'completed',
    rating: 4
  },
  {
    id: 3,
    petId: 3,
    time: '2025-06-12T07:00:00.000Z',
    location: 'Parklands',
    duration: 20,
    walkerId: null,
    status: 'open',
    rating: null
  }
];

// Endpoint 1: /api/dogs
server.get('/api/dogs', (req, res) => {
  try {
    const result = pets.map(p => {
      const owner = people.find(user => user.id === p.ownerRef);
      if (!owner) throw new Error(`Missing owner for dog ID ${p.id}`);
      return {
        dog_name: p.name,
        size: p.size,
        owner_username: owner.username
      };
    });
    res.json(result);
  } catch (error) {
    console.error('GET /api/dogs failed:', error.message);
    res.status(500).json({ error: 'Unable to fetch dog list' });
  }
});

// Endpoint 2: /api/walkrequests/open
server.get('/api/walkrequests/open', (req, res) => {
  try {
    const openBookings = bookings.filter(b => b.status === 'open');
    const response = openBookings.map(b => {
      const dog = pets.find(d => d.id === b.petId);
      const owner = people.find(u => u.id === dog.ownerRef);
      return {
        request_id: b.id,
        dog_name: dog.name,
        requested_time: b.time,
        duration_minutes: b.duration,
        location: b.location,
        owner_username: owner ? owner.username : null
      };
    });
    res.json(response);
  } catch (error) {
    console.error('GET /api/walkrequests/open failed:', error.message);
    res.status(500).json({ error: 'Could not retrieve open walk requests' });
  }
});

// Endpoint 3: /api/walkers/summary
server.get('/api/walkers/summary', (req, res) => {
  try {
    const walkerList = people.filter(p => p.role === 'walker');
    const summary = walkerList.map(w => {
      const completed = bookings.filter(b => b.walkerId === w.id && b.status === 'completed');
      const ratings = completed.map(b => b.rating).filter(r => r !== null);
      const average = ratings.length > 0 ? parseFloat((ratings.reduce((a, b) => a + b) / ratings.length).toFixed(1)) : null;
      return {
        walker_username: w.username,
        total_ratings: ratings.length,
        average_rating: average,
        completed_walks: completed.length
      };
    });
    res.json(summary);
  } catch (error) {
    console.error('GET /api/walkers/summary failed:', error.message);
    res.status(500).json({ error: 'Could not compute walker stats' });
  }
});

// Launch the server
server.listen(port, () => {
  console.log(`App is active on port ${port}`);
});
