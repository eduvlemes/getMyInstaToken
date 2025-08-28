<template>
  <div class="max-w-5xl mx-auto">
    <!-- Header Section -->
    <div class="text-center mb-12">
      <div class="flex flex-col items-center justify-center mb-4">
        <div class="w-16 h-16 rounded-md flex items-center justify-center instagram-gradient mb-3">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg> 
        </div>
        <h1 class="text-4xl font-bold tracking-tight text-black">
          GetMyInstaToken
        </h1>
      </div>
      <p class="text-xl text-black max-w-2xl mx-auto">
        Connect your Instagram account and get a secure token that you can use in your websites.
      </p>
    </div>
    
    <div v-if="error" class="bg-red-50 text-red-700 p-4 mb-6 rounded-md shadow-sm" role="alert">
      {{ error }}
    </div>
    
    <!-- Main Dashboard Grid -->
    <div class="grid md:grid-cols-2 gap-8 mb-10">
      <!-- Left Column - CTA -->
      <div class="card flex flex-col items-center justify-center p-8 text-center">
        <img src="../assets/instagram-logo.svg" alt="Instagram Logo" class="w-20 h-20 mb-6" />
        <h2 class="text-2xl font-semibold mb-3">Connect Your Account</h2>
        <p class="text-gray-600 mb-6">
          Link your Instagram Business or Creator account to get started with our token service.
        </p>
        <button 
          class="bg-instagram-blue text-white rounded-lg hover:bg-blue-600 flex items-center justify-center min-w-[220px] py-3 px-5 shadow-md transition-colors duration-200"
          @click="loginWithInstagram" 
          :disabled="isLoading"
          aria-label="Connect with Instagram"
        >
          <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span v-if="isLoading">Connecting...</span>
          <span v-else>Connect with Instagram</span>
        </button>
      </div>
      
      <!-- Right Column - Features -->
      <div class="card p-8">
        <h2 class="text-2xl font-semibold mb-4">Key Features</h2>
        <ul class="space-y-4">
          <li class="flex items-start">
            <svg class="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Get a long-lived Instagram token that lasts up to 60 days</span>
          </li>
          <li class="flex items-start">
            <svg class="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Automatic token refresh before expiration</span>
          </li>
          <li class="flex items-start">
            <svg class="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Secure API key system for accessing your token</span>
          </li>
          <li class="flex items-start">
            <svg class="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Easy integration with your website via a simple script tag</span>
          </li>
          <li class="flex items-start">
            <svg class="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>View your Instagram profile stats</span>
          </li>
        </ul>
      </div>
    </div>
    
    <!-- How It Works Section -->
    <div class="card p-8 mb-8">
      <h2 class="text-2xl font-semibold mb-4">How It Works</h2>
      <div class="grid md:grid-cols-3 gap-6">
        <div class="text-center p-4">
          <div class="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl font-bold text-instagram-blue">1</span>
          </div>
          <h3 class="font-medium mb-2">Connect Account</h3>
          <p class="text-gray-600 text-sm">Link your Instagram Business or Creator account</p>
        </div>
        <div class="text-center p-4">
          <div class="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl font-bold text-instagram-blue">2</span>
          </div>
          <h3 class="font-medium mb-2">Get Your Token</h3>
          <p class="text-gray-600 text-sm">Copy your API key and integration script</p>
        </div>
        <div class="text-center p-4">
          <div class="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl font-bold text-instagram-blue">3</span>
          </div>
          <h3 class="font-medium mb-2">Integrate & Enjoy</h3>
          <p class="text-gray-600 text-sm">Add the script to your website and display your content</p>
        </div>
      </div>
    </div>
    
    <!-- FAQ Section -->
    <div class="card p-8">
      <h2 class="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
      <div class="space-y-4">
        <div>
          <h3 class="font-medium mb-1">What kind of Instagram account do I need?</h3>
          <p class="text-gray-600">You need an Instagram Business or Creator account connected to a Facebook page.</p>
        </div>
        <div>
          <h3 class="font-medium mb-1">How long will my token last?</h3>
          <p class="text-gray-600">Your token is valid for 60 days and will be automatically refreshed before expiration.</p>
        </div>
        <div>
          <h3 class="font-medium mb-1">How do I integrate the token with my website?</h3>
          <p class="text-gray-600">After connecting, you'll receive a simple script tag that you can add to your website.</p>
        </div>
        <div>
          <h3 class="font-medium mb-1">Is my Instagram data secure?</h3>
          <p class="text-gray-600">Yes, we use secure API keys instead of user IDs to protect your data and token access.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'HomeView',
  computed: {
    ...mapGetters(['isAuthenticated', 'isLoading', 'error'])
  },
  methods: {
    ...mapActions(['loginWithInstagram']),
  },
  mounted() {
    // Check if user is already authenticated and redirect to profile
    if (this.isAuthenticated) {
      this.$router.push('/profile')
    }
  }
}
</script>

<style scoped>
/* Component-specific styles can be added here */
</style>
