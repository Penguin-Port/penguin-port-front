import type { TimeSaleRecommendation, TimeSaleStatus } from '../../../types/admin'

const STATUS_LABELS: Record<TimeSaleStatus, string> = {
  review: 'REVIEW',
  scheduled: 'SCHEDULED',
  active: 'ACTIVE',
  ended: 'ENDED',
  rejected: 'REJECTED',
}

interface TimeSaleCardProps {
  recommendation: TimeSaleRecommendation
  isPending: boolean
  onApprove: (id: string) => void
  onEdit: (id: string) => void
  onReject: (id: string) => void
  onOpenDetail: (id: string) => void
}

export function TimeSaleCard({
  recommendation,
  isPending,
  onApprove,
  onEdit,
  onReject,
  onOpenDetail,
}: TimeSaleCardProps) {
  const isReview = recommendation.status === 'review'

  return (
    <article className="time-sale-card">
      <div className="time-sale-copy">
        <div className="time-sale-meta">
          <span className={`time-sale-status ${recommendation.status}`}>
            {STATUS_LABELS[recommendation.status]}
          </span>
          <span>근거 · {recommendation.reasons.join(' · ')}</span>
        </div>
        <h2>{recommendation.menu} {recommendation.discountRate}% 할인</h2>
        <div className="time-sale-details">
          <span>적용 시간 · {recommendation.timeRange}</span>
          <span>할인율 · {recommendation.discountRate}%</span>
        </div>
        <button className="time-sale-detail-trigger" onClick={() => onOpenDetail(recommendation.id)}>추천 상세 보기 <span>→</span></button>
      </div>

      {isReview && (
        <div className="time-sale-actions">
          <button className="approve" disabled={isPending} onClick={() => onApprove(recommendation.id)}>{isPending ? '처리 중' : '승인'}</button>
          <button disabled={isPending} onClick={() => onEdit(recommendation.id)}>수정</button>
          <button disabled={isPending} onClick={() => onReject(recommendation.id)}>거절</button>
        </div>
      )}
    </article>
  )
}
