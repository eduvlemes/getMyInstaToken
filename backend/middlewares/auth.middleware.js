const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Authentication middleware
exports.authenticate = async (req, res, next) => {
  try {
    console.log('--- Auth Middleware ---');
    console.log('Request path:', req.path);
    console.log('Cookies:', req.cookies);
    console.log('All headers:', JSON.stringify(req.headers));
    console.log('Authorization header:', req.headers.authorization);
    console.log('X-Auth-Token header:', req.headers['x-auth-token']);
    console.log('Query params:', req.query);
    
    let token;
    
    // Check for token in cookies first
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log('Using token from cookies');
    } 
    // Then check for token in Authorization header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Using token from Authorization header');
    }
    // Check for X-Auth-Token header
    else if (req.headers['x-auth-token']) {
      token = req.headers['x-auth-token'];
      console.log('Using token from X-Auth-Token header');
    }
    // Finally check query params (useful for token.js endpoint)
    else if (req.query && req.query.token) {
      token = req.query.token;
      console.log('Using token from query params');
    }

    if (!token) {
      return res.status(401).json({ error: true, message: 'Not authenticated. Please login.' });
    }

    // Verify token
    let decoded;
    try {
      console.log('Verifying token with secret key');
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded);
    } catch (err) {
      console.error('Token verification failed:', err.message);
      return res.status(401).json({ error: true, message: 'Invalid token. Please login again.' });
    }
    
    if (!decoded.id) {
      console.error('Token payload does not contain user ID');
      return res.status(401).json({ error: true, message: 'Invalid token format. Please login again.' });
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });
    
    console.log('User from database:', user ? `ID: ${user.id}` : 'Not found');

    if (!user) {
      return res.status(401).json({ error: true, message: 'User no longer exists' });
    }

    // Add user info to request
    req.user = {
      id: user.id,
      instagram_user_id: user.instagram_user_id
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: true, message: 'Invalid or expired token. Please login again.' });
    }
    
    res.status(500).json({ error: true, message: error.message });
  }
};
