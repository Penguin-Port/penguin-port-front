import type { RewardHistoryItem } from '../types/admin'

export const REWARD_HISTORY: RewardHistoryItem[] = [
  { id: 'reward-1', time: '14:22', tier: 10_000, benefit: '무료 사이즈업', usageType: '즉시 사용', status: 'used' },
  { id: 'reward-2', time: '13:01', tier: 5_000, benefit: '다음 방문 할인쿠폰', usageType: '쿠폰 저장', status: 'saved' },
  { id: 'reward-3', time: '11:48', tier: 20_000, benefit: 'Wi-Fi 종일권', usageType: '즉시 사용', status: 'used' },
  { id: 'reward-4', time: '11:12', tier: 10_000, benefit: '디저트 할인', usageType: '쿠폰 저장', status: 'expired' },
  { id: 'reward-5', time: '10:05', tier: 5_000, benefit: '마일리지 적립', usageType: '즉시 사용', status: 'used' },
]

export const REWARD_HISTORY_STATUS_LABELS = {
  used: 'USED',
  saved: 'SAVED',
  expired: 'EXPIRED',
} as const
