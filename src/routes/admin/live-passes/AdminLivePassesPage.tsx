import { useEffect, useState } from 'react'
import { ADMIN_ROUTES } from '../../../constants/adminRoutes'
import { LivePassesTable } from './LivePassesTable'

export function AdminLivePassesPage() {
  const [lastUpdatedAt, setLastUpdatedAt] = useState(new Date())
  const [isNoticeVisible, setIsNoticeVisible] = useState(true)

  useEffect(() => {
    const intervalId = window.setInterval(() => setLastUpdatedAt(new Date()), 10_000)
    return () => window.clearInterval(intervalId)
  }, [])

  return (
    <>
      <section className="live-passes-heading">
        <div>
          <p className="eyebrow">LIVE PASSES <span>/ {ADMIN_ROUTES.livePasses.slice(1)}</span></p>
          <h1>실시간 이용권</h1>
          <p>serverTime 기준 잔여 시간입니다. 추가 주문이 들어오면 자동으로 연장 표시됩니다.</p>
        </div>
        <span className="polling-badge"><i /> 10초마다 갱신 · {lastUpdatedAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
      </section>

      <LivePassesTable />

      {isNoticeVisible && (
        <aside className="live-pass-toast" role="status">
          <span className="toast-dot" />
          <div><strong>이용권 활성화</strong><p>P-2483 · 주문 고객에게 Wi-Fi 2시간 제공됨</p></div>
          <button onClick={() => setIsNoticeVisible(false)} aria-label="알림 닫기">×</button>
        </aside>
      )}
    </>
  )
}
