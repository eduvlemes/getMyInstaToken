import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Profile from '../views/Profile.vue'
import NotFound from '../views/NotFound.vue'
import store from '../store'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    // Check for token in URL when home page is loaded
    beforeEnter: (to, from, next) => {
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get('token')
      
      if (token) {
        console.log('Token found in URL (router):', token)
        
        // Set authentication state
        store.dispatch('setAuth', { token })
          .then(() => {
            // Remove token from URL
            window.history.replaceState({}, document.title, '/')
            
            // Redirect to profile page
            next('/profile')
          })
          .catch(error => {
            console.error('Error setting auth:', error)
            next()
          })
      } else {
        next()
      }
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/payment-success',
    name: 'PaymentSuccess',
    component: () => import('../views/PaymentSuccess.vue')
  },
  {
    path: '/payment-failure',
    name: 'PaymentFailure',
    component: () => import('../views/PaymentFailure.vue')
  },
  {
    path: '/payment-pending',
    name: 'PaymentPending',
    component: () => import('../views/PaymentPending.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  // Check if the route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // Check if the user is authenticated
    if (store.getters.isAuthenticated) {
      // Already authenticated, proceed to the route
      next()
    } else {
      // Try to initialize auth from token
      const token = window.$cookies.get('token') || localStorage.getItem('auth_token')
      
      if (token) {
        console.log('Route guard: Found token, initializing auth')
        // Try to initialize auth with the token
        store.dispatch('initAuth')
          .then(user => {
            if (user) {
              console.log('Route guard: Auth initialized, proceeding to route')
              next()
            } else {
              console.log('Route guard: Auth initialization failed, redirecting to home')
              next({ name: 'Home' })
            }
          })
          .catch(error => {
            console.error('Route guard: Error initializing auth:', error)
            next({ name: 'Home' })
          })
      } else {
        // No token found, redirect to home
        console.log('Route guard: No token found, redirecting to home')
        next({ name: 'Home' })
      }
    }
  } else {
    // If the route doesn't require authentication, proceed
    next()
  }
})

export default router
