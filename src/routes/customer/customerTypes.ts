export type Screen =
  | 'qr'
  | 'auth'
  | 'start'
  | 'active'
  | 'reward'
  | 'coupons'
  | 'extend'
  | 'expired'
  | 'blocked'
  | 'error'
  | 'privacy'
  | 'claimMissing'

export type MenuItem = {
  id: string
  name: string
  description: string
  price: number
}

export type PortalOrderItem = {
  productId: string
  name: string
  quantity: number
  unitPrice: number
  lineAmount: number
}

export type PortalOrder = {
  orderClaim: string
  storeName: string
  orderNo: string
  items: PortalOrderItem[]
  paidAmount: number
  providedMinutes: number
}
