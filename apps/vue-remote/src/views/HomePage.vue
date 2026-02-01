<template>
  <div class="page">
    <h3>Vue Remote Home</h3>
    <p>This is a standalone Vue 3 application loaded as a remote module.</p>
    <div class="info-card">
      <h4>Features:</h4>
      <ul>
        <li>Vue 3 Composition API</li>
        <li>TypeScript Support</li>
        <li>Vite Module Federation</li>
        <li>Vue Router Integration</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
// Vue 3 Composition API
</script>

<style scoped>
.page {
  padding: 1rem;
}

h3 {
  color: #42b883;
  margin-bottom: 1rem;
}

.info-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #42b883;
  margin-top: 1rem;
}

.info-card h4 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.info-card ul {
  list-style: none;
  padding: 0;
}

.info-card li {
  padding: 0.5rem 0;
  color: #666;
}

.info-card li:before {
  content: "✓ ";
  color: #42b883;
  font-weight: bold;
  margin-right: 0.5rem;
}
</style>