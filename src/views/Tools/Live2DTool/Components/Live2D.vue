<script setup lang="ts">
import { Live2dCreator } from '@/utils/live2d.ts'
import { MotionPriority } from 'pixi-live2d-display/cubism4'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    params: any
    assetUrl: string
  }>(),
  {}
)
const loading = ref(false)
const erosModel = ref()

const createNewModel = async () => {
  loading.value = true
  deleteModel()
  console.log(props.assetUrl, 'ssss')
  erosModel.value = new Live2dCreator({
    modelJson: props.assetUrl.replace('http://154.196.245.64', 'http://frontend.yangezzz.top'),
    canvasID: 'live2d',
    containerID: 'modelContainer',
    params: {
      aspectRatio: props.params.aspectRatio,
      angle: props.params.angle,
      anchor: props.params.anchor
    }
  })
  try {
    await erosModel.value.initModel(() => {
      loading.value = false
    })
  } catch (e) {
    console.warn(e)
  }
  erosModel.value.registerHitEvent((hitAreaNames: string[]) => {
    console.log(hitAreaNames)
    const motionName = hitAreaNames[0]
    erosModel.value.motionTrigger(motionName, undefined, MotionPriority.FORCE)
  })
}

const loadingText = computed(() => {
  if (loading.value) {
    return '模型加载中'
  }
  if (!props.assetUrl && !erosModel.value) {
    return '等待模型文件'
  } else if (props.assetUrl && !erosModel.value) {
    return '等待渲染模型文件'
  }
  return ''
})

const deleteModel = () => {
  ;(window as any)?.erosModel?.destroy(true, true, true)
  delete (window as any).erosModel
  erosModel.value = undefined
}

onMounted(async () => {
  // await createNewModel()
})

watch(
  () => props.params.angle,
  (val) => {
    erosModel.value.setAngle(val)
  }
)
watch(
  () => props.params.aspectRatio,
  (val) => {
    erosModel.value.setScale(val)
  }
)
watch(
  () => props.params.anchor,
  (val) => {
    erosModel.value?.setAnchor(val.x, val.y)
  }
)

onBeforeUnmount(() => {
  delete (window as any).erosModel
})

defineExpose({
  createNewModel,
  deleteModel,
  erosModel,
  loading
})
</script>

<template>
  <div id="live2d-container" class="absolute z-0 w-full h-full [&::-webkit-scrollbar]:hidden">
    <canvas id="live2d" class="w-full h-full bg-transparent"></canvas>
    <div class="absolute top-0 left-0 -z-10 w-full h-full flex items-center justify-center flex-col">
      {{ loadingText }}
    </div>
  </div>
</template>

<style scoped></style>
