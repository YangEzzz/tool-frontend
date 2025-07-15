<script setup lang="ts">
import { ref } from 'vue'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'vue-sonner'

const key = ref('')
const value = ref('')
const result = ref('')

const output = () => {
  console.log(key.value)
  const keyArr = key.value.split('\n')
  const valueArr = value.value.split('\n')
  console.log(keyArr, valueArr)
  result.value = keyArr.map((k, i) => `"${k.trim()}": "${valueArr[i].trim()}",`).join('\n')
  console.log(result.value)
}

const reverseOutput = () => {
  // 反向输出 用result输出key和value
  const resultArr = result.value.split('\n')
  key.value = resultArr
    .map((r) => r.split(':')[0].replace(/"/g, ''))
    .join('\n')
    .trim()
  value.value = resultArr
    .map((r) => {
      // 最后一个字符如果是逗号，则去掉
      r = r.split(':')[1].replace(/"/g, '')
      if (r.endsWith(',')) {
        r = r.slice(0, -1)
      }
      return r
    })
    .join('\n')
}

const getClipKey = async () => {
  key.value = await navigator.clipboard.readText()
}

const getClipValue = async () => {
  value.value = await navigator.clipboard.readText()
}

const copyToClipboard = async (content: string, contentType: 'text' | 'image') => {
  try {
    if (contentType === 'text') {
      // 复制文本
      await navigator.clipboard.writeText(content)
      toast.success('复制成功', {
        duration: 2000,
        position: 'top-center'
      })
    }
  } catch (err) {
    console.error('复制失败:', err)
  }
}
</script>

<template>
  <div class="p-4 h-full">
    <div class="flex justify-center items-center w-full h-full gap-x-6">
      <div class="shrink-0 flex-1">
        <Button class="mb-4" @click="getClipKey">粘贴</Button>
        <Textarea v-model="key" style="height: 600px" type="textarea" :row="10" placeholder="键名" />
      </div>
      <div class="shrink-0 flex-1">
        <Button class="mb-4" @click="getClipValue">粘贴</Button>
        <Textarea v-model="value" style="height: 600px" type="textarea" :row="10" placeholder="翻译" />
      </div>
      <div class="shrink-0 flex flex-col justify-center gap-y-4">
        <Button @click="output">输出</Button>
        <Button @click="reverseOutput">反向输出</Button>
      </div>
      <div class="shrink-0 flex-1">
        <Button class="mb-4" @click="copyToClipboard(result, 'text')">复制</Button>
        <Textarea v-model="result" style="height: 600px" type="textarea" :row="5" placeholder="结果" />
      </div>
    </div>
    <div class="mt-4 h-full">
      <Card class="p-4 h-full">
        使用方法：从腾讯文档翻译表内直接复制键名、翻译进对应文本框，点击输出按钮，即可生成json格式对象，可直接复制到json文件中
      </Card>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
