<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDropZone } from '@vueuse/core'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'vue-sonner'
import { Upload, Download, Video, Image, X, FileVideo } from 'lucide-vue-next'

// 状态管理
const dropZoneRef = ref<HTMLDivElement>()
const fileInputRef = ref<HTMLInputElement>()
const videoRef = ref<HTMLVideoElement>()
const canvasRef = ref<HTMLCanvasElement>()

const selectedFile = ref<File | null>(null)
const videoUrl = ref('')
const posterUrl = ref('')
const isProcessing = ref(false)
const isDragOver = ref(false)

// 拖拽上传配置
const { isOverDropZone } = useDropZone(dropZoneRef, {
  onDrop: (files) => {
    handleFileSelect(files)
    isDragOver.value = false
  },
  onEnter: () => {
    isDragOver.value = true
  },
  onLeave: () => {
    isDragOver.value = false
  }
})

// 文件选择处理
const handleFileSelect = (files: File[] | FileList | null) => {
  if (!files || files.length === 0) return

  const file = files[0]

  // 检查文件类型
  if (!file.type.startsWith('video/')) {
    toast.error('请选择视频文件')
    return
  }

  // 检查文件大小 (限制100MB)
  if (file.size > 100 * 1024 * 1024) {
    toast.error('文件大小不能超过100MB')
    return
  }

  selectedFile.value = file
  videoUrl.value = URL.createObjectURL(file)
  posterUrl.value = ''

  toast.success('视频文件已选择')
}

// 手动选择文件
const selectFile = () => {
  fileInputRef.value?.click()
}

// 文件输入变化
const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  handleFileSelect(target.files)
}

// 提取视频首帧
const extractFirstFrame = async () => {
  if (!selectedFile.value || !videoRef.value || !canvasRef.value) {
    toast.error('请先选择视频文件')
    return
  }

  isProcessing.value = true

  try {
    const video = videoRef.value
    const canvas = canvasRef.value
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('无法获取Canvas上下文')
    }

    // 等待视频加载完成
    await new Promise((resolve, reject) => {
      video.onloadeddata = resolve
      video.onerror = reject
      video.load()
    })

    // 设置视频时间为0（第一帧）
    video.currentTime = 0

    // 等待视频定位到第一帧
    await new Promise((resolve) => {
      video.onseeked = resolve
    })

    // 设置canvas尺寸
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // 绘制视频帧到canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // 转换为图片URL
    posterUrl.value = canvas.toDataURL('image/webp', 0.5)

    toast.success('视频首帧提取成功！')
  } catch (error) {
    console.error('提取首帧失败:', error)
    toast.error('提取首帧失败，请重试')
  } finally {
    isProcessing.value = false
  }
}

// 下载首帧图片
const downloadPoster = () => {
  if (!posterUrl.value) {
    toast.error('请先提取视频首帧')
    return
  }

  const link = document.createElement('a')
  link.href = posterUrl.value
  link.download = `${selectedFile.value?.name.replace(/\.[^/.]+$/, '') || 'video'}_poster.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  toast.success('首帧图片下载成功！')
}

// 清除选择
const clearSelection = () => {
  selectedFile.value = null
  videoUrl.value = ''
  posterUrl.value = ''

  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }

  toast.success('已清除选择')
}

// 计算属性
const hasVideo = computed(() => !!selectedFile.value)
const hasPoster = computed(() => !!posterUrl.value)
const canExtract = computed(() => hasVideo.value && !isProcessing.value)
const canDownload = computed(() => hasPoster.value && !isProcessing.value)
</script>

<template>
  <div class="p-4 w-full flex flex-col h-[calc(100vh-4rem-1px)]">
    <!-- 页面标题 -->
    <div class="mb-6">
      <p class="text-muted-foreground text-sm md:text-base">上传视频文件，快速提取并下载视频的第一帧图片</p>
    </div>
    <div class="lg:flex-row flex-col h-full w-full flex gap-4">
      <div class="flex-1 h-full">
        <Card class="h-full flex flex-col w-full">
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Upload class="h-5 w-5" />
              上传视频
            </CardTitle>
            <CardDescription> 支持常见视频格式，文件大小限制100MB </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4 flex-1 flex flex-col">
            <!-- 拖拽上传区域 -->
            <div
              ref="dropZoneRef"
              class="border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer"
              :class="{
                'border-primary bg-primary/5': isDragOver || isOverDropZone,
                'border-muted-foreground/25 hover:border-muted-foreground/50': !isDragOver && !isOverDropZone
              }"
              @click="selectFile"
            >
              <div class="flex flex-col items-center gap-3">
                <div class="p-3 rounded-full bg-muted">
                  <FileVideo class="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <p class="text-sm font-medium">
                    {{ isDragOver ? '释放文件以上传' : '点击选择或拖拽视频文件' }}
                  </p>
                  <p class="text-xs text-muted-foreground mt-1">支持 MP4, AVI, MOV, WMV 等格式</p>
                </div>
              </div>
            </div>

            <!-- 隐藏的文件输入 -->
            <input ref="fileInputRef" type="file" accept="video/*" class="hidden" @change="onFileChange" />

            <!-- 已选择的文件信息 -->
            <div v-if="hasVideo" class="bg-muted/50 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3 min-w-0 flex-1">
                  <Video class="h-5 text-primary flex-shrink-0" />
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-medium truncate">{{ selectedFile?.name }}</p>
                    <p class="text-xs text-muted-foreground">
                      {{ (selectedFile!.size / (1024 * 1024)).toFixed(2) }} MB
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" class="flex-shrink-0" @click.stop="clearSelection">
                  <X class="h-4" />
                </Button>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="flex flex-col gap-2 mt-auto">
              <Button :disabled="!canExtract" class="flex-1 w-full" @click="extractFirstFrame">
                <Image class="h-4 mr-2" />
                {{ isProcessing ? '提取中...' : '提取首帧' }}
              </Button>
              <Button variant="outline" class="flex-1 w-full" @click="selectFile">
                <Upload class="h-4 mr-2" />
                重新选择
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <div class="flex-1 h-full">
        <Card class="h-full">
          <CardHeader>
            <CardTitle>首帧预览</CardTitle>
            <CardDescription> 提取的视频首帧图片预览和下载 </CardDescription>
          </CardHeader>
          <CardContent class="flex-1">
            <div v-if="hasPoster" class="h-full flex flex-col">
              <div
                class="flex-1 overflow-hidden"
                :style="{
                  backgroundImage: `url(${posterUrl})`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }"
              ></div>
              <!-- 下载按钮 -->
              <Button :disabled="!canDownload" class="w-full mt-4" @click="downloadPoster">
                <Download class="h-4 w-4 mr-2" />
                下载首帧图片
              </Button>
            </div>
            <div v-else class="flex-1 flex items-center justify-center">
              <div class="text-center">
                <div class="flex flex-col items-center gap-3">
                  <div class="p-4 rounded-full bg-muted">
                    <Image class="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-muted-foreground">暂无首帧图片</p>
                    <p class="text-xs text-muted-foreground mt-1">请先上传视频并提取首帧</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- 隐藏的视频和canvas元素 -->
    <video ref="videoRef" :src="videoUrl" class="hidden" preload="metadata" muted />
    <canvas ref="canvasRef" class="hidden" />
  </div>
</template>

<style scoped>
/* 拖拽动画 */
.border-dashed {
  transition: all 0.2s ease-in-out;
}
</style>
