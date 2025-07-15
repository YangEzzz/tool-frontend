<script setup lang="ts">
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
</script>

<template>
  <div class="flex flex-col p-6 w-full">
    <Tabs default-value="account" class="w-[400px]">
      <TabsList>
        <TabsTrigger value="account"> 代码生成器 </TabsTrigger>
        <TabsTrigger value="password"> 代码内容 </TabsTrigger>
      </TabsList>
      <TabsContent value="account"> Make changes to your account here. </TabsContent>
      <TabsContent value="password"> Change your password here. </TabsContent>
    </Tabs>
  </div>
</template>

<style scoped></style>
