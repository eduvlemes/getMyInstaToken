<template>
  <div class="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center">
      <!-- Error Icon -->
      <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg class="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </div>
      
      <!-- Error Message -->
      <h1 class="text-2xl font-bold text-gray-900 mb-4">
        ❌ Pagamento Não Aprovado
      </h1>
      
      <p class="text-gray-600 mb-6">
        Infelizmente não foi possível processar seu pagamento do <strong>GetMyToken</strong>. 
        Isso pode acontecer por diversos motivos.
      </p>
      
      <!-- Common Reasons -->
      <div class="bg-yellow-50 rounded-lg p-4 mb-6 text-left">
        <h3 class="font-semibold text-gray-900 mb-2">Possíveis motivos:</h3>
        <ul class="text-sm text-gray-600 space-y-1">
          <li>• Saldo insuficiente no cartão</li>
          <li>• Dados do cartão incorretos</li>
          <li>• Transação bloqueada pelo banco</li>
          <li>• Limite de cartão excedido</li>
        </ul>
      </div>
      
      <!-- Payment Details -->
      <div v-if="paymentDetails" class="bg-gray-50 rounded-lg p-4 mb-6 text-left">
        <h3 class="font-semibold text-gray-900 mb-2">Detalhes da Tentativa:</h3>
        <p class="text-sm text-gray-600">ID: {{ paymentDetails.payment_id || 'N/A' }}</p>
        <p class="text-sm text-gray-600">Plano: {{ getPlanName(paymentDetails.plan_type) }}</p>
        <p class="text-sm text-gray-600">Status: Rejeitado</p>
      </div>
      
      <!-- Actions -->
      <div class="space-y-3">
        <button 
          @click="tryAgain" 
          class="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
        >
          Tentar Novamente
        </button>
        
        <button 
          @click="goToProfile" 
          class="w-full border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 px-6 rounded-lg transition-all"
        >
          Voltar ao Perfil
        </button>
        
        <button 
          @click="contactSupport" 
          class="w-full border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 px-6 rounded-lg transition-all"
        >
          Falar com Suporte
        </button>
      </div>
      
      <!-- Additional Info -->
      <div class="mt-6 text-xs text-gray-500">
        <p>Nenhum valor foi cobrado.</p>
        <p>Você pode tentar novamente a qualquer momento.</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaymentFailure',
  data() {
    return {
      paymentDetails: null
    };
  },
  mounted() {
    // Capturar parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    this.paymentDetails = {
      payment_id: urlParams.get('payment_id'),
      plan_type: urlParams.get('plan_type'),
      status: urlParams.get('status'),
      reason: urlParams.get('reason')
    };
  },
  methods: {
    getPlanName(planType) {
      switch(planType) {
        case 'monthly': return 'Mensal (R$ 4,97/mês)';
        case 'yearly': return 'Anual (R$ 49,70/ano)';
        default: return 'Plano não identificado';
      }
    },
    
    tryAgain() {
      // Redirecionar para o perfil para tentar novamente
      this.$router.push('/profile');
    },
    
    goToProfile() {
      this.$router.push('/profile');
    },
    
    contactSupport() {
      // Aqui você pode adicionar integração com WhatsApp, email, etc.
      window.open('mailto:suporte@getmytoken.com?subject=Problema com Pagamento');
    }
  }
};
</script>
