const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const mercadopago = require('mercadopago');

// Configurar o SDK do Mercado Pago com a chave de acesso
mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN || 'TEST-1234567890123456-123456-12345678901234567890123456789012-123456789'
});

/**
 * Get the subscription status for a user
 */
const getSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Buscar a assinatura mais recente do usuário
    const subscription = await prisma.subscription.findFirst({
      where: {
        user_id: userId
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    
    // Se não há assinatura, o usuário precisa assinar
    if (!subscription) {
      return res.status(200).json({
        isActive: false,
        inTrialPeriod: false,
        message: 'Nenhuma assinatura encontrada'
      });
    }
    
    // Verificar se está no período de teste
    const now = new Date();
    const trialEndsAt = subscription.trial_ends_at ? new Date(subscription.trial_ends_at) : null;
    const isInTrial = trialEndsAt && trialEndsAt > now && subscription.status === 'trial';
    
    // Calcular dias restantes de teste
    let daysLeft = 0;
    if (isInTrial) {
      daysLeft = Math.ceil((trialEndsAt - now) / (1000 * 60 * 60 * 24));
    }
    
    // Verificar se a assinatura está ativa
    const isActive = subscription.status === 'active' && 
                     (!subscription.ends_at || new Date(subscription.ends_at) > now);
    
    return res.status(200).json({
      isActive: isActive,
      inTrialPeriod: isInTrial,
      daysLeft: daysLeft,
      subscription: subscription
    });
    
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return res.status(500).json({ error: 'Failed to get subscription status' });
  }
};

/**
 * Create a new subscription for a user
 */
const createSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { plan } = req.body;
    
    if (!plan || !['monthly', 'yearly'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan type' });
    }
    
    // Verificar se o usuário já tem uma assinatura ativa
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        user_id: userId,
        OR: [
          { status: 'active' },
          {
            status: 'trial',
            trial_ends_at: {
              gt: new Date()
            }
          }
        ]
      }
    });
    
    if (existingSubscription && existingSubscription.status === 'active') {
      return res.status(400).json({ error: 'User already has an active subscription' });
    }
    
    // Definir o preço com base no plano
    const price = plan === 'monthly' ? 29.90 : 299.90;
    
    // Criar preferência de pagamento no Mercado Pago
    const preference = {
      items: [
        {
          title: plan === 'monthly' ? 'Assinatura Mensal' : 'Assinatura Anual',
          quantity: 1,
          currency_id: 'BRL',
          unit_price: price
        }
      ],
      back_urls: {
        success: `${process.env.FRONTEND_URL || 'https://alpix.dev'}/payment-success`,
        failure: `${process.env.FRONTEND_URL || 'htts://alpix.dev'}/payment-failure`
      },
      auto_return: 'approved',
      notification_url: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/subscription/webhook`,
      external_reference: userId.toString(),
      metadata: {
        userId: userId,
        plan: plan
      }
    };
    
    const mpResponse = await mercadopago.preferences.create(preference);
    
    // Criar ou atualizar assinatura no banco de dados
    // Se estiver em período de teste, atualize para pending
    // Se não, crie uma nova assinatura como pending
    if (existingSubscription && existingSubscription.status === 'trial') {
      await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          status: 'pending',
          plan_type: plan
        }
      });
    } else {
      await prisma.subscription.create({
        data: {
          user_id: userId,
          plan_type: plan,
          status: 'pending',
          starts_at: new Date()
        }
      });
    }
    
    // Retornar URL de checkout
    return res.status(200).json({
      init_point: mpResponse.body.init_point,
      sandbox_init_point: mpResponse.body.sandbox_init_point
    });
    
  } catch (error) {
    console.error('Error creating subscription:', error);
    return res.status(500).json({ error: 'Failed to create subscription' });
  }
};

/**
 * Handle webhooks from payment provider
 */
const webhookHandler = async (req, res) => {
  try {
    const { data } = req.body;
    
    // Apenas processar notificações de pagamento
    if (req.body.type !== 'payment') {
      return res.status(200).send();
    }
    
    // Obter os detalhes do pagamento
    const paymentId = data.id;
    const payment = await mercadopago.payment.get(paymentId);
    
    // Se o pagamento foi aprovado
    if (payment.body.status === 'approved') {
      const userId = Number(payment.body.external_reference);
      const metadata = payment.body.metadata || {};
      const plan = metadata.plan || 'monthly';
      
      // Buscar a assinatura pendente do usuário
      const subscription = await prisma.subscription.findFirst({
        where: {
          user_id: userId,
          status: 'pending'
        },
        orderBy: {
          created_at: 'desc'
        }
      });
      
      if (!subscription) {
        console.error('No pending subscription found for userId:', userId);
        return res.status(200).send();
      }
      
      // Calcular data de término da assinatura
      const now = new Date();
      const endsAt = new Date(now);
      if (plan === 'monthly') {
        endsAt.setMonth(endsAt.getMonth() + 1);
      } else {
        endsAt.setFullYear(endsAt.getFullYear() + 1);
      }
      
      // Atualizar assinatura para ativa
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'active',
          starts_at: now,
          ends_at: endsAt,
          plan_type: plan
        }
      });
      
      // Registrar o pagamento
      await prisma.payment.create({
        data: {
          subscription_id: subscription.id,
          user_id: userId,
          amount: payment.body.transaction_amount,
          currency: 'BRL',
          payment_method: payment.body.payment_method_id,
          mercado_pago_id: paymentId,
          status: payment.body.status
        }
      });
    }
    
    return res.status(200).send();
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
};

/**
 * Validate a user's subscription status
 * Used internally when a token is requested
 */
const validateSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Verificar se o usuário tem uma assinatura ativa ou em período de teste
    const subscription = await prisma.subscription.findFirst({
      where: {
        user_id: userId,
        OR: [
          { status: 'active' },
          {
            status: 'trial',
            trial_ends_at: {
              gt: new Date()
            }
          }
        ]
      }
    });
    
    if (!subscription) {
      return res.status(403).json({
        isValid: false,
        message: 'No active subscription found'
      });
    }
    
    // Se a assinatura está ativa, mas já expirou
    if (subscription.status === 'active' && 
        subscription.ends_at && 
        new Date(subscription.ends_at) <= new Date()) {
      return res.status(403).json({
        isValid: false,
        message: 'Subscription has expired'
      });
    }
    
    return res.status(200).json({
      isValid: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        plan: subscription.plan_type,
        endsAt: subscription.ends_at,
        trialEndsAt: subscription.trial_ends_at
      }
    });
    
  } catch (error) {
    console.error('Error validating subscription:', error);
    return res.status(500).json({ error: 'Failed to validate subscription' });
  }
};

module.exports = {
  getSubscriptionStatus,
  createSubscription,
  webhookHandler,
  validateSubscription
};
