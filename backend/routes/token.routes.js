const express = require('express');
const { getUserToken, refreshToken, getTokenInfo } = require('../controllers/token.controller');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Public route - allows embedding the token in any website using api_key instead of user ID
router.get('/token/:apiKey/script.js', getUserToken);

// Protected routes - require authentication
router.get('/token/info', authMiddleware, getTokenInfo);
router.post('/users/:id/refresh-token', authMiddleware, refreshToken);

module.exports = router;
