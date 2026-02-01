<template>
  <div class="page">
    <h3>Vue Dashboard</h3>
    <div class="dashboard-grid">
      <div class="stat-card">
        <div class="stat-value">{{ stats.users }}</div>
        <div class="stat-label">Active Users</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.revenue }}</div>
        <div class="stat-label">Revenue</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.orders }}</div>
        <div class="stat-label">Orders</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const stats = reactive({
  users: 1234,
  revenue: '$45,678',
  orders: 567,
})
</script>

<style scoped>
.page {
  padding: 1rem;
}

h3 {
  color: #42b883;
  margin-bottom: 1.5rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  border-top: 4px solid #42b883;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}
</style>