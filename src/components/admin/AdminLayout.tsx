import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AdminHeader } from './AdminHeader'
import { AdminSidebar } from './AdminSidebar'
import { ToastProvider } from './ToastProvider'

export function AdminLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleNavigate = () => {
    if (window.matchMedia('(max-width: 760px)').matches) setIsMenuOpen(false)
  }

  return (
    <ToastProvider>
      <div className={`app-shell ${isMenuOpen ? 'sidebar-open' : ''}`}>
        <AdminHeader
          isMenuOpen={isMenuOpen}
          onMenuToggle={() => setIsMenuOpen((open) => !open)}
        />
        <AdminSidebar isOpen={isMenuOpen} onNavigate={handleNavigate} />
        {isMenuOpen && (
          <button
            className="backdrop"
            onClick={() => setIsMenuOpen(false)}
            aria-label="메뉴 닫기"
          />
        )}
        <main className="main-content"><Outlet /></main>
      </div>
    </ToastProvider>
  )
}
