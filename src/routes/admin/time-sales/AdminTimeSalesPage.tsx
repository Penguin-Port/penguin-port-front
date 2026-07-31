import { useState } from 'react'
import { TIME_SALE_RECOMMENDATIONS } from '../../../constants/adminTimeSales'
import { ADMIN_ROUTES } from '../../../constants/adminRoutes'
import type { TimeSaleRecommendation } from '../../../types/admin'
import { TimeSaleCard } from './TimeSaleCard'

export function AdminTimeSalesPage() {
  const [isAutoApproveEnabled, setIsAutoApproveEnabled] = useState(false)
  const [recommendations, setRecommendations] = useState(TIME_SALE_RECOMMENDATIONS)

  const updateRecommendation = (
    id: string,
    updater: (recommendation: TimeSaleRecommendation) => TimeSaleRecommendation,
  ) => {
    setRecommendations((current) => current.map((item) => item.id === id ? updater(item) : item))
  }

  const approveRecommendation = (id: string) => {
    updateRecommendation(id, (item) => ({ ...item, status: 'scheduled' }))
  }

  const editRecommendation = (id: string) => {
    updateRecommendation(id, (item) => ({
      ...item,
      discountRate: item.discountRate === 30 ? 10 : item.discountRate + 5,
    }))
  }

  const rejectRecommendation = (id: string) => {
    updateRecommendation(id, (item) => ({ ...item, status: 'rejected' }))
  }

  return (
    <>
      <section className="time-sales-heading">
        <p className="eyebrow">AI TIME SALES <span>/ {ADMIN_ROUTES.aiTimeSales.slice(1)}</span></p>
        <h1>타임세일 추천 · 승인</h1>
        <p>추천은 자동 게시되지 않습니다. 할인율·적용 시간·적용 메뉴를 검토하고 승인할 수 있습니다.</p>
      </section>

      <section className="auto-approve-panel">
        <strong>자동 승인 / Auto-approve</strong>
        <button
          type="button"
          className={`switch ${isAutoApproveEnabled ? 'is-on' : ''}`}
          role="switch"
          aria-checked={isAutoApproveEnabled}
          onClick={() => setIsAutoApproveEnabled((enabled) => !enabled)}
        >
          <span />
        </button>
        <span>{isAutoApproveEnabled ? 'ON' : 'OFF'} — 기본값</span>
      </section>

      <section className="time-sale-list" aria-label="타임세일 추천 목록">
        {recommendations.map((recommendation) => (
          <TimeSaleCard
            key={recommendation.id}
            recommendation={recommendation}
            onApprove={approveRecommendation}
            onEdit={editRecommendation}
            onReject={rejectRecommendation}
          />
        ))}
      </section>
    </>
  )
}
