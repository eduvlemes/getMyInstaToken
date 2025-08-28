<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
    <h1 class="text-7xl font-bold text-instagram-blue mb-4">404</h1>
    <p class="text-2xl text-gray-600 mb-8">Page not found</p>
    <router-link 
      to="/" 
      class="text-instagram-blue font-medium hover:underline transition-all duration-200"
    >
      Go back to home
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'NotFound',
}
</script>

<style scoped>
/* Utilizando apenas Tailwind CSS */
</style>
