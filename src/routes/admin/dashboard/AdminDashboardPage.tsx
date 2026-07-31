import {
  AiInsightBanner,
  DashboardActivityPanel,
  DashboardApprovalPanel,
  DashboardMetricCard,
} from '../../../components/admin'
import { DASHBOARD_METRICS } from '../../../constants/adminDashboard'
import { ADMIN_ROUTES } from '../../../constants/adminRoutes'

export function AdminDashboardPage() {
  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">DASHBOARD <span>/ {ADMIN_ROUTES.dashboard.slice(1)}</span></p>
          <h1>오늘의 운영 현황</h1>
          <p className="welcome">좋은 오후예요, 김관리님. 오늘 매장의 흐름을 확인해보세요.</p>
        </div>
        <div className="date-chip"><span>●</span> 실시간 업데이트 · 오후 2:31</div>
      </section>

      <section className="metric-grid" aria-label="주요 지표">
        {DASHBOARD_METRICS.map((metric) => (
          <DashboardMetricCard metric={metric} key={metric.label} />
        ))}
      </section>

      <AiInsightBanner />

      <section className="content-grid">
        <DashboardActivityPanel />
        <DashboardApprovalPanel />
      </section>

      <footer className="page-footer">© 2026 PenguinPort Admin Console <span>v1.0.0</span></footer>
    </>
  )
}
