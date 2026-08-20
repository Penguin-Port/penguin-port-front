import { useCallback, useEffect, useMemo, useState } from 'react'
import { adminApi } from '../../../api'
import {
  AiInsightBanner,
  DashboardActivityPanel,
  DashboardApprovalPanel,
  DashboardMetricCard,
} from '../../../components/admin'
import { DASHBOARD_APPROVALS, DASHBOARD_METRICS } from '../../../constants/adminDashboard'
import { ADMIN_ROUTES } from '../../../constants/adminRoutes'
import { isApiConfigured } from '../../../config/env'
import { useDashboardRecommendations } from '../../../hooks/useDashboardRecommendations'
import type { DashboardActivity, DashboardApproval, TimeSaleRecommendation } from '../../../types/admin'

interface DashboardOverview {
  activePasses: number
  totalSales: number
  rewardTiers: number
  activities: DashboardActivity[]
}

function formatAuditActivities(items: Awaited<ReturnType<typeof adminApi.getAuditLogs>>['data']): DashboardActivity[] {
  return items.slice(0, 4).map((item) => {
    const createdAt = item.createdAt ? new Date(item.createdAt) : null
    return {
      id: item.auditId,
      title: item.action,
      description: `${item.resourceType} · ${item.resourceId}`,
      time: createdAt && !Number.isNaN(createdAt.getTime())
        ? createdAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
        : '-',
      color: 'gray',
    }
  })
}

function getRecommendationGroup(recommendation: TimeSaleRecommendation) {
  const type = recommendation.recommendationType?.toUpperCase() ?? 'TIME_SALE'
  if (type.includes('INVENTORY') || type.includes('STOCK')) {
    return { key: 'inventory', label: 'AI 재고 프로모션', path: ADMIN_ROUTES.aiInventory }
  }
  if (type.includes('MENU') || type.includes('TREND')) {
    return { key: 'menu-trend', label: 'AI 신메뉴 트렌드', path: ADMIN_ROUTES.aiMenuTrends }
  }
  if (type === 'TIME_SALE') {
    return { key: 'time-sale', label: 'AI 타임세일 추천', path: ADMIN_ROUTES.aiTimeSales }
  }
  return null
}

function createApprovalItems(recommendations: TimeSaleRecommendation[]) {
  const grouped = new Map<string, DashboardApproval>()
  recommendations.forEach((recommendation) => {
    const group = getRecommendationGroup(recommendation)
    if (!group) return
    const current = grouped.get(group.key)
    grouped.set(group.key, {
      id: group.key,
      type: group.label,
      path: group.path,
      count: (current?.count ?? 0) + 1,
      description: current?.description
        ?? `${recommendation.menu} ${recommendation.discountRate}% · ${recommendation.timeRange}`,
    })
  })
  return [...grouped.values()]
}

export function AdminDashboardPage() {
  const { data, isLoading, error, serverTime, refetch, isApiConnected } = useDashboardRecommendations()
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [overviewError, setOverviewError] = useState('')

  const loadOverview = useCallback(async (signal?: AbortSignal) => {
    if (!isApiConfigured) return
    try {
      const [passes, sales, tiers, audit] = await Promise.all([
        adminApi.getActivePasses(signal),
        adminApi.getSalesSummary(signal),
        adminApi.getRewardTiers(signal),
        adminApi.getAuditLogs(4, signal),
      ])
      setOverview({
        activePasses: passes.data.length,
        totalSales: sales.data.totalSales,
        rewardTiers: tiers.data.length,
        activities: formatAuditActivities(audit.data),
      })
      setOverviewError('')
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === 'AbortError') return
      setOverviewError('운영 지표를 불러오지 못했습니다.')
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void loadOverview(controller.signal)
    const interval = window.setInterval(() => void loadOverview(), 10_000)
    return () => {
      controller.abort()
      window.clearInterval(interval)
    }
  }, [loadOverview])
  const pendingRecommendations = useMemo(
    () => data.filter((recommendation) => (
      recommendation.status === 'review' || recommendation.status === 'edited'
    )),
    [data],
  )
  const pendingTimeSaleRecommendations = useMemo(
    () => pendingRecommendations.filter((recommendation) => (
      (recommendation.recommendationType?.toUpperCase() ?? 'TIME_SALE') === 'TIME_SALE'
    )),
    [pendingRecommendations],
  )
  const approvals = useMemo(
    () => isApiConnected ? createApprovalItems(pendingRecommendations) : DASHBOARD_APPROVALS,
    [isApiConnected, pendingRecommendations],
  )
  const metrics = useMemo(() => DASHBOARD_METRICS.map((metric) => {
    if (!isApiConnected) return metric
    if (metric.id === 'active-passes' && overview) {
      return { ...metric, value: `${overview.activePasses}장`, detail: '현재 서버 기준 활성 이용권' }
    }
    if (metric.id === 'sales' && overview) {
      return { ...metric, value: `${overview.totalSales.toLocaleString('ko-KR')}원`, detail: '현재 영업일 결제 매출' }
    }
    if (metric.id === 'rewards' && overview) {
      return { ...metric, label: '리워드 티어', value: `${overview.rewardTiers}개`, detail: '현재 운영 중인 누적 혜택', path: ADMIN_ROUTES.rewardTiers }
    }
    if (metric.id !== 'approvals') return metric
    if (isLoading) return { ...metric, value: '…', detail: 'AI 추천 현황을 불러오는 중' }
    if (error) return { ...metric, value: '-', detail: '추천 조회 상태를 확인해주세요' }
    return {
      ...metric,
      label: '타임세일 승인 대기',
      value: `${pendingTimeSaleRecommendations.length}건`,
      detail: pendingTimeSaleRecommendations.length > 0 ? '타임세일 제안 검토가 필요해요' : '모든 타임세일 추천을 검토했어요',
    }
  }), [error, isApiConnected, isLoading, overview, pendingTimeSaleRecommendations.length])
  const latestRecommendation = pendingRecommendations[0] ?? null
  const updatedAt = serverTime ? new Date(serverTime) : new Date()

  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">DASHBOARD <span>/ {ADMIN_ROUTES.dashboard.slice(1)}</span></p>
          <h1>오늘의 운영 현황</h1>
          <p className="welcome">좋은 오후예요, 김관리님. 오늘 매장의 흐름을 확인해보세요.</p>
        </div>
        <div className="date-chip"><span>●</span> 실시간 업데이트 · {updatedAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</div>
      </section>

      {(error || overviewError) && isApiConnected && (
        <div className="dashboard-api-error" role="alert">
          <span>{error || overviewError}</span>
          <button onClick={() => { void refetch(); void loadOverview() }}>다시 시도</button>
        </div>
      )}

      <section className="metric-grid" aria-label="주요 지표">
        {metrics.map((metric) => <DashboardMetricCard metric={metric} key={metric.id} />)}
      </section>

      <AiInsightBanner recommendation={latestRecommendation} isLoading={isApiConnected && isLoading} />

      <section className="content-grid">
        <DashboardActivityPanel activities={overview?.activities} />
        <DashboardApprovalPanel approvals={approvals} isLoading={isApiConnected && isLoading} />
      </section>

      <footer className="page-footer">© 2026 PenguinPort Admin Console <span>v1.0.0</span></footer>
    </>
  )
}
