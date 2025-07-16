<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// import { fetchAllMenus, createMenu, updateMenu, deleteMenu } from '@/api/menu'
import type { MenuItem, CreateMenuRequest } from '@/api/menu/types'
import { MoreHorizontal, Plus, Edit, Trash2, FolderTree } from 'lucide-vue-next'

// 响应式数据
const menus = ref<MenuItem[]>([])
const loading = ref(false)
const dialogOpen = ref(false)
const editingMenu = ref<MenuItem | null>(null)

// 表单数据
const formData = ref<CreateMenuRequest>({
  name: '',
  path: '',
  component: '',
  icon: '',
  permissionCode: '',
  parentId: 0
})

// 计算属性：扁平化菜单列表用于表格显示
const flatMenus = computed(() => {
  const flatten = (
    items: MenuItem[],
    level = 0,
    parentName = ''
  ): Array<MenuItem & { level: number; parentName: string }> => {
    const result: Array<MenuItem & { level: number; parentName: string }> = []

    items.forEach((item) => {
      result.push({
        ...item,
        level,
        parentName
      })

      if (item.children && item.children.length > 0) {
        result.push(...flatten(item.children, level + 1, item.name))
      }
    })

    return result
  }

  return flatten(menus.value)
})

// 计算属性：可选择的父菜单列表
const parentMenuOptions = computed(() => {
  const options: Array<{ value: number | null; label: string }> = [{ value: null, label: '无父菜单（顶级菜单）' }]

  const addOptions = (items: MenuItem[], prefix = '') => {
    items.forEach((item) => {
      options.push({
        value: item.id,
        label: `${prefix}${item.name}`
      })

      if (item.children && item.children.length > 0) {
        addOptions(item.children, `${prefix}${item.name} / `)
      }
    })
  }

  addOptions(menus.value)
  return options
})

// 获取菜单列表
const fetchMenus = async () => {
  try {
    loading.value = true
    // 暂时使用模拟数据，因为接口可能还没有实现
    // const response = await fetchAllMenus()
    // menus.value = response.data || []

    // 模拟数据
    menus.value = [
      {
        id: 4,
        name: '控制台',
        path: '/dashboard',
        component: 'Dashboard',
        icon: 'dashboard',
        permissionCode: 'dashboard',
        children: []
      },
      {
        id: 1,
        name: '常用工具',
        path: '/tool',
        component: '',
        icon: '',
        permissionCode: '',
        children: [
          {
            id: 9,
            name: '占位图',
            path: '/textToImg',
            component: 'Tools/TextToImg',
            icon: '',
            permissionCode: '',
            children: []
          },
          {
            id: 3,
            name: '表单生成器',
            path: '/form',
            component: 'Tools/FormGenerator',
            icon: '',
            permissionCode: '',
            children: []
          },
          {
            id: 10,
            name: '多语言json处理',
            path: '/i18Json',
            component: 'Tools/I18nJson',
            icon: '',
            permissionCode: '',
            children: []
          },
          {
            id: 6,
            name: '剪贴板',
            path: '/paste',
            component: 'Tools/Paste',
            icon: 'team',
            permissionCode: 'role:view',
            children: []
          }
        ]
      },
      {
        id: 5,
        name: '用户管理',
        path: '/users',
        component: 'UserManagement',
        icon: 'user',
        permissionCode: 'user:view',
        children: []
      },
      {
        id: 7,
        name: '菜单管理',
        path: '/menus',
        component: 'MenuManagement',
        icon: 'menu',
        permissionCode: 'menu:view',
        children: []
      }
    ]
  } catch (error) {
    console.error('获取菜单列表失败:', error)
    toast.error('获取菜单列表失败')
  } finally {
    loading.value = false
  }
}

// 重置表单
const resetForm = () => {
  formData.value = {
    name: '',
    path: '',
    component: '',
    icon: '',
    permissionCode: '',
    parentId: 0
  }
  editingMenu.value = null
}

// 打开新增对话框
const openCreateDialog = () => {
  resetForm()
  dialogOpen.value = true
}

// 打开编辑对话框
const openEditDialog = (menu: MenuItem) => {
  editingMenu.value = menu
  formData.value = {
    name: menu.name,
    path: menu.path,
    component: menu.component,
    icon: menu.icon,
    permissionCode: menu.permissionCode,
    parentId: getParentId(menu.id)
  }
  dialogOpen.value = true
}

// 获取菜单的父ID
const getParentId = (menuId: number): number => {
  const findParent = (items: MenuItem[], targetId: number): number => {
    for (const item of items) {
      if (item.children.some((child) => child.id === targetId)) {
        return item.id
      }

      const parentId = findParent(item.children, targetId)
      if (parentId !== null) {
        return parentId
      }
    }
    return 0
  }

  return findParent(menus.value, menuId)
}

// 保存菜单
const saveMenu = async () => {
  try {
    if (!formData.value.name.trim()) {
      toast.error('菜单名称不能为空')
      return
    }

    loading.value = true

    // 模拟保存操作
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (editingMenu.value) {
      // 模拟更新菜单
      toast.success('菜单更新成功（模拟）')
    } else {
      // 模拟创建菜单
      toast.success('菜单创建成功（模拟）')
    }

    dialogOpen.value = false
    await fetchMenus()
  } catch (error) {
    console.error('保存菜单失败:', error)
    toast.error('保存菜单失败')
  } finally {
    loading.value = false
  }
}

// 删除菜单
const handleDeleteMenu = async (menu: MenuItem) => {
  if (!confirm(`确定要删除菜单"${menu.name}"吗？`)) {
    return
  }

  try {
    loading.value = true
    // 模拟删除操作
    await new Promise((resolve) => setTimeout(resolve, 1000))
    toast.success('菜单删除成功（模拟）')
    await fetchMenus()
  } catch (error) {
    console.error('删除菜单失败:', error)
    toast.error('删除菜单失败')
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchMenus()
})
</script>

<template>
  <div class="container mx-auto p-6 space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">菜单管理</h1>
        <p class="text-muted-foreground">管理系统菜单结构和权限</p>
      </div>
      <Button class="flex items-center gap-2" @click="openCreateDialog">
        <Plus class="h-4 w-4" />
        新增菜单
      </Button>
    </div>

    <!-- 菜单表格 -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <FolderTree class="h-5 w-5" />
          菜单列表
        </CardTitle>
        <CardDescription> 系统中所有菜单的层级结构和配置信息 </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>菜单名称</TableHead>
                <TableHead>路径</TableHead>
                <TableHead>组件</TableHead>
                <TableHead>图标</TableHead>
                <TableHead>权限代码</TableHead>
                <TableHead>父菜单</TableHead>
                <TableHead class="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-if="loading">
                <TableCell colspan="7" class="text-center py-8">
                  <div class="flex items-center justify-center gap-2">
                    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    加载中...
                  </div>
                </TableCell>
              </TableRow>
              <TableRow v-else-if="flatMenus.length === 0">
                <TableCell colspan="7" class="text-center py-8 text-muted-foreground"> 暂无菜单数据 </TableCell>
              </TableRow>
              <TableRow v-for="menu in flatMenus" v-else :key="menu.id">
                <TableCell>
                  <div class="flex items-center gap-2" :style="{ paddingLeft: `${menu.level * 20}px` }">
                    <span v-if="menu.level > 0" class="text-muted-foreground">└─</span>
                    {{ menu.name }}
                  </div>
                </TableCell>
                <TableCell>
                  <code v-if="menu.path" class="bg-muted px-2 py-1 rounded text-sm">{{ menu.path }}</code>
                  <span v-else class="text-muted-foreground">-</span>
                </TableCell>
                <TableCell>
                  <code v-if="menu.component" class="bg-muted px-2 py-1 rounded text-sm">{{ menu.component }}</code>
                  <span v-else class="text-muted-foreground">-</span>
                </TableCell>
                <TableCell>
                  <span v-if="menu.icon" class="bg-muted px-2 py-1 rounded text-sm">{{ menu.icon }}</span>
                  <span v-else class="text-muted-foreground">-</span>
                </TableCell>
                <TableCell>
                  <code v-if="menu.permissionCode" class="bg-muted px-2 py-1 rounded text-sm">{{
                    menu.permissionCode
                  }}</code>
                  <span v-else class="text-muted-foreground">-</span>
                </TableCell>
                <TableCell>
                  <span v-if="menu.parentName" class="text-sm">{{ menu.parentName }}</span>
                  <span v-else class="text-muted-foreground text-sm">顶级菜单</span>
                </TableCell>
                <TableCell class="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal class="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem class="flex items-center gap-2" @click="openEditDialog(menu)">
                        <Edit class="h-4 w-4" />
                        编辑
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        class="flex items-center gap-2 text-destructive focus:text-destructive"
                        @click="handleDeleteMenu(menu)"
                      >
                        <Trash2 class="h-4 w-4" />
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <!-- 新增/编辑菜单对话框 -->
    <Dialog v-model:open="dialogOpen">
      <DialogContent class="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{{ editingMenu ? '编辑菜单' : '新增菜单' }}</DialogTitle>
          <DialogDescription>
            {{ editingMenu ? '修改菜单信息' : '创建新的菜单项' }}
          </DialogDescription>
        </DialogHeader>

        <div class="grid gap-4 py-4">
          <!-- 菜单名称 -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="name" class="text-right">菜单名称 *</Label>
            <Input id="name" v-model="formData.name" placeholder="请输入菜单名称" class="col-span-3" />
          </div>

          <!-- 菜单路径 -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="path" class="text-right">菜单路径</Label>
            <Input id="path" v-model="formData.path" placeholder="如：/dashboard" class="col-span-3" />
          </div>

          <!-- 组件路径 -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="component" class="text-right">组件路径</Label>
            <Input id="component" v-model="formData.component" placeholder="如：Dashboard" class="col-span-3" />
          </div>

          <!-- 图标 -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="icon" class="text-right">图标</Label>
            <Input id="icon" v-model="formData.icon" placeholder="如：dashboard" class="col-span-3" />
          </div>

          <!-- 权限代码 -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="permissionCode" class="text-right">权限代码</Label>
            <Input
              id="permissionCode"
              v-model="formData.permissionCode"
              placeholder="如：menu:view"
              class="col-span-3"
            />
          </div>

          <!-- 父菜单 -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="parentId" class="text-right">父菜单</Label>
            <Select v-model="formData.parentId">
              <SelectTrigger class="col-span-3">
                <SelectValue placeholder="选择父菜单" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="option in parentMenuOptions" :key="option.value || 'null'" :value="option.value">
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="dialogOpen = false">取消</Button>
          <Button :disabled="loading" @click="saveMenu">
            {{ loading ? '保存中...' : '保存' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<style scoped>
/* 自定义样式 */
.container {
  max-width: 1200px;
}

/* 表格行悬停效果 */
:deep(.table-row:hover) {
  background-color: var(--muted);
}

/* 层级缩进样式 */
.menu-level-indent {
  border-left: 1px solid var(--border);
  margin-left: 10px;
  padding-left: 10px;
}
</style>
