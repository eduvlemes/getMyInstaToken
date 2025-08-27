const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');
const authMiddleware = require('../middleware/auth');

// Rotas protegidas (requerem autenticação)
router.get('/status', authMiddleware, subscriptionController.getSubscriptionStatus);
router.post('/create', authMiddleware, subscriptionController.createSubscription);
router.post('/create-recurring', authMiddleware, subscriptionController.createRecurringSubscription);
router.post('/confirm-recurring', authMiddleware, subscriptionController.confirmRecurringSubscription);
router.get('/verify-payment/:payment_id', authMiddleware, subscriptionController.verifyPaymentOwnership);

// Webhook do Mercado Pago (não requer autenticação)
router.post('/webhook', subscriptionController.webhookHandler);

// Endpoint para verificar logs de webhook (apenas para debug)
router.get('/webhook/logs', authMiddleware, subscriptionController.getWebhookLogs);

// Callbacks de sucesso, falha e pendente do Mercado Pago
router.get('/success', subscriptionController.handleSubscriptionSuccess);
router.get('/failure', subscriptionController.handleSubscriptionFailure);
router.get('/pending', subscriptionController.handleSubscriptionPending);

module.exports = router;
