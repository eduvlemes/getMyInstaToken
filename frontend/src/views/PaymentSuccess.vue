<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center">
      <!-- Success Icon -->
      <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      
      <!-- Success Message -->
      <h1 class="text-2xl font-bold text-gray-900 mb-4">
        🎉 Pagamento Aprovado!
      </h1>
      
      <p class="text-gray-600 mb-6">
        Sua assinatura do <strong>GetMyToken</strong> foi ativada com sucesso! 
        Agora você tem acesso completo aos tokens do Instagram sem limitações.
      </p>
      
      <!-- Payment Details -->
      <div v-if="paymentDetails" class="bg-gray-50 rounded-lg p-4 mb-6 text-left">
        <h3 class="font-semibold text-gray-900 mb-2">Detalhes da Assinatura:</h3>
        <p v-if="paymentDetails.preapproval_id" class="text-sm text-gray-600">ID Assinatura: {{ paymentDetails.preapproval_id }}</p>
        <p v-if="paymentDetails.payment_id" class="text-sm text-gray-600">ID Pagamento: {{ paymentDetails.payment_id }}</p>
        <p v-if="paymentDetails.plan_type" class="text-sm text-gray-600">Plano: {{ getPlanName(paymentDetails.plan_type) }}</p>
        <p class="text-sm text-gray-600">Status: {{ paymentDetails.preapproval_id ? 'Assinatura Ativa' : 'Aprovado' }}</p>
      </div>
      
      <!-- Actions -->
      <div class="space-y-3">
        <button 
          @click="goToProfile" 
          class="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
        >
          Ir para Meu Perfil
        </button>
        
        <button 
          @click="goToHome" 
          class="w-full border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 px-6 rounded-lg transition-all"
        >
          Voltar ao Início
        </button>
      </div>
      
      <!-- Additional Info -->
      <div class="mt-6 text-xs text-gray-500">
        <p>Você receberá um e-mail de confirmação em breve.</p>
        <p>Dúvidas? Entre em contato conosco.</p>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'PaymentSuccess',
  data() {
    return {
      paymentDetails: null,
      isProcessing: false
    };
  },
  mounted() {
    // Capturar parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    this.paymentDetails = {
      preapproval_id: urlParams.get('preapproval_id'),
      payment_id: urlParams.get('payment_id'),
      plan_type: urlParams.get('plan_type'),
      status: urlParams.get('status')
    };

    console.log('Payment success page - URL params:', this.paymentDetails);

    // Se temos preapproval_id, é uma assinatura recorrente
    if (this.paymentDetails.preapproval_id) {
      this.processRecurringSubscription();
    }
  },
  methods: {
    async processRecurringSubscription() {
      try {
        this.isProcessing = true;
        console.log('Processing recurring subscription:', this.paymentDetails.preapproval_id);
        
        // Chamar API para confirmar/ativar a assinatura
        const response = await api.confirmRecurringSubscription(this.paymentDetails.preapproval_id);
        
        console.log('Subscription confirmation response:', response.data);
        
        if (response.data.success) {
          console.log('Recurring subscription confirmed successfully');
        }
      } catch (error) {
        console.error('Error processing recurring subscription:', error);
      } finally {
        this.isProcessing = false;
      }
    },
    getPlanName(planType) {
      switch(planType) {
        case 'monthly': return 'Mensal (R$ 4,97/mês)';
        case 'yearly': return 'Anual (R$ 49,70/ano)';
        default: return 'Plano não identificado';
      }
    },
    
    goToProfile() {
      this.$router.push('/profile');
    },
    
    goToHome() {
      this.$router.push('/');
    }
  }
};
</script>
