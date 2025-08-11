<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import ImageKit from 'imagekit'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'vue-sonner'
import { Label } from '@/components/ui/label'
import { createPaste, getUserPastes, deletePasteById } from '@/api/paste'
import type { PasteItem } from '@/api/paste/types'
// import { api } from '@/request'

// 定义组件名称解决linter错误
defineOptions({
  name: 'ToolsPastePage'
})

const pasteContent = ref('')
const isPublic = ref(false)
const isLoading = ref(false)
const isSubmitting = ref(false)
const savedPastes = ref<PasteItem[]>([])

// 图片上传相关状态
const selectedImage = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const contentType = ref<'text' | 'image'>('text')

// 筛选设置
const showPublicPastes = ref(false) // 默认显示非公开内容

// 根据筛选条件过滤剪贴板内容
const filteredPastes = computed(() => {
  return savedPastes.value.filter((paste: PasteItem) => paste.isPublic === showPublicPastes.value)
})

// 加载用户的剪贴板内容
const loadUserPastes = async () => {
  isLoading.value = true

  try {
    const response = await getUserPastes()

    if (response.code === 200 && response.data) {
      savedPastes.value = Array.isArray(response.data) ? response.data : []
    } else {
      toast.error('获取剪贴板内容失败', {
        description: response.message || '请稍后重试'
      })
    }
  } catch (error) {
    console.error('加载剪贴板内容失败:', error)
    toast.error('获取剪贴板内容失败', {
      description: '请检查网络连接后重试'
    })
  } finally {
    isLoading.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadUserPastes()
})

// 处理图片选择
const handleImageSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    const file = input.files[0]

    // 检查文件是否为图片类型
    if (!file.type.startsWith('image/')) {
      toast.error('文件类型错误', {
        description: '请选择图片文件',
        duration: 2000
      })
      return
    }

    // 检查文件大小 (限制为 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast.error('文件过大', {
        description: '图片大小不能超过 5MB',
        duration: 2000
      })
      return
    }

    // 存储选择的图片并创建预览
    selectedImage.value = file
    contentType.value = 'image'

    // 创建图片预览
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)

    toast.success('图片已选择', {
      duration: 2000
    })
  }
}

// 清除选择的图片
const clearSelectedImage = () => {
  selectedImage.value = null
  imagePreview.value = null
  contentType.value = 'text'
}

// 从剪贴板获取内容
const getFromClipboard = async () => {
  try {
    // 尝试获取剪贴板中的图片
    const clipboardItems = await navigator.clipboard.read()

    for (const clipboardItem of clipboardItems) {
      // 检查剪贴板中是否有图片
      if (
        clipboardItem.types.includes('image/png') ||
        clipboardItem.types.includes('image/jpeg') ||
        clipboardItem.types.includes('image/gif')
      ) {
        const imageType = clipboardItem.types.find((type) => type.startsWith('image/')) || 'image/png'
        const blob = await clipboardItem.getType(imageType)

        // 创建文件对象
        const file = new File([blob], `clipboard-image.${imageType.split('/')[1]}`, { type: imageType })

        // 检查文件大小 (限制为 5MB)
        const maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
          toast.error('图片过大', {
            description: '图片大小不能超过 5MB',
            duration: 2000
          })
          return
        }

        // 存储选择的图片并创建预览
        selectedImage.value = file
        contentType.value = 'image'

        // 创建图片预览
        const reader = new FileReader()
        reader.onload = (e) => {
          imagePreview.value = e.target?.result as string
        }
        reader.readAsDataURL(file)

        toast.success('获取成功', {
          description: '已从剪贴板获取图片',
          duration: 2000
        })
        return
      }
    }

    // 如果没有图片，尝试获取文本
    const text = await navigator.clipboard.readText()
    if (text) {
      pasteContent.value = text
      contentType.value = 'text'
      // 清除可能存在的图片
      clearSelectedImage()

      toast.success('获取成功', {
        description: '已从剪贴板获取文本内容',
        duration: 2000
      })
    } else {
      toast.info('剪贴板为空', {
        duration: 2000
      })
    }
  } catch (err) {
    console.error(err)
    // 回退到只读取文本
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        pasteContent.value = text
        contentType.value = 'text'
        // 清除可能存在的图片
        clearSelectedImage()

        toast.success('获取成功', {
          description: '已从剪贴板获取文本内容',
          duration: 2000
        })
      } else {
        toast.info('剪贴板为空', {
          duration: 2000
        })
      }
    } catch (textErr) {
      console.error(textErr)
      toast.error('无法读取剪贴板', {
        description: '请检查浏览器权限设置或手动添加内容',
        duration: 3000
      })
    }
  }
}

// 添加新的粘贴内容
const addPaste = async () => {
  // 检查内容类型并验证是否有内容
  if (contentType.value === 'text' && !pasteContent.value.trim()) {
    toast.error('请输入内容后再保存')
    return
  }

  if (contentType.value === 'image' && !selectedImage.value) {
    toast.error('请选择图片后再保存')
    return
  }

  isSubmitting.value = true

  try {
    if (contentType.value === 'text') {
      const response = await createPaste({
        content: pasteContent.value,
        isPublic: isPublic.value,
        contentType: 'text'
      })

      if (response.code === 200 && response.data) {
        // 添加新创建的内容到列表
        const newPaste = response.data as PasteItem
        savedPastes.value.unshift(newPaste)

        // 清空输入框
        pasteContent.value = ''

        toast.success('保存成功', {
          description: '文本内容已添加到列表',
          duration: 2000
        })
      } else {
        toast.error('保存失败', {
          description: response.message || '请稍后重试',
          duration: 2000
        })
      }
    } else if (selectedImage.value) {
      // 使用ImageKit上传图片
      try {
        const imagekit = new ImageKit({
          publicKey: 'public_FKz3tIw+Nb5FeUT0D00wjqi8LF8=',
          urlEndpoint: 'https://ik.imagekit.io/tysolution',
          privateKey: 'private_84dvmmk25tgGICW567QOHomWBOk='
        })

        // 创建FormData对象用于上传
        const formData = new FormData()
        formData.append('file', selectedImage.value)
        formData.append('fileName', selectedImage.value.name)
        formData.append('isPublic', isPublic.value.toString())
        imagekit.upload(
          {
            file: selectedImage.value as never,
            fileName: selectedImage.value.name
          },
          async (error, result) => {
            if (error) {
              console.error('图片上传失败:', error)
              toast.error('图片上传失败', {
                description: error.message || '请稍后重试',
                duration: 2000
              })
            } else if (result) {
              console.log('图片上传成功:', result)

              // 保存图片URL到剪贴板内容
              const imageUrl = result.url
              const response = await createPaste({
                content: imageUrl, // 保存图片URL作为内容
                isPublic: isPublic.value,
                contentType: 'image'
              })

              if (response.code === 200 && response.data) {
                // 添加新创建的内容到列表
                const newPaste = response.data as PasteItem
                savedPastes.value.unshift(newPaste)

                toast.success('保存成功', {
                  description: '图片内容已上传并添加到列表',
                  duration: 2000
                })
              } else {
                toast.error('保存图片URL失败', {
                  description: response.message || '请稍后重试',
                  duration: 2000
                })
              }
            }
          }
        )
        // 上传图片到服务器
        // 注意：这里假设后端有处理图片上传并返回URL的接口
        // 可以根据实际API调整
      } catch (uploadError) {
        console.error('图片上传失败:', uploadError)
        toast.error('图片上传失败', {
          description: '请检查网络连接或图片格式',
          duration: 2000
        })
      }

      // 清空图片预览和选择
      clearSelectedImage()
    }
  } catch (error) {
    console.error('保存内容失败:', error)
    toast.error('保存失败', {
      description: '请检查网络连接后重试',
      duration: 2000
    })
  } finally {
    isSubmitting.value = false
  }
}

// 复制内容到剪贴板
const copyToClipboard = async (content: string, contentType: 'text' | 'image') => {
  try {
    if (contentType === 'text') {
      // 复制文本
      await navigator.clipboard.writeText(content)
      toast.success('复制成功', {
        description: '文本内容已复制到剪贴板',
        duration: 2000
      })
    } else if (contentType === 'image') {
      // 复制图片
      try {
        // 创建一个img元素加载图片
        const img = new Image()
        img.crossOrigin = 'anonymous' // 处理跨域

        img.onload = async () => {
          // 创建Canvas将图片绘制到上面
          const canvas = document.createElement('canvas')
          canvas.width = img.naturalWidth
          canvas.height = img.naturalHeight

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            toast.error('复制失败', {
              description: '无法创建图片上下文',
              duration: 2000
            })
            return
          }

          // 绘制图片到canvas
          ctx.drawImage(img, 0, 0)

          // 将canvas转换为blob
          canvas.toBlob(async (blob) => {
            if (!blob) {
              toast.error('复制失败', {
                description: '无法创建图片数据',
                duration: 2000
              })
              return
            }

            try {
              // 使用Clipboard API复制图片
              const clipboardItem = new ClipboardItem({
                [blob.type]: blob
              })

              await navigator.clipboard.write([clipboardItem])

              toast.success('复制成功', {
                description: '图片已复制到剪贴板',
                duration: 2000
              })
            } catch (err) {
              console.error('复制图片到剪贴板失败:', err)
              // 退化处理 - 提供下载链接
              toast.error('复制失败', {
                description: '您的浏览器不支持复制图片，请直接访问图片链接',
                duration: 3000
              })
              // 打开图片链接
              window.open(content, '_blank')
            }
          }, 'image/png')
        }

        img.onerror = () => {
          toast.error('复制失败', {
            description: '无法加载图片',
            duration: 2000
          })
        }

        // 开始加载图片
        img.src = content
      } catch (err) {
        console.error('处理图片复制失败:', err)
        // 退化处理
        await navigator.clipboard.writeText(content)
        toast.warning('已复制图片链接', {
          description: '您的浏览器不支持直接复制图片',
          duration: 2000
        })
      }
    }
  } catch (err) {
    console.error('复制失败:', err)
    toast.error('复制失败', {
      description: '请手动复制内容',
      duration: 2000
    })
  }
}

// 删除粘贴项
const deletePaste = async (id: number) => {
  try {
    const response = await deletePasteById(id)

    if (response.code === 200) {
      // 从列表中移除被删除的内容
      savedPastes.value = savedPastes.value.filter((paste: PasteItem) => paste.id !== id)

      toast.success('已删除', {
        duration: 2000
      })
    } else {
      toast.error('删除失败', {
        description: response.message || '请稍后重试',
        duration: 2000
      })
    }
  } catch (error) {
    console.error('删除剪贴板内容失败:', error)
    toast.error('删除失败', {
      description: '请检查网络连接后重试',
      duration: 2000
    })
  }
}
</script>

<template>
  <div class="flex flex-col py-4 px-4 overflow-hidden h-[calc(100vh-4rem-1px)]">
    <!-- 横向布局容器 -->
    <div class="flex flex-col lg:flex-row gap-2 flex-1 overflow-hidden">
      <!-- 输入区域 -->
      <Card
        class="mb-4 gap-1 lg:mb-0 lg:w-2/5 lg:self-start bg-card dark:bg-card border border-border dark:border-border shadow-sm dark:shadow-lg"
      >
        <CardHeader class="pb-3 sm:pb-4 lg:pb-6">
          <CardTitle class="text-lg sm:text-xl lg:text-3xl font-bold text-foreground dark:text-foreground">
            剪贴板工具
          </CardTitle>
          <CardDescription class="text-xs sm:text-sm lg:text-base text-muted-foreground dark:text-muted-foreground">
            在此输入您想保存的文本或图片内容
          </CardDescription>
        </CardHeader>
        <CardContent class="p-3 sm:p-4 lg:p-6">
          <div class="space-y-3 sm:space-y-4">
            <!-- 内容类型切换 -->
            <div class="flex items-center space-x-2 sm:space-x-4 mb-2">
              <Button
                variant="outline"
                size="sm"
                :class="{
                  'bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground':
                    contentType === 'text',
                  'border-border dark:border-border hover:bg-accent dark:hover:bg-accent': contentType !== 'text'
                }"
                :disabled="isSubmitting"
                class="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                @click="
                  () => {
                    contentType = 'text'
                    clearSelectedImage()
                  }
                "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <span class="hidden sm:inline">文本内容</span>
                <span class="sm:hidden">文本</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                :class="{
                  'bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground':
                    contentType === 'image',
                  'border-border dark:border-border hover:bg-accent dark:hover:bg-accent': contentType !== 'image'
                }"
                :disabled="isSubmitting"
                class="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                @click="contentType = 'image'"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <span class="hidden sm:inline">图片内容</span>
                <span class="sm:hidden">图片</span>
              </Button>
            </div>

            <!-- 文本输入区域 -->
            <div v-if="contentType === 'text'">
              <Textarea
                v-model="pasteContent"
                placeholder="输入要保存的文本..."
                class="min-h-24 sm:min-h-32 text-sm sm:text-base bg-background dark:bg-background border-border dark:border-border text-foreground dark:text-foreground placeholder:text-muted-foreground dark:placeholder:text-muted-foreground"
                :disabled="isSubmitting"
              />
            </div>

            <!-- 图片上传区域 -->
            <div v-else class="flex flex-col space-y-3 sm:space-y-4">
              <!-- 图片预览区域 -->
              <div
                class="border-2 border-dashed border-border dark:border-border rounded-md p-3 sm:p-4 min-h-24 sm:min-h-32 flex flex-col items-center justify-center cursor-pointer hover:border-primary dark:hover:border-primary transition-colors bg-background dark:bg-background"
                @click="!isSubmitting && ($refs.imageUpload as HTMLInputElement)?.click()"
              >
                <input
                  ref="imageUpload"
                  type="file"
                  class="hidden"
                  accept="image/*"
                  :disabled="isSubmitting"
                  @change="handleImageSelect"
                />

                <!-- 有图片预览时 -->
                <div v-if="imagePreview" class="w-full">
                  <img
                    :src="imagePreview"
                    alt="预览图片"
                    class="max-h-48 sm:max-h-64 mx-auto rounded-md shadow-sm dark:shadow-lg"
                  />
                  <div class="flex justify-end mt-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      :disabled="isSubmitting"
                      class="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                      @click.stop="clearSelectedImage"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4"
                      >
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      </svg>
                      <span class="hidden sm:inline">移除图片</span>
                      <span class="sm:hidden">移除</span>
                    </Button>
                  </div>
                </div>

                <!-- 无图片预览时 -->
                <div v-else class="text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="mx-auto text-muted-foreground dark:text-muted-foreground sm:w-12 sm:h-12"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  <p class="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground dark:text-muted-foreground">
                    <span class="hidden sm:inline">点击选择图片或拖放图片到此处</span>
                    <span class="sm:hidden">点击选择图片</span>
                  </p>
                  <p class="text-xs text-muted-foreground dark:text-muted-foreground hidden sm:block">
                    支持 JPG, PNG, GIF 等常见图片格式
                  </p>
                  <p class="text-xs text-muted-foreground dark:text-muted-foreground">图片大小不超过 5MB</p>
                </div>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <Switch
                id="public-mode"
                v-model:checked="isPublic"
                :disabled="isSubmitting"
                class="data-[state=checked]:bg-primary dark:data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input"
              />
              <Label
                html-for="public-mode"
                class="text-xs sm:text-sm text-foreground dark:text-foreground cursor-pointer"
              >
                <span class="hidden sm:inline">公开内容 (所有用户可见)</span>
                <span class="sm:hidden">公开内容</span>
              </Label>
            </div>
          </div>
        </CardContent>
        <CardFooter class="flex justify-between">
          <Button variant="outline" :disabled="isSubmitting" @click="getFromClipboard">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="mr-2 h-4 w-4"
            >
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            </svg>
            获取剪贴板内容
          </Button>
          <Button :disabled="isSubmitting" @click="addPaste">
            <span v-if="isSubmitting" class="mr-2">
              <!-- 加载指示器 -->
              <svg
                class="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </span>
            {{ isSubmitting ? '保存中...' : '保存内容' }}
          </Button>
        </CardFooter>
      </Card>

      <!-- 已保存的内容列表 -->
      <div class="lg:w-3/5 h-full flex flex-col overflow-hidden">
        <div class="flex flex-wrap justify-between items-center mb-4 gap-2">
          <h2 class="text-xl font-bold">已保存内容</h2>

          <div class="flex items-center space-x-4">
            <!-- 筛选切换 -->
            <div class="flex items-center space-x-2">
              <Switch id="filter-mode" v-model:checked="showPublicPastes" />
              <Label html-for="filter-mode">{{ showPublicPastes ? '显示公开内容' : '显示私密内容' }}</Label>
            </div>

            <!-- 刷新按钮 -->
            <Button variant="outline" size="sm" :disabled="isLoading" @click="loadUserPastes">
              <svg
                v-if="isLoading"
                class="animate-spin -ml-1 mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="mr-2 h-4 w-4"
              >
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              刷新列表
            </Button>
          </div>
        </div>

        <div v-if="isLoading" class="flex-1 flex justify-center items-center">
          <svg
            class="animate-spin h-8 w-8 text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>

        <div v-else class="space-y-4 overflow-y-auto pr-2 flex-1">
          <Card v-for="paste in filteredPastes" :key="paste.id" class="relative overflow-visible">
            <CardHeader class="pb-2">
              <div class="flex justify-between items-center">
                <div>
                  <CardTitle class="text-sm text-muted-foreground flex items-center">
                    <span>{{ new Date(paste.createdAt).toLocaleString() }}</span>
                    <span
                      class="ml-2 inline-flex items-center rounded-full px-2 py-1 text-xs"
                      :class="
                        paste.isPublic
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                      "
                    >
                      {{ paste.isPublic ? '公开' : '私密' }}
                    </span>
                  </CardTitle>
                  <p class="text-xs text-muted-foreground mt-1">创建者: {{ paste.creator?.name || '未知用户' }}</p>
                </div>
                <div class="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    class="h-8 w-8 p-0"
                    @click="copyToClipboard(paste.content, paste.contentType)"
                  >
                    <span class="sr-only">复制</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="h-4 w-4"
                    >
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                    </svg>
                  </Button>
                  <Button variant="ghost" size="sm" class="h-8 w-8 p-0 text-destructive" @click="deletePaste(paste.id)">
                    <span class="sr-only">删除</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="h-4 w-4"
                    >
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <!-- 根据内容类型显示不同内容 -->
              <div v-if="paste.contentType === 'text'">
                <p class="whitespace-pre-wrap">{{ paste.content }}</p>
              </div>

              <div v-else-if="paste.contentType === 'image'" class="flex justify-center">
                <img :src="paste.content" alt="图片内容" class="max-h-64 rounded-md object-contain" />
              </div>

              <div v-else>
                <p class="whitespace-pre-wrap">{{ paste.content }}</p>
              </div>
            </CardContent>
          </Card>

          <div v-if="filteredPastes.length === 0" class="text-center py-8 text-muted-foreground">
            <p v-if="savedPastes.length === 0">暂无保存的内容</p>
            <p v-else>没有{{ showPublicPastes ? '公开' : '私密' }}的内容</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
