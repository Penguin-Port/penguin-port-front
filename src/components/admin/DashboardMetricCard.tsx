import { Link } from 'react-router-dom'
import type { DashboardMetric } from '../../types/admin'

interface DashboardMetricCardProps {
  metric: DashboardMetric
}

export function DashboardMetricCard({ metric }: DashboardMetricCardProps) {
  return (
    <article className="metric-card">
      <div className={`metric-icon ${metric.tone}`}><span /></div>
      <div className="metric-copy">
        <p>{metric.label}</p>
        <strong>{metric.value}</strong>
        <small>{metric.detail}</small>
      </div>
      <Link to={metric.path} aria-label={`${metric.label} 상세 보기`}>↗</Link>
    </article>
  )
}
