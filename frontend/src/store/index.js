import { createStore } from 'vuex'
import api from '../services/api'

export default createStore({
  state: {
    user: null,
    token: null,
    loading: false,
    error: null
  },
  getters: {
    isAuthenticated: state => !!state.token,
    currentUser: state => state.user,
    isLoading: state => state.loading,
    error: state => state.error
  },
  mutations: {
    setUser(state, user) {
      state.user = user
    },
    setToken(state, token) {
      state.token = token
      // Store the token in cookies and localStorage
      if (token) {
        window.$cookies.set('token', token, '7d')
        localStorage.setItem('auth_token', token)
        console.log('Token saved in both cookies and localStorage')
      } else {
        window.$cookies.remove('token')
        localStorage.removeItem('auth_token')
        console.log('Token removed from both cookies and localStorage')
      }
    },
    setLoading(state, loading) {
      state.loading = loading
    },
    setError(state, error) {
      state.error = error
    },
    clearError(state) {
      state.error = null
    },
    logout(state) {
      state.user = null
      state.token = null
      window.$cookies.remove('token')
      localStorage.removeItem('auth_token')
      console.log('Logged out: tokens removed from state, cookies, and localStorage')
    }
  },
  actions: {
    // Initialize auth from cookies or localStorage
    initAuth({ commit }) {
      // Try to get token from multiple sources
      let token = window.$cookies.get('token')
      
      // If not in cookies, try localStorage
      if (!token) {
        token = localStorage.getItem('auth_token')
        console.log('Token from localStorage:', token)
        // If found in localStorage but not in cookies, restore it to cookies
        if (token) {
          window.$cookies.set('token', token, '7d')
          console.log('Restored token from localStorage to cookies')
        }
      }
      
      if (token) {
        console.log('Initializing auth with token:', token)
        commit('setToken', token)
        commit('setLoading', true)
        
        return api.getCurrentUser()
          .then(response => {
            console.log('getCurrentUser response in initAuth:', response.data)
            if (response.data && response.data.user) {
              commit('setUser', response.data.user)
              commit('setLoading', false)
              
              // Ensure token is saved in both places
              window.$cookies.set('token', token, '7d')
              localStorage.setItem('auth_token', token)
              
              return response.data.user
            } else {
              throw new Error('Invalid user data')
            }
          })
          .catch((error) => {
            console.error('Error in initAuth:', error)
            // Token is invalid
            commit('setToken', null)
            commit('setLoading', false)
            window.$cookies.remove('token')
            localStorage.removeItem('auth_token')
            return null
          })
      }
      return Promise.resolve(null)
    },
    
    // Login with Instagram
    loginWithInstagram({ commit }) {
      commit('setLoading', true)
      commit('clearError')
      
      return api.loginWithInstagram()
        .then(response => {
          // O redirecionamento já foi tratado na função api.loginWithInstagram()
          // Não precisamos fazer nada aqui pois a página será redirecionada
          if (response && response.redirecting) {
            console.log('Redirecionando para a autenticação do Instagram...')
          }
          return response
        })
        .catch(error => {
          commit('setError', error.response?.data?.message || 'Failed to login with Instagram')
          commit('setLoading', false)
          return Promise.reject(error)
        })
    },
    
    // Set user and token after successful login/redirect
    setAuth({ commit }, { token }) {
      console.log('setAuth action called with token:', token)
      
      // First set the token in both store and cookies
      commit('setToken', token)
      window.$cookies.set('token', token, '7d')
      console.log('Token set in both store and cookies')
      
      commit('setLoading', true)
      
      // Add a slight delay to ensure token is properly set before making the API call
      return new Promise(resolve => setTimeout(resolve, 100))
        .then(() => api.getCurrentUser())
        .then(response => {
          console.log('getCurrentUser response:', response.data)
          if (response.data && response.data.user) {
            commit('setUser', response.data.user)
            commit('setLoading', false)
            return response.data.user
          } else {
            throw new Error('Invalid user data returned from server')
          }
        })
        .catch(error => {
          console.error('getCurrentUser error:', error)
          if (error.response) {
            console.error('Error response:', error.response.data)
            console.error('Error status:', error.response.status)
          }
          commit('setError', error.response?.data?.message || 'Failed to get user data')
          commit('setLoading', false)
          commit('setToken', null)
          window.$cookies.remove('token')
          return Promise.reject(error)
        })
    },
    
    // Refresh Instagram token
    refreshToken({ commit, state }) {
      if (!state.user) return Promise.reject(new Error('User not authenticated'))
      
      commit('setLoading', true)
      commit('clearError')
      
      return api.refreshToken(state.user.id)
        .then(response => {
          commit('setLoading', false)
          return response.data
        })
        .catch(error => {
          commit('setError', error.response?.data?.message || 'Failed to refresh token')
          commit('setLoading', false)
          return Promise.reject(error)
        })
    },
    
    // Logout
    logout({ commit }) {
      return api.logout()
        .then(() => {
          commit('logout')
        })
        .catch(error => {
          console.error('Logout error:', error)
          // Still logout on frontend even if backend logout fails
          commit('logout')
        })
    },
    
    // Fetch current user data (for refreshing user info)
    fetchCurrentUser({ commit }) {
      commit('setLoading', true)
      
      return api.getCurrentUser()
        .then(response => {
          console.log('fetchCurrentUser response:', response.data)
          if (response.data && response.data.user) {
            commit('setUser', response.data.user)
            commit('setLoading', false)
            return response.data.user
          } else {
            throw new Error('Invalid user data returned from server')
          }
        })
        .catch(error => {
          console.error('fetchCurrentUser error:', error)
          commit('setError', error.response?.data?.message || 'Failed to get user data')
          commit('setLoading', false)
          return Promise.reject(error)
        })
    },
    
    // Get subscription status
    getSubscriptionStatus() {
      console.log('Store: Starting getSubscriptionStatus')
      // Não vamos definir loading global para esta operação específica
      
      return api.getSubscriptionStatus()
        .then(response => {
          console.log('Store: Subscription status API response:', response)
          if (response && response.data) {
            console.log('Store: Returning subscription data:', response.data)
            return response.data
          } else {
            console.log('Store: No data in response, returning empty object')
            return {}
          }
        })
        .catch(error => {
          console.error('Store: Error getting subscription status:', error)
          return Promise.reject(error)
        })
    }
  }
})
