const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const tokenController = require('../controllers/token.controller');

// Get token information
router.get('/info', authMiddleware, tokenController.getTokenInfo);

module.exports = router;
