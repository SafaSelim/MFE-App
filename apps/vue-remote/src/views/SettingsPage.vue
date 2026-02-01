<template>
  <div class="settings-page">
    <div class="settings-header">
      <h1>Settings</h1>
      <p>Manage your preferences and account settings</p>
    </div>

    <div class="settings-sections">
      <div class="settings-section">
        <h2>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
          Profile Information
        </h2>

        <div class="form-grid">
          <div class="form-group">
            <label for="username">Username</label>
            <input
              id="username"
              v-model="settings.username"
              type="text"
              placeholder="Enter username"
            />
          </div>
          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              id="email"
              v-model="settings.email"
              type="email"
              placeholder="Enter email"
            />
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h2>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
          Notifications
        </h2>

        <div class="toggle-group">
          <div class="toggle-item">
            <div class="toggle-info">
              <span class="toggle-label">Email Notifications</span>
              <span class="toggle-desc">Receive updates via email</span>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="settings.emailNotifications" />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="toggle-item">
            <div class="toggle-info">
              <span class="toggle-label">Push Notifications</span>
              <span class="toggle-desc">Browser push notifications</span>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="settings.pushNotifications" />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="toggle-item">
            <div class="toggle-info">
              <span class="toggle-label">Marketing Emails</span>
              <span class="toggle-desc">News and promotional content</span>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="settings.marketingEmails" />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h2>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
          </svg>
          Appearance
        </h2>

        <div class="theme-selector">
          <button
            v-for="theme in themes"
            :key="theme.id"
            :class="['theme-option', { active: settings.theme === theme.id }]"
            @click="settings.theme = theme.id"
          >
            <span class="theme-icon">{{ theme.icon }}</span>
            <span class="theme-name">{{ theme.name }}</span>
          </button>
        </div>
      </div>
    </div>

    <div class="settings-footer">
      <button class="btn-secondary" @click="resetSettings">Reset to Default</button>
      <button class="btn-primary" @click="saveSettings">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        Save Changes
      </button>
    </div>

    <Transition name="toast">
      <div v-if="showToast" class="toast">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        Settings saved successfully!
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

const settings = reactive({
  username: 'VueUser',
  email: 'vue@example.com',
  emailNotifications: true,
  pushNotifications: true,
  marketingEmails: false,
  theme: 'system',
})

const themes = [
  { id: 'light', name: 'Light', icon: '☀️' },
  { id: 'dark', name: 'Dark', icon: '🌙' },
  { id: 'system', name: 'System', icon: '💻' },
]

const showToast = ref(false)

const saveSettings = () => {
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

const resetSettings = () => {
  settings.username = 'VueUser'
  settings.email = 'vue@example.com'
  settings.emailNotifications = true
  settings.pushNotifications = true
  settings.marketingEmails = false
  settings.theme = 'system'
}
</script>

<style scoped>
.settings-page {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.settings-header {
  margin-bottom: 1.5rem;
}

.settings-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.settings-header p {
  color: #6b7280;
  margin: 0;
  font-size: 0.9rem;
}

.settings-sections {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.settings-section {
  background: #fafafa;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 1.25rem;
}

.settings-section h2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem 0;
}

.settings-section h2 svg {
  color: #42b883;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

@media (max-width: 500px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.form-group label {
  display: block;
  font-size: 0.8rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.375rem;
}

.form-group input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  background: white;
}

.form-group input:focus {
  outline: none;
  border-color: #42b883;
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.15);
}

.toggle-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.toggle-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.toggle-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.toggle-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
}

.toggle-desc {
  font-size: 0.75rem;
  color: #9ca3af;
}

.toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;
  cursor: pointer;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  inset: 0;
  background: #d1d5db;
  border-radius: 24px;
  transition: all 0.2s ease;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  left: 3px;
  bottom: 3px;
  background: white;
  border-radius: 50%;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.toggle-switch input:checked + .toggle-slider {
  background: #42b883;
}

.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(20px);
}

.theme-selector {
  display: flex;
  gap: 0.75rem;
}

.theme-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-option:hover {
  border-color: #42b883;
}

.theme-option.active {
  border-color: #42b883;
  background: #f0fdf4;
}

.theme-icon {
  font-size: 1.5rem;
}

.theme-name {
  font-size: 0.8rem;
  font-weight: 500;
  color: #374151;
}

.settings-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn-primary, .btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #42b883 0%, #3ca876 100%);
  color: white;
}

.btn-primary:hover {
  box-shadow: 0 4px 12px rgba(66, 184, 131, 0.35);
  transform: translateY(-1px);
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.25rem;
  background: #065f46;
  color: white;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.toast svg {
  color: #34d399;
}

.toast-enter-active, .toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from, .toast-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
