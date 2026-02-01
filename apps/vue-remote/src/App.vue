<template>
  <div class="vue-remote">
    <div class="remote-header">
      <div class="header-content">
        <div class="header-title">
          <span class="vue-logo">
            <svg viewBox="0 0 128 128" width="32" height="32">
              <path fill="#42b883" d="M78.8,10L64,35.4L49.2,10H0l64,110l64-110C128,10,78.8,10,78.8,10z"/>
              <path fill="#35495e" d="M78.8,10L64,35.4L49.2,10H25.6L64,76l38.4-66H78.8z"/>
            </svg>
          </span>
          <h2>Vue Remote</h2>
        </div>
        <div v-if="user" class="user-badge">
          <img v-if="user.picture" :src="user.picture" :alt="user.name || user.username" class="user-avatar" referrerpolicy="no-referrer" />
          <span v-else class="user-initial">{{ (user.name || user.username).charAt(0).toUpperCase() }}</span>
          <span class="user-name">{{ user.name || user.username }}</span>
        </div>
      </div>
    </div>

    <nav class="remote-nav">
      <router-link to="/" class="nav-link">
        <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
        </svg>
        Home
      </router-link>
      <router-link to="/dashboard" class="nav-link">
        <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
        </svg>
        Dashboard
      </router-link>
      <router-link to="/settings" class="nav-link">
        <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        Settings
      </router-link>
    </nav>

    <div class="remote-content">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface User {
  id: string
  username: string
  name?: string
  picture?: string
  roles: string[]
}

const user = ref<User | null>(null)

const handleAuthChange = () => {
  const userStr = sessionStorage.getItem('mfe_user')
  user.value = userStr ? JSON.parse(userStr) : null
}

onMounted(() => {
  handleAuthChange()
  window.addEventListener('auth-changed', handleAuthChange)
})

onUnmounted(() => {
  window.removeEventListener('auth-changed', handleAuthChange)
})
</script>

<style scoped>
.vue-remote {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.remote-header {
  background: linear-gradient(135deg, #42b883 0%, #35495e 100%);
  padding: 1.25rem 1.5rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.vue-logo {
  display: flex;
  align-items: center;
}

.remote-header h2 {
  margin: 0;
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.user-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.15);
  padding: 0.4rem 0.75rem 0.4rem 0.4rem;
  border-radius: 50px;
  backdrop-filter: blur(10px);
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.user-initial {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
  font-size: 0.85rem;
}

.user-name {
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
}

.remote-nav {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  text-decoration: none;
  padding: 0.625rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.nav-icon {
  width: 18px;
  height: 18px;
}

.nav-link:hover {
  background: #f1f5f9;
  color: #42b883;
}

.nav-link.router-link-exact-active {
  background: linear-gradient(135deg, #42b883 0%, #3ca876 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(66, 184, 131, 0.35);
}

.remote-content {
  padding: 1.5rem;
  background: white;
  min-height: 300px;
}
</style>
