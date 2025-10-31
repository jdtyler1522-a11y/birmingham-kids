const express = require('express');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Note: Session and database setup removed for basic deployment
// When you implement authentication, you'll need to add:
// 1. Session middleware with connect-pg-simple
// 2. Database connection with drizzle-orm
// 3. Auth provider integration (Clerk, Auth0, etc.)

// Simple auth middleware (placeholder)
const isAuthenticated = (req, res, next) => {
  // For now, authentication is disabled for Vercel deployment
  // You'll need to implement your own auth (Auth0, Clerk, NextAuth, etc.)
  res.status(401).json({ 
    message: 'Authentication not configured. Please set up Auth0, Clerk, or another auth provider.' 
  });
};

// API Routes
app.get('/api/auth/user', isAuthenticated, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

app.get('/api/favorites', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    const directory = req.query.directory;
    // Implementation needed with db
    res.json([]);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ message: 'Failed to fetch favorites' });
  }
});

app.post('/api/favorites', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { directory, listingId } = req.body;
    
    if (!directory || !listingId) {
      return res.status(400).json({ message: 'directory and listingId are required' });
    }
    
    // Implementation needed with db
    res.json({ success: true });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ message: 'Failed to add favorite' });
  }
});

app.delete('/api/favorites', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { directory, listingId } = req.body;
    
    if (!directory || !listingId) {
      return res.status(400).json({ message: 'directory and listingId are required' });
    }
    
    // Implementation needed with db
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ message: 'Failed to remove favorite' });
  }
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '..'), {
  index: false,
  setHeaders: (res) => {
    res.set('Cache-Control', 'no-cache');
  }
}));

// Serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Export the Express app for Vercel
module.exports = app;
