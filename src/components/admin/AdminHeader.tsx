import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { adminApi } from '../../api'
import { ADMIN_ROUTES } from '../../constants/adminRoutes'
import { AdminIcon } from './AdminIcon'
import { useToast } from './useToast'

interface AdminHeaderProps {
  isMenuOpen: boolean
  onMenuToggle: () => void
}

export function AdminHeader({ isMenuOpen, onMenuToggle }: AdminHeaderProps) {
  const { showToast } = useToast()
  const location = useLocation()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => setIsProfileOpen(false), [location.pathname])

  useEffect(() => {
    if (!isProfileOpen) return
    const handlePointerDown = (event: PointerEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) setIsProfileOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsProfileOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isProfileOpen])

  const logout = () => {
    adminApi.logout()
    setIsProfileOpen(false)
    showToast('관리자 API 세션에서 로그아웃했습니다.', 'success')
  }

  return (
    <header className="topbar">
      <button
        className={`mobile-menu ${isMenuOpen ? 'is-open' : ''}`}
        onClick={onMenuToggle}
        aria-label={isMenuOpen ? '사이드바 닫기' : '사이드바 열기'}
        aria-expanded={isMenuOpen}
      >
        <span /><span /><span />
      </button>
      <Link className="brand" to={ADMIN_ROUTES.dashboard} aria-label="PenguinPort 관리자 홈">
        <span className="brand-mark">P</span>
        <span>PenguinPort</span>
      </Link>
      <span className="console-badge">관리자 콘솔</span>
      <div className="topbar-spacer" />
      <Link className="notification-button" to={ADMIN_ROUTES.notifications} aria-label="알림">
        <AdminIcon name="bell" />
        <span className="notification-dot" />
      </Link>
      <div className="profile-menu" ref={profileRef}>
        <button
          className="profile"
          type="button"
          aria-haspopup="menu"
          aria-expanded={isProfileOpen}
          onClick={() => setIsProfileOpen((open) => !open)}
        >
          <span className="avatar">김</span>
          <span className="profile-copy"><b>김관리</b><small>최고 관리자</small></span>
          <span className={`chevron ${isProfileOpen ? 'is-open' : ''}`}>⌄</span>
        </button>
        {isProfileOpen && (
          <div className="profile-dropdown" role="menu">
            <div className="profile-dropdown-user">
              <strong>김관리</strong>
              <span>demo-owner · 최고 관리자</span>
            </div>
            <Link role="menuitem" to={ADMIN_ROUTES.settings}>
              <AdminIcon name="settings" />
              관리자 설정
            </Link>
            <button role="menuitem" className="logout" onClick={logout}>
              <span className="logout-icon">↪</span>
              로그아웃
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
