const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

// Configuração do Mercado Pago - Nova API
const { MercadoPagoConfig, Preference, Payment, PreApproval } = require('mercadopago');

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN 
});

// Verificar status da assinatura do usuário
exports.getSubscriptionStatus = async (req, res) => {
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

// Retorno de pagamento pendente do Mercado Pago
exports.handleSubscriptionPending = async (req, res) => {
  try {
    const { payment_id, status, external_reference } = req.query;
    
    console.log('Subscription pending callback received:', { payment_id, status, external_reference });
    
    // Extrair user_id da referência externa se disponível
    let userId = null;
    if (external_reference) {
      try {
        const [userIdPart] = external_reference.split(':plan_type:');
        userId = parseInt(userIdPart.split('user_id:')[1]);
      } catch (error) {
        console.error('Error parsing external_reference:', error);
      }
    }

    // Redirecionar para a página de perfil com status pendente
    const redirectUrl = userId 
      ? `${process.env.FRONTEND_URL}/profile?subscription_status=pending&payment_id=${payment_id}&user_id=${userId}`
      : `${process.env.FRONTEND_URL}/profile?subscription_status=pending&payment_id=${payment_id || 'unknown'}`;
    
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Subscription pending handler error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/profile?subscription_status=error&reason=server_error`);
  }
};

// Criar assinatura recorrente (nova API do Mercado Pago)
exports.createRecurringSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { plan_type, payer_email } = req.body;
    
    console.log('Creating recurring subscription for user:', userId, 'plan:', plan_type, 'email:', payer_email);
    
    if (!plan_type || !['monthly', 'yearly'].includes(plan_type)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tipo de plano inválido. Use "monthly" ou "yearly".' 
      });
    }

    if (!payer_email || !payer_email.includes('@')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email válido é obrigatório para criar assinatura recorrente.' 
      });
    }

    // Buscar dados do usuário
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }

    if (!user.instagram_user_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Usuário deve estar vinculado ao Instagram para criar assinatura recorrente.' 
      });
    }

    // Configurações do plano
    const planConfig = {
      monthly: {
        amount: 4.97,
        frequency: 1,
        frequency_type: 'months',
        reason: 'GetMyToken - Assinatura Mensal'
      },
      yearly: {
        amount: 49.70,
        frequency: 12,
        frequency_type: 'months', 
        reason: 'GetMyToken - Assinatura Anual'
      }
    };

    const selectedPlan = planConfig[plan_type];
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 2); // 2 anos no futuro

    // Criar assinatura recorrente usando PreApproval
    const preApprovalData = {
      reason: selectedPlan.reason,
      external_reference: `user_id:${userId}:plan_type:${plan_type}:instagram_id:${user.instagram_user_id}`,
      payer_email: payer_email, // Email fornecido pelo usuário
      auto_recurring: {
        frequency: selectedPlan.frequency,
        frequency_type: selectedPlan.frequency_type,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        transaction_amount: selectedPlan.amount,
        currency_id: 'BRL'
      },
      // back_url: `${process.env.FRONTEND_URL}/payment-success`,
      back_url: `https://www.alpix.dev/payment-success`,
      status: 'pending'
    };

    console.log('Creating PreApproval with data:', preApprovalData);

    const preApproval = new PreApproval(client);
    const response = await preApproval.create({ body: preApprovalData });

    console.log('PreApproval created:', response);

    // Salvar assinatura no banco
    const subscription = await prisma.subscription.create({
      data: {
        user_id: userId,
        plan_type: plan_type,
        status: 'pending',
        starts_at: startDate,
        mercado_pago_id: response.id
      }
    });

    return res.status(200).json({
      success: true,
      subscription_id: subscription.id,
      preapproval_id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
      plan: selectedPlan,
      instagram_user_id: user.instagram_user_id
    });

  } catch (error) {
    console.error('Error creating recurring subscription:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: error.message 
    });
  }
};

// Confirmar assinatura recorrente
exports.confirmRecurringSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { preapproval_id } = req.body;
    
    console.log('Confirming recurring subscription for user:', userId, 'preapproval_id:', preapproval_id);
    
    if (!preapproval_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'preapproval_id é obrigatório' 
      });
    }

    // Buscar a assinatura no banco pelo mercado_pago_id
    const subscription = await prisma.subscription.findFirst({
      where: {
        user_id: userId,
        mercado_pago_id: preapproval_id
      }
    });

    if (!subscription) {
      return res.status(404).json({ 
        success: false, 
        message: 'Assinatura não encontrada' 
      });
    }

    // Buscar informações da assinatura no Mercado Pago
    try {
      const preApproval = new PreApproval(client);
      const response = await preApproval.get({ id: preapproval_id });
      
      console.log('PreApproval info from MP:', response);

      // Atualizar status da assinatura baseado no status do Mercado Pago
      let newStatus = 'pending';
      let endsAt = null;

      if (response.status === 'authorized' || response.status === 'active') {
        newStatus = 'active';
        
        // Calcular data de término baseada no plano
        const planConfig = {
          monthly: { months: 1 },
          yearly: { months: 12 }
        };
        
        const config = planConfig[subscription.plan_type];
        if (config) {
          endsAt = new Date();
          endsAt.setMonth(endsAt.getMonth() + config.months);
        }
      } else if (response.status === 'cancelled' || response.status === 'finished') {
        newStatus = 'cancelled';
      }

      // Atualizar assinatura no banco
      const updatedSubscription = await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: newStatus,
          ends_at: endsAt,
          updated_at: new Date()
        }
      });

      return res.status(200).json({
        success: true,
        subscription: updatedSubscription,
        mercado_pago_status: response.status,
        message: 'Assinatura confirmada com sucesso'
      });

    } catch (mpError) {
      console.error('Error fetching preapproval from MP:', mpError);
      
      // Se não conseguir buscar no MP, assumir que está ativa
      const updatedSubscription = await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'active',
          ends_at: subscription.plan_type === 'monthly' ? 
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : 
            new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          updated_at: new Date()
        }
      });

      return res.status(200).json({
        success: true,
        subscription: updatedSubscription,
        message: 'Assinatura ativada (confirmação offline)'
      });
    }

  } catch (error) {
    console.error('Error confirming recurring subscription:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: error.message 
    });
  }
};

// Criar assinatura
exports.createSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { plan_type } = req.body;
    
    console.log('Creating subscription for user:', userId, 'plan:', plan_type);
    
    if (!plan_type || !['monthly', 'yearly'].includes(plan_type)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tipo de plano inválido. Use "monthly" ou "yearly".' 
      });
    }

    // Verificar se o token do Mercado Pago está configurado
    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN || 
        process.env.MERCADO_PAGO_ACCESS_TOKEN === 'TEST-YOUR-ACCESS-TOKEN-HERE') {
      console.log('Mercado Pago token not configured, using direct payment links');
      
      // URLs diretas do Mercado Pago para cada tipo de plano
      const paymentUrls = {
        monthly: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=ac9f7517c5404260be6c4aa09dd4f6ab',
        yearly: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=2c9380848c5c0c55018c5d1b07ad0096'
      };
      
      // Criar registro de assinatura pendente
      const subscription = await prisma.subscription.create({
        data: {
          user_id: userId,
          plan_type: plan_type,
          status: 'pending',
          starts_at: new Date(),
          mercado_pago_id: `direct_${plan_type}_${Date.now()}`
        }
      });

      return res.json({
        success: true,
        subscription_id: subscription.id,
        plan_type,
        init_point: paymentUrls[plan_type],
        message: 'Redirecionando para pagamento direto do Mercado Pago...'
      });
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
      return res.status(400).json({ 
        success: false, 
        message: 'Usuário já possui uma assinatura ativa' 
      });
    }
    
    // Definir configurações do plano
    const planConfig = {
      monthly: {
        price: 4.97,
        title: 'GetMyToken - Plano Mensal',
        frequency: 1, // monthly
        frequency_type: 'months'
      },
      yearly: {
        price: 49.70, // Desconto anual (10 meses)
        title: 'GetMyToken - Plano Anual',
        frequency: 12,
        frequency_type: 'months'
      }
    };
    
    const selectedPlan = planConfig[plan_type];
    
    console.log('Using Mercado Pago API with configured token');
    console.log('Selected plan:', selectedPlan);
    
    // Criar preferência de pagamento para assinatura
    const preference = {
      items: [
        {
          title: selectedPlan.title,
          unit_price: selectedPlan.price,
          quantity: 1,
        }
      ],
      back_urls: {
        // success: `${process.env.FRONTEND_URL || 'https://alpix.dev'}/payment-success`,
        // failure: `${process.env.FRONTEND_URL || 'https://alpix.dev'}/payment-failure`,
        // pending: `${process.env.FRONTEND_URL || 'https://alpix.dev'}/payment-pending`
         success: `${'https://alpix.dev'}/payment-success`,
        failure: `${'https://alpix.dev'}/payment-failure`,
        pending: `${'https://alpix.dev'}/payment-pending`
      },
      auto_return: "approved",
      notification_url: `${process.env.BACKEND_URL}/api/subscription/webhook`,
      external_reference: `user_id:${userId}:plan_type:${plan_type}`,
      metadata: {
        user_id: userId,
        plan_type: plan_type
      }
    };
    
    console.log('Creating Mercado Pago preference:', preference);
    
    // Usar a nova API do Mercado Pago
    const preferenceClient = new Preference(client);
    const response = await preferenceClient.create({ body: preference });
    
    console.log('Mercado Pago preference created:', response);
    
    // Criar ou atualizar assinatura no banco de dados como pending
    if (existingSubscription && existingSubscription.status === 'trial') {
      await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          status: 'pending',
          plan_type: plan_type,
          mercado_pago_id: response.id
        }
      });
    } else {
      await prisma.subscription.create({
        data: {
          user_id: userId,
          plan_type: plan_type,
          status: 'pending',
          starts_at: new Date(),
          mercado_pago_id: response.id
        }
      });
    }
    
    // Retornar URL de checkout
    return res.status(200).json({
      success: true,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
      preference_id: response.id,
      plan: selectedPlan
    });
    
  } catch (error) {
    console.error('Error creating subscription:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: error.message 
    });
  }
};

// Função auxiliar para verificar se o pagamento pertence ao usuário
const verifyPaymentOwnership = async (paymentId, userId) => {
  try {
    // Buscar a assinatura associada ao pagamento
    const subscription = await prisma.subscription.findFirst({
      where: {
        user_id: parseInt(userId),
        mercado_pago_id: paymentId
      }
    });

    return subscription ? true : false;
  } catch (error) {
    console.error('Error verifying payment ownership:', error);
    return false;
  }
};

// Webhook do Mercado Pago
exports.webhookHandler = async (req, res) => {
  try {
    const { type, data } = req.body;
    
    console.log('Webhook received:', { type, data, headers: req.headers });
    
    // Validar assinatura do webhook (opcional, mas recomendado)
    const signature = req.headers['x-signature'];
    const requestId = req.headers['x-request-id'];
    
    if (type === 'payment') {
      await handlePaymentWebhook(data.id);
    } else if (type === 'subscription_preapproval') {
      await handleSubscriptionWebhook(data.id);
    } else if (type === 'subscription_authorized_payment') {
      await handleAuthorizedPaymentWebhook(data.id);
    } else {
      console.log('Unknown webhook type:', type);
    }
    
    return res.status(200).json({ success: true });
    
  } catch (error) {
    console.error('Webhook handler error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Webhook processing failed',
      error: error.message 
    });
  }
};

// Handler para webhooks de pagamento único
async function handlePaymentWebhook(paymentId) {
  console.log('Processing payment webhook for ID:', paymentId);
  
  // Buscar informações do pagamento no Mercado Pago usando nova API
  const paymentClient = new Payment(client);
  const paymentResponse = await paymentClient.get({ id: paymentId });
  const paymentInfo = paymentResponse;
  
  console.log('Payment info from MP:', paymentInfo);
  
  const { status, external_reference, transaction_amount, payment_method_id } = paymentInfo;
  
  if (!external_reference) {
    console.log('No external_reference found in payment');
    return;
  }
  
  // Extrair user_id e plan_type da referência externa
  const [userIdPart, planTypePart] = external_reference.split(':plan_type:');
  const userId = parseInt(userIdPart.split('user_id:')[1]);
  const planType = planTypePart;
  
  console.log('Parsed from external_reference:', { userId, planType });
  
  // Buscar usuário e assinatura pendente
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    console.log('User not found:', userId);
    return;
  }
  
  const subscription = await prisma.subscription.findFirst({
    where: { 
      user_id: userId,
      status: 'pending'
    },
    orderBy: { created_at: 'desc' }
  });
  
  if (!subscription) {
    console.log('Pending subscription not found for user:', userId);
    return;
  }
  
  // Registrar pagamento
  const payment = await prisma.payment.create({
    data: {
      user_id: userId,
      subscription_id: subscription.id,
      amount: transaction_amount,
      currency: 'BRL',
      status,
      mercado_pago_id: paymentId.toString(),
      payment_method: payment_method_id || 'unknown'
    }
  });
  
  console.log('Payment registered:', payment);
  
  // Atualizar status da assinatura baseado no status do pagamento
  if (status === 'approved') {
    await activateSubscription(subscription.id, userId, planType, paymentId);
  } else if (status === 'rejected' || status === 'cancelled') {
    await failSubscription(subscription.id, paymentId);
  }
}

// Handler para webhooks de assinatura recorrente
async function handleSubscriptionWebhook(preapprovalId) {
  console.log('Processing subscription webhook for preapproval ID:', preapprovalId);
  
  try {
    // Buscar informações da assinatura no Mercado Pago
    const preapprovalClient = new PreApproval(client);
    const preapprovalInfo = await preapprovalClient.get({ id: preapprovalId });
    
    console.log('PreApproval info from MP:', preapprovalInfo);
    
    const { status, external_reference, reason } = preapprovalInfo;
    
    if (!external_reference) {
      console.log('No external_reference found in preapproval');
      return;
    }
    
    // Buscar assinatura no banco usando preapproval_id
    const subscription = await prisma.subscription.findFirst({
      where: { 
        mercado_pago_id: preapprovalId
      }
    });
    
    if (!subscription) {
      console.log('Subscription not found for preapproval ID:', preapprovalId);
      return;
    }
    
    // Atualizar status da assinatura baseado no status do preapproval
    if (status === 'authorized') {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'active' }
      });
      console.log('Recurring subscription activated:', subscription.id);
      
    } else if (status === 'cancelled' || status === 'paused') {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'cancelled' }
      });
      console.log('Recurring subscription cancelled:', subscription.id);
      
    } else if (status === 'pending') {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'pending' }
      });
      console.log('Recurring subscription pending:', subscription.id);
    }
    
  } catch (error) {
    console.error('Error processing subscription webhook:', error);
  }
}

// Handler para webhooks de pagamento autorizado em assinatura
async function handleAuthorizedPaymentWebhook(paymentId) {
  console.log('Processing authorized payment webhook for ID:', paymentId);
  
  try {
    // Buscar informações do pagamento
    const paymentClient = new Payment(client);
    const paymentInfo = await paymentClient.get({ id: paymentId });
    
    console.log('Authorized payment info from MP:', paymentInfo);
    
    const { status, external_reference, transaction_amount, preapproval_id } = paymentInfo;
    
    // Buscar assinatura pelo preapproval_id
    const subscription = await prisma.subscription.findFirst({
      where: { 
        mercado_pago_id: preapproval_id
      }
    });
    
    if (!subscription) {
      console.log('Subscription not found for preapproval ID:', preapproval_id);
      return;
    }
    
    // Registrar o pagamento recorrente
    const payment = await prisma.payment.create({
      data: {
        user_id: subscription.user_id,
        subscription_id: subscription.id,
        amount: transaction_amount,
        currency: 'BRL',
        status,
        mercado_pago_id: paymentId.toString(),
        payment_method: 'recurring'
      }
    });
    
    console.log('Recurring payment registered:', payment);
    
    // Se o pagamento foi aprovado, estender a assinatura
    if (status === 'approved') {
      const now = new Date();
      let newEndsAt;
      
      if (subscription.plan_type === 'monthly') {
        newEndsAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      } else if (subscription.plan_type === 'yearly') {
        newEndsAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      }
      
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'active',
          ends_at: newEndsAt
        }
      });
      
      console.log('Subscription renewed until:', newEndsAt);
    }
    
  } catch (error) {
    console.error('Error processing authorized payment webhook:', error);
  }
}

// Função auxiliar para ativar assinatura
async function activateSubscription(subscriptionId, userId, planType, paymentId) {
  const now = new Date();
  let endsAt;
  
  if (planType === 'monthly') {
    endsAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 dias
  } else if (planType === 'yearly') {
    endsAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 365 dias
  }
  
  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: 'active',
      mercado_pago_id: paymentId.toString(),
      ends_at: endsAt
    }
  });
  
  console.log('Subscription activated for user:', userId);
}

// Função auxiliar para marcar assinatura como falhou
async function failSubscription(subscriptionId, paymentId) {
  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: 'failed',
      mercado_pago_id: paymentId.toString()
    }
  });
  
  console.log('Subscription failed for subscription:', subscriptionId);
}

// Verificar se a assinatura está válida (para uso interno na API)
exports.validateSubscription = async (userId) => {
  try {
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return { valid: false, reason: 'user_not_found' };
    }
    
    // Verificar se está no período de teste gratuito (7 dias)
    const creationDate = user.created_at;
    const trialEndsAt = new Date(creationDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    const now = new Date();
    
    // Se ainda estiver no período de teste, é válido
    if (now < trialEndsAt) {
      return { 
        valid: true, 
        type: 'trial',
        daysLeft: Math.ceil((trialEndsAt - now) / (24 * 60 * 60 * 1000))
      };
    }
    
    // Buscar assinatura ativa
    const subscription = await prisma.subscription.findFirst({
      where: { 
        user_id: userId,
        status: 'active'
      },
      orderBy: { created_at: 'desc' }
    });
    
    // Se não há assinatura, não é válido
    if (!subscription) {
      return { valid: false, reason: 'no_active_subscription' };
    }
    
    // Verificar se a assinatura não expirou
    if (subscription.ends_at && subscription.ends_at < now) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'expired' }
      });
      return { valid: false, reason: 'subscription_expired' };
    }
    
    // Tudo certo, assinatura válida
    return { 
      valid: true, 
      type: 'paid',
      subscription 
    };
  } catch (error) {
    console.error('Validate subscription error:', error);
    return { valid: false, reason: 'validation_error', error };
  }
};

// Retorno de sucesso do Mercado Pago
exports.handleSubscriptionSuccess = async (req, res) => {
  try {
    const { payment_id, status, external_reference } = req.query;
    
    console.log('Subscription success callback received:', { payment_id, status, external_reference });
    
    // Verificar se é uma transação aprovada
    if (status !== 'approved' || !payment_id) {
      console.log('Invalid payment status or missing payment_id');
      return res.redirect(`${process.env.FRONTEND_URL}/profile?subscription_status=error&reason=invalid_status`);
    }

    // Extrair user_id da referência externa para segurança adicional
    let userId = null;
    if (external_reference) {
      try {
        const [userIdPart] = external_reference.split(':plan_type:');
        userId = parseInt(userIdPart.split('user_id:')[1]);
      } catch (error) {
        console.error('Error parsing external_reference:', error);
      }
    }

    // Redirecionar para a página de perfil com sucesso
    const redirectUrl = userId 
      ? `${process.env.FRONTEND_URL}/profile?subscription_status=success&payment_id=${payment_id}&user_id=${userId}`
      : `${process.env.FRONTEND_URL}/profile?subscription_status=success&payment_id=${payment_id}`;
    
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Subscription success handler error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/profile?subscription_status=error&reason=server_error`);
  }
};

// Retorno de falha do Mercado Pago
exports.handleSubscriptionFailure = async (req, res) => {
  try {
    const { payment_id, status, external_reference } = req.query;
    
    console.log('Subscription failure callback received:', { payment_id, status, external_reference });
    
    // Redirecionar para a página de perfil com erro
    res.redirect(`${process.env.FRONTEND_URL}/profile?subscription_status=failed&payment_id=${payment_id || 'unknown'}`);
  } catch (error) {
    console.error('Subscription failure handler error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/profile?subscription_status=error&reason=server_error`);
  }
};

// Retorno de pagamento pendente do Mercado Pago
exports.handleSubscriptionPending = async (req, res) => {
  try {
    const { payment_id, status, external_reference } = req.query;
    
    console.log('Subscription pending callback received:', { payment_id, status, external_reference });
    
    // Extrair user_id da referência externa se disponível
    let userId = null;
    if (external_reference) {
      try {
        const [userIdPart] = external_reference.split(':plan_type:');
        userId = parseInt(userIdPart.split('user_id:')[1]);
      } catch (error) {
        console.error('Error parsing external_reference:', error);
      }
    }

    // Redirecionar para a página de perfil com status pendente
    const redirectUrl = userId 
      ? `${process.env.FRONTEND_URL}/profile?subscription_status=pending&payment_id=${payment_id}&user_id=${userId}`
      : `${process.env.FRONTEND_URL}/profile?subscription_status=pending&payment_id=${payment_id || 'unknown'}`;
    
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Subscription pending handler error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/profile?subscription_status=error&reason=server_error`);
  }
};

// Verificar se um pagamento pertence ao usuário atual
exports.verifyPaymentOwnership = async (req, res) => {
  try {
    const { payment_id } = req.params;
    const userId = req.user.id;

    console.log('Verifying payment ownership:', { payment_id, userId });

    const isOwner = await verifyPaymentOwnership(payment_id, userId);

    res.json({
      success: true,
      isOwner,
      payment_id,
      user_id: userId
    });
  } catch (error) {
    console.error('Payment ownership verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar propriedade do pagamento',
      error: error.message
    });
  }
};

// Endpoint para visualizar logs de webhook (apenas para debug/admin)
exports.getWebhookLogs = async (req, res) => {
  try {
    // Buscar últimos 50 pagamentos com informações de webhook
    const payments = await prisma.payment.findMany({
      take: 50,
      orderBy: { created_at: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            instagram_username: true
          }
        },
        subscription: {
          select: {
            id: true,
            plan_type: true,
            status: true
          }
        }
      }
    });

    // Buscar assinaturas recentes para debug
    const subscriptions = await prisma.subscription.findMany({
      take: 20,
      orderBy: { created_at: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            instagram_username: true
          }
        },
        payments: {
          orderBy: { created_at: 'desc' },
          take: 3
        }
      }
    });

    res.json({
      success: true,
      data: {
        recent_payments: payments,
        recent_subscriptions: subscriptions,
        webhook_url: `${process.env.BACKEND_URL}/api/subscription/webhook`,
        last_updated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error getting webhook logs:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar logs de webhook',
      error: error.message
    });
  }
};
