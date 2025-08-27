const express = require('express');
const { loginWithInstagram, instagramCallback, getCurrentUser, logout } = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

// Public routes
router.get('/instagram', loginWithInstagram);
router.get('/instagram/callback', instagramCallback);
router.get('/logout', logout);

// Protected routes
router.get('/me', authenticate, getCurrentUser);

module.exports = router;
