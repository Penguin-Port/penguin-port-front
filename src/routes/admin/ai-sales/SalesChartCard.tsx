import type { ReactNode } from 'react'

interface SalesChartCardProps {
  title: string
  endpoint: string
  children: ReactNode
  className?: string
}

export function SalesChartCard({ title, endpoint, children, className = '' }: SalesChartCardProps) {
  return (
    <article className={`sales-chart-card ${className}`}>
      <header>
        <h2>{title}</h2>
        <span>{endpoint}</span>
      </header>
      {children}
    </article>
  )
}
