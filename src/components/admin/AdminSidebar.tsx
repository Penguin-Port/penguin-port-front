import { NavLink } from 'react-router-dom'
import { ADMIN_NAVIGATION } from '../../constants/adminNavigation'
import { cn } from '../../utils/cn'
import { AdminIcon } from './AdminIcon'

interface AdminSidebarProps {
  isOpen: boolean
  onNavigate: () => void
}

export function AdminSidebar({ isOpen, onNavigate }: AdminSidebarProps) {
  return (
    <aside className={cn('sidebar', isOpen && 'is-open')}>
      <div className="sidebar-heading">ADMIN CONSOLE</div>
      <nav>
        {ADMIN_NAVIGATION.map((item) => (
          <NavLink
            className={({ isActive }) => cn('nav-item', isActive && 'active')}
            to={item.path}
            key={item.path}
            onClick={onNavigate}
          >
            <AdminIcon name={item.icon} />
            <span><b>{item.label}</b><small>{item.path}</small></span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <span className="system-dot" />
        <span><b>모든 시스템 정상</b><small>마지막 확인 1분 전</small></span>
      </div>
    </aside>
  )
}
