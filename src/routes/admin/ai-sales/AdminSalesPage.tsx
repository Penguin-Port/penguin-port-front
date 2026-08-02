import { Link } from 'react-router-dom'
import {
  CONGESTION,
  HOURLY_REVENUE,
  REPEAT_PURCHASE,
  SALES_INSIGHTS,
  SALES_SUMMARY,
} from '../../../constants/adminSales'
import { ADMIN_ROUTES } from '../../../constants/adminRoutes'
import { SalesChartCard } from './SalesChartCard'
import { SalesLineChart } from './SalesLineChart'
import { TopMenuChart } from './TopMenuChart'

export function AdminSalesPage() {
  return (
    <>
      <section className="sales-page-heading">
        <p className="eyebrow">AI SALES ANALYTICS <span>/ {ADMIN_ROUTES.aiSales.slice(1)}</span></p>
        <h1>AI 매출 분석</h1>
        <p>차트 데이터는 API 응답을 그대로 렌더링하며, 현재는 화면 확인을 위한 샘플 데이터입니다.</p>
      </section>

      <section className="sales-chart-grid" aria-label="매출 분석 차트">
        <SalesChartCard title="시간대별 매출 / Hourly revenue" endpoint="GET /ai/sales/hourly">
          <SalesLineChart values={HOURLY_REVENUE} max={50} labels={['9시', '11시', '13시', '15시', '17시']} />
        </SalesChartCard>
        <SalesChartCard title="혼잡도 / Congestion" endpoint="GET /ai/sales/congestion">
          <SalesLineChart values={CONGESTION} color="#ff4d70" fill="#ffe8ee" labels={['9시', '11시', '13시', '15시', '17시']} />
        </SalesChartCard>
        <SalesChartCard title="인기 메뉴 / Top menus" endpoint="GET /ai/sales/menus">
          <TopMenuChart />
        </SalesChartCard>
        <SalesChartCard title="재방문 / Repeat purchase" endpoint="GET /ai/sales/revisit" className="repeat-chart">
          <SalesLineChart values={REPEAT_PURCHASE} color="#ff4d70" fill="#ffe8ee" labels={['월', '수', '금', '일']} />
        </SalesChartCard>
      </section>

      <section className="sales-insight-grid" aria-label="AI 인사이트">
        {SALES_INSIGHTS.map((insight) => (
          <article className="sales-insight-card" key={insight.title}>
            <span>AI 인사이트</span>
            <h2>{insight.title}</h2>
            <p>{insight.description}</p>
            <Link className="sales-insight-action" to={insight.path}>{insight.action} <i>→</i></Link>
          </article>
        ))}
      </section>

      <section className="sales-summary" aria-label="매출 요약 지표">
        {SALES_SUMMARY.map((item) => (
          <article key={item.label}>
            <p>{item.label}</p>
            <strong>{item.value}</strong>
            <small>{item.description}</small>
          </article>
        ))}
      </section>
    </>
  )
}
