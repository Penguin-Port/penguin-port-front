import type { MenuItem, PortalOrder, PortalOrderItem } from './customerTypes'

export const demoOtpCode = '123456'

export const portalDemo = {
  storeName: '팽귄포트 대학가 1호점',
  orderNo: 'A-1041',
  baseMinutes: 120,
  bonusMinutes: 30,
  paidAmount: 8500,
  dailyTotal: 10000,
  nextTierAmount: 20000,
  remainingToReward: 1500,
}

export const defaultPortalOrder: PortalOrder = {
  orderClaim: 'mock-order-claim',
  storeName: portalDemo.storeName,
  orderNo: portalDemo.orderNo,
  items: [
    {
      productId: 'americano',
      name: '아메리카노',
      quantity: 1,
      unitPrice: 4500,
      lineAmount: 4500,
    },
    {
      productId: 'cake',
      name: '케이크',
      quantity: 1,
      unitPrice: 4000,
      lineAmount: 4000,
    },
  ],
  paidAmount: portalDemo.paidAmount,
  providedMinutes: portalDemo.baseMinutes + portalDemo.bonusMinutes,
}

export const recommendedItems: MenuItem[] = [
  {
    id: 'butter-dacquoise',
    name: '버터덕',
    description: '누적까지 딱 맞는 금액',
    price: 3500,
  },
  {
    id: 'americano',
    name: '아메리카노',
    description: '타임세일 적용가 · 정상 4,000원',
    price: 3400,
  },
  {
    id: 'croffle',
    name: '크로플',
    description: '재고 임박 · 오늘 추천',
    price: 4160,
  },
]

export const rewardOptions = [
  {
    benefitId: 'size-up',
    title: '무료 사이즈업',
    description: '라떼를 자주 주문하셨습니다',
    recommended: true,
  },
  {
    benefitId: 'shot',
    title: '무료 샷 추가',
    description: '오늘 두 잔 이상 주문하셨습니다',
    recommended: false,
  },
  {
    benefitId: 'dessert',
    title: '디저트 할인',
    description: '디저트를 자주 주문하셨습니다',
    recommended: false,
  },
]

export function createMockPortalOrder(orderClaim: string): PortalOrder {
  if (!orderClaim) return defaultPortalOrder

  return {
    ...defaultPortalOrder,
    orderClaim,
  }
}

export function formatPortalOrderItems(items: PortalOrderItem[]) {
  return items.map((item) => `${item.name} ${item.quantity}개`).join(', ')
}
