import { defineStore } from 'pinia'
import type { RouteRecordRaw, RouteComponent } from 'vue-router'
import router from '@/router'
import type { MenuItem } from '@/api/menu/types'
import Layout from '@/components/Layout/index.vue'
import { RouterView } from 'vue-router'

// 定义一个实用类型，避免TypeScript错误
type AppRouteRecordRaw = {
  path: string
  name?: string | symbol
  meta?: {
    title?: string
    icon?: string | null
    permissions?: string[]
    [key: string]: unknown
  }
  redirect?: string
  component?: RouteComponent | (() => Promise<RouteComponent>)
  children?: AppRouteRecordRaw[]
  alias?: string | string[]
}

// 组件导入映射，Vite不支持完全动态的导入路径
// 使用绝对路径模式
const modules = import.meta.glob(['/src/views/**/index.vue'])

// 输出所有可用的模块路径，用于调试
console.log('可用的模块路径:', Object.keys(modules))

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    routes: [] as AppRouteRecordRaw[],
    menuList: [] as MenuItem[],
    isRoutesGenerated: false
  }),

  getters: {
    // 获取展示用的菜单列表
    getMenus(): MenuItem[] {
      return this.menuList
    }
  },

  actions: {
    // 设置菜单数据
    setMenus(menus: MenuItem[]) {
      this.menuList = menus
    },

    // 根据菜单数据生成路由配置
    generateRoutes(menus: MenuItem[]) {
      const routes: AppRouteRecordRaw[] = []

      // 解析组件路径，获取实际组件
      const getComponent = (componentPath: string) => {
        // 先检查预定义组件
        switch (componentPath) {
          case 'Dashboard':
            return () => import('../views/Dashboard/index.vue')
          case 'Tools/Paste':
            return () => import('../views/Tools/Paste/index.vue')
          case 'UserManagement':
            return () => import('../views/UserManagement/index.vue')
          default: {
            // 尝试从modules中动态获取
            const fullPath = `/src/views/${componentPath}/index.vue`
            if (modules[fullPath]) {
              return modules[fullPath]
            }
            console.warn(`未知组件: ${componentPath}, 使用404组件代替`)
            return () => import('../views/NotFound/index.vue')
          }
        }
      }

      // 将菜单转换为路由 - 确保顶级路由都使用Layout
      const convertTopLevelMenuToRoute = (menu: MenuItem): AppRouteRecordRaw | null => {
        // 跳过无效菜单
        if (!menu.path && (!menu.children || menu.children.length === 0)) {
          return null
        }

        // 处理顶级路径
        const routePath = menu.path || ''

        // 创建顶级路由 - 使用Layout
        const route: AppRouteRecordRaw = {
          path: routePath,
          name: menu.name,
          component: Layout, // 顶级路由统一使用Layout
          meta: {
            title: menu.name,
            icon: menu.icon,
            permissions: menu.permissionCode ? [menu.permissionCode] : []
          },
          children: [] // 初始化children数组
        }

        // 如果有子菜单，递归生成子路由
        if (menu.children && menu.children.length > 0) {
          // 递归处理子菜单
          const childrenRoutes = menu.children
            .map((child) => convertChildMenuToRoute(child, routePath))
            .filter(Boolean) as AppRouteRecordRaw[]

          if (childrenRoutes.length > 0) {
            route.children = childrenRoutes
          }
        } else if (menu.component) {
          // 没有子菜单但有组件，创建一个默认子路由
          route.children = [
            {
              path: '',
              name: `${menu.name}-content`,
              component: getComponent(menu.component),
              meta: {
                title: menu.name,
                permissions: menu.permissionCode ? [menu.permissionCode] : []
              }
            }
          ]
        }

        return route
      }

      // 处理子菜单 - 不使用Layout，直接使用组件
      const convertChildMenuToRoute = (menu: MenuItem, parentPath: string = ''): AppRouteRecordRaw | null => {
        // 跳过无效菜单
        if (!menu.path && (!menu.children || menu.children.length === 0)) {
          return null
        }

        // 处理路径
        let routePath = menu.path || ''

        // 如果不是以 / 开头的路径，且存在父路径，则拼接父路径
        if (routePath && !routePath.startsWith('/') && parentPath) {
          routePath = `${parentPath}/${routePath}`
        }

        // 创建路由
        const route: AppRouteRecordRaw = {
          path: menu.path || '', // 使用相对路径，会自动根据嵌套关系处理
          name: menu.name,
          meta: {
            title: menu.name,
            icon: menu.icon,
            permissions: menu.permissionCode ? [menu.permissionCode] : []
          }
        }

        // 如果有子菜单，使用RouterView并递归生成子路由
        if (menu.children && menu.children.length > 0) {
          route.component = RouterView

          // 递归处理子菜单
          const childrenRoutes = menu.children
            .map((child) => convertChildMenuToRoute(child, routePath))
            .filter(Boolean) as AppRouteRecordRaw[]

          if (childrenRoutes.length > 0) {
            route.children = childrenRoutes
          }
        } else if (menu.component) {
          // 叶子节点，直接使用实际组件
          route.component = getComponent(menu.component)
        } else {
          // 无组件的菜单项使用RouterView
          route.component = RouterView
        }

        return route
      }

      // 转换所有顶级菜单
      menus.forEach((menu) => {
        const route = convertTopLevelMenuToRoute(menu)
        if (route) {
          routes.push(route)
        }
      })

      this.routes = routes
      return routes
    },

    // 动态添加路由
    addRoutes() {
      if (this.isRoutesGenerated) return

      const routes = this.generateRoutes(this.menuList)

      // 动态添加路由到router实例
      routes.forEach((route) => {
        if (route.name && !router.hasRoute(route.name as string)) {
          router.addRoute(route as unknown as RouteRecordRaw)
        }
      })

      // 添加404路由兜底
      if (!router.hasRoute('NotFound')) {
        router.addRoute({
          path: '/:pathMatch(.*)*',
          name: 'NotFound',
          component: () => import('../views/NotFound/index.vue')
        })
      }

      this.isRoutesGenerated = true
    },

    // 重置路由
    resetRoutes() {
      // 移除动态添加的路由
      this.routes.forEach((route) => {
        if (route.name && router.hasRoute(route.name as string)) {
          router.removeRoute(route.name as string)
        }
      })

      this.routes = []
      this.menuList = []
      this.isRoutesGenerated = false
    }
  }
})
