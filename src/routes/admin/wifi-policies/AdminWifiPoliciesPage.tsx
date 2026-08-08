import { useCallback, useEffect, useMemo, useState } from 'react'
import { adminApi } from '../../../api'
import { ErrorState, LoadingState, useToast } from '../../../components/admin'
import { isApiConfigured } from '../../../config/env'
import { ADMIN_ROUTES } from '../../../constants/adminRoutes'
import { FIRST_ORDER_BONUSES, REPEAT_ORDER_BONUSES } from '../../../constants/adminWifiPolicies'
import type { PolicyTierResponse, WifiPolicyResponse, WifiPolicySimulationResponse } from '../../../types/api'
import { PolicyTierList } from './PolicyTierList'

const SIMULATION_ORDER_AMOUNT = 12_000

function displayTiers(tiers: PolicyTierResponse[]) {
  return tiers.map((tier) => ({
    threshold: `${tier.minAmount.toLocaleString('ko-KR')}원 이상`,
    benefit: `+${tier.minutes}분`,
  }))
}

export function AdminWifiPoliciesPage() {
  const { showToast } = useToast()
  const [policy, setPolicy] = useState<WifiPolicyResponse | null>(null)
  const [baseMinutes, setBaseMinutes] = useState(120)
  const [simulation, setSimulation] = useState<WifiPolicySimulationResponse | null>(null)
  const [isLoading, setIsLoading] = useState(isApiConfigured)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const loadPolicy = useCallback(async (signal?: AbortSignal) => {
    if (!isApiConfigured) return
    setIsLoading(true)
    setError('')
    try {
      const policyResponse = await adminApi.getWifiPolicy(signal)
      setPolicy(policyResponse.data)
      setBaseMinutes(policyResponse.data.baseMinutes)
      const simulationResponse = await adminApi.simulateWifiPolicy(SIMULATION_ORDER_AMOUNT)
      setSimulation(simulationResponse.data)
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === 'AbortError') return
      setError('Wi-Fi 정책을 불러오거나 시뮬레이션하지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void loadPolicy(controller.signal)
    return () => controller.abort()
  }, [loadPolicy])

  const savePolicy = async () => {
    if (!policy || isSaving) return
    setIsSaving(true)
    try {
      const response = await adminApi.publishWifiPolicy({
        version: policy.version,
        baseMinutes,
        firstOrderTiers: policy.firstOrderTiers,
        additionalOrderTiers: policy.additionalOrderTiers,
      })
      setPolicy(response.data)
      setBaseMinutes(response.data.baseMinutes)
      const simulated = await adminApi.simulateWifiPolicy(SIMULATION_ORDER_AMOUNT)
      setSimulation(simulated.data)
      showToast('Wi-Fi 시간 정책을 배포했습니다.', 'success')
    } catch {
      showToast('정책 배포에 실패했습니다. 정책 버전을 다시 확인해주세요.', 'error')
      await loadPolicy()
    } finally {
      setIsSaving(false)
    }
  }

  const firstOrderTiers = policy ? displayTiers(policy.firstOrderTiers) : FIRST_ORDER_BONUSES
  const repeatOrderTiers = policy ? displayTiers(policy.additionalOrderTiers) : REPEAT_ORDER_BONUSES
  const breakdown = simulation?.breakdown ?? {}
  const bonusMinutes = Number(breakdown.bonusMinutes ?? 0)
  const totalMinutes = simulation?.minutes ?? baseMinutes + bonusMinutes
  const expectedExpiry = useMemo(() => {
    const expiresAt = new Date(Date.now() + totalMinutes * 60_000)
    return expiresAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  }, [totalMinutes])

  return (
    <>
      <section className="wifi-policies-heading">
        <div>
          <p className="eyebrow">WIFI POLICIES <span>/ {ADMIN_ROUTES.wifiPolicies.slice(1)}</span></p>
          <h1>Wi-Fi 시간 정책</h1>
          <p>서버 정책을 조회하고 배포한 뒤 실제 발급 계산 결과를 미리 확인합니다.</p>
        </div>
        <button className="policy-save-button" disabled={!policy || isSaving} onClick={() => void savePolicy()}>
          {isSaving ? '배포 중…' : '정책 저장 · 배포'}
        </button>
      </section>

      {isLoading && <LoadingState count={2} label="Wi-Fi 정책을 불러오는 중입니다." />}
      {error && <ErrorState description={error} onRetry={() => void loadPolicy()} />}
      {!isLoading && !error && (
        <>
          <section className="wifi-policy-grid">
            <article className="wifi-policy-card">
              <h2>첫 주문 / First order</h2>
              <div className="base-time-control">
                <span>기본 제공 시간 (무조건)</span>
                <div>
                  <button onClick={() => setBaseMinutes((minutes) => Math.max(30, minutes - 30))} aria-label="기본 시간 30분 줄이기">−</button>
                  <strong>{baseMinutes}분</strong>
                  <button onClick={() => setBaseMinutes((minutes) => Math.min(1_440, minutes + 30))} aria-label="기본 시간 30분 늘리기">＋</button>
                </div>
              </div>
              <p className="policy-label">금액 구간 보너스</p>
              <PolicyTierList tiers={firstOrderTiers} />
            </article>

            <article className="wifi-policy-card">
              <h2>추가 주문 / Repeat order</h2>
              <p className="policy-description">서버에 저장된 금액별 연장 정책입니다.</p>
              <PolicyTierList tiers={repeatOrderTiers} />
              <div className="off-peak-setting">
                <div><strong>현재 정책 버전</strong><small>동시 수정 충돌을 방지하기 위한 서버 버전</small></div>
                <strong>v{policy?.version ?? 1}</strong>
              </div>
            </article>
          </section>

          <section className="wifi-simulation">
            <header><h2>미리보기 / POST /admin/wifi/policies/simulate</h2><span>{SIMULATION_ORDER_AMOUNT.toLocaleString('ko-KR')}원 주문</span></header>
            <div className="simulation-row"><span>기본 제공</span><strong>{Number(breakdown.baseMinutes ?? baseMinutes)}분</strong></div>
            <div className="simulation-row"><span>금액 구간 보너스</span><strong>+{bonusMinutes}분</strong></div>
            <div className="simulation-row"><span>총 이용권</span><strong>{totalMinutes}분 ({Math.floor(totalMinutes / 60)}시간 {totalMinutes % 60}분)</strong></div>
            <div className="simulation-row"><span>만료 예정</span><strong>{expectedExpiry}</strong></div>
            <p>미리보기는 현재 서버에 배포된 정책을 기준으로 계산됩니다. 변경 후 저장하면 결과가 갱신됩니다.</p>
          </section>
        </>
      )}
    </>
  )
}
