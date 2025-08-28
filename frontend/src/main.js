import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueCookies from 'vue-cookies'
// Tailwind CSS agora é carregado via CDN

// Set up cookies globally
VueCookies.config('7d')
window.$cookies = VueCookies

const app = createApp(App)

app.use(router)
app.use(store)
app.config.globalProperties.$cookies = VueCookies

app.mount('#app')
