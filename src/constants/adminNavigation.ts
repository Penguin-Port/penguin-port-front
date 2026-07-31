import type { AdminNavigationItem } from '../types/admin'
import { ADMIN_ROUTES } from './adminRoutes'

export const ADMIN_NAVIGATION: AdminNavigationItem[] = [
  { label: '대시보드', path: ADMIN_ROUTES.dashboard, icon: 'dashboard' },
  { label: 'AI 매출 분석', path: ADMIN_ROUTES.aiSales, icon: 'chart' },
  { label: 'AI 타임세일', path: ADMIN_ROUTES.aiTimeSales, icon: 'clock' },
  { label: 'AI 재고 · 유통기한', path: ADMIN_ROUTES.aiInventory, icon: 'box' },
  { label: 'AI 신메뉴 트렌드', path: ADMIN_ROUTES.aiMenuTrends, icon: 'sparkles' },
  { label: '실시간 이용권', path: ADMIN_ROUTES.livePasses, icon: 'ticket' },
  { label: 'Wi-Fi 시간 정책', path: ADMIN_ROUTES.wifiPolicies, icon: 'wifi' },
  { label: '리워드 티어', path: ADMIN_ROUTES.rewardTiers, icon: 'gift' },
  { label: '리워드 이력', path: ADMIN_ROUTES.rewardHistory, icon: 'receipt' },
  { label: '주문', path: ADMIN_ROUTES.orders, icon: 'receipt' },
  { label: '알림', path: ADMIN_ROUTES.notifications, icon: 'bell' },
  { label: '이상 징후', path: ADMIN_ROUTES.anomalies, icon: 'shield' },
  { label: '팀 · 권한', path: ADMIN_ROUTES.team, icon: 'users' },
  { label: '감사 로그', path: ADMIN_ROUTES.audit, icon: 'receipt' },
  { label: '설정', path: ADMIN_ROUTES.settings, icon: 'settings' },
  { label: '개인정보 보관 · 폐기', path: ADMIN_ROUTES.privacy, icon: 'shield' },
]
