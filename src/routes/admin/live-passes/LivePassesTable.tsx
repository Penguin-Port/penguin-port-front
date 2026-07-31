import { LIVE_PASSES, LIVE_PASS_STATUS_LABELS } from '../../../constants/adminLivePasses'

export function LivePassesTable() {
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
          </tr>
        </thead>
        <tbody>
          {LIVE_PASSES.map((pass) => (
            <tr key={pass.id}>
              <td>{pass.id}</td>
              <td>{pass.phone}</td>
              <td className="remaining-time">{pass.remaining}</td>
              <td>{pass.totalProvided}</td>
              <td>{pass.source}</td>
              <td><span className={`live-pass-status ${pass.status}`}>{LIVE_PASS_STATUS_LABELS[pass.status]}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
