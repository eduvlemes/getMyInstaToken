const express = require('express');
const router = express.Router();

// Importar rotas
const authRoutes = require('./auth.routes');
const tokenRoutes = require('./token.routes');
const userRoutes = require('./user.routes');
const subscriptionRoutes = require('./subscription.routes');

// Definir prefixos das rotas
router.use('/auth', authRoutes);
router.use('/token', tokenRoutes);
router.use('/user', userRoutes);
router.use('/subscription', subscriptionRoutes);

module.exports = router;
