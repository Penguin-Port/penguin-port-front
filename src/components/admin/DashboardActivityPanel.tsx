import { DASHBOARD_ACTIVITIES } from '../../constants/adminDashboard'

export function DashboardActivityPanel() {
  return (
    <article className="panel activity-panel">
      <div className="panel-heading">
        <div><span className="panel-kicker">LIVE FEED</span><h2>실시간 이벤트</h2></div>
        <span className="connection"><i /> 10초마다 갱신</span>
      </div>
      <div className="activity-list">
        {DASHBOARD_ACTIVITIES.map((activity) => (
          <div className="activity-row" key={activity.id}>
            <span className={`activity-dot ${activity.color}`} />
            <div><b>{activity.title}</b><p>{activity.description}</p></div>
            <time>{activity.time}</time>
          </div>
        ))}
      </div>
      <button className="panel-link">전체 이벤트 보기 <span>→</span></button>
    </article>
  )
}
