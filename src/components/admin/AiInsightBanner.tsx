import { Link } from 'react-router-dom'
import { ADMIN_ROUTES } from '../../constants/adminRoutes'
import { AdminIcon } from './AdminIcon'

export function AiInsightBanner() {
  return (
    <section className="ai-banner">
      <div className="ai-orb"><AdminIcon name="sparkles" /></div>
      <div className="ai-content">
        <div><span className="ai-label">AI 요약</span><span className="private-label">점주 승인 전에는 게시되지 않아요</span></div>
        <h2>오후 2~4시는 손님이 적습니다. 아메리카노 15% 타임세일로 매출을 높여보세요.</h2>
        <div className="ai-actions">
          <Link className="primary-button" to={ADMIN_ROUTES.aiTimeSales}>타임세일 추천 보기 <span>→</span></Link>
          <Link className="text-button" to={ADMIN_ROUTES.aiSales}>매출 분석 열기 <span>↗</span></Link>
        </div>
      </div>
    </section>
  )
}
