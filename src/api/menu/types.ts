/**
 * 菜单项类型定义
 */
export interface MenuItem {
  id: number
  name: string
  path: string | null
  component: string | null
  icon: string | null
  permissionCode: string | null
  children: MenuItem[]
}
