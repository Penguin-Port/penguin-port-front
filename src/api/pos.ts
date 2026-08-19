import { apiDataRequest } from './client'

export interface PosOrderItemRequest {
  productId: string
  quantity: number
  unitPrice?: number
}

export interface PosOrderRequest {
  storeId: string
  externalOrderId: string
  customer: {
    memberId?: string | null
    phone?: string | null
  }
  items: PosOrderItemRequest[]
  totalAmount: number
  paidAt: string
}

export interface PosOrderResponse {
  orderId: string
  businessDate: string
  dailyTotal: number
  newRewardGrantIds: string[]
  appliedRewards: Array<Record<string, unknown>>
  wifiPass: {
    passId: string
    status: string
    expiresAt: string
    remainingSeconds?: number
  }
  orderClaim: {
    token: string
    expiresAt: string
  }
}

export const posApi = {
  createOrder(body: PosOrderRequest) {
    return apiDataRequest<PosOrderResponse>('/pos/orders', {
      method: 'POST',
      headers: {
        'X-Demo-Key': 'demo-key',
        'Idempotency-Key': `demo-pos-${body.externalOrderId}`,
      },
      body: JSON.stringify(body),
    })
  },
}
