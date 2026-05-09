<template>
  <aside class="w-64 bg-brand-card h-screen flex flex-col fixed left-0 top-0 border-r border-white/10">
    <!-- Logo -->
    <div class="px-6 py-8 border-b border-white/10">
      <h1 class="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
        InstaDash
      </h1>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-4 py-6 space-y-2">
      <a
        v-for="item in navItems"
        :key="item.id"
        :href="`#${item.id}`"
        :class="[
          'flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth',
          activeNav === item.id
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
            : 'text-gray-400 hover:text-white hover:bg-white/5'
        ]"
        @click="activeNav = item.id"
      >
        <span class="text-xl">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </a>
    </nav>

    <!-- Footer -->
    <div class="px-6 py-4 border-t border-white/10 text-xs text-gray-500">
      <p>Dashboard v1.0</p>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'

const activeNav = ref('overview')

const navItems = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'analytics', label: 'Analytics', icon: '📈' },
  { id: 'content', label: 'Content', icon: '📸' },
  { id: 'audience', label: 'Audience', icon: '👥' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
]
</script>
