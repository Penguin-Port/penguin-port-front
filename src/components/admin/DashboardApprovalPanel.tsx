import { Link } from 'react-router-dom'
import { ADMIN_ROUTES } from '../../constants/adminRoutes'
import type { DashboardApproval } from '../../types/admin'

interface DashboardApprovalPanelProps {
  approvals: DashboardApproval[]
  isLoading?: boolean
}

export function DashboardApprovalPanel({ approvals, isLoading = false }: DashboardApprovalPanelProps) {
  const totalCount = approvals.reduce((total, approval) => total + approval.count, 0)

  return (
    <article className="panel approval-panel" aria-busy={isLoading}>
      <div className="panel-heading">
        <div><span className="panel-kicker">ACTION NEEDED</span><h2>승인 대기</h2></div>
        <span className="count-badge">{isLoading ? '…' : totalCount}</span>
      </div>
      <div className="approval-list">
        {isLoading ? (
          Array.from({ length: 3 }, (_, index) => <span className="approval-skeleton" key={index} />)
        ) : approvals.length > 0 ? (
          approvals.map((approval) => (
            <Link className="approval-row" key={approval.id} to={approval.path}>
              <span><b>{approval.type}</b><small>{approval.description}</small></span>
              <span className="approval-count">{approval.count}건 <i>→</i></span>
            </Link>
          ))
        ) : (
          <p className="approval-empty">현재 승인 대기 중인 AI 추천이 없습니다.</p>
        )}
      </div>
      <Link className="panel-link" to={approvals[0]?.path ?? ADMIN_ROUTES.aiTimeSales}>모든 승인 항목 보기 <span>→</span></Link>
    </article>
  )
}
