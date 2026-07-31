import type { AdminOrder } from '../types/admin'

export const ADMIN_ORDERS: AdminOrder[] = [
  { id: 'order-1', time: '14:28', orderNumber: 'A-1041', amount: 12_500, wifiPass: '2시간 45분 발급', reward: '선택 대기 중', hasWifiPass: true, hasReward: true },
  { id: 'order-2', time: '13:54', orderNumber: 'A-1040', amount: 8_500, wifiPass: '2시간 발급', reward: '무료 사이즈업 사용', hasWifiPass: true, hasReward: true },
  { id: 'order-3', time: '12:31', orderNumber: 'A-1039', amount: 20_400, wifiPass: '종일권 전환', reward: 'Wi-Fi 종일권 (자동)', hasWifiPass: true, hasReward: true },
  { id: 'order-4', time: '11:02', orderNumber: 'A-1038', amount: 6_000, wifiPass: '2시간 발급', reward: '마일리지 적립', hasWifiPass: true, hasReward: true },
  { id: 'order-5', time: '10:44', orderNumber: 'A-1037', amount: 4_800, wifiPass: '2시간 발급', reward: '—', hasWifiPass: true, hasReward: false },
]
