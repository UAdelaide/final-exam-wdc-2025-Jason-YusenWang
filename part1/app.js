const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Sample in-memory data
const users = [
  { id: 1, username: 'owner1', password: 'pass1', role: 'owner' },
  { id: 2, username: 'owner2', password: 'pass2', role: 'owner' },
  { id: 3, username: 'walkerA', password: 'pass3', role: 'walker' },
  { id: 4, username: 'walkerB', password: 'pass4', role: 'walker' }
];

const dogs = [
  { id: 101, name: 'Buddy', size: 'Small', ownerId: 1 },
  { id: 102, name: 'Charlie', size: 'Medium', ownerId: 1 },
  { id: 103, name: 'Max', size: 'Large', ownerId: 2 }
];

const requests = [
  { id: 1001, dogId: 101, time: '2025-06-21T10:00:00.000Z', location: 'City Park', duration: 60, walkerId: null, status: 'open', rating: null },
  { id: 1002, dogId: 102, time: '2025-06-20T09:00:00.000Z', location: 'Beach', duration: 30, walkerId: 3, status: 'completed', rating: 5 },
  { id: 1003, dogId: 103, time: '2025-06-19T18:00:00.000Z', location: 'Downtown', duration: 45, walkerId: 3, status: 'completed', rating: 3 },
  { id: 1004, dogId: 103, time: '2025-06-22T11:00:00.000Z', location: 'Mall', duration: 20, walkerId: null, status: 'open', rating: null },
  { id: 1005, dogId: 101, time: '2025-06-18T07:30:00.000Z', location: 'Neighborhood', duration: 15, walkerId: 4, status: 'completed', rating: 4 }
];

// Route 1: /api/dogs
app.get('/api/dogs', (req, res) => {
  try {
    const result = dogs.map(dog => {
      const owner = users.find(u => u.id === dog.ownerId);
      if (!owner) throw new Error(`Owner not found for dog ID ${dog.id}`);
      return {
        dog_name: dog.name,
        size: dog.size.toLowerCase(),
        owner_username: owner.username
      };
    });
    res.json(result);
  } catch (err) {
    console.error('Error in /api/dogs:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route 2: /api/walkrequests/open
app.get('/api/walkrequests/open', (req, res) => {
  try {
    const openRequests = requests.filter(r => r.status === 'open');
    const result = openRequests.map(r => {
      const dog = dogs.find(d => d.id === r.dogId);
      if (!dog) throw new Error(`Dog not found for request ${r.id}`);
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route 3: /api/walkers/summary
app.get('/api/walkers/summary', (req, res) => {
  try {
    const walkers = users.filter(u => u.role === 'walker');
    const result = walkers.map(walker => {
      const completedRequests = requests.filter(r => r.walkerId === walker.id && r.rating !== null);
      const completedCount = completedRequests.length;
      let avgRating = null;

      if (completedCount > 0) {
        const totalRating = completedRequests.reduce((sum, r) => sum + r.rating, 0);
        avgRating = Number((totalRating / completedCount).toFixed(1));
      }

      return {
        walker_username: walker.username,
        total_ratings: completedCount,
        average_rating: avgRating,
        completed_walks: completedCount
      };
    });
    res.json(result);
  } catch (err) {
    console.error('Error in /api/walkers/summary:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
