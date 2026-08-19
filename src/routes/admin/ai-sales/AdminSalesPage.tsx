import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../../../api'
import { EmptyState, ErrorState, LoadingState } from '../../../components/admin'
import { isApiConfigured } from '../../../config/env'
import {
  CONGESTION,
  HOURLY_REVENUE,
  SALES_INSIGHTS,
  SALES_SUMMARY,
  TOP_MENUS,
} from '../../../constants/adminSales'
import { ADMIN_ROUTES } from '../../../constants/adminRoutes'
import type { SalesSummaryResponse } from '../../../types/api'
import { SalesChartCard } from './SalesChartCard'
import { SalesLineChart } from './SalesLineChart'
import { TopMenuChart } from './TopMenuChart'

function hourLabel(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : `${date.getHours()}시`
}

export function AdminSalesPage() {
  const [summary, setSummary] = useState<SalesSummaryResponse | null>(null)
  const [isLoading, setIsLoading] = useState(isApiConfigured)
  const [error, setError] = useState('')

  const loadSummary = useCallback(async (signal?: AbortSignal) => {
    if (!isApiConfigured) return
    setIsLoading(true)
    setError('')
    try {
      const response = await adminApi.getSalesSummary(signal)
      setSummary(response.data)
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === 'AbortError') return
      setError('매출 분석 데이터를 불러오지 못했습니다. 백엔드와 관리자 계정을 확인해주세요.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void loadSummary(controller.signal)
    return () => controller.abort()
  }, [loadSummary])

  const chartData = useMemo(() => {
    if (!summary) return null
    const revenue = summary.hourly.map((item) => Math.round(item.grossSales / 1_000))
    const orders = summary.hourly.map((item) => item.orderCount)
    const maxOrders = Math.max(1, ...orders)
    return {
      revenue,
      congestion: orders.map((count) => Math.round((count / maxOrders) * 100)),
      labels: summary.hourly.map((item) => hourLabel(item.bucketStart)),
      topMenus: summary.topItems.map((item) => ({ name: item.name, value: item.quantity })),
    }
  }, [summary])

  const insights = summary
    ? [
        {
          title: summary.recommendation.summary ?? '오늘 매출 분석',
          description: summary.recommendation.reason,
          action: '타임세일 추천 보기',
          path: ADMIN_ROUTES.aiTimeSales,
        },
        ...SALES_INSIGHTS.slice(1),
      ]
    : SALES_INSIGHTS
  const summaryItems = summary
    ? [
        { label: '오늘 매출', value: `${summary.totalSales.toLocaleString('ko-KR')}원`, description: `${summary.totalOrders}건 주문` },
        { label: '활성 Wi-Fi 이용권', value: `${summary.wifiActiveCount}건`, description: `총 ${summary.wifiActiveMinutes.toLocaleString('ko-KR')}분 제공` },
        {
          label: '재구매 고객',
          value: `${summary.repeatCustomerCount}명`,
          description: `전체 주문 고객 집계 기준`,
        },
      ]
    : SALES_SUMMARY

  return (
    <>
      <section className="sales-page-heading">
        <p className="eyebrow">AI SALES ANALYTICS <span>/ {ADMIN_ROUTES.aiSales.slice(1)}</span></p>
        <h1>AI 매출 분석</h1>
        <p>{isApiConfigured ? '서버의 영업일 매출 집계와 AI 요약을 표시합니다.' : '백엔드 미연동 모드의 샘플 데이터입니다.'}</p>
      </section>

      {isLoading && <LoadingState count={4} label="매출 분석 데이터를 불러오는 중입니다." />}
      {error && <ErrorState description={error} onRetry={() => void loadSummary()} />}
      {!isLoading && !error && summary && summary.hourly.length === 0 && (
        <EmptyState title="오늘 주문 데이터가 없습니다" description="POS 주문이 생성되면 시간대별 차트가 표시됩니다." />
      )}

      {!isLoading && !error && ((chartData && chartData.revenue.length > 0) || !isApiConfigured) && (
        <section className="sales-chart-grid" aria-label="매출 분석 차트">
          <SalesChartCard title="시간대별 매출 / Hourly revenue" endpoint="GET /admin/ai/sales-summary">
            <SalesLineChart
              values={chartData?.revenue ?? HOURLY_REVENUE}
              max={Math.max(1, ...(chartData?.revenue ?? HOURLY_REVENUE))}
              labels={chartData?.labels ?? ['9시', '11시', '13시', '15시', '17시']}
            />
          </SalesChartCard>
          <SalesChartCard title="시간대별 주문 비중 / Congestion" endpoint="GET /admin/ai/sales-summary">
            <SalesLineChart values={chartData?.congestion ?? CONGESTION} color="#ff4d70" fill="#ffe8ee" labels={chartData?.labels ?? ['9시', '11시', '13시', '15시', '17시']} />
          </SalesChartCard>
          <SalesChartCard title="인기 메뉴 / Top menus" endpoint="GET /admin/ai/sales-summary">
            <TopMenuChart items={chartData?.topMenus ?? TOP_MENUS} />
          </SalesChartCard>
          <SalesChartCard title="재구매 고객 / Repeat customers" endpoint="GET /admin/ai/sales-summary" className="repeat-chart">
            <div className="repeat-customer-summary">
              <strong>{summary ? `${summary.repeatCustomerCount}명` : '표시 전'}</strong>
              <span>현재 영업일에 주문을 2회 이상 완료한 고객 수</span>
              <small>백엔드가 추이 데이터를 제공하기 전까지 실제 집계값만 표시합니다.</small>
            </div>
          </SalesChartCard>
        </section>
      )}

      {!isLoading && !error && (
        <>
          <section className="sales-insight-grid" aria-label="AI 인사이트">
            {insights.map((insight) => (
              <article className="sales-insight-card" key={insight.title}>
                <span>AI 인사이트</span>
                <h2>{insight.title}</h2>
                <p>{insight.description}</p>
                <Link className="sales-insight-action" to={insight.path}>{insight.action} <i>→</i></Link>
              </article>
            ))}
          </section>

          <section className="sales-summary" aria-label="매출 요약 지표">
            {summaryItems.map((item) => (
              <article key={item.label}>
                <p>{item.label}</p>
                <strong>{item.value}</strong>
                <small>{item.description}</small>
              </article>
            ))}
          </section>
        </>
      )}
    </>
  )
}
