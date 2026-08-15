import { apiDataRequest } from './client'

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
  storeId: string
  storeName: string
  orderNo: string
  items: CustomerOrderItem[]
  paidAmount: number
  providedMinutes: number
}

export interface PublicProduct {
  productId: string
  name: string
  price: number
}

export interface RewardGrantSummary {
  grantId: string
  status: string
  businessDate: string
}

export interface OtpSendRequest {
  verificationTicket: string
  phone: string
}

export interface OtpSendResponse {
  challengeId: string
  expiresAt: string
  maxAttempts: number
  demoCode: string | null
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
  nextTierBenefitsPreview?: string[]
  suggestedItems?: Array<{
    productId: string
    name: string
    price: number
    originalPrice?: number | null
    discountRate?: number | null
    discountedPrice?: number | null
    promotionTitle?: string | null
    promotionEndsAt?: string | null
  }>
}

export type RewardFulfillMode = 'IMMEDIATE' | 'COUPON_7D'

export interface RewardOption {
  benefitId: string
  type: string
  title: string
  payload: Record<string, unknown>
  recommended: boolean
  recommendationReason?: string | null
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

export interface CustomerCoupon {
  couponId: string
  status: string
  benefit: Record<string, unknown>
  expiresAt: string
  redeemedAt: string | null
}

export interface CouponRedeemResponse {
  couponId: string
  status: string
  redeemedAt: string
  benefit: Record<string, unknown>
}

export interface PrivacyNoticeResponse {
  storeId: string
  storeName: string
  phoneStorage: string
  phoneRetentionDays: number
  automaticDeletion: boolean
  purpose: string
  supportNote: string
}

function portalSessionHeaders(portalSession: string) {
  return { 'X-Portal-Session': portalSession }
}

export const customerApi = {
  listProducts(storeId: string) {
    return apiDataRequest<PublicProduct[]>(`/public/stores/${storeId}/products`)
  },

  exchangeOrderClaim(body: OrderClaimExchangeRequest) {
    return apiDataRequest<OrderClaimExchangeResponse>('/public/order-claims/exchange', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  sendOtp(body: OtpSendRequest) {
    return apiDataRequest<OtpSendResponse>('/public/otp/send', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  confirmOtp(body: OtpConfirmRequest) {
    return apiDataRequest<OtpConfirmResponse>('/public/otp/confirm', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  activatePass(passId: string, portalSession: string) {
    return apiDataRequest<CustomerPass>(`/public/passes/${passId}/activate`, {
      method: 'POST',
      headers: portalSessionHeaders(portalSession),
    })
  },

  getPass(passId: string, portalSession: string) {
    return apiDataRequest<CustomerPass>(`/public/passes/${passId}`, {
      headers: portalSessionHeaders(portalSession),
    })
  },

  getUpsellHint(portalSession: string) {
    return apiDataRequest<UpsellHintResponse>('/public/upsell-hint', {
      headers: portalSessionHeaders(portalSession),
    })
  },

  getRewardOptions(grantId: string, portalSession: string) {
    return apiDataRequest<RewardOptionsResponse>(
      `/public/rewards/grants/${grantId}/options`,
      {
        headers: portalSessionHeaders(portalSession),
      },
    )
  },

  listRewardGrants(portalSession: string) {
    return apiDataRequest<RewardGrantSummary[]>('/public/rewards/grants', {
      headers: portalSessionHeaders(portalSession),
    })
  },

  chooseReward(
    grantId: string,
    body: RewardChooseRequest,
    portalSession: string,
  ) {
    return apiDataRequest<RewardChooseResponse>(
      `/public/rewards/grants/${grantId}/choose`,
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: portalSessionHeaders(portalSession),
      },
    )
  },

  listCoupons(portalSession: string) {
    return apiDataRequest<CustomerCoupon[]>('/public/coupons', {
      headers: portalSessionHeaders(portalSession),
    })
  },

  redeemCoupon(couponId: string, portalSession: string) {
    return apiDataRequest<CouponRedeemResponse>(
      `/public/coupons/${couponId}/redeem`,
      {
        method: 'POST',
        headers: portalSessionHeaders(portalSession),
      },
    )
  },

  getPrivacyNotice(storeId: string) {
    return apiDataRequest<PrivacyNoticeResponse>(
      `/public/stores/${storeId}/privacy-notice`,
    )
  },
}
