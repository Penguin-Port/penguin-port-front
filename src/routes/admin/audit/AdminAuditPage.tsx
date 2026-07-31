import { AUDIT_LOGS } from '../../../constants/adminAudit'
import { ADMIN_ROUTES } from '../../../constants/adminRoutes'

export function AdminAuditPage() {
  return (
    <>
      <section className="audit-heading">
        <p className="eyebrow">AUDIT LOG <span>/ {ADMIN_ROUTES.audit.slice(1)}</span></p>
        <h1>감사 로그</h1>
        <p>승인·수정·거절과 정책 변경은 모두 기록됩니다.</p>
      </section>

      <div className="audit-table-wrap">
        <table className="audit-table">
          <thead><tr><th>시각</th><th>수행자</th><th>행위</th><th>대상 · 변경</th></tr></thead>
          <tbody>
            {AUDIT_LOGS.map((log) => (
              <tr key={log.id}>
                <td>{log.time}</td>
                <td>{log.actor}</td>
                <td>{log.action}</td>
                <td>{log.change}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
