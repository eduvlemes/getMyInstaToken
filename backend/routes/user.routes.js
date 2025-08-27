const express = require('express');
const { getUserById, updateUser, regenerateApiKey } = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

// Get user profile
router.get('/:id', getUserById);

// Update user profile
router.put('/:id', updateUser);

// Regenerate API key
router.post('/regenerate-api-key', regenerateApiKey);

module.exports = router;
