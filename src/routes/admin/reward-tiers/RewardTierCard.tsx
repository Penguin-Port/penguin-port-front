import type { RewardTier } from '../../../types/admin'

interface RewardTierCardProps {
  tier: RewardTier
  onAddBenefit: (tierId: string) => void
}

export function RewardTierCard({ tier, onAddBenefit }: RewardTierCardProps) {
  return (
    <article className="reward-tier-card">
      <div className="reward-tier-summary">
        <span>당일 누적</span>
        <strong>{tier.threshold.toLocaleString('ko-KR')}원</strong>
        <small>당일 방문의 약 {tier.reachRate}%가 도달</small>
      </div>
      <div className="reward-benefit-area">
        <h2>선택 가능 혜택 풀 / benefit pool</h2>
        <div className="reward-benefit-list">
          {tier.benefits.map((benefit) => (
            <span className="reward-benefit" key={benefit.id}>
              {benefit.name} <small>w {benefit.weight.toFixed(1)}</small>
            </span>
          ))}
          <button onClick={() => onAddBenefit(tier.id)}>＋ 혜택 추가</button>
        </div>
        <p>AI 정렬 가중치는 점주가 승인·수정합니다. 고객 화면은 서버의 rankedOptions만 렌더링합니다.</p>
      </div>
    </article>
  )
}
