import { LIVE_PASS_STATUS_LABELS } from '../../../constants/adminLivePasses'
import type { LivePass } from '../../../types/admin'

interface LivePassesTableProps {
  passes: LivePass[]
  isApiConnected: boolean
  pendingPassId: string | null
  onExtend: (passId: string) => void
  onExpire: (passId: string) => void
}

export function LivePassesTable({
  passes,
  isApiConnected,
  pendingPassId,
  onExtend,
  onExpire,
}: LivePassesTableProps) {
  return (
    <div className="live-passes-table-wrap">
      <table className="live-passes-table">
        <thead>
          <tr>
            <th>이용권</th>
            <th>연락처</th>
            <th>잔여</th>
            <th>총 제공</th>
            <th>발급 근거</th>
            <th>상태</th>
            {isApiConnected && <th>관리</th>}
          </tr>
        </thead>
        <tbody>
          {passes.map((pass) => (
            <tr key={pass.id}>
              <td title={pass.id}>{pass.id.length > 12 ? `${pass.id.slice(0, 8)}…` : pass.id}</td>
              <td>{pass.phone}</td>
              <td className="remaining-time">{pass.remaining}</td>
              <td>{pass.totalProvided}</td>
              <td>{pass.source}</td>
              <td><span className={`live-pass-status ${pass.status}`}>{LIVE_PASS_STATUS_LABELS[pass.status]}</span></td>
              {isApiConnected && (
                <td>
                  <div className="pass-actions">
                    <button disabled={pendingPassId === pass.id} onClick={() => onExtend(pass.id)}>+15분</button>
                    <button className="danger" disabled={pendingPassId === pass.id} onClick={() => onExpire(pass.id)}>종료</button>
                  </div>
                </td>
              )}
            </tr>
          ))}
          {passes.length === 0 && (
            <tr><td className="table-empty" colSpan={isApiConnected ? 7 : 6}>현재 활성 이용권이 없습니다.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
