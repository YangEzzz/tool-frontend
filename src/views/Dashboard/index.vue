<script setup lang="ts">
import { ref } from 'vue'
import GithubTrending from '@/components/GithubTrending/index.vue'

// 定义组件名称解决linter错误
defineOptions({
  name: 'DashboardPage'
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
  <div class="py-8 flex flex-col h-[calc(100vh-4rem-1px)]">
    <div class="mb-8 text-center">
      <h1 class="text-3xl font-bold mb-2">{{ greeting }}</h1>
      <p class="text-muted-foreground">提高工作效率，简化生活</p>
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
    <!-- GitHub热门项目 -->
    <div class="mt-6 flex-1 overflow-hidden">
        <GithubTrending />
    </div>
  </div>
</template>