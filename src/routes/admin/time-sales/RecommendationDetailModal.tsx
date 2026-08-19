import { Modal } from '../../../components/admin'
import type { TimeSaleRecommendation, TimeSaleStatus } from '../../../types/admin'
import { getRecommendationSourceMeta } from '../../../utils/recommendationSource'

const STATUS_LABELS: Record<TimeSaleStatus, string> = {
  review: '검토 대기',
  edited: '수정 완료',
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

function formatEvidence(evidence?: Record<string, unknown>) {
  if (!evidence) return '정보 없음'
  const parts: string[] = []
  if (typeof evidence.businessDate === 'string') parts.push(`기준일 ${evidence.businessDate}`)
  if (typeof evidence.totalOrders === 'number') parts.push(`주문 ${evidence.totalOrders}건`)
  if (typeof evidence.totalSales === 'number') {
    parts.push(`매출 ${evidence.totalSales.toLocaleString('ko-KR')}원`)
  }
  const quietBucket = evidence.quietBucket
  if (quietBucket && typeof quietBucket === 'object') {
    const localHour = (quietBucket as Record<string, unknown>).localHour
    if (typeof localHour === 'number') parts.push(`비혼잡 시간 ${localHour}시`)
  }
  return parts.length > 0 ? parts.join(' · ') : '정보 없음'
}

export function RecommendationDetailModal({
  recommendation,
  onClose,
  onApprove,
  onReject,
}: RecommendationDetailModalProps) {
  if (!recommendation) return null
  const canDecide = recommendation.status === 'review' || recommendation.status === 'edited'
  const confidence = recommendation.confidence === undefined
    ? '정보 없음'
    : `${Math.round(recommendation.confidence * 100)}%`
  const source = getRecommendationSourceMeta(recommendation.source)

  return (
    <Modal
      isOpen
      title={`${recommendation.menu} ${recommendation.discountRate}% 할인`}
      description="AI가 분석한 추천 조건과 예상 효과를 검토한 뒤 승인 여부를 결정하세요."
      onClose={onClose}
    >
      <div className="recommendation-detail">
        <div className="recommendation-detail-highlight">
          <div className="recommendation-detail-badges">
            <span className={`time-sale-status ${recommendation.status}`}>{STATUS_LABELS[recommendation.status]}</span>
            <span className={`recommendation-source ${source.tone}`}>{source.label}</span>
          </div>
          <strong>{recommendation.expectedEffect || '예상 효과 데이터가 아직 제공되지 않았습니다.'}</strong>
        </div>
        <dl>
          <div><dt>대상 메뉴</dt><dd>{recommendation.menu}</dd></div>
          <div><dt>할인율</dt><dd>{recommendation.discountRate}%</dd></div>
          <div><dt>적용 시간</dt><dd>{recommendation.timeRange}</dd></div>
          <div><dt>AI 신뢰도</dt><dd>{confidence}</dd></div>
          <div><dt>생성 방식</dt><dd>{source.label}</dd></div>
          <div><dt>사용 모델</dt><dd>{recommendation.model || '정보 없음'}</dd></div>
          <div><dt>생성 시각</dt><dd>{formatCreatedAt(recommendation.createdAt)}</dd></div>
          <div className="wide"><dt>추천 근거</dt><dd>{recommendation.reasons.join(' · ')}</dd></div>
          <div className="wide"><dt>분석 데이터</dt><dd>{formatEvidence(recommendation.evidence)}</dd></div>
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
