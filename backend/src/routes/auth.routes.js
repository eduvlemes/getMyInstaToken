const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middleware/auth');

// Instagram OAuth callback route
router.get('/instagram/callback', async (req, res) => {
  try {
    // In a real app, this would handle the Instagram OAuth process
    // For this example, we'll simulate successful authentication
    const mockInstagramData = {
      id: '12345678',
      username: 'instagram_user',
      full_name: 'Instagram User',
      access_token: 'mock-instagram-token',
      profile_picture: 'https://via.placeholder.com/150'
    };
    
    // Find or create the user in the database
    const user = await prisma.user.upsert({
      where: { instagram_id: mockInstagramData.id },
      update: {
        username: mockInstagramData.username,
        full_name: mockInstagramData.full_name,
        profile_picture: mockInstagramData.profile_picture
      },
      create: {
        instagram_id: mockInstagramData.id,
        username: mockInstagramData.username,
        full_name: mockInstagramData.full_name,
        profile_picture: mockInstagramData.profile_picture,
        email: `${mockInstagramData.username}@example.com` // In a real app, you'd get this from Instagram API
      }
    });
    
    // Create/update the token for the user
    await prisma.token.upsert({
      where: { userId: user.id },
      update: {
        value: mockInstagramData.access_token,
        expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days
      },
      create: {
        userId: user.id,
        value: mockInstagramData.access_token,
        expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days
      }
    });
    
    // Generate a JWT for the frontend
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    // Redirect to the frontend with the token
    // In production, you'd use a more secure method
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/auth-callback?token=${token}`);
  } catch (error) {
    console.error('Instagram callback error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Get current user information
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id
      },
      select: {
        id: true,
        username: true,
        full_name: true,
        profile_picture: true,
        email: true,
        posts_count: true,
        followers_count: true,
        following_count: true,
        token_expires_at: true
      }
    });
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user information' });
  }
});

// Logout route (just for frontend, JWT is stateless)
router.post('/logout', (req, res) => {
  res.status(200).json({ message: 'Logout successful' });
});

module.exports = router;
