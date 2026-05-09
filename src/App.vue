<script setup>
import { ref } from 'vue'
import Sidebar from './components/Sidebar.vue'
import Dashboard from './components/Dashboard.vue'

const isLoaded = ref(true)
</script>

<template>
  <div class="min-h-screen bg-brand-bg text-white">
    <div v-if="isLoaded" class="flex">
      <Sidebar />
      <Dashboard />
    </div>
    <div v-else class="flex items-center justify-center h-screen">
      <p>Carregando...</p>
    </div>
  </div>
</template>
