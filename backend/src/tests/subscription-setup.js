const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Iniciando testes de assinatura...");
    
    // 1. Criar um usuário de teste se não existir
    const testUser = await prisma.user.upsert({
      where: { instagram_user_id: '12345' },
      update: {},
      create: {
        username: 'testeuser',
        full_name: 'Usuário de Teste',
        instagram_user_id: '12345',
        access_token: 'mock-access-token',
        token_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
      }
    });
    
    console.log("Usuário de teste criado/encontrado:", testUser.id);
    
    // 2. Criar uma assinatura em período de teste
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7); // 7 dias de teste
    
    const trialSubscription = await prisma.subscription.create({
      data: {
        user_id: testUser.id,
        plan_type: 'monthly',
        status: 'trial',
        trial_ends_at: trialEndDate,
        starts_at: new Date()
      }
    });
    
    console.log("Assinatura em período de teste criada:", trialSubscription);
    
    // 3. Criar um usuário com assinatura ativa
    const activeUser = await prisma.user.upsert({
      where: { instagram_user_id: '67890' },
      update: {},
      create: {
        username: 'usuarioativo',
        full_name: 'Usuário Ativo',
        instagram_user_id: '67890',
        access_token: 'mock-active-token',
        token_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 ano
      }
    });
    
    console.log("Usuário ativo criado/encontrado:", activeUser.id);
    
    // Criar assinatura ativa
    const nextMonthDate = new Date();
    nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
    
    const activeSubscription = await prisma.subscription.create({
      data: {
        user_id: activeUser.id,
        plan_type: 'monthly',
        status: 'active',
        starts_at: new Date(),
        ends_at: nextMonthDate,
        mercado_pago_id: 'mp-subscription-123'
      }
    });
    
    console.log("Assinatura ativa criada:", activeSubscription);
    
    // Criar pagamento
    const payment = await prisma.payment.create({
      data: {
        subscription_id: activeSubscription.id,
        user_id: activeUser.id,
        amount: 29.90,
        currency: 'BRL',
        status: 'approved',
        payment_method: 'credit_card',
        mercado_pago_id: 'mp-payment-123'
      }
    });
    
    console.log("Pagamento criado:", payment);
    
    // 4. Criar um usuário com assinatura expirada
    const expiredUser = await prisma.user.upsert({
      where: { instagram_user_id: '24680' },
      update: {},
      create: {
        username: 'usuarioexpirado',
        full_name: 'Usuário Expirado',
        instagram_user_id: '24680',
        access_token: 'mock-expired-token',
        token_expires_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 dias atrás
      }
    });
    
    console.log("Usuário com assinatura expirada criado:", expiredUser.id);
    
    // Criar assinatura expirada
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1); // 1 mês atrás
    
    const expiredSubscription = await prisma.subscription.create({
      data: {
        user_id: expiredUser.id,
        plan_type: 'monthly',
        status: 'expired',
        starts_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 dias atrás
        ends_at: lastMonthDate
      }
    });
    
    console.log("Assinatura expirada criada:", expiredSubscription);
    
    console.log("Testes finalizados com sucesso!");
  } catch (error) {
    console.error("Erro nos testes:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

main();
