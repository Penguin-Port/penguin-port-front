import type { LookupPass, MenuItem, PortalOrder, Screen } from './customerTypes'

export const pass = {
  brand: '펭귄포트',
  orderNo: '20260728-0012',
  item: '아메리카노 1잔, 케이크 1개',
  amount: '8,500원',
  minutes: 120,
}

export const demoOtpCode = '123456'
export const lookupPhone = '01011111111'

export const steps: { key: string; id: Screen; label: string }[] = [
  { key: 'home', id: 'home', label: '홈' },
  { key: 'menu', id: 'menu', label: '주문' },
  { key: 'auth', id: 'home', label: '인증' },
  { key: 'active', id: 'active', label: '이용 중' },
]

export const menuItems: MenuItem[] = [
  {
    id: 'americano',
    name: '아메리카노',
    description: '기본 WiFi 이용권이 포함됩니다.',
    price: 4500,
  },
  {
    id: 'cake',
    name: '케이크',
    description: '함께 주문하면 리워드 적립에 가까워져요.',
    price: 4000,
  },
  {
    id: 'latte',
    name: '카페라떼',
    description: '부드러운 우유 베이스 메뉴입니다.',
    price: 5200,
  },
]

export const defaultPortalOrder: PortalOrder = {
  orderClaim: 'mock-order-claim',
  storeName: '펭귄 카페 MVP',
  orderNo: pass.orderNo,
  items: pass.item,
  paidAmount: parseWon(pass.amount),
  providedMinutes: pass.minutes,
}

export const guestPasses: LookupPass[] = [
  {
    id: 'pass-active',
    label: '현재 이용 중',
    orderNo: pass.orderNo,
    purchasedAt: '2026.07.28 14:22',
    status: 'ACTIVE',
    title: `WiFi 이용권 ${pass.minutes}분`,
    description: '현재 매장에서 이용 중인 이용권입니다.',
  },
  {
    id: 'pass-expired',
    label: '이전 구매',
    orderNo: '20260721-0007',
    purchasedAt: '2026.07.21 12:08',
    status: 'EXPIRED',
    title: 'WiFi 이용권 90분',
    description: '이용이 종료된 이전 구매 이용권입니다.',
  },
]

export function createMockPortalOrder(
  orderClaim: string,
  items: MenuItem[],
): PortalOrder {
  if (!orderClaim) return defaultPortalOrder

  // Mock boundary: exchange(orderClaim) should return these display fields.
  const paidAmount = items.reduce((total, item) => total + item.price, 0)
  const orderItems = items.map((item) => `${item.name} 1개`).join(', ')

  return {
    ...defaultPortalOrder,
    orderClaim,
    orderNo: `QR-${orderClaim.slice(-6).toUpperCase().padStart(6, '0')}`,
    items: orderItems || defaultPortalOrder.items,
    paidAmount: paidAmount || defaultPortalOrder.paidAmount,
  }
}

function parseWon(value: string) {
  return Number(value.replace(/\D/g, ''))
}
