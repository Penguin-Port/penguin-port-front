import { Link } from 'react-router-dom'
import { ADMIN_ROUTES } from '../../constants/adminRoutes'
import type { TimeSaleRecommendation } from '../../types/admin'
import { AdminIcon } from './AdminIcon'

interface AiInsightBannerProps {
  recommendation: TimeSaleRecommendation | null
  isLoading?: boolean
}

export function AiInsightBanner({ recommendation, isLoading = false }: AiInsightBannerProps) {
  const message = isLoading
    ? '최신 AI 추천을 불러오는 중입니다.'
    : recommendation
      ? `${recommendation.timeRange} ${recommendation.menu} ${recommendation.discountRate}% 타임세일을 검토해보세요.`
      : '현재 승인 대기 중인 AI 추천이 없습니다. 매장 운영 상태가 안정적입니다.'

  return (
    <section className="ai-banner" aria-busy={isLoading}>
      <div className="ai-orb"><AdminIcon name="sparkles" /></div>
      <div className="ai-content">
        <div>
          <span className="ai-label">AI 요약</span>
          <span className="private-label">점주 승인 전에는 게시되지 않아요</span>
        </div>
        <h2>{message}</h2>
        <div className="ai-actions">
          <Link className="primary-button" to={ADMIN_ROUTES.aiTimeSales}>
            {recommendation ? '추천 검토하기' : 'AI 추천 목록 보기'} <span>→</span>
          </Link>
          <Link className="text-button" to={ADMIN_ROUTES.aiSales}>매출 분석 열기 <span>↗</span></Link>
        </div>
      </div>
    </section>
  )
}
