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
import { fetchAllMenus, createMenu, updateMenu, deleteMenu } from '@/api/menu'
import type { MenuItem, CreateMenuRequest } from '@/api/menu/types'
import { MoreHorizontal, Plus, Edit, Trash2, FolderTree } from 'lucide-vue-next'
import { Switch } from '@/components/ui/switch'
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput
} from '@/components/ui/number-field'
import {
  AlertDialog,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogContent
} from '@/components/ui/alert-dialog'

const roleMap = [
  {
    id: 1,
    name: '用户'
  },
  {
    id: 2,
    name: '管理员'
  },
  {
    id: 3,
    name: '超级管理员'
  }
]

// 响应式数据
const menus = ref<MenuItem[]>([])
const loading = ref(false)
const dialogOpen = ref(false)
const editingMenu = ref<MenuItem | null>(null)
const showDeleteDialog = ref(false)
const menuToDelete = ref<MenuItem | null>(null)

// 表单数据
const formData = ref<CreateMenuRequest>({
  name: '',
  path: '',
  component: '',
  icon: '',
  sort: 0,
  visible: true,
  permission_code: [],
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
  const options: Array<{ value: number | null; label: string }> = [{ value: 0, label: '无父菜单（顶级菜单）' }]

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
    const response = await fetchAllMenus()
    menus.value = response.data || []
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
    permission_code: [],
    sort: 0,
    visible: true,
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
    sort: menu.sort,
    visible: menu.visible,
    permission_code: menu.permission_code,
    parentId: menu.parentId
  }
  dialogOpen.value = true
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
    console.log(formData.value, 'formData')
    if (editingMenu.value) {
      await updateMenu({
        ...formData.value,
        id: editingMenu.value.id
      })
      toast.success('菜单更新成功')
    } else {
      await createMenu(formData.value)
      toast.success('菜单创建成功')
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
const handleDeleteMenu = async () => {
  try {
    loading.value = true
    // 模拟删除操作
    await deleteMenu(menuToDelete.value!.id)
    toast.success('菜单删除成功')
    await fetchMenus()
  } catch (error) {
    console.error('删除菜单失败:', error)
    toast.error('删除菜单失败')
  } finally {
    loading.value = false
  }
}

const closeDeleteDialog = () => {
  menuToDelete.value = null
  showDeleteDialog.value = false
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
                <TableHead>排序值</TableHead>
                <TableHead>可见性</TableHead>
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
              <TableRow v-for="menu in flatMenus" v-else :key="menu.id" :class="menu.level > 0 && 'bg-muted'">
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
                  <code v-if="menu.sort" class="bg-muted px-2 py-1 rounded text-sm">{{ menu.sort }}</code>
                  <span v-else class="text-muted-foreground">-</span>
                </TableCell>
                <TableCell>
                  <Switch v-if="menu.visible !== undefined" v-model:checked="menu.visible" />
                  <span v-else class="text-muted-foreground">-</span>
                </TableCell>
                <TableCell>
                  <code v-if="menu.permission_code" class="bg-muted px-2 py-1 rounded text-sm">{{
                    menu.permission_code
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
                        @click="
                          () => {
                            menuToDelete = menu
                            showDeleteDialog = true
                          }
                        "
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

          <!-- 排序值 -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="sort" class="text-right">排序值</Label>
            <NumberField id="sort" v-model="formData.sort" class="col-span-3">
              <NumberFieldContent>
                <NumberFieldDecrement />
                <NumberFieldInput />
                <NumberFieldIncrement />
              </NumberFieldContent>
            </NumberField>
          </div>

          <!-- 可见性 -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="visible" class="text-right">可见性</Label>
            <Switch v-model:checked="formData.visible" />
          </div>

          <!-- 权限代码 -->
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="permission_code" class="text-right">权限代码</Label>
            <Select v-model="formData.permission_code" multiple>
              <SelectTrigger class="col-span-3">
                <SelectValue placeholder="选择权限代码" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="role in roleMap" :key="role.id" :value="role.id">
                  {{ role.name }}
                </SelectItem>
              </SelectContent>
            </Select>
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
    <AlertDialog v-model:open="showDeleteDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认删除菜单</AlertDialogTitle>
          <AlertDialogDescription>
            您确定要删除菜单 "{{ menuToDelete?.name }}" 吗？此操作不可撤销。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="closeDeleteDialog">取消</AlertDialogCancel>
          <AlertDialogAction class="bg-destructive hover:bg-destructive/90" @click="handleDeleteMenu">
            删除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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
