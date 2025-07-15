<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from 'vue-sonner'

// 状态定义
const text = ref('')
const width = ref(500)
const height = ref(300)
const format = ref('png')
const fontSize = ref(48)
const fontColor = ref('#000000')
const backgroundColor = ref('#eeeeee')
const fontFamily = ref('Comic Sans MS, cursive')
const isGenerating = ref(false)
const imageUrl = ref('')
const sizeMode = ref('preset') // 'preset' 或 'custom'
const debounceTimeout = ref<number | null>(null)

// 图片尺寸选项
const sizeOptions = [
  { label: '500 x 300', width: 500, height: 300 },
  { label: '800 x 600', width: 800, height: 600 },
  { label: '1024 x 768', width: 1024, height: 768 },
  { label: '1280 x 720', width: 1280, height: 720 },
  { label: '1920 x 1080', width: 1920, height: 1080 }
]

// 图片格式选项
const formatOptions = [
  { value: 'png', label: 'PNG' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'webp', label: 'WebP' }
]

// 字体选项
const fontOptions = [
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Times New Roman, serif', label: '宋体' },
  { value: 'Courier New, monospace', label: '等宽字体' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Impact, fantasy', label: 'Impact' },
  { value: 'Comic Sans MS, cursive', label: 'Comic Sans' }
]

// 处理尺寸选择
const handleSizeChange = (sizeString: string) => {
  const [w, h] = sizeString.split('x').map((s) => parseInt(s.trim(), 10))
  width.value = w
  height.value = h
}

// 计算当前尺寸字符串
const currentSize = computed(() => {
  return `${width.value} x ${height.value}`
})

// 生成图片的核心函数
const generateImageCore = () => {
  if (width.value <= 0 || height.value <= 0) {
    toast.error('图片尺寸必须大于0')
    return
  }

  try {
    // 创建一个canvas元素
    const canvas = document.createElement('canvas')
    canvas.width = width.value
    canvas.height = height.value

    // 获取绘图上下文
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('无法获取绘图上下文')
    }

    // 设置背景色
    ctx.fillStyle = backgroundColor.value
    ctx.fillRect(0, 0, width.value, height.value)

    // 如果有文本内容，则绘制文字
    if (text.value.trim()) {
      // 设置文字样式
      ctx.fillStyle = fontColor.value
      ctx.font = `${fontSize.value}px ${fontFamily.value}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // 绘制文字（处理多行）
      const lines = text.value.split('\n')
      const lineHeight = fontSize.value * 1.2
      const totalHeight = lines.length * lineHeight
      const startY = (height.value - totalHeight) / 2 + lineHeight / 2

      lines.forEach((line, index) => {
        ctx.fillText(line, width.value / 2, startY + index * lineHeight)
      })
    }

    // 将canvas转换为图片URL
    imageUrl.value = canvas.toDataURL(`image/${format.value}`)
    return true
  } catch (error) {
    console.error('生成图片失败:', error)
    toast.error('生成失败', {
      description: error instanceof Error ? error.message : '未知错误'
    })
    return false
  }
}

// 带防抖的实时生成图片
const generateImageWithDebounce = () => {
  // 清除之前的定时器
  if (debounceTimeout.value !== null) {
    clearTimeout(debounceTimeout.value)
  }

  // 设置新的定时器，300ms后执行生成
  debounceTimeout.value = window.setTimeout(() => {
    generateImageCore()
    debounceTimeout.value = null
  }, 300)
}

// 手动生成图片（按钮点击时调用）
const generateImage = () => {
  if (!text.value.trim()) {
    toast.error('请输入要生成的文字内容')
    return
  }

  isGenerating.value = true

  try {
    const success = generateImageCore()
    if (success) {
      toast.success('图片生成成功')
    }
  } finally {
    isGenerating.value = false
  }
}

// 下载图片
const downloadImage = () => {
  if (!imageUrl.value) return

  const link = document.createElement('a')
  link.download = `text-image-${Date.now()}.${format.value}`
  link.href = imageUrl.value
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  toast.success('图片已开始下载')
}

// 监听所有参数变化，实时更新图片
watch(
  [text, width, height, format, fontSize, fontColor, backgroundColor, fontFamily],
  () => {
    generateImageWithDebounce()
  },
  { deep: true }
)

// 组件挂载时生成一次初始图片
onMounted(() => {
  // 设置一个默认文本，以便初始时就有图片显示
  if (!text.value) {
    text.value = '在此输入文字'
  }
  generateImageCore()
})
</script>

<template>
  <div class="overflow-y-auto h-full p-6 w-full">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- 左侧表单部分 -->
      <Card class="w-full">
        <CardHeader>
          <CardTitle>文字转图片工具</CardTitle>
        </CardHeader>

        <CardContent>
          <div class="space-y-4">
            <div>
              <Label for="text-input">文字内容</Label>
              <Textarea id="text-input" v-model="text" placeholder="输入要转为图片的文字..." class="mt-1" rows="4" />
            </div>

            <div>
              <Label class="mb-2 block">图片尺寸</Label>
              <RadioGroup v-model="sizeMode" class="mb-2 flex space-x-4">
                <div class="flex items-center space-x-2">
                  <RadioGroupItem id="preset" value="preset" />
                  <Label for="preset">预设尺寸</Label>
                </div>
                <div class="flex items-center space-x-2">
                  <RadioGroupItem id="custom" value="custom" />
                  <Label for="custom">自定义尺寸</Label>
                </div>
              </RadioGroup>

              <div v-if="sizeMode === 'preset'">
                <Select :value="currentSize" @update:value="handleSizeChange">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="选择尺寸" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="option in sizeOptions"
                      :key="option.label"
                      :value="`${option.width} x ${option.height}`"
                    >
                      {{ option.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div v-else class="grid grid-cols-2 gap-2">
                <div>
                  <Label for="custom-width">宽度</Label>
                  <Input id="custom-width" v-model="width" type="number" min="1" max="3000" class="mt-1" />
                </div>
                <div>
                  <Label for="custom-height">高度</Label>
                  <Input id="custom-height" v-model="height" type="number" min="1" max="3000" class="mt-1" />
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label for="format-select">图片格式</Label>
                <Select v-model="format">
                  <SelectTrigger class="mt-1 w-full">
                    <SelectValue placeholder="选择格式" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="option in formatOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label for="font-size">字体大小</Label>
                <Input id="font-size" v-model="fontSize" type="number" min="10" max="100" class="mt-1" />
              </div>
            </div>

            <div>
              <Label for="font-family">字体</Label>
              <Select v-model="fontFamily">
                <SelectTrigger class="mt-1 w-full">
                  <SelectValue placeholder="选择字体" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="option in fontOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label for="font-color">字体颜色</Label>
                <div class="flex mt-1">
                  <input v-model="fontColor" type="color" class="w-10 h-10 rounded-md cursor-pointer" />
                  <Input v-model="fontColor" class="ml-2 flex-1" />
                </div>
              </div>
              <div>
                <Label for="bg-color">背景颜色</Label>
                <div class="flex mt-1">
                  <input v-model="backgroundColor" type="color" class="w-10 h-10 rounded-md cursor-pointer" />
                  <Input v-model="backgroundColor" class="ml-2 flex-1" />
                </div>
              </div>
            </div>

            <Button class="w-full" :disabled="isGenerating" @click="generateImage">
              {{ isGenerating ? '正在生成...' : '刷新图片' }}
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- 右侧预览部分 -->
      <Card class="w-full">
        <CardHeader>
          <CardTitle>预览结果</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex flex-col h-full justify-center items-center">
            <div v-if="imageUrl" class="w-full">
              <div class="flex justify-center mb-4">
                <img :src="imageUrl" alt="生成的图片" class="max-w-full max-h-[400px] object-contain border rounded" />
              </div>
              <Button class="w-full" variant="outline" @click="downloadImage"> 下载图片 </Button>
            </div>
            <div v-else class="text-center text-muted-foreground p-8">
              <p>图片预览区域</p>
              <p class="text-sm mt-2">正在生成图片预览...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<style scoped>
/* 移除了自定义类名 */
</style>
