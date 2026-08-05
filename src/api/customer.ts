import { apiRequest } from './client'

export interface OrderClaimExchangeRequest {
  orderClaim: string
}

export interface CustomerOrderItem {
  productId: string
  name: string
  quantity: number
  unitPrice: number
  lineAmount: number
}

export interface OrderClaimExchangeResponse {
  verificationTicket: string
  requiresVerification: boolean
  passId: string | null
  expiresIn: number
  storeName: string
  orderNo: string
  items: CustomerOrderItem[]
  paidAmount: number
  providedMinutes: number
}

export interface OtpSendRequest {
  verificationTicket: string
  phone: string
}

export interface OtpSendResponse {
  challengeId: string
  expiresAt: string
  maxAttempts: number
  demoCode: string
}

export interface OtpConfirmRequest {
  challengeId: string
  code: string
}

export interface OtpConfirmResponse {
  portalSession: string
  passId: string | null
  expiresIn: number
}

export type CustomerPassStatus =
  | 'ISSUED'
  | 'ACTIVATING'
  | 'ACTIVE'
  | 'EXPIRING_SOON'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'BLOCKED'
  | 'FAILED'

export interface CustomerPass {
  passId: string
  status: CustomerPassStatus
  issuedAt: string
  activatedAt: string | null
  expiresAt: string
  remainingSeconds: number
  version: number
  policySnapshot: Record<string, unknown>
  dailyTotal?: number
}

export interface UpsellHintResponse {
  dailyTotal: number
  nextTierAmount: number | null
  remainingAmountToNextTier: number
}

export type RewardFulfillMode = 'IMMEDIATE' | 'COUPON_7D'

export interface RewardOption {
  benefitId: string
  type: string
  title: string
  payload: Record<string, unknown>
  recommended: boolean
}

export interface RewardOptionsResponse {
  grantId: string
  tierAmount: number
  status: string
  options: RewardOption[]
}

export interface RewardChooseRequest {
  benefitId: string
  fulfillMode: RewardFulfillMode
}

export interface RewardChooseResponse {
  grantId: string
  status: string
  fulfillMode: RewardFulfillMode
  benefit: Record<string, unknown>
  coupon: {
    couponId: string
    status: string
    expiresAt: string
  } | null
}

function portalSessionHeaders(portalSession: string) {
  return { 'X-Portal-Session': portalSession }
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

  activatePass(passId: string, portalSession: string) {
    return apiRequest<CustomerPass>(`/public/passes/${passId}/activate`, {
      method: 'POST',
      headers: portalSessionHeaders(portalSession),
    })
  },

  getPass(passId: string, portalSession: string) {
    return apiRequest<CustomerPass>(`/public/passes/${passId}`, {
      headers: portalSessionHeaders(portalSession),
    })
  },

  getUpsellHint(portalSession: string) {
    return apiRequest<UpsellHintResponse>('/public/upsell-hint', {
      headers: portalSessionHeaders(portalSession),
    })
  },

  getRewardOptions(grantId: string, portalSession: string) {
    return apiRequest<RewardOptionsResponse>(
      `/public/rewards/grants/${grantId}/options`,
      {
        headers: portalSessionHeaders(portalSession),
      },
    )
  },

  chooseReward(
    grantId: string,
    body: RewardChooseRequest,
    portalSession: string,
  ) {
    return apiRequest<RewardChooseResponse>(`/public/rewards/${grantId}/choose`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: portalSessionHeaders(portalSession),
    })
  },
}
