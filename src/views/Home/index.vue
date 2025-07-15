<script setup lang="ts">
import { ref } from 'vue'

// 定义组件名称解决linter错误
defineOptions({
  name: 'HomePage'
})

const greeting = ref('欢迎使用聚合工具')
const stats = ref([
  { name: '总数据源', value: '12', icon: '📊' },
  { name: '活跃连接', value: '8', icon: '🔗' },
  { name: '今日数据量', value: '2.4K', icon: '📈' },
  { name: '系统状态', value: '正常', icon: '✅' }
])
</script>

<template>
  <div class="py-8">
    <div class="mb-8 text-center">
      <h1 class="text-3xl font-bold mb-2">{{ greeting }}</h1>
      <p class="text-muted-foreground">高效管理和分析您的所有数据源</p>
    </div>

    <!-- 数据统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div
        v-for="(stat, index) in stats"
        :key="index"
        class="bg-card border rounded-lg p-4 flex items-center shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="text-4xl mr-4">{{ stat.icon }}</div>
        <div>
          <p class="text-sm text-muted-foreground">{{ stat.name }}</p>
          <p class="text-2xl font-bold">{{ stat.value }}</p>
        </div>
      </div>
    </div>

    <!-- 主要内容区 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 最新活动 -->
      <div class="bg-card border rounded-lg p-4 col-span-2">
        <h2 class="text-xl font-bold mb-4 flex items-center"><span class="mr-2">📝</span> 最新活动</h2>
        <div class="space-y-4">
          <div v-for="i in 3" :key="i" class="border-b pb-3 last:border-0">
            <div class="flex justify-between items-center mb-1">
              <span class="font-medium">数据源更新</span>
              <span class="text-sm text-muted-foreground">{{ new Date().toLocaleDateString() }}</span>
            </div>
            <p class="text-sm text-muted-foreground">已成功更新财务数据源的最新数据</p>
          </div>
        </div>
      </div>

      <!-- 快速访问 -->
      <div class="bg-card border rounded-lg p-4">
        <h2 class="text-xl font-bold mb-4 flex items-center"><span class="mr-2">⚡</span> 快速访问</h2>
        <div class="space-y-2">
          <a v-for="i in 5" :key="i" href="#" class="block p-2 hover:bg-accent rounded-md transition-colors">
            📊 数据源 {{ i }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
