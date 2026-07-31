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
      <strong>예상 마진 {trend.expectedMargin}%</strong>
      <div className="menu-trend-actions">
        <button
          className={isInterested ? 'is-interested' : ''}
          onClick={() => onToggleInterest(trend.id)}
        >
          {isInterested ? '관심 해제' : '관심 표시'}
        </button>
        <button onClick={() => onSaveDraft(trend.id)}>
          {isDraftSaved ? '초안 저장됨' : '메뉴 초안 저장'}
        </button>
      </div>
    </article>
  )
}
