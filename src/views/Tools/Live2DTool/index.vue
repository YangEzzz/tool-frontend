<script setup lang="ts"></script>

<template>1</template>

<style scoped></style>

<!--
<script setup lang="ts">
import Live2D from './Live2D.vue'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { message, UploadChangeParam, UploadProps, notification, TourProps, Modal } from 'ant-design-vue'
import { FolderOpenOutlined, UploadOutlined } from '@ant-design/icons-vue'
import axios from 'axios'
const aspectRatio = ref(0.15)
const angle = ref(0)
const anchor = ref({
  x: 0.5,
  y: 0.5
})
const uploadRef = ref()
const clearRef = ref()
const uploading = ref(false)
const tour = ref(false)
const uploadProgress = ref({
  total: 0,
  loaded: 0
})
const steps: TourProps['steps'] = [
  {
    title: 'Upload File',
    description: '点击上传模型资源',
    target: () => uploadRef.value && uploadRef.value.$el
  },
  {
    title: 'Remove File',
    description: '点击可以清空模型，重新选择文件夹上传',
    target: () => clearRef.value && clearRef.value.$el
  }
]
const show = ref(true)
const modelPath = ref('')
const fileList = ref([])
const l2dRef = ref()

const widthResize = ref()
const heightResize = ref()
const screen = ref()
const container = ref()
const phoneType = ref('iPhone X')
const motionFileList = ref([])
const motionDrawer = ref(false)
const hitFrameVisible = ref(false)

const l2dList = ref([])

const phoneTypeMap = {
  'iPhone 6/7/8 Plus': { width: 414, height: 736, label: '414x736' },
  'iPhone 6/7/8': { width: 375, height: 667, label: '375x667' },
  'iPhone X': { width: 375, height: 812, label: '375x812' },
  'iPhone 5/SE': { width: 320, height: 568, label: '320x568' },
  'iPhone 4': { width: 320, height: 480, label: '320x480' },
  'Pixel 7': { width: 412, height: 915, label: '412x915' },
  'iPhone 12 Pro': { width: 390, height: 844, label: '390x844' },
  'iPhone 14 Pro Max': { width: 430, height: 932, label: '430x932' },
  'iPhone SE': { width: 375, height: 667, label: '375x667' },
  'iPhone XR': { width: 414, height: 896, label: '414x896' },
  'Pixel 4': { width: 353, height: 745, label: '353x745' },
  'Galaxy S9+': { width: 320, height: 658, label: '320x658' },
  'OnePlus 10T': { width: 412, height: 915, label: '412x915' }
}

const nowWidth = ref(375)
const nowHeight = ref(812)

const changeSize = (flag: boolean) => {
  if (flag) {
    screen.value.style.width = nowWidth.value + 'px'
  } else {
    screen.value.style.height = nowHeight.value + 'px'
  }
}

const changePhoneType = (value) => {
  console.log(value)
  nowWidth.value = phoneTypeMap[value].width
  nowHeight.value = phoneTypeMap[value].height
  screen.value.style.width = nowWidth.value + 'px'
  screen.value.style.height = nowHeight.value + 'px'
  nextTick(() => {
    reset()
  })
}

const changeHadModel = (value) => {
  if (value) {
    reset()
  } else {
    clear()
  }
}

const tourClose = () => {
  tour.value = false
  localStorage.setItem('new', 'true')
}

const reset = () => {
  l2dRef.value.loading = true
  nextTick(async () => {
    try {
      await l2dRef.value.createNewModel()
    } catch (e) {
      message.error(e)
    }
    const motionManager = l2dRef.value.erosModel.model.internalModel.motionManager
    const motionGroups = []

    const definitions = motionManager.definitions

    for (const [group, motions] of Object.entries(definitions)) {
      motionGroups.push({
        name: group,
        motions:
          motions
            ?.map((motion, index) => ({
              file: motion.file || motion.File || '',
              error: motionManager.motionGroups[group]![index]! === null ? 'Failed to load' : undefined
            }))
            .filter((item) => item.file) || []
      })
    }
    motionDrawer.value = true
    motionFileList.value = motionGroups
    console.log(motionGroups)
  })
}

const clear = () => {
  l2dRef.value.loading = false
  fileList.value = []
  modelPath.value = ''
  l2dRef.value.deleteModel()
  motionDrawer.value = false
  motionFileList.value = []
  hitFrameVisible.value = false
}

const initDrag = () => {
  const isNew = localStorage.getItem('new')
  if (!isNew) {
    localStorage.setItem('new', String(false))
  }
  // 鼠标按下事件
  widthResize.value.onmousedown = function (e) {
    //颜色改变提醒
    widthResize.value.style.background = '#818181'
    const startX = e.clientX
    widthResize.value.left = widthResize.value.offsetLeft
    // 鼠标拖动事件
    document.onmousemove = function (e) {
      const endX = e.clientX
      let moveLen = widthResize.value.left + (endX - startX) // （endx-startx）=移动的距离。widthResize.value.left+移动的距离=左边区域最后的宽度
      const maxT = container.value.clientWidth - widthResize.value.offsetWidth // 容器宽度 - 左边区域的宽度 = 右边区域的宽度

      if (moveLen < 200) moveLen = 200 // 最小宽度为200px
      if (moveLen > 500) moveLen = 500 //最大宽度为500px

      widthResize.value.style.left = moveLen // 设置左侧区域的宽度

      screen.value.style.width = moveLen + 'px'
      nowWidth.value = moveLen
    }
    // 鼠标松开事件
    document.onmouseup = function (evt) {
      //颜色恢复
      widthResize.value.style.background = '#d6d6d6'
      document.onmousemove = null
      document.onmouseup = null
      reset()
      widthResize.value.releaseCapture && widthResize.value.releaseCapture() //当你不在需要继续获得鼠标消息就要应该调用ReleaseCapture()释放掉
    }
    widthResize.value.setCapture && widthResize.value.setCapture() //该函数在属于当前线程的指定窗口里设置鼠标捕获
    return false
  }
  // 鼠标按下事件
  heightResize.value.onmousedown = function (e) {
    //颜色改变提醒
    heightResize.value.style.background = '#818181'
    const startY = e.clientY
    heightResize.value.top = heightResize.value.offsetTop
    // 鼠标拖动事件
    document.onmousemove = function (e) {
      const endY = e.clientY
      let moveLen = heightResize.value.top + (endY - startY) // （endx-startx）=移动的距离。heightResize.value.left+移动的距离=左边区域最后的宽度

      if (moveLen < 200) moveLen = 200 // 最小高度为200px
      if (moveLen > 900) moveLen = 900 // 最大高度为1000px

      heightResize.value.style.top = moveLen // 设置左侧区域的宽度

      screen.value.style.height = moveLen + 'px'
      nowHeight.value = moveLen
    }
    // 鼠标松开事件
    document.onmouseup = function (evt) {
      //颜色恢复
      heightResize.value.style.background = '#d6d6d6'
      document.onmousemove = null
      document.onmouseup = null
      heightResize.value.releaseCapture && heightResize.value.releaseCapture() //当你不在需要继续获得鼠标消息就要应该调用ReleaseCapture()释放掉
    }
    heightResize.value.setCapture && heightResize.value.setCapture() //该函数在属于当前线程的指定窗口里设置鼠标捕获
    return false
  }
}

const getLive2dList = () => {
  axios.post('https://frontend.yangezzz.top:3001/l2d_list').then((res) => {
    console.log(res.data)
    l2dList.value = res.data
  })
}

getLive2dList()

const startMotion = (item, index) => {
  console.log(item)
  l2dRef.value.erosModel.motionTrigger(item, index)
}

const handleRemove: UploadProps['onRemove'] = (file) => {
  const index = fileList.value.indexOf(file)
  const newFileList = fileList.value.slice()
  newFileList.splice(index, 1)
  fileList.value = newFileList
}

const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  fileList.value = [...(fileList.value || []), file]
  if (localStorage.getItem('new') === 'false') {
    tour.value = true
  }
  return false
}

const handleUpload = async () => {
  tour.value = false

  const folderName = fileList.value[0].webkitRelativePath.substring(0, fileList.value[0].webkitRelativePath.lastIndexOf('/'))
  const res = await axios.post('https://frontend.yangezzz.top:3001/is_live2d_exist', {
    folderName
  })

  if (res.data.is_exist) {
    Modal.confirm({
      title: '提示',
      content: '文件已存在，是否覆盖？',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消并清空页面文件列表',
      onOk() {
        uploadFunc()
      },
      onCancel() {
        fileList.value = []
      }
    })
  } else {
    uploadFunc()
  }
}

const uploadFunc = () => {
  const formData = new FormData()
  fileList.value.forEach((file: UploadProps['fileList'][number]) => {
    formData.append('files', file as File)
  })
  uploading.value = true

  // You can use any AJAX library you like
  axios
    .post('https://frontend.yangezzz.top:3001/upload', formData, {
      onUploadProgress: ({ total, loaded }) => {
        console.log(total, loaded)
        uploadProgress.value.total = total
        uploadProgress.value.loaded = loaded
      }
    })
    .then((res: axios.AxiosResponse<{ modelUrl: string }>) => {
      uploading.value = false
      modelPath.value = res.data.modelUrl
      message.success({
        content: '上传成功，等待模型自动渲染中',
        duration: 2
      })
      getLive2dList()
      reset()
    })
    .catch(() => {
      uploading.value = false
      message.error({
        content: '上传失败，刷新页面重试或联系作者yorenz',
        duration: 3
      })
    })
}

onMounted(() => {
  initDrag()
})

watch(hitFrameVisible, (val) => {
  console.log(val)
  l2dRef.value?.erosModel?.setHitAreaFrames?.(val)
})
</script>

<template>
  <div
    ref="container"
    class="container"
  >
    <div>
      <div
        ref="screen"
        class="phone-screen"
        id="modelContainer"
      >
        <Live2D
          ref="l2dRef"
          v-if="show"
          :asset-url="modelPath"
          :params="{
            aspectRatio,
            angle: angle / 360,
            anchor: {
              x: anchor.x,
              y: anchor.y
            }
          }"
        />
        <div
          ref="widthResize"
          class="width-adjust resize"
        >
          ⋮
        </div>
        <div
          ref="heightResize"
          class="height-adjust"
        >
          ···
        </div>
      </div>
      <div class="flex-center-center mt-16">
        <a-input-number
          v-model:value="nowWidth"
          @change="changeSize(true)"
          :min="200"
          :max="500"
          :step="1"
        />
        *
        <a-input-number
          v-model:value="nowHeight"
          @change="changeSize(false)"
          :min="200"
          :max="900"
          :step="1"
        />
      </div>
    </div>

    <div class="params-operate w-full">
      <a-row :gutter="128">
        <a-col :span="12">
          <a-button
            ref="clearRef"
            type="primary"
            @click="clear"
            :disabled="!modelPath"
          >
            清空模型
          </a-button>
        </a-col>
        <a-col :span="12">
          <a-checkbox v-model:checked="hitFrameVisible"> 显示触发区域 </a-checkbox>
        </a-col>
      </a-row>
      <a-row :gutter="12">
        <a-col :span="5">
          <a-form-item label="机型">
            <a-select
              class="w-full"
              v-model:value="phoneType"
              @change="changePhoneType"
            >
              <a-select-option
                v-for="(value, key) in phoneTypeMap"
                :key="key"
                :value="key"
              />
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="19">
          <a-form-item label="已上传模型列表">
            <a-select
              class="w-full"
              v-model:value="modelPath"
              @change="changeHadModel"
            >
              <a-select-option
                v-for="item in l2dList"
                :key="item.id"
                :value="item.l2d_url"
              >
                {{ item.l2d_folder_name }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <a-form>
        <a-form-item label="模型文件链接">
          <a-input
            v-model:value="modelPath"
            disabled
          />
        </a-form-item>
        <a-form-item label="放大倍数(0.01~1)">
          <a-input-number
            v-model:value="aspectRatio"
            :min="0"
            :max="4"
            :step="0.01"
          />
          <a-slider
            v-model:value="aspectRatio"
            :step="0.01"
            :min="0"
            :max="3"
          />
        </a-form-item>
        <a-form-item label="旋转角度(0~360)">
          <a-input-number
            v-model:value="angle"
            :min="0"
            :max="360"
            :step="1"
          />
          <a-slider
            v-model:value="angle"
            :step="1"
            :min="0"
            :max="360"
          />
        </a-form-item>
        <a-form-item label="中心点(0~1)">
          <div class="flex-start-center">
            <a-input-number
              class="mr-16"
              v-model:value="anchor.x"
              :min="0"
              :max="1"
              :step="0.01"
            >
              <template #addonBefore>水平位置</template>
            </a-input-number>

            <a-input-number
              v-model:value="anchor.y"
              :min="0"
              :max="1"
              :step="0.01"
            >
              <template #addonBefore>竖直位置</template>
            </a-input-number>
          </div>
        </a-form-item>
      </a-form>

      <div class="upload">
        <a-tour
          :open="tour"
          :mask="false"
          type="primary"
          :steps="steps"
          @close="tourClose"
        />
        <div class="mr-16 flex-start-center flex-column">
          <a-button
            ref="uploadRef"
            type="primary"
            :disabled="fileList.length === 0 || Boolean(modelPath)"
            :loading="uploading"
            @click="handleUpload"
            class="mb-16"
          >
            {{ uploading ? '上传中' : '开始上传' }}
          </a-button>
          <a-progress
            v-if="uploading"
            type="circle"
            :percent="Number(((uploadProgress.loaded / uploadProgress.total) * 100).toFixed(0))"
          />
        </div>
        <a-upload
          :file-list="fileList"
          directory
          :before-upload="beforeUpload"
          @remove="handleRemove"
        >
          <a-button :disabled="Boolean(modelPath)">
            <UploadOutlined />
            选择文件夹
          </a-button>
        </a-upload>
      </div>
    </div>
    <a-drawer
      v-model:open="motionDrawer"
      width="400"
      :closable="false"
      title="Motion"
      placement="right"
      :mask="false"
    >
      <div
        v-for="(motion, index) in motionFileList"
        class="pb-16 fsize-16"
        :key="index"
      >
        {{ motion.name }}
        <div
          v-for="(file, fileIndex) in motion.motions"
          :key="fileIndex"
          class="pt-6 fsize-14"
        >
          <a-button
            type="link"
            @click="startMotion(motion.name, fileIndex)"
          >
            {{ file.file }}
          </a-button>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<style scoped lang="scss">
.container {
  display: flex;
  column-gap: 16px;
  place-content: center center;
  width: 100%;
  height: 100%;
  padding: 16px 400px 16px 16px;
  border-radius: 8px;
}

.phone-screen {
  position: relative;
  width: 375px;
  height: 812px;
  margin: 8px;
  border: 2px solid black;

  .width-adjust {
    position: absolute;
    top: calc(50% - 4px);
    right: -6px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 10px;
    height: 50px;
    font-size: 32px;
    cursor: col-resize;
    background-color: #d6d6d6;
    border-radius: 5px;
  }

  .height-adjust {
    position: absolute;
    bottom: -6px;
    left: calc(50% - 25px);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 10px;
    font-size: 20px;
    cursor: row-resize;
    background-color: #d6d6d6;
    border-radius: 5px;
  }
}

.params-operate {
  display: flex;
  flex: 1;
  flex-direction: column;
  row-gap: 16px;
  height: 100%;
  padding: 16px;

  .upload {
    display: flex;
    flex: 1;
    width: 100%;
    overflow: hidden;

    :deep(.ant-upload-wrapper) {
      display: flex;
      flex: 1;
      flex-direction: column;
      height: 100%;
    }

    :deep(.ant-upload-list) {
      flex: 1;
      overflow: auto;

      &::-webkit-scrollbar {
        width: 3px;
      }

      &::-webkit-scrollbar-track {
        background: #f1f1f1;
      }

      &::-webkit-scrollbar-thumb {
        background: #888;
      }
    }
  }
}
</style>

-->

<!--
<script setup lang="ts">
import { Live2dCreator } from '../utils/live2d.ts'
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
  <div id="live2d-container">
    <canvas
      id="live2d"
      style="background-color: transparent"
    ></canvas>
    <div class="load flex-center-center flex-column">
      {{ loadingText }}
    </div>
  </div>
</template>

<style scoped lang="scss">
.load {
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  width: 100%;
  height: 100%;

  .load-img {
    width: 100%;
    height: 10%;
    background-size: contain;
  }
}

#live2d-container {
  position: absolute;
  z-index: 0;
  width: 100%;
  height: 100%;

  &::-webkit-scrollbar {
    display: none;
  }
}

#live2d-container::before {
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
  content: '';
}

#live2d {
  width: 100%;
  height: 100%;
}
</style>

-->
