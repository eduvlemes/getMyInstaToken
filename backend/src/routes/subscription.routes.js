const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const subscriptionController = require('../controllers/subscription.controller');

// Get subscription status
router.get('/status', authMiddleware, subscriptionController.getSubscriptionStatus);

// Create a new subscription
router.post('/create', authMiddleware, subscriptionController.createSubscription);

// Handle webhook from payment provider
router.post('/webhook', subscriptionController.webhookHandler);

// Validate subscription (for internal use)
router.post('/validate', authMiddleware, subscriptionController.validateSubscription);

module.exports = router;
