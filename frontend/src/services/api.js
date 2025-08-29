import axios from 'axios'

const API_URL = process.env.VUE_APP_API_URL || 'https://localhost:5000/api'

// Create axios instance with default config
const instance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Add token to requests if available
instance.interceptors.request.use(config => {
  const token = window.$cookies.get('token') || localStorage.getItem('auth_token')
  
  if (token) {
    // Make sure we're setting Authorization header correctly
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`,
      'X-Auth-Token': token // Adding an alternative header as well
    }
    
    // Also ensure the token is available as a URL parameter
    if (config.params) {
      config.params.token = token
    } else {
      config.params = { token }
    }
  }
  return config
})

// Add response and error interceptors
instance.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error)
    
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error('Network error - is the backend server running?')
    }
    
    if (!error.response) {
      console.error('Empty response received')
    }
    
    return Promise.reject(error)
  }
)

const api = {
  // Auth
  loginWithInstagram: () => {
    console.log('Initiating Instagram login request to:', `${API_URL}/auth/instagram`)
    return instance.get('/auth/instagram')
      .then(response => {
        console.log('Instagram login response:', response.data)
        if (response.data && response.data.redirectUrl) {
          // Redirect to Instagram auth URL
          window.location.href = response.data.redirectUrl
          return { redirecting: true }
        }
        return response
      })
      .catch(error => {
        console.error('Instagram login failed:', error)
        throw error
      })
  },
  getCurrentUser: () => {
    const token = window.$cookies.get('token') || localStorage.getItem('auth_token')
    return instance.get('/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Auth-Token': token
      }
    })
  },
  logout: () => instance.get('/auth/logout'),
  
  // User
  getUserById: (userId) => instance.get(`/users/${userId}`),
  updateUser: (userId, userData) => instance.put(`/users/${userId}`, userData),
  regenerateApiKey: () => {
    const token = window.$cookies.get('token') || localStorage.getItem('auth_token')
    return instance.post('/users/regenerate-api-key', {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Auth-Token': token
      }
    })
  },
  
  // Subscription
  getSubscriptionStatus: () => {
    console.log('API: Calling subscription status endpoint');
    return instance.get('/subscription/status');
  },
  createSubscription: (plan) => {
    console.log('API: Creating subscription for plan:', plan);
    return instance.post('/subscription/create', { plan_type: plan });
  },
  createRecurringSubscription: (plan, payer_email) => {
    console.log('API: Creating recurring subscription for plan:', plan, 'email:', payer_email);
    return instance.post('/subscription/create-recurring', { 
      plan_type: plan,
      payer_email: payer_email
    });
  },
  confirmRecurringSubscription: (preapproval_id) => {
    console.log('API: Confirming recurring subscription:', preapproval_id);
    return instance.post('/subscription/confirm-recurring', { 
      preapproval_id: preapproval_id
    });
  },
  
  // Token
  getTokenInfo: () => instance.get('/token/info'),
  getTokenScript: (apiKey) => `${API_URL}/token/${apiKey}/script.js`,
  refreshToken: (userId) => {
    const token = window.$cookies.get('token') || localStorage.getItem('auth_token')
    return instance.post(`/users/${userId}/refresh-token`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Auth-Token': token
      }
    })
  }
}

export default api
