<template>
  <div class="w-full h-64 flex items-end gap-2 px-4">
    <div
      v-for="(value, idx) in data.datasets[0].data"
      :key="idx"
      class="flex-1 flex flex-col items-center"
    >
      <div
        :style="{
          height: `${(value / maxValue) * 100}%`,
          minHeight: '20px'
        }"
        class="w-full card-rounded bg-gradient-to-t from-purple-500 to-pink-500 opacity-80 hover:opacity-100 transition-opacity"
      ></div>
      <p class="text-xs text-gray-400 mt-2">{{ data.labels[idx] }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: Object
})

const maxValue = computed(() => {
  if (!props.data?.datasets?.[0]?.data) return 0
  return Math.max(...props.data.datasets[0].data)
})
</script>
