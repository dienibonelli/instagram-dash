<template>
  <div class="card-rounded bg-brand-card border border-white/10 p-6 transition-smooth hover:border-white/20">
    <div class="flex items-start justify-between mb-4">
      <div>
        <p class="text-label mb-2">{{ label }}</p>
        <h3 class="text-4xl font-bold">{{ formattedValue }}</h3>
      </div>
      <span class="text-3xl">{{ icon }}</span>
    </div>

    <!-- Variation indicator -->
    <div v-if="variation !== null" class="flex items-center gap-2">
      <span
        :class="[
          'text-sm font-semibold',
          variation >= 0 ? 'text-brand-success' : 'text-brand-alert'
        ]"
      >
        {{ variation >= 0 ? '↑' : '↓' }} {{ Math.abs(variation) }}%
      </span>
      <span class="text-xs text-gray-500">vs last month</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: String,
  value: [Number, String],
  variation: {
    type: Number,
    default: null
  },
  icon: {
    type: String,
    default: '📊'
  },
  format: {
    type: String,
    enum: ['number', 'percentage', 'currency'],
    default: 'number'
  }
})

const formattedValue = computed(() => {
  const val = Number(props.value)

  switch (props.format) {
    case 'percentage':
      return `${val.toFixed(1)}%`
    case 'currency':
      return `$${val.toLocaleString()}`
    case 'number':
    default:
      return val.toLocaleString()
  }
})
</script>
