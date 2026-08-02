export const HOURLY_REVENUE = [12, 28, 23, 42, 37, 19, 14, 21, 31]
export const CONGESTION = [31, 64, 79, 94, 88, 45, 36, 41, 69]
export const REPEAT_PURCHASE = [31, 28, 42, 35, 39, 55, 47]

export const TOP_MENUS = [
  { name: '아메리카노', value: 42 },
  { name: '카페라떼', value: 38 },
  { name: '크로플', value: 24 },
  { name: '버터떡', value: 19 },
  { name: '치즈케이크', value: 14 },
]

export const SALES_INSIGHTS = [
  {
    title: '오후 2~4시 타임세일 효과 분석',
    description: '유사 매장 대비 혼잡도 기준 예측 매출이 18% 낮습니다.',
    action: '타임세일 추천 보기',
    path: ADMIN_ROUTES.aiTimeSales,
  },
  {
    title: '재구매 고객이 가장 많은 시간대는 오전 10~11시',
    description: '체류 시간이 길고 재구매율이 높은 단골 고객층입니다.',
    action: '이용권 정책 조정',
    path: ADMIN_ROUTES.wifiPolicies,
  },
  {
    title: '버터떡 · 두쫀쿠가 재고 대비 매출이 낮습니다',
    description: '프로모션 또는 SNS 홍보가 필요합니다.',
    action: '재고 추천 보기',
    path: ADMIN_ROUTES.aiInventory,
  },
]

export const SALES_SUMMARY = [
  { label: 'Wi-Fi 이용 → 재주문 전환율', value: '34%', description: '이용권 활성화 후 추가주문 비율' },
  { label: '평균 체류 시간 (이용권 기준)', value: '1시간 48분', description: '서버 시간 기준 평균' },
  { label: '리워드 선택률', value: '91%', description: '티어 달성 후 24시간 이내' },
]
import { ADMIN_ROUTES } from './adminRoutes'
