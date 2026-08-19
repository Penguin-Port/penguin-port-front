import type {
  DashboardActivity,
  DashboardApproval,
  DashboardMetric,
} from '../types/admin'
import { ADMIN_ROUTES } from './adminRoutes'

export const DASHBOARD_METRICS: DashboardMetric[] = [
  { id: 'active-passes', label: '활성 이용권', value: '128장', detail: '전일 대비 +12장', tone: 'blue', path: ADMIN_ROUTES.livePasses },
  { id: 'sales', label: '오늘 매출', value: '2,840,000원', detail: '어제 대비 23% 증가', tone: 'green', path: ADMIN_ROUTES.aiSales },
  { id: 'rewards', label: '리워드 달성', value: '24건', detail: '오늘 발행 · 18건 선택 완료', tone: 'purple', path: ADMIN_ROUTES.rewardHistory },
  { id: 'approvals', label: '승인 대기', value: '6건', detail: 'AI 제안 검토가 필요해요', tone: 'orange', path: ADMIN_ROUTES.aiTimeSales },
]

export const DASHBOARD_ACTIVITIES: DashboardActivity[] = [
  { id: 'activity-1', title: '이용권 활성화', description: 'P-2481 · 주문 고객에게 Wi-Fi 2시간 제공', time: '14:28', color: 'green' },
  { id: 'activity-2', title: '리워드 달성', description: '누적 10,000원 · 고객이 무료 음료를 선택했습니다', time: '14:22', color: 'purple' },
  { id: 'activity-3', title: '재고 위험', description: '우유 1L 유통기한 D-1 · 프로모션 검토 필요', time: '14:15', color: 'orange' },
  { id: 'activity-4', title: '타임세일 종료', description: '오전 10~11시 카페라떼 10% 할인', time: '11:01', color: 'gray' },
]

export const DASHBOARD_APPROVALS: DashboardApproval[] = [
  { id: 'approval-1', type: 'AI 타임세일 추천', description: '오후 2~4시 아메리카노 15%', count: 2, path: ADMIN_ROUTES.aiTimeSales },
  { id: 'approval-2', type: 'AI 재고 프로모션', description: '유통기한 임박 · 케이크 세트 할인', count: 1, path: ADMIN_ROUTES.aiInventory },
  { id: 'approval-3', type: 'AI 신메뉴 트렌드', description: '버터떡 · 두쫀쿠 · 말차 디저트', count: 3, path: ADMIN_ROUTES.aiMenuTrends },
]
