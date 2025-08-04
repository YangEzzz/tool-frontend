<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import GithubTrending from '@/components/GithubTrending/index.vue'

// 定义组件名称解决linter错误
defineOptions({
  name: 'DashboardPage'
})

const greeting = ref('欢迎使用聚合工具')

const currentTime = ref(new Date().toLocaleTimeString())

let timer: number | null = null

onMounted(() => {
  // 每秒更新一次时间
  // @ts-ignore
  timer = setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString()
  }, 1000)
})

onBeforeUnmount(() => {
  // 清理定时器
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<template>
  <div class="py-8 flex flex-col h-[calc(100vh-4rem-1px)]">
    <div class="mb-8 text-center">
      <h1 class="text-3xl font-bold mb-2">{{ greeting }}</h1>
    </div>
    <!-- 数据统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="bg-card border rounded-lg p-4 flex items-center shadow-sm hover:shadow-md transition-shadow">
        <div class="text-4xl mr-4">📅</div>
        <div>
          <p class="text-sm text-muted-foreground">当前日期</p>
          <p class="text-2xl font-bold">{{ new Date().toLocaleDateString() }}</p>
        </div>
      </div>
      <div class="bg-card border rounded-lg p-4 flex items-center shadow-sm hover:shadow-md transition-shadow">
        <div class="text-4xl mr-4">🕰</div>
        <div>
          <p class="text-sm text-muted-foreground">当前时间</p>
          <p class="text-2xl font-bold">{{ currentTime }}</p>
        </div>
      </div>
    </div>
    <!-- GitHub热门项目 -->
    <div class="mt-6 flex-1 overflow-hidden">
      <GithubTrending />
    </div>
  </div>
</template>
