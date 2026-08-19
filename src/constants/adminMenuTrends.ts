import type { MenuTrend } from '../types/admin'

export const MENU_TRENDS: MenuTrend[] = [
  {
    id: 'trend-1',
    name: '버터떡',
    description: 'SNS 언급이 3주 연속 증가하고 있습니다. 20대 여성 비중이 높습니다.',
    expectedMargin: 62,
    status: 'interested',
  },
  {
    id: 'trend-2',
    name: '두쫀쿠',
    description: '대학가 상권 검색량이 최근 2주간 급증했습니다.',
    expectedMargin: 58,
    status: 'reviewing',
  },
  {
    id: 'trend-3',
    name: '말차 디저트',
    description: '여름 시즌 재구매율이 높은 카테고리입니다.',
    expectedMargin: 55,
    status: 'new',
  },
]
