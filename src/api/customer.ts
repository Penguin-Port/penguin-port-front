import { apiRequest } from './http'

export type OrderClaimExchangeRequest = {
  orderClaim: string
}

export type OrderClaimExchangeResponse = {
  passId?: string
  orderNo: string
  storeName?: string
  providedMinutes: number
  phoneMasked?: string
  status?: 'PENDING' | 'ACTIVE' | 'EXPIRED'
}

export type OtpSendRequest = {
  passId: string
  phone: string
}

export type OtpSendResponse = {
  cooldownSeconds: number
  phoneMasked: string
}

export type OtpConfirmRequest = {
  passId: string
  code: string
}

export type OtpConfirmResponse = {
  sessionToken: string
  passId: string
}

export type PassStatus = 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'BLOCKED'

export type CustomerPass = {
  id: string
  orderNo: string
  status: PassStatus
  serverTime: string
  expiresAt: string | null
  remainingSeconds: number
  dailyTotal?: number
  remainingAmountToNextTier?: number
  nextTierBenefitsPreview?: string[]
}

export type RewardChoice = 'IMMEDIATE' | 'COUPON_7D'

export type RewardChooseResponse = {
  grantId: string
  choice: RewardChoice
  message: string
}

export function exchangeOrderClaim(body: OrderClaimExchangeRequest) {
  return apiRequest<OrderClaimExchangeResponse>('/public/order-claims/exchange', {
    method: 'POST',
    body,
  })
}

export function sendOtp(body: OtpSendRequest) {
  return apiRequest<OtpSendResponse>('/public/otp/send', {
    method: 'POST',
    body,
  })
}

export function confirmOtp(body: OtpConfirmRequest) {
  return apiRequest<OtpConfirmResponse>('/public/otp/confirm', {
    method: 'POST',
    body,
  })
}

export function activatePass(passId: string, token: string) {
  return apiRequest<CustomerPass>(`/public/passes/${passId}/activate`, {
    method: 'POST',
    token,
  })
}

export function getPass(passId: string, token: string) {
  return apiRequest<CustomerPass>(`/public/passes/${passId}`, {
    token,
  })
}

export function chooseReward(grantId: string, choice: RewardChoice, token: string) {
  return apiRequest<RewardChooseResponse>(`/public/rewards/${grantId}/choose`, {
    method: 'POST',
    body: { choice },
    token,
  })
}
