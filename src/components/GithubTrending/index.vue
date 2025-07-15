<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getMockGithubTrending } from '@/api/github'
import { GithubSince, type GithubTrendingItem } from '@/api/github/types'
import { Star, GitFork, TrendingUp, Book } from 'lucide-vue-next'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// 状态定义
const trendingProjects = ref<GithubTrendingItem[]>([])
const isLoading = ref(true)
const timeRange = ref<GithubSince>(GithubSince.TODAY)
const error = ref<string | null>(null)

// 获取GitHub热门项目
const fetchTrendingProjects = async () => {
  isLoading.value = true
  error.value = null

  try {
    // 在实际项目中，这里应该调用fetchGithubTrending API
    // 目前使用模拟数据
    const response = await getMockGithubTrending(timeRange.value)

    if (response.code === 200 && response.data) {
      trendingProjects.value = response.data
    } else {
      error.value = response.message || '获取数据失败'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '获取数据失败'
    console.error('获取GitHub热门项目失败:', err)
  } finally {
    isLoading.value = false
  }
}

// 切换时间范围
const handleTimeRangeChange = (value: string) => {
  timeRange.value = value
  fetchTrendingProjects()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchTrendingProjects()
})
</script>

<template>
  <div class="bg-card border rounded-lg p-4 h-full flex flex-col">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold flex items-center"><span class="mr-2">🔥</span> GitHub热门项目</h2>

      <Select v-model="timeRange" @update:model-value="handleTimeRangeChange">
        <SelectTrigger class="w-[120px]">
          <SelectValue placeholder="时间范围" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="daily">今日</SelectItem>
          <SelectItem value="weekly">本周</SelectItem>
          <SelectItem value="monthly">本月</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div v-if="isLoading" class="space-y-4">
      <div v-for="i in 2" :key="i" class="flex items-center space-x-4">
        <Skeleton class="h-10 w-10 rounded-full" />
        <div class="space-y-2">
          <Skeleton class="h-4 w-[250px]" />
          <Skeleton class="h-4 w-[200px]" />
        </div>
      </div>
    </div>

    <div v-else-if="error" class="text-destructive p-4 rounded-md bg-destructive/10">
      <p>{{ error }}</p>
      <button class="mt-2 text-sm underline hover:text-destructive/80" @click="fetchTrendingProjects">重试</button>
    </div>

    <div v-else class="space-y-4 flex-1 overflow-auto">
      <a
        v-for="project in trendingProjects"
        :key="`${project.id}`"
        :href="project.url"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-start p-3 hover:bg-accent rounded-md transition-colors w-full"
      >
        <div class="flex-1 min-w-0">
          <div class="flex items-center">
            <Book class="w-3.5 h-3.5 mr-1" />
            <h3 class="font-medium truncate">
              {{ project.title }}
            </h3>
          </div>

          <p class="text-sm text-muted-foreground line-clamp-2 mt-1">
            {{ project.extra.desc }}
          </p>

          <div class="flex items-center mt-2 text-xs text-muted-foreground w-full">
            <span v-if="project.extra.codeLang" class="flex items-center mr-3">
              <span
                class="inline-block w-3 h-3 rounded-full mr-1"
                :style="{ backgroundColor: project.extra.codeColor }"
              ></span>
              {{ project.extra.codeLang }}
            </span>

            <span class="flex items-center mr-3">
              <Star class="w-3.5 h-3.5 mr-1" />
              {{ project.extra.star }}
            </span>

            <span class="flex items-center mr-3">
              <GitFork class="w-3.5 h-3.5 mr-1" />
              {{ project.extra.fork }}
            </span>

            <span class="flex items-center ml-auto">
              <TrendingUp class="w-3.5 h-3.5 mr-1" />
              {{ project.extra.todayStar }} stars today
            </span>
          </div>
        </div>
      </a>
    </div>
  </div>
</template>
