import { apiRequest } from './client'

export interface OrderClaimExchangeRequest {
  orderClaim: string
}

export interface OrderClaimExchangeResponse {
  passId?: string
  orderNo: string
  storeName?: string
  providedMinutes: number
  phoneMasked?: string
  status?: 'PENDING' | 'ACTIVE' | 'EXPIRED'
}

export interface OtpSendRequest {
  passId: string
  phone: string
}

export interface OtpSendResponse {
  cooldownSeconds: number
  phoneMasked: string
}

export interface OtpConfirmRequest {
  passId: string
  code: string
}

export interface OtpConfirmResponse {
  sessionToken: string
  passId: string
}

export type CustomerPassStatus = 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'BLOCKED'

export interface CustomerPass {
  id: string
  orderNo: string
  status: CustomerPassStatus
  serverTime: string
  expiresAt: string | null
  remainingSeconds: number
  dailyTotal?: number
  remainingAmountToNextTier?: number
  nextTierBenefitsPreview?: string[]
}

export type RewardChoice = 'IMMEDIATE' | 'COUPON_7D'

export interface RewardChooseResponse {
  grantId: string
  choice: RewardChoice
  message: string
}

export const customerApi = {
  exchangeOrderClaim(body: OrderClaimExchangeRequest) {
    return apiRequest<OrderClaimExchangeResponse>('/public/order-claims/exchange', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  sendOtp(body: OtpSendRequest) {
    return apiRequest<OtpSendResponse>('/public/otp/send', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  confirmOtp(body: OtpConfirmRequest) {
    return apiRequest<OtpConfirmResponse>('/public/otp/confirm', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  activatePass(passId: string, token: string) {
    return apiRequest<CustomerPass>(`/public/passes/${passId}/activate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
  },

  getPass(passId: string, token: string) {
    return apiRequest<CustomerPass>(`/public/passes/${passId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  },

  chooseReward(grantId: string, choice: RewardChoice, token: string) {
    return apiRequest<RewardChooseResponse>(`/public/rewards/${grantId}/choose`, {
      method: 'POST',
      body: JSON.stringify({ choice }),
      headers: { Authorization: `Bearer ${token}` },
    })
  },
}
