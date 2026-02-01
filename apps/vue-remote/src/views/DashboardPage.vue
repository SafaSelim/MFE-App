<template>
  <div class="dashboard-page">
    <div class="dashboard-header">
      <h1>Dashboard</h1>
      <p>Real-time metrics and analytics</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card users">
        <div class="stat-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ animatedStats.users.toLocaleString() }}</span>
          <span class="stat-label">Active Users</span>
        </div>
        <div class="stat-trend positive">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
          </svg>
          +12.5%
        </div>
      </div>

      <div class="stat-card revenue">
        <div class="stat-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">${{ animatedStats.revenue.toLocaleString() }}</span>
          <span class="stat-label">Revenue</span>
        </div>
        <div class="stat-trend positive">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
          </svg>
          +8.2%
        </div>
      </div>

      <div class="stat-card orders">
        <div class="stat-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ animatedStats.orders.toLocaleString() }}</span>
          <span class="stat-label">Orders</span>
        </div>
        <div class="stat-trend positive">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
          </svg>
          +23.1%
        </div>
      </div>

      <div class="stat-card conversion">
        <div class="stat-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ animatedStats.conversion }}%</span>
          <span class="stat-label">Conversion</span>
        </div>
        <div class="stat-trend negative">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"/>
          </svg>
          -2.4%
        </div>
      </div>
    </div>

    <div class="activity-section">
      <h2>Recent Activity</h2>
      <div class="activity-list">
        <div v-for="(activity, index) in activities" :key="index" class="activity-item">
          <div :class="['activity-dot', activity.type]"></div>
          <div class="activity-content">
            <span class="activity-text">{{ activity.text }}</span>
            <span class="activity-time">{{ activity.time }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'

const stats = {
  users: 1234,
  revenue: 45678,
  orders: 567,
  conversion: 3.2,
}

const animatedStats = reactive({
  users: 0,
  revenue: 0,
  orders: 0,
  conversion: 0,
})

const activities = ref([
  { type: 'success', text: 'New user registered', time: '2 min ago' },
  { type: 'info', text: 'Order #1234 completed', time: '5 min ago' },
  { type: 'warning', text: 'Low inventory alert', time: '12 min ago' },
  { type: 'success', text: 'Payment received', time: '18 min ago' },
  { type: 'info', text: 'New review posted', time: '25 min ago' },
])

onMounted(() => {
  // Animate stats on mount
  const duration = 1000
  const steps = 60
  const interval = duration / steps

  let step = 0
  const timer = setInterval(() => {
    step++
    const progress = step / steps
    const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic

    animatedStats.users = Math.round(stats.users * eased)
    animatedStats.revenue = Math.round(stats.revenue * eased)
    animatedStats.orders = Math.round(stats.orders * eased)
    animatedStats.conversion = Math.round(stats.conversion * eased * 10) / 10

    if (step >= steps) {
      clearInterval(timer)
      animatedStats.users = stats.users
      animatedStats.revenue = stats.revenue
      animatedStats.orders = stats.orders
      animatedStats.conversion = stats.conversion
    }
  }, interval)
})
</script>

<style scoped>
.dashboard-page {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.dashboard-header {
  margin-bottom: 1.5rem;
}

.dashboard-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.dashboard-header p {
  color: #6b7280;
  margin: 0;
  font-size: 0.9rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  background: white;
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: all 0.2s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon svg {
  width: 22px;
  height: 22px;
}

.stat-card.users .stat-icon {
  background: #dbeafe;
  color: #2563eb;
}

.stat-card.revenue .stat-icon {
  background: #d1fae5;
  color: #059669;
}

.stat-card.orders .stat-icon {
  background: #fef3c7;
  color: #d97706;
}

.stat-card.conversion .stat-icon {
  background: #ede9fe;
  color: #7c3aed;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
}

.stat-label {
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  font-weight: 600;
}

.stat-trend.positive {
  color: #059669;
}

.stat-trend.negative {
  color: #dc2626;
}

.activity-section h2 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.activity-list {
  background: #fafafa;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.activity-dot.success { background: #22c55e; }
.activity-dot.info { background: #3b82f6; }
.activity-dot.warning { background: #f59e0b; }

.activity-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.activity-text {
  font-size: 0.875rem;
  color: #374151;
}

.activity-time {
  font-size: 0.75rem;
  color: #9ca3af;
  flex-shrink: 0;
}
</style>
