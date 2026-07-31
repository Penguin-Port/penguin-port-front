import type { TimeSaleRecommendation } from '../types/admin'

export const TIME_SALE_RECOMMENDATIONS: TimeSaleRecommendation[] = [
  {
    id: 'time-sale-1',
    menu: '아메리카노',
    discountRate: 15,
    timeRange: '오후 2~4시',
    status: 'review',
    reasons: ['혼잡 ↓', '판매 ↓'],
  },
  {
    id: 'time-sale-2',
    menu: '크로플',
    discountRate: 20,
    timeRange: '오후 8~9시',
    status: 'review',
    reasons: ['재고 ↑', '판매 ↓'],
  },
  {
    id: 'time-sale-3',
    menu: '카페라떼',
    discountRate: 10,
    timeRange: '오전 10~11시',
    status: 'active',
    reasons: ['혼잡 ↓'],
  },
  {
    id: 'time-sale-4',
    menu: '치즈케이크',
    discountRate: 15,
    timeRange: '오후 5~6시',
    status: 'ended',
    reasons: ['재고 ↑'],
  },
]
