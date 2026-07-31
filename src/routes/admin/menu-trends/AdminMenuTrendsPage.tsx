import { useState } from 'react'
import { MENU_TRENDS } from '../../../constants/adminMenuTrends'
import { ADMIN_ROUTES } from '../../../constants/adminRoutes'
import type { MenuTrend } from '../../../types/admin'
import { MenuTrendCard } from './MenuTrendCard'

export function AdminMenuTrendsPage() {
  const [trends, setTrends] = useState(MENU_TRENDS)
  const [savedDraftIds, setSavedDraftIds] = useState<string[]>([])

  const toggleInterest = (id: string) => {
    setTrends((current) => current.map((trend): MenuTrend => {
      if (trend.id !== id) return trend
      return { ...trend, status: trend.status === 'interested' ? 'reviewing' : 'interested' }
    }))
  }

  const saveDraft = (id: string) => {
    setSavedDraftIds((current) => current.includes(id) ? current : [...current, id])
  }

  return (
    <>
      <section className="menu-trends-heading">
        <p className="eyebrow">AI MENU TRENDS <span>/ {ADMIN_ROUTES.aiMenuTrends.slice(1)}</span></p>
        <h1>트렌드 신메뉴 추천</h1>
        <p>외부 SNS 원문 링크는 선택 노출이며 개인·민감 정보는 표시하지 않습니다.</p>
      </section>

      <section className="menu-trend-grid" aria-label="트렌드 신메뉴 추천 목록">
        {trends.map((trend) => (
          <MenuTrendCard
            key={trend.id}
            trend={trend}
            isDraftSaved={savedDraftIds.includes(trend.id)}
            onToggleInterest={toggleInterest}
            onSaveDraft={saveDraft}
          />
        ))}
      </section>
    </>
  )
}
