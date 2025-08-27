// insert-subscriptions.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestSubscriptions() {
  try {
    console.log('Iniciando criação de assinaturas de teste...');

    // Verificar se existem usuários no sistema
    const users = await prisma.user.findMany({
      take: 3
    });

    if (users.length === 0) {
      console.log('Não existem usuários para criar assinaturas. Por favor, crie usuários primeiro.');
      return;
    }

    console.log(`Encontrados ${users.length} usuários para teste.`);

    // Criar assinatura em período de teste
    if (users[0]) {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 7); // 7 dias de teste

      await prisma.$executeRaw`
        INSERT INTO "Subscription" (user_id, status, plan_type, trial_ends_at, starts_at, created_at, updated_at)
        VALUES (${users[0].id}, 'trial', 'monthly', ${trialEndDate}, ${new Date()}, ${new Date()}, ${new Date()})
        ON CONFLICT (id) DO NOTHING;
      `;
      console.log(`Assinatura de teste criada para o usuário ${users[0].username}`);
    }

    // Criar assinatura ativa
    if (users[1]) {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // Expira em 1 mês

      const subscription = await prisma.$executeRaw`
        INSERT INTO "Subscription" (user_id, status, plan_type, starts_at, ends_at, created_at, updated_at)
        VALUES (${users[1].id}, 'active', 'monthly', ${new Date()}, ${endDate}, ${new Date()}, ${new Date()})
        RETURNING id;
      `;
      
      console.log(`Assinatura ativa criada para o usuário ${users[1].username}`);
      
      // Criar pagamento para a assinatura ativa
      await prisma.$executeRaw`
        INSERT INTO "Payment" (user_id, subscription_id, amount, currency, status, mercado_pago_id, payment_method, created_at, updated_at)
        VALUES (${users[1].id}, (SELECT id FROM "Subscription" WHERE user_id = ${users[1].id} ORDER BY created_at DESC LIMIT 1), 
                29.90, 'BRL', 'approved', 'test-payment-${Date.now()}', 'credit_card', ${new Date()}, ${new Date()})
        ON CONFLICT DO NOTHING;
      `;
      console.log(`Pagamento criado para o usuário ${users[1].username}`);
    }

    // Criar assinatura expirada
    if (users[2]) {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 2); // Iniciou há 2 meses
      
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() - 1); // Expirou há 1 mês

      await prisma.$executeRaw`
        INSERT INTO "Subscription" (user_id, status, plan_type, starts_at, ends_at, created_at, updated_at)
        VALUES (${users[2].id}, 'expired', 'monthly', ${startDate}, ${endDate}, ${startDate}, ${new Date()})
        ON CONFLICT DO NOTHING;
      `;
      
      console.log(`Assinatura expirada criada para o usuário ${users[2].username}`);
    }

    console.log('Assinaturas de teste criadas com sucesso!');

  } catch (error) {
    console.error('Erro ao criar assinaturas de teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestSubscriptions();
