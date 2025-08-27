// create-test-subscriptions.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestSubscriptions() {
  try {
    console.log('Iniciando criação de assinaturas de teste...');
    
    // Verificar se a tabela Subscription existe
    try {
      await prisma.$queryRaw`SELECT 1 FROM "Subscription" LIMIT 1`;
      console.log('Tabela de assinaturas verificada com sucesso!');
    } catch (error) {
      console.error('Erro ao verificar tabela de assinaturas:', error.message);
      console.error('É necessário criar as tabelas no banco de dados primeiro.');
      console.log('Execute: npx prisma migrate dev --name add_subscription_tables');
      return;
    }

    // 1. Buscar usuários existentes (ou criar se não existirem)
    const users = await getOrCreateTestUsers();
    console.log(`${users.length} usuários disponíveis para testes`);

    // 2. Criar diferentes tipos de assinaturas para teste
    await Promise.all([
      createTrialSubscription(users[0]),
      createActiveSubscription(users[1]),
      createExpiredSubscription(users[2]),
    ]);

    console.log('Assinaturas de teste criadas com sucesso!');
  } catch (error) {
    console.error('Erro ao criar assinaturas de teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function getOrCreateTestUsers() {
  // Buscar usuários existentes
  const existingUsers = await prisma.user.findMany({
    take: 3,
  });

  if (existingUsers.length >= 3) {
    return existingUsers;
  }

  // Se não temos usuários suficientes, criar novos
  const testUsers = [
    {
      username: 'user_trial',
      instagram_user_id: 'trial123',
      full_name: 'Usuário em Período de Teste',
      access_token: 'fake-token-trial',
    },
    {
      username: 'user_active',
      instagram_user_id: 'active456',
      full_name: 'Usuário com Assinatura Ativa',
      access_token: 'fake-token-active',
    },
    {
      username: 'user_expired',
      instagram_user_id: 'expired789',
      full_name: 'Usuário com Assinatura Expirada',
      access_token: 'fake-token-expired',
    }
  ];

  // Criar os usuários que faltam
  const createdUsers = [];
  for (let i = 0; i < Math.min(3 - existingUsers.length, testUsers.length); i++) {
    const newUser = await prisma.user.create({
      data: testUsers[i],
    });
    createdUsers.push(newUser);
  }

  return [...existingUsers, ...createdUsers];
}

async function createTrialSubscription(user) {
  // Calcular data de fim do período de teste (7 dias a partir de hoje)
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 7);

  // Verificar se já existe uma assinatura para este usuário
  const existingSubscription = await prisma.subscription.findFirst({
    where: {
      user_id: user.id,
      status: 'trial'
    }
  });

  if (existingSubscription) {
    console.log(`Usuário ${user.username} já tem uma assinatura de teste`);
    return existingSubscription;
  }

  // Criar uma assinatura em período de teste
  const subscription = await prisma.subscription.create({
    data: {
      user_id: user.id,
      status: 'trial',
      plan_type: 'monthly',
      starts_at: new Date(),
      trial_ends_at: trialEndsAt
    }
  });

  console.log(`Assinatura de teste criada para ${user.username}`);
  return subscription;
}

async function createActiveSubscription(user) {
  // Calcular data de fim da assinatura (30 dias a partir de hoje)
  const endsAt = new Date();
  endsAt.setDate(endsAt.getDate() + 30);

  // Verificar se já existe uma assinatura para este usuário
  const existingSubscription = await prisma.subscription.findFirst({
    where: {
      user_id: user.id,
      status: 'active'
    }
  });

  if (existingSubscription) {
    console.log(`Usuário ${user.username} já tem uma assinatura ativa`);
    return existingSubscription;
  }

  // Criar uma assinatura ativa
  const subscription = await prisma.subscription.create({
    data: {
      user_id: user.id,
      status: 'active',
      plan_type: 'monthly',
      starts_at: new Date(),
      ends_at: endsAt
    }
  });

  // Criar um pagamento para esta assinatura
  await prisma.payment.create({
    data: {
      user_id: user.id,
      subscription_id: subscription.id,
      amount: 29.90,
      currency: 'BRL',
      status: 'approved',
      mercado_pago_id: `test-payment-${Date.now()}`,
      payment_method: 'credit_card'
    }
  });

  console.log(`Assinatura ativa criada para ${user.username}`);
  return subscription;
}

async function createExpiredSubscription(user) {
  // Data no passado (30 dias atrás)
  const startedAt = new Date();
  startedAt.setDate(startedAt.getDate() - 60);
  
  // Data de expiração (30 dias atrás)
  const endsAt = new Date();
  endsAt.setDate(endsAt.getDate() - 30);

  // Verificar se já existe uma assinatura para este usuário
  const existingSubscription = await prisma.subscription.findFirst({
    where: {
      user_id: user.id,
      status: 'expired'
    }
  });

  if (existingSubscription) {
    console.log(`Usuário ${user.username} já tem uma assinatura expirada`);
    return existingSubscription;
  }

  // Criar uma assinatura expirada
  const subscription = await prisma.subscription.create({
    data: {
      user_id: user.id,
      status: 'expired',
      plan_type: 'monthly',
      starts_at: startedAt,
      ends_at: endsAt
    }
  });

  // Criar um pagamento histórico para esta assinatura
  await prisma.payment.create({
    data: {
      user_id: user.id,
      subscription_id: subscription.id,
      amount: 29.90,
      currency: 'BRL',
      status: 'approved',
      mercado_pago_id: `test-payment-${Date.now()}`,
      payment_method: 'credit_card',
      created_at: startedAt
    }
  });

  console.log(`Assinatura expirada criada para ${user.username}`);
  return subscription;
}

// Executar o script
createTestSubscriptions();
