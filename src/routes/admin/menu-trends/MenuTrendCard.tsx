import type { MenuTrend, MenuTrendStatus } from '../../../types/admin'

const STATUS_LABELS: Record<MenuTrendStatus, string> = {
  interested: '관심 표시됨',
  reviewing: '검토 중',
  new: '신규',
}

interface MenuTrendCardProps {
  trend: MenuTrend
  isDraftSaved: boolean
  onToggleInterest: (id: string) => void
  onSaveDraft: (id: string) => void
}

export function MenuTrendCard({
  trend,
  isDraftSaved,
  onToggleInterest,
  onSaveDraft,
}: MenuTrendCardProps) {
  const isInterested = trend.status === 'interested'

  return (
    <article className="menu-trend-card">
      <header>
        <h2>{trend.name}</h2>
        <span className={`menu-trend-status ${trend.status}`}>{STATUS_LABELS[trend.status]}</span>
      </header>
      <p>{trend.description}</p>
      <strong>{trend.expectedMargin === undefined ? '서버 추천 후보' : `예상 마진 ${trend.expectedMargin}%`}</strong>
      <small className="menu-trend-local-note">아래 작업은 서버에 저장되지 않는 로컬 미리보기입니다.</small>
      <div className="menu-trend-actions">
        <button
          className={isInterested ? 'is-interested' : ''}
          onClick={() => onToggleInterest(trend.id)}
        >
          {isInterested ? '관심 해제 (로컬)' : '관심 표시 (로컬)'}
        </button>
        <button onClick={() => onSaveDraft(trend.id)}>
          {isDraftSaved ? '초안 저장됨 (로컬)' : '메뉴 초안 저장 (로컬)'}
        </button>
      </div>
    </article>
  )
}
