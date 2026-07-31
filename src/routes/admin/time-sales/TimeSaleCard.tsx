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
  onApprove: (id: string) => void
  onEdit: (id: string) => void
  onReject: (id: string) => void
}

export function TimeSaleCard({ recommendation, onApprove, onEdit, onReject }: TimeSaleCardProps) {
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
      </div>

      {isReview && (
        <div className="time-sale-actions">
          <button className="approve" onClick={() => onApprove(recommendation.id)}>승인</button>
          <button onClick={() => onEdit(recommendation.id)}>수정</button>
          <button onClick={() => onReject(recommendation.id)}>거절</button>
        </div>
      )}
    </article>
  )
}
