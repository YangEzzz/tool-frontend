# 菜单管理页面

## 功能概述

菜单管理页面是一个完整的菜单CRUD管理界面，支持以下功能：

### ✨ 主要功能

1. **菜单列表展示**

   - 树形结构显示菜单层级关系
   - 支持多级菜单的可视化展示
   - 显示菜单的完整信息（名称、路径、组件、图标、权限代码等）

2. **新增菜单**

   - 支持创建顶级菜单和子菜单
   - 表单验证确保数据完整性
   - 可选择父菜单建立层级关系

3. **编辑菜单**

   - 修改菜单的所有属性
   - 支持更改菜单的父子关系
   - 实时预览修改效果

4. **删除菜单**
   - 安全删除确认机制
   - 防止误删重要菜单

### 🎨 UI特性

- 使用 **Tailwind CSS** 和 **shadcn-vue** 组件库
- 响应式设计，支持移动端和桌面端
- 现代化的表格和对话框界面
- 直观的操作按钮和下拉菜单

### 📋 菜单数据结构

```typescript
interface MenuItem {
  id: number
  name: string // 菜单名称
  path: string | null // 路由路径
  component: string | null // 组件路径
  icon: string | null // 图标名称
  permission_code: string | null // 权限代码
  children: MenuItem[] // 子菜单列表
}
```

### 🔧 技术实现

- **Vue 3** + **TypeScript** + **Composition API**
- **shadcn-vue** 组件库（Table, Dialog, Button, Input等）
- **Tailwind CSS** 样式框架
- **vue-sonner** 消息提示
- **lucide-vue-next** 图标库

### 📁 文件结构

```
src/views/MenuManagement/
├── index.vue                 # 主页面组件
src/api/menu/
├── index.ts                  # API接口定义
├── types.ts                  # 类型定义
```

### 🚀 使用方法

1. **访问页面**: 导航到 `/menus` 路径
2. **查看菜单**: 页面自动加载并显示菜单树形结构
3. **新增菜单**: 点击"新增菜单"按钮，填写表单信息
4. **编辑菜单**: 点击菜单行的操作按钮，选择"编辑"
5. **删除菜单**: 点击菜单行的操作按钮，选择"删除"

### ⚠️ 注意事项

- 当前版本使用模拟数据进行演示
- 实际使用时需要连接后端API接口
- 删除菜单前请确认是否有子菜单依赖
- 菜单路径应该与前端路由配置保持一致

### 🔄 API接口

页面已预留以下API接口调用：

- `fetchAllMenus()` - 获取所有菜单
- `createMenu(data)` - 创建新菜单
- `updateMenu(data)` - 更新菜单信息
- `deleteMenu(id)` - 删除菜单

### 📝 待完善功能

- [ ] 拖拽排序功能
- [ ] 批量操作功能
- [ ] 菜单图标选择器
- [ ] 权限代码自动补全
- [ ] 菜单预览功能

---

**开发完成时间**: 2025-07-16  
**技术栈**: Vue 3 + TypeScript + Tailwind CSS + shadcn-vue
