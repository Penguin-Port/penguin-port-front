import { Modal } from '../../../components/admin'
import type { TimeSaleRecommendation, TimeSaleStatus } from '../../../types/admin'

const STATUS_LABELS: Record<TimeSaleStatus, string> = {
  review: '검토 대기',
  scheduled: '승인 완료',
  active: '진행 중',
  ended: '종료',
  rejected: '거절',
}

interface RecommendationDetailModalProps {
  recommendation: TimeSaleRecommendation | null
  onClose: () => void
  onApprove: (id: string) => void
  onReject: (id: string) => void
}

function formatCreatedAt(value?: string) {
  if (!value) return '정보 없음'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function RecommendationDetailModal({
  recommendation,
  onClose,
  onApprove,
  onReject,
}: RecommendationDetailModalProps) {
  if (!recommendation) return null
  const canDecide = recommendation.status === 'review'
  const confidence = recommendation.confidence === undefined
    ? '정보 없음'
    : `${Math.round(recommendation.confidence * 100)}%`

  return (
    <Modal
      isOpen
      title={`${recommendation.menu} ${recommendation.discountRate}% 할인`}
      description="AI가 분석한 추천 조건과 예상 효과를 검토한 뒤 승인 여부를 결정하세요."
      onClose={onClose}
    >
      <div className="recommendation-detail">
        <div className="recommendation-detail-highlight">
          <span className={`time-sale-status ${recommendation.status}`}>{STATUS_LABELS[recommendation.status]}</span>
          <strong>{recommendation.expectedEffect || '예상 효과 데이터가 아직 제공되지 않았습니다.'}</strong>
        </div>
        <dl>
          <div><dt>대상 메뉴</dt><dd>{recommendation.menu}</dd></div>
          <div><dt>할인율</dt><dd>{recommendation.discountRate}%</dd></div>
          <div><dt>적용 시간</dt><dd>{recommendation.timeRange}</dd></div>
          <div><dt>AI 신뢰도</dt><dd>{confidence}</dd></div>
          <div><dt>생성 시각</dt><dd>{formatCreatedAt(recommendation.createdAt)}</dd></div>
          <div className="wide"><dt>추천 근거</dt><dd>{recommendation.reasons.join(' · ')}</dd></div>
        </dl>
      </div>
      <div className="admin-modal-actions recommendation-detail-actions">
        <button type="button" onClick={onClose}>{canDecide ? '나중에 검토' : '닫기'}</button>
        {canDecide && (
          <>
            <button type="button" className="reject" onClick={() => onReject(recommendation.id)}>거절</button>
            <button type="button" className="confirm" onClick={() => onApprove(recommendation.id)}>승인하기</button>
          </>
        )}
      </div>
    </Modal>
  )
}
