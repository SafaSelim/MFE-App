<template>
  <div class="page">
    <h3>Settings</h3>
    <div class="settings-form">
      <div class="form-group">
        <label>Username</label>
        <input v-model="settings.username" type="text" />
      </div>
      <div class="form-group">
        <label>Email</label>
        <input v-model="settings.email" type="email" />
      </div>
      <div class="form-group">
        <label>Notifications</label>
        <input v-model="settings.notifications" type="checkbox" />
        <span>Enable notifications</span>
      </div>
      <button @click="saveSettings" class="save-btn">
        Save Settings
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const settings = reactive({
  username: 'VueUser',
  email: 'vue@example.com',
  notifications: true,
})

const saveSettings = () => {
  alert('Settings saved!')
}
</script>

<style scoped>
.page {
  padding: 1rem;
}

h3 {
  color: #42b883;
  margin-bottom: 1.5rem;
}

.settings-form {
  max-width: 500px;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  color: #2c3e50;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.form-group input[type="text"],
.form-group input[type="email"] {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.form-group input[type="checkbox"] {
  margin-right: 0.5rem;
}

.save-btn {
  width: 100%;
  padding: 0.75rem;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
}

.save-btn:hover {
  background: #35a372;
}
</style>