const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Initialize test data
const users = [
  { id: 1, username: 'owner1', password: 'pass1', role: 'owner' },
  { id: 2, username: 'owner2', password: 'pass2', role: 'owner' },
  { id: 3, username: 'walkerA', password: 'pass3', role: 'walker' },
  { id: 4, username: 'walkerB', password: 'pass4', role: 'walker' }
];
const dogs = [
  { id: 101, name: 'Buddy', size: 'Small', ownerId: 1 },   // Belongs to owner1
  { id: 102, name: 'Charlie', size: 'Medium', ownerId: 1 }, // Belongs to owner1
  { id: 103, name: 'Max', size: 'Large', ownerId: 2 }       // Belongs to owner2
];
const requests = [
  // request_id, dog_id, time, location, duration, walker_id, status, rating
  { id: 1001, dogId: 101, time: '2025-06-21 10:00', location: 'City Park', duration: 60, walkerId: null, status: 'open', rating: null },      // Unaccepted request
  { id: 1002, dogId: 102, time: '2025-06-20 09:00', location: 'Beach',    duration: 30, walkerId: 3,    status: 'completed', rating: 5 },    // Completed by walkerA, rating 5
  { id: 1003, dogId: 103, time: '2025-06-19 18:00', location: 'Downtown', duration: 45, walkerId: 3,    status: 'completed', rating: 3 },    // Completed by walkerA, rating 3
  { id: 1004, dogId: 103, time: '2025-06-22 11:00', location: 'Mall',     duration: 20, walkerId: null, status: 'open',      rating: null }, // Unaccepted request
  { id: 1005, dogId: 101, time: '2025-06-18 07:30', location: 'Neighborhood', duration: 15, walkerId: 4, status: 'completed', rating: 4 }    // Completed by walkerB, rating 4
];
// *Note*: In a real application, the above data would be stored in a database. Here it's simplified as in-memory objects for demonstration.

// Route 1: Get all dog information (name, size, owner's username)
app.get('/api/dogs', (req, res) => {
  try {
    const result = dogs.map(d => {
      const owner = users.find(u => u.id === d.ownerId);        // Find the dog's owner
      if (!owner) throw new Error(`Owner not found for dog ${d.id}`);
      return { name: d.name, size: d.size, ownerUsername: owner.username };
    });
    res.json(result);
  } catch (err) {
    console.error('Error in /api/dogs:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route 2: Get all unaccepted walk requests (dog name, time, location, duration, owner's username)
app.get('/api/walkrequests/open', (req, res) => {
  try {
    const openRequests = requests.filter(r => !r.walkerId || r.status === 'open');
    const result = openRequests.map(r => {
      const dog = dogs.find(d => d.id === r.dogId);
      if (!dog) throw new Error(`Dog not found for request ${r.id}`);
      const owner = users.find(u => u.id === dog.ownerId);
      return {
        dogName: dog.name,
        time: r.time,
        location: r.location,
        duration: r.duration,
        ownerUsername: owner ? owner.username : null
      };
    });
    res.json(result);
  } catch (err) {
    console.error('Error in /api/walkrequests/open:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route 3: Get summary of all walkers (username, average rating, completed walks)
app.get('/api/walkers/summary', (req, res) => {
  try {
    // Filter users with role 'walker'
    const walkers = users.filter(u => u.role === 'walker');
    const result = walkers.map(walker => {
      // Find completed requests for this walker (rated ones are considered completed)
      const completedRequests = requests.filter(r => r.walkerId === walker.id && r.rating !== null);
      const completedCount = completedRequests.length;
      // Calculate average rating
      let avgRating = null;
      if (completedCount > 0) {
        const totalRating = completedRequests.reduce((sum, r) => sum + (r.rating || 0), 0);
        avgRating = Number((totalRating / completedCount).toFixed(2));  // Keep two decimal places
      }
      return {
        walkerUsername: walker.username,
        averageRating: avgRating,
        completedWalks: completedCount
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
