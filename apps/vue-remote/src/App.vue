<template>
  <div class="vue-remote">
    <div class="remote-header">
      <h2>🌟 Vue Remote Application</h2>
      <p v-if="user">Logged in as: <strong>{{ user.username }}</strong></p>
    </div>

    <nav class="remote-nav">
      <router-link to="/">Home</router-link>
      <router-link to="/dashboard">Dashboard</router-link>
      <router-link to="/settings">Settings</router-link>
    </nav>

    <div class="remote-content">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface User {
  id: string
  username: string
  roles: string[]
}

const user = ref<User | null>(null)

onMounted(() => {
  const userStr = localStorage.getItem('mfe_user')
  if (userStr) {
    user.value = JSON.parse(userStr)
  }

  window.addEventListener('auth-changed', handleAuthChange)
})

const handleAuthChange = () => {
  const userStr = localStorage.getItem('mfe_user')
  user.value = userStr ? JSON.parse(userStr) : null
}
</script>

<style scoped>
.vue-remote {
  border: 3px solid #42b883;
  border-radius: 8px;
  padding: 1.5rem;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.remote-header {
  background: linear-gradient(135deg, #42b883 0%, #35a372 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.remote-header h2 {
  margin: 0 0 0.5rem 0;
}

.remote-header p {
  margin: 0;
  font-size: 0.9rem;
}

.remote-nav {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.remote-nav a {
  color: #42b883;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.3s;
  font-weight: 500;
}

.remote-nav a:hover {
  background: #42b883;
  color: white;
}

.remote-nav a.router-link-active {
  background: #42b883;
  color: white;
}

.remote-content {
  padding: 1rem;
  min-height: 200px;
}
</style>