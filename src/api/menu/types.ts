/**
 * 菜单项类型定义
 */
export interface MenuItem {
  id: number
  name: string
  path: string
  component: string
  icon: string
  permissionCode: string
  children: MenuItem[]
}

/**
 * 创建菜单请求参数
 */
export interface CreateMenuRequest {
  name: string
  path?: string
  component?: string
  icon?: string
  permissionCode?: string
  parentId?: number
}

/**
 * 更新菜单请求参数
 */
export interface UpdateMenuRequest {
  id: number
  name?: string
  path?: string
  component?: string
  icon?: string
  permissionCode?: string
  parentId?: number
}

/**
 * 菜单响应类型
 */
export interface MenuResponse {
  code: number
  message: string
  data: MenuItem | MenuItem[]
}
