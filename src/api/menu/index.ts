import { api } from '@/request'
import type { MenuItem } from './types'

/**
 * 获取当前用户的菜单列表
 * @returns 菜单树数据
 */
export const fetchUserMenus = async () => {
  return api.get<MenuItem[]>({
    url: '/menus/user'
  })
}

/**
 * 获取所有菜单列表(仅管理员)
 * @returns 菜单树数据
 */
export const fetchAllMenus = async () => {
  return api.get<MenuItem[]>({
    url: '/menus/all'
  })
}

// 重新导出类型
export * from './types'
