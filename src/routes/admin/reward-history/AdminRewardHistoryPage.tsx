import { REWARD_HISTORY, REWARD_HISTORY_STATUS_LABELS } from '../../../constants/adminRewardHistory'
import { ADMIN_ROUTES } from '../../../constants/adminRoutes'

export function AdminRewardHistoryPage() {
  return (
    <>
      <section className="reward-history-heading">
        <p className="eyebrow">REWARD HISTORY <span>/ {ADMIN_ROUTES.rewardHistory.slice(1)}</span></p>
        <h1>지급 · 선택 · 사용 이력</h1>
      </section>

      <div className="reward-history-table-wrap">
        <table className="reward-history-table">
          <thead>
            <tr>
              <th>시각</th>
              <th>티어</th>
              <th>선택 혜택</th>
              <th>사용 방식</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {REWARD_HISTORY.map((item) => (
              <tr key={item.id}>
                <td>{item.time}</td>
                <td>{item.tier.toLocaleString('ko-KR')}원</td>
                <td>{item.benefit}</td>
                <td>{item.usageType}</td>
                <td><span className={`reward-history-status ${item.status}`}>{REWARD_HISTORY_STATUS_LABELS[item.status]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
