<template>
  <div class="min-h-screen flex flex-col bg-gray-50 text-gray-800">
    <!-- Top navigation -->
    <header class="bg-white shadow-sm border-b border-gray-200" v-if="isAuthenticated">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo and brand name -->
          <div class="flex-shrink-0 flex items-center">
            <router-link to="/" class="flex items-center">
              <div class="w-8 h-8 rounded-md flex items-center justify-center instagram-gradient mr-2">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <span class="text-xl font-bold tracking-tight">GetMyInstaToken</span>
            </router-link>
          </div>

          <!-- Navigation menu -->
          <nav class="hidden md:flex space-x-10">
            <router-link 
              v-if="isAuthenticated"
              to="/" 
              class="text-gray-600 hover:text-instagram-blue transition-colors duration-200 font-medium"
              :class="{ 'text-instagram-blue': $route.path === '/' }"
            >
              Home
            </router-link>
            <router-link 
              to="/profile" 
              v-if="isAuthenticated"
              class="text-gray-600 hover:text-instagram-blue transition-colors duration-200 font-medium"
              :class="{ 'text-instagram-blue': $route.path === '/profile' }"
            >
              My Profile
            </router-link>
          </nav>

          <!-- User menu -->
          <div class="flex items-center space-x-4">
            <!-- Mobile menu button -->
            <button 
              @click="mobileMenuOpen = !mobileMenuOpen" 
              class="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path v-if="mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            
            <!-- User avatar or logout button -->
            <div v-if="isAuthenticated" class="relative flex items-center">
              <button 
                @click="logout" 
                class="hidden md:flex items-center text-gray-600 hover:text-red-600 transition-colors duration-200 font-medium"
              >
                <span class="mr-2">Logout</span>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
              </button>
              
              <!-- User avatar (only displayed on mobile) -->
              <div v-if="currentUser" class="md:hidden">
                <div class="w-8 h-8 rounded-full bg-instagram-blue flex items-center justify-center text-white font-medium">
                  {{ currentUser.username?.charAt(0).toUpperCase() || 'U' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
    
    <!-- Mobile menu -->
    <div v-if="mobileMenuOpen" class="md:hidden bg-white border-b border-gray-200 shadow-sm">
      <div class="px-2 pt-2 pb-3 space-y-1">
        <router-link 
          to="/" 
          class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
          :class="{ 'bg-gray-100 text-instagram-blue': $route.path === '/' }"
        >
          Home
        </router-link>
        <router-link 
          v-if="isAuthenticated"
          to="/profile" 
          class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
          :class="{ 'bg-gray-100 text-instagram-blue': $route.path === '/profile' }"
        >
          My Profile
        </router-link>
        <a 
          v-if="isAuthenticated"
          @click="logout" 
          class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
        >
          Logout
        </a>
      </div>
    </div>
    
    <!-- Main content -->
    <main class="flex-1 py-6 px-4 sm:px-6 lg:px-8">
      <div v-if="isLoading" class="flex justify-center items-center p-5">
        <div class="animate-pulse text-instagram-blue font-medium">Loading...</div>
      </div>
      <div v-if="error" class="bg-red-50 text-red-700 p-4 mb-5 rounded-md shadow-sm">{{ error }}</div>
      <router-view></router-view>
    </main>
    
    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 py-4 px-6">
      <div class="container mx-auto text-center text-gray-500 text-sm">
        &copy; {{ new Date().getFullYear() }} GetMyInstaToken. All rights reserved.
      </div>
    </footer>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'App',
  data() {
    return {
      mobileMenuOpen: false
    }
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'currentUser', 'isLoading', 'error'])
  },
  methods: {
    ...mapActions(['initAuth', 'setAuth', 'logout'])
  },
  created() {
    // Check if we have a token in the URL (from Instagram redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      console.log('Token found in URL:', token);
      
      // Store the token in multiple places to ensure it's available
      // 1. In cookies
      window.$cookies.set('token', token, '7d');
      console.log('Token set in cookies');
      
      // 2. In localStorage as a fallback
      localStorage.setItem('auth_token', token);
      console.log('Token set in localStorage');
      
      // 3. Make a direct API request to test the token before using Vuex
      const headers = {
        'Authorization': `Bearer ${token}`,
        'X-Auth-Token': token,
        'Content-Type': 'application/json'
      };
      
      console.log('Testing token with direct API call...');
      fetch('https://localhost:5000/api/auth/me', {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      })
      .then(response => {
        console.log('Direct API test response:', response);
        if (response.ok) {
          console.log('Direct API test successful');
        } else {
          console.error('Direct API test failed with status:', response.status);
        }
        return response.json();
      })
      .then(data => console.log('Direct API test data:', data))
      .catch(err => console.error('Direct API test error:', err));
      
      // 4. Set in Vuex store and proceed with authentication
      this.setAuth({ token })
        .then(() => {
          console.log('Authentication successful, redirecting to profile');
          
          // Remove token from URL
          const url = new URL(window.location);
          url.searchParams.delete('token');
          window.history.replaceState({}, document.title, url);
          
          // Redirect to profile page if not already there
          if (this.$route.path !== '/profile') {
            this.$router.push('/profile');
          }
        })
        .catch(error => {
          console.error('Authentication error:', error);
        });
    } else {
      console.log('No token in URL, initializing auth from cookies');
      // Try from cookies first
      let cookieToken = window.$cookies.get('token');
      
      // If not in cookies, try localStorage
      if (!cookieToken) {
        cookieToken = localStorage.getItem('auth_token');
        if (cookieToken) {
          window.$cookies.set('token', cookieToken, '7d');
          console.log('Restored token from localStorage to cookies');
        }
      }
      
      console.log('Cookie/localStorage token:', cookieToken);
      
      // Initialize authentication state
      this.initAuth();
    }
  }
};
</script>

<style>
/* Global styles */

/* Instagram Brand Colors */
:root {
  --instagram-blue: #0095f6;
  --instagram-purple: #8a3ab9;
  --instagram-pink: #e95950;
  --instagram-orange: #fcaf45;
  --instagram-yellow: #ffdc80;
}

.text-instagram-blue {
  color: var(--instagram-blue);
}

.bg-instagram-blue {
  background-color: var(--instagram-blue);
}

/* Gradient for Instagram-like elements */
.instagram-gradient {
  background: linear-gradient(45deg, var(--instagram-purple), var(--instagram-pink), var(--instagram-orange), var(--instagram-yellow));
}

/* Card styling */
.card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}
</style>


