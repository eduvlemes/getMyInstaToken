const express = require('express');
const authRoutes = require('./auth.routes');
const subscriptionRoutes = require('./subscription.routes');
const tokenRoutes = require('./token.routes');

const router = express.Router();

// Define routes
router.use('/auth', authRoutes);
router.use('/subscription', subscriptionRoutes);
router.use('/token', tokenRoutes);

module.exports = router;
