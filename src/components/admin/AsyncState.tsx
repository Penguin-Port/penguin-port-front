interface LoadingStateProps {
  variant?: 'cards' | 'table'
  count?: number
  label?: string
}

export function LoadingState({ variant = 'cards', count = 3, label = '데이터를 불러오는 중입니다.' }: LoadingStateProps) {
  return (
    <div className={`async-loading ${variant}`} role="status" aria-label={label}>
      {Array.from({ length: count }, (_, index) => (
        <div className="skeleton-item" key={index} aria-hidden="true">
          <span className="skeleton-line short" />
          <span className="skeleton-line title" />
          <span className="skeleton-line" />
        </div>
      ))}
      <span className="sr-only">{label}</span>
    </div>
  )
}

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <section className="async-state empty" role="status">
      <span className="async-state-icon">○</span>
      <h2>{title}</h2>
      <p>{description}</p>
      {actionLabel && onAction && <button onClick={onAction}>{actionLabel}</button>}
    </section>
  )
}

interface ErrorStateProps {
  title?: string
  description: string
  onRetry: () => void
  isRetrying?: boolean
}

export function ErrorState({
  title = '데이터를 불러오지 못했습니다',
  description,
  onRetry,
  isRetrying = false,
}: ErrorStateProps) {
  return (
    <section className="async-state error" role="alert">
      <span className="async-state-icon">!</span>
      <h2>{title}</h2>
      <p>{description}</p>
      <button onClick={onRetry} disabled={isRetrying}>{isRetrying ? '다시 시도 중…' : '다시 시도'}</button>
    </section>
  )
}
