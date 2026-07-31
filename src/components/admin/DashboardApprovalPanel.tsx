import { Link } from 'react-router-dom'
import { DASHBOARD_APPROVALS } from '../../constants/adminDashboard'
import { ADMIN_ROUTES } from '../../constants/adminRoutes'

const APPROVAL_ROUTES: Record<string, string> = {
  'approval-1': ADMIN_ROUTES.aiTimeSales,
  'approval-2': ADMIN_ROUTES.aiInventory,
  'approval-3': ADMIN_ROUTES.aiMenuTrends,
}

export function DashboardApprovalPanel() {
  return (
    <article className="panel approval-panel">
      <div className="panel-heading">
        <div><span className="panel-kicker">ACTION NEEDED</span><h2>승인 대기</h2></div>
        <span className="count-badge">6</span>
      </div>
      <div className="approval-list">
        {DASHBOARD_APPROVALS.map((approval) => (
          <Link className="approval-row" key={approval.id} to={APPROVAL_ROUTES[approval.id]}>
            <span><b>{approval.type}</b><small>{approval.description}</small></span>
            <span className="approval-count">{approval.count}건 <i>→</i></span>
          </Link>
        ))}
      </div>
      <button className="panel-link">모든 승인 항목 보기 <span>→</span></button>
    </article>
  )
}
