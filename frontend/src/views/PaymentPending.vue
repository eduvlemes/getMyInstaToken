<template>
  <div class="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center">
      <!-- Pending Icon -->
      <div class="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg class="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      
      <!-- Pending Message -->
      <h1 class="text-2xl font-bold text-gray-900 mb-4">
        ⏳ Pagamento em Análise
      </h1>
      
      <p class="text-gray-600 mb-6">
        Seu pagamento do <strong>GetMyToken</strong> está sendo processado. 
        Você receberá uma confirmação em breve.
      </p>
      
      <!-- Payment Methods Info -->
      <div class="bg-blue-50 rounded-lg p-4 mb-6 text-left">
        <h3 class="font-semibold text-gray-900 mb-2">Tempo de processamento:</h3>
        <ul class="text-sm text-gray-600 space-y-1">
          <li>• <strong>PIX:</strong> Até 2 horas</li>
          <li>• <strong>Boleto:</strong> 1-2 dias úteis</li>
          <li>• <strong>Cartão:</strong> Até 24 horas</li>
          <li>• <strong>Débito:</strong> Até 1 hora</li>
        </ul>
      </div>
      
      <!-- Payment Details -->
      <div v-if="paymentDetails" class="bg-gray-50 rounded-lg p-4 mb-6 text-left">
        <h3 class="font-semibold text-gray-900 mb-2">Detalhes do Pagamento:</h3>
        <p class="text-sm text-gray-600">ID: {{ paymentDetails.payment_id || 'Aguardando...' }}</p>
        <p class="text-sm text-gray-600">Plano: {{ getPlanName(paymentDetails.plan_type) }}</p>
        <p class="text-sm text-gray-600">Status: Em análise</p>
      </div>
      
      <!-- Actions -->
      <div class="space-y-3">
        <button 
          @click="checkStatus" 
          class="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
          :disabled="isChecking"
        >
          <span v-if="isChecking">Verificando...</span>
          <span v-else>Verificar Status</span>
        </button>
        
        <button 
          @click="goToProfile" 
          class="w-full border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 px-6 rounded-lg transition-all"
        >
          Voltar ao Perfil
        </button>
      </div>
      
      <!-- Additional Info -->
      <div class="mt-6 text-xs text-gray-500">
        <p>📧 Você será notificado por email quando o pagamento for aprovado.</p>
        <p>💬 Dúvidas? Entre em contato conosco.</p>
      </div>
      
      <!-- Auto Refresh Counter -->
      <div v-if="autoRefreshCounter > 0" class="mt-4 text-sm text-gray-500">
        Verificação automática em {{ autoRefreshCounter }}s
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaymentPending',
  data() {
    return {
      paymentDetails: null,
      isChecking: false,
      autoRefreshCounter: 30,
      refreshInterval: null
    };
  },
  mounted() {
    // Capturar parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    this.paymentDetails = {
      payment_id: urlParams.get('payment_id'),
      plan_type: urlParams.get('plan_type'),
      status: urlParams.get('status')
    };
    
    // Iniciar auto-refresh
    this.startAutoRefresh();
  },
  beforeUnmount() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  },
  methods: {
    getPlanName(planType) {
      switch(planType) {
        case 'monthly': return 'Mensal (R$ 4,97/mês)';
        case 'yearly': return 'Anual (R$ 49,70/ano)';
        default: return 'Plano não identificado';
      }
    },
    
    async checkStatus() {
      this.isChecking = true;
      try {
        // Aqui você pode fazer uma chamada para verificar o status
        // Por agora, vamos simular uma verificação
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Redirecionar para o perfil para verificar atualizações
        this.$router.push('/profile');
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      } finally {
        this.isChecking = false;
      }
    },
    
    goToProfile() {
      this.$router.push('/profile');
    },
    
    startAutoRefresh() {
      this.refreshInterval = setInterval(() => {
        this.autoRefreshCounter--;
        
        if (this.autoRefreshCounter <= 0) {
          this.checkStatus();
          this.autoRefreshCounter = 30; // Reset counter
        }
      }, 1000);
    }
  }
};
</script>
