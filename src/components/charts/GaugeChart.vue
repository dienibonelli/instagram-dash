<template>
  <div class="flex flex-col items-center justify-center h-40">
    <div class="relative w-32 h-32">
      <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <!-- Background circle -->
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          stroke-width="8"
          stroke-linecap="round"
        />
        <!-- Progress circle -->
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          :stroke="circleColor"
          stroke-width="8"
          stroke-linecap="round"
          :style="{
            strokeDasharray: `${circumference}`,
            strokeDashoffset: `${circumference - (value / 100) * circumference}`,
            transition: 'stroke-dashoffset 0.5s ease'
          }"
        />
      </svg>

      <!-- Center text -->
      <div class="absolute inset-0 flex items-center justify-center">
        <span class="text-3xl font-bold">{{ value }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  }
})

const circumference = Math.PI * 90

const circleColor = computed(() => {
  if (props.value >= 70) return '#10B981'
  if (props.value >= 50) return '#F59E0B'
  return '#EF4444'
})
</script>
