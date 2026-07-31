import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AdminHeader } from './AdminHeader'
import { AdminSidebar } from './AdminSidebar'

export function AdminLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="app-shell">
      <AdminHeader onMenuToggle={() => setIsMenuOpen((open) => !open)} />
      <AdminSidebar isOpen={isMenuOpen} onNavigate={() => setIsMenuOpen(false)} />
      {isMenuOpen && (
        <button
          className="backdrop"
          onClick={() => setIsMenuOpen(false)}
          aria-label="메뉴 닫기"
        />
      )}
      <main className="main-content"><Outlet /></main>
    </div>
  )
}
