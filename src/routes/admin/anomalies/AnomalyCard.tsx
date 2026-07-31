import { ANOMALY_SEVERITY_LABELS } from '../../../constants/adminAnomalies'
import type { AnomalyItem } from '../../../types/admin'

interface AnomalyCardProps {
  anomaly: AnomalyItem
  isGuideSent: boolean
  onSendGuide: (id: string) => void
  onResolve: (id: string) => void
}

export function AnomalyCard({ anomaly, isGuideSent, onSendGuide, onResolve }: AnomalyCardProps) {
  return (
    <article className={`anomaly-card ${anomaly.isResolved ? 'resolved' : ''}`}>
      <span className={`anomaly-severity ${anomaly.severity}`}><i />{anomaly.isResolved ? '처리 완료' : ANOMALY_SEVERITY_LABELS[anomaly.severity]}</span>
      <h2>{anomaly.title}</h2>
      <p>{anomaly.description}</p>
      <time>{anomaly.time}</time>
      <div className="anomaly-actions">
        <button onClick={() => onSendGuide(anomaly.id)} disabled={anomaly.isResolved}>
          {isGuideSent ? '안내 전송됨' : '이용 안내 보내기'}
        </button>
        <button className="resolve" onClick={() => onResolve(anomaly.id)} disabled={anomaly.isResolved}>
          {anomaly.isResolved ? '처리 완료 ✓' : '확인 처리 →'}
        </button>
      </div>
    </article>
  )
}
