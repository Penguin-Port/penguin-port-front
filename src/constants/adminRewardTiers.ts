import type { RewardTier } from '../types/admin'

export const REWARD_TIERS: RewardTier[] = [
  {
    id: 'tier-5000',
    threshold: 5_000,
    reachRate: 42,
    benefits: [
      { id: 'benefit-5000-1', name: '다음 방문 할인쿠폰', weight: 1.0 },
      { id: 'benefit-5000-2', name: '마일리지 적립', weight: 0.8 },
    ],
  },
  {
    id: 'tier-10000',
    threshold: 10_000,
    reachRate: 28,
    benefits: [
      { id: 'benefit-10000-1', name: '무료 샷 추가', weight: 0.9 },
      { id: 'benefit-10000-2', name: '무료 사이즈업', weight: 1.2 },
      { id: 'benefit-10000-3', name: '디저트 할인', weight: 0.7 },
    ],
  },
  {
    id: 'tier-20000',
    threshold: 20_000,
    reachRate: 11,
    benefits: [
      { id: 'benefit-20000-1', name: 'Wi-Fi 종일권', weight: 1.1 },
      { id: 'benefit-20000-2', name: '음료 할인', weight: 0.9 },
      { id: 'benefit-20000-3', name: '신메뉴 시식권', weight: 0.6 },
    ],
  },
]
