import { useMemo, useState } from 'react'
import { ADMIN_ROUTES } from '../../../constants/adminRoutes'
import { FIRST_ORDER_BONUSES, REPEAT_ORDER_BONUSES } from '../../../constants/adminWifiPolicies'
import { PolicyTierList } from './PolicyTierList'

const SIMULATION_ORDER_AMOUNT = 12_000

export function AdminWifiPoliciesPage() {
  const [baseMinutes, setBaseMinutes] = useState(120)
  const [isOffPeakExtensionEnabled, setIsOffPeakExtensionEnabled] = useState(true)

  const bonusMinutes = useMemo(() => {
    if (SIMULATION_ORDER_AMOUNT >= 20_000) return null
    if (SIMULATION_ORDER_AMOUNT >= 10_000) return 45
    if (SIMULATION_ORDER_AMOUNT >= 5_000) return 30
    return 0
  }, [])

  const totalMinutes = bonusMinutes === null ? null : baseMinutes + bonusMinutes
  const expectedExpiry = useMemo(() => {
    if (totalMinutes === null) return '영업 종료 시각'
    const expiresAt = new Date(Date.now() + totalMinutes * 60_000)
    return expiresAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  }, [totalMinutes])

  const totalTimeLabel = totalMinutes === null
    ? '종일권'
    : `${totalMinutes}분 (${Math.floor(totalMinutes / 60)}시간 ${totalMinutes % 60}분)`

  return (
    <>
      <section className="wifi-policies-heading">
        <p className="eyebrow">WIFI POLICIES <span>/ {ADMIN_ROUTES.wifiPolicies.slice(1)}</span></p>
        <h1>Wi-Fi 시간 정책</h1>
        <p>프론트는 분을 확정하지 않습니다. 현재 화면은 정책 UI와 응답 breakdown 미리보기입니다.</p>
      </section>

      <section className="wifi-policy-grid">
        <article className="wifi-policy-card">
          <h2>첫 주문 / First order</h2>
          <div className="base-time-control">
            <span>기본 제공 시간 (무조건)</span>
            <div>
              <button onClick={() => setBaseMinutes((minutes) => Math.max(30, minutes - 30))} aria-label="기본 시간 30분 줄이기">−</button>
              <strong>{baseMinutes}분</strong>
              <button onClick={() => setBaseMinutes((minutes) => Math.min(360, minutes + 30))} aria-label="기본 시간 30분 늘리기">＋</button>
            </div>
          </div>
          <p className="policy-label">금액 구간 보너스</p>
          <PolicyTierList tiers={FIRST_ORDER_BONUSES} />
        </article>

        <article className="wifi-policy-card">
          <h2>추가 주문 / Repeat order</h2>
          <p className="policy-description">첫 주문과 분리된 금액별 연장 테이블입니다.</p>
          <PolicyTierList tiers={REPEAT_ORDER_BONUSES} />
          <div className="off-peak-setting">
            <div><strong>한산 시간대 자동연장</strong><small>아침·저녁 1회 주문 시 설정 시각까지 자동 연장</small></div>
            <button
              className={`switch ${isOffPeakExtensionEnabled ? 'is-on' : ''}`}
              role="switch"
              aria-checked={isOffPeakExtensionEnabled}
              onClick={() => setIsOffPeakExtensionEnabled((enabled) => !enabled)}
            ><span /></button>
          </div>
        </article>
      </section>

      <section className="wifi-simulation">
        <header><h2>미리보기 / POST /wifi/simulate</h2><span>{SIMULATION_ORDER_AMOUNT.toLocaleString('ko-KR')}원 주문으로 시뮬레이션</span></header>
        <div className="simulation-row"><span>기본 제공</span><strong>{baseMinutes}분</strong></div>
        <div className="simulation-row"><span>금액 구간 보너스 (10,000원~)</span><strong>+{bonusMinutes}분</strong></div>
        <div className="simulation-row"><span>총 이용권</span><strong>{totalTimeLabel}</strong></div>
        <div className="simulation-row"><span>만료 예정</span><strong>{expectedExpiry}</strong></div>
        <p>특수 누적 20,000원 티어의 Wi-Fi 종일권은 expiresAt을 영업 종료 시각으로 설정합니다.</p>
      </section>
    </>
  )
}
