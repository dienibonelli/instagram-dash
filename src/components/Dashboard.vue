<template>
  <main class="ml-64 min-h-screen bg-brand-bg p-8">
    <div class="mb-8">
      <h2 class="text-3xl font-bold mb-2">Welcome back! 👋</h2>
      <p class="text-gray-400">Here's your Instagram performance at a glance</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-max">
      <!-- KPI Cards -->
      <KPICard label="Reach" :value="45230" :variation="12.5" icon="📢" format="number" />
      <KPICard label="Engagement" :value="8.5" :variation="8.2" icon="❤️" format="percentage" />
      <KPICard label="Followers" :value="12450" :variation="5.1" icon="👥" format="number" />
      <KPICard label="Clicks" :value="3240" :variation="15.3" icon="🔗" format="number" />

      <!-- Growth Chart -->
      <div class="lg:col-span-2 row-span-2 card-rounded bg-brand-card border border-white/10 p-6">
        <h3 class="text-lg font-semibold mb-6">Audience Growth</h3>
        <div class="h-64 bg-brand-bg/50 card-rounded flex items-center justify-center">
          📈 Chart placeholder
        </div>
      </div>

      <!-- Retention Cards -->
      <div class="card-rounded bg-brand-card border border-white/10 p-6 text-center">
        <h3 class="text-lg font-semibold mb-4">Reels</h3>
        <p class="text-4xl font-bold text-green-500">72%</p>
      </div>

      <div class="card-rounded bg-brand-card border border-white/10 p-6 text-center">
        <h3 class="text-lg font-semibold mb-4">Stories</h3>
        <p class="text-4xl font-bold text-yellow-500">58%</p>
      </div>

      <!-- Top Posts -->
      <div class="lg:col-span-3 card-rounded bg-brand-card border border-white/10 p-6">
        <h3 class="text-lg font-semibold mb-4">Top Performing Posts</h3>
        <div class="space-y-3">
          <div class="flex items-center gap-4 pb-3 border-b border-white/10">
            <div class="w-16 h-16 card-rounded bg-gradient-to-br from-purple-400 to-pink-400"></div>
            <div class="flex-1">
              <p class="text-sm font-medium">Summer Vibes</p>
              <p class="text-xs text-gray-400">2 days ago</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-bold">1.2K</p>
              <p class="text-xs text-gray-400">likes</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Feed Retention -->
      <div class="card-rounded bg-brand-card border border-white/10 p-6 text-center">
        <h3 class="text-lg font-semibold mb-4">Feed</h3>
        <p class="text-4xl font-bold text-blue-500">65%</p>
      </div>
    </div>
  </main>
</template>

<script setup>
import KPICard from './KPICard.vue'
</script>
