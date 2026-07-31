import { useState } from 'react'
import { REWARD_TIERS } from '../../../constants/adminRewardTiers'
import { ADMIN_ROUTES } from '../../../constants/adminRoutes'
import type { RewardTier } from '../../../types/admin'
import { RewardTierCard } from './RewardTierCard'

export function AdminRewardTiersPage() {
  const [tiers, setTiers] = useState(REWARD_TIERS)

  const addBenefit = (tierId: string) => {
    setTiers((current) => current.map((tier): RewardTier => {
      if (tier.id !== tierId) return tier
      const benefitNumber = tier.benefits.length + 1
      return {
        ...tier,
        benefits: [
          ...tier.benefits,
          {
            id: `${tier.id}-benefit-${benefitNumber}`,
            name: `새 혜택 ${benefitNumber}`,
            weight: 0.5,
          },
        ],
      }
    }))
  }

  return (
    <>
      <section className="reward-tiers-heading">
        <p className="eyebrow">DAILY REWARD TIERS <span>/ {ADMIN_ROUTES.rewardTiers.slice(1)}</span></p>
        <h1>당일 누적 리워드 티어</h1>
        <p>쿠폰을 반복 지급하지 않습니다. 매장 영업일 기준 누적 금액 티어에 도달할 때마다 고객이 혜택을 선택합니다.</p>
      </section>

      <section className="reward-tier-list" aria-label="당일 누적 리워드 티어 목록">
        {tiers.map((tier) => (
          <RewardTierCard key={tier.id} tier={tier} onAddBenefit={addBenefit} />
        ))}
      </section>
    </>
  )
}
