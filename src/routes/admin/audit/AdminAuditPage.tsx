import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '../../../api'
import { EmptyState, ErrorState, LoadingState } from '../../../components/admin'
import { isApiConfigured } from '../../../config/env'
import { AUDIT_LOGS } from '../../../constants/adminAudit'
import { ADMIN_ROUTES } from '../../../constants/adminRoutes'
import type { AuditLogItem } from '../../../types/admin'
import { mapApiAuditLog } from '../../../utils/adminApiMappers'

export function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>(isApiConfigured ? [] : AUDIT_LOGS)
  const [isLoading, setIsLoading] = useState(isApiConfigured)
  const [error, setError] = useState('')

  const loadLogs = useCallback(async (signal?: AbortSignal) => {
    if (!isApiConfigured) return
    setIsLoading(true)
    setError('')
    try {
      const response = await adminApi.getAuditLogs(100, signal)
      setLogs(response.data.map(mapApiAuditLog))
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === 'AbortError') return
      setError('감사 로그를 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void loadLogs(controller.signal)
    return () => controller.abort()
  }, [loadLogs])

  return (
    <>
      <section className="audit-heading">
        <p className="eyebrow">AUDIT LOG <span>/ {ADMIN_ROUTES.audit.slice(1)}</span></p>
        <h1>감사 로그</h1>
        <p>승인·수정·거절과 정책 변경은 모두 서버에 기록됩니다.</p>
      </section>

      {isLoading && <LoadingState variant="table" label="감사 로그를 불러오는 중입니다." />}
      {error && <ErrorState description={error} onRetry={() => void loadLogs()} />}
      {!isLoading && !error && logs.length === 0 && <EmptyState title="기록된 감사 로그가 없습니다" description="관리자 작업이 발생하면 이곳에 표시됩니다." />}
      {!isLoading && !error && logs.length > 0 && (
        <div className="audit-table-wrap">
          <table className="audit-table">
            <thead><tr><th>시각</th><th>수행자</th><th>행위</th><th>대상 · 변경</th></tr></thead>
            <tbody>
              {logs.map((log) => (
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
      )}
    </>
  )
}
