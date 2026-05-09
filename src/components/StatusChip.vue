<template>
  <span
    :class="[
      'inline-flex items-center gap-2 px-3 py-1 card-rounded text-sm font-medium transition-smooth',
      statusStyles[status]
    ]"
  >
    <span class="w-2 h-2 rounded-full"></span>
    {{ label }}
  </span>
</template>

<script setup>
defineProps({
  status: {
    type: String,
    enum: ['active', 'pending', 'completed', 'alert'],
    default: 'active'
  },
  label: String
})

const statusStyles = {
  active: 'bg-green-500/20 text-green-400 border border-green-500/30',
  pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  completed: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  alert: 'bg-red-500/20 text-red-400 border border-red-500/30'
}
</script>
