import { useState } from 'react'
import { ANOMALIES } from '../../../constants/adminAnomalies'
import { ADMIN_ROUTES } from '../../../constants/adminRoutes'
import type { AnomalyItem } from '../../../types/admin'
import { AnomalyCard } from './AnomalyCard'

export function AdminAnomaliesPage() {
  const [anomalies, setAnomalies] = useState(ANOMALIES)
  const [sentGuideIds, setSentGuideIds] = useState<string[]>([])

  const sendGuide = (id: string) => {
    setSentGuideIds((current) => current.includes(id) ? current : [...current, id])
  }

  const resolveAnomaly = (id: string) => {
    setAnomalies((current) => current.map((item): AnomalyItem => item.id === id ? { ...item, isResolved: true } : item))
  }

  return (
    <>
      <section className="anomalies-heading">
        <p className="eyebrow">ANOMALIES <span>/ {ADMIN_ROUTES.anomalies.slice(1)}</span></p>
        <h1>이상 징후</h1>
        <p>점주 보호를 위한 안내용 신호입니다. 고객 화면에는 혜택 톤 안내만 표시됩니다.</p>
      </section>

      <section className="anomaly-grid" aria-label="이상 징후 목록">
        {anomalies.map((anomaly) => (
          <AnomalyCard
            key={anomaly.id}
            anomaly={anomaly}
            isGuideSent={sentGuideIds.includes(anomaly.id)}
            onSendGuide={sendGuide}
            onResolve={resolveAnomaly}
          />
        ))}
      </section>
    </>
  )
}
