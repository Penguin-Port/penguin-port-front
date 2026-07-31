import { Link } from 'react-router-dom'
import { ADMIN_ROUTES } from '../../constants/adminRoutes'
import { AdminIcon } from './AdminIcon'

interface AdminHeaderProps {
  onMenuToggle: () => void
}

export function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
  return (
    <header className="topbar">
      <button className="mobile-menu" onClick={onMenuToggle} aria-label="메뉴 열기">
        <span /><span /><span />
      </button>
      <Link className="brand" to={ADMIN_ROUTES.dashboard} aria-label="PenguinPort 관리자 홈">
        <span className="brand-mark">P</span>
        <span>PenguinPort</span>
      </Link>
      <span className="console-badge">관리자 콘솔</span>
      <div className="topbar-spacer" />
      <button className="notification-button" aria-label="알림">
        <AdminIcon name="bell" />
        <span className="notification-dot" />
      </button>
      <div className="profile">
        <span className="avatar">김</span>
        <span className="profile-copy"><b>김관리</b><small>최고 관리자</small></span>
        <span className="chevron">⌄</span>
      </div>
    </header>
  )
}
