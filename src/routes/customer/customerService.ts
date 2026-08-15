import {
  customerApi,
  type CustomerPass,
  type CustomerCoupon,
  type CouponRedeemResponse,
  type OrderClaimExchangeResponse,
  type OtpConfirmResponse,
  type OtpSendResponse,
  type PrivacyNoticeResponse,
  type RewardGrantSummary,
  type RewardChooseResponse,
  type RewardFulfillMode,
  type RewardOptionsResponse,
  type UpsellHintResponse,
} from '../../api/customer'
import { env, isApiConfigured } from '../../config/env'
import {
  activatePassMock,
  confirmOtpMock,
  exchangeOrderClaimMock,
  sendOtpMock,
} from './customerMockService'

export type CustomerPortalService = {
  exchangeOrderClaim(orderClaim: string): Promise<OrderClaimExchangeResponse>
  sendOtp(input: {
    verificationTicket: string
    phone: string
  }): Promise<OtpSendResponse>
  confirmOtp(input: {
    challengeId: string
    code: string
    passId: string | null
  }): Promise<OtpConfirmResponse>
  activatePass(input: {
    passId: string
    portalSession: string
  }): Promise<CustomerPass>
  getPass(input: {
    passId: string
    portalSession: string
  }): Promise<CustomerPass>
  getUpsellHint(input: {
    portalSession: string
  }): Promise<UpsellHintResponse>
  getRewardOptions(input: {
    grantId: string
    portalSession: string
  }): Promise<RewardOptionsResponse>
  listRewardGrants(input: {
    portalSession: string
  }): Promise<RewardGrantSummary[]>
  chooseReward(input: {
    grantId: string
    benefitId: string
    fulfillMode: RewardFulfillMode
    portalSession: string
  }): Promise<RewardChooseResponse>
  listCoupons(input: {
    portalSession: string
  }): Promise<CustomerCoupon[]>
  redeemCoupon(input: {
    couponId: string
    portalSession: string
  }): Promise<CouponRedeemResponse>
  getPrivacyNotice(input: {
    storeId: string
  }): Promise<PrivacyNoticeResponse>
}

const mockCustomerService: CustomerPortalService = {
  exchangeOrderClaim(orderClaim) {
    return exchangeOrderClaimMock(orderClaim)
  },
  sendOtp() {
    return sendOtpMock()
  },
  confirmOtp({ challengeId, code, passId }) {
    return confirmOtpMock(challengeId, code, passId)
  },
  activatePass({ passId }) {
    return activatePassMock(passId)
  },
  getPass({ passId }) {
    return activatePassMock(passId)
  },
  getUpsellHint() {
    return Promise.resolve({
      dailyTotal: 10000,
      nextTierAmount: 20000,
      remainingAmountToNextTier: 10000,
      nextTierBenefitsPreview: ['Wi-Fi 종일권', '음료 할인', '신메뉴 시식권'],
      suggestedItems: [],
    })
  },
  getRewardOptions({ grantId }) {
    return Promise.resolve({
      grantId,
      tierAmount: 10000,
      status: 'AWAITING_CHOICE',
      options: [
        {
          benefitId: 'size-up',
          type: 'FREE_SIZE_UP',
          title: '무료 사이즈업',
          payload: {},
          recommended: true,
        },
        {
          benefitId: 'shot',
          type: 'FREE_SHOT',
          title: '무료 샷 추가',
          payload: { count: 1 },
          recommended: false,
        },
        {
          benefitId: 'dessert',
          type: 'DESSERT_DISCOUNT',
          title: '디저트 할인',
          payload: { discountAmount: 1000 },
          recommended: false,
        },
      ],
    })
  },
  listRewardGrants() {
    return Promise.resolve([])
  },
  chooseReward({ grantId, benefitId, fulfillMode }) {
    return Promise.resolve({
      grantId,
      status: 'FULFILLED',
      fulfillMode,
      benefit: { benefitId },
      coupon:
        fulfillMode === 'COUPON_7D'
          ? {
              couponId: `mock-coupon-${benefitId}`,
              status: 'AVAILABLE',
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            }
          : null,
    })
  },
  listCoupons() {
    return Promise.resolve([
      {
        couponId: 'mock-coupon-dessert',
        status: 'AVAILABLE',
        benefit: {
          title: '디저트 10% 할인',
          benefitType: 'DESSERT_DISCOUNT',
        },
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        redeemedAt: null,
      },
    ])
  },
  redeemCoupon({ couponId }) {
    return Promise.resolve({
      couponId,
      status: 'REDEEMED',
      redeemedAt: new Date().toISOString(),
      benefit: {
        title: '디저트 10% 할인',
      },
    })
  },
  getPrivacyNotice({ storeId }) {
    return Promise.resolve({
      storeId,
      storeName: '펭귄 카페 MVP',
      phoneStorage: '이용권 연결에 필요한 전화번호만 암호화해 보관합니다.',
      phoneRetentionDays: 30,
      automaticDeletion: true,
      purpose: 'Wi-Fi 이용권 연결, OTP 인증, 매장 보호를 위한 최소 정보 처리',
      supportNote: '불법 접속 대응 기록은 점주 보호 목적으로만 보관하며, 목적을 달성하면 폐기합니다.',
    })
  },
}

const apiCustomerService: CustomerPortalService = {
  exchangeOrderClaim(orderClaim) {
    return customerApi.exchangeOrderClaim({ orderClaim })
  },
  sendOtp({ verificationTicket, phone }) {
    return customerApi.sendOtp({ verificationTicket, phone })
  },
  confirmOtp({ challengeId, code }) {
    return customerApi.confirmOtp({ challengeId, code })
  },
  activatePass({ passId, portalSession }) {
    return customerApi.activatePass(passId, portalSession)
  },
  getPass({ passId, portalSession }) {
    return customerApi.getPass(passId, portalSession)
  },
  getUpsellHint({ portalSession }) {
    return customerApi.getUpsellHint(portalSession)
  },
  getRewardOptions({ grantId, portalSession }) {
    return customerApi.getRewardOptions(grantId, portalSession)
  },
  listRewardGrants({ portalSession }) {
    return customerApi.listRewardGrants(portalSession)
  },
  chooseReward({ grantId, benefitId, fulfillMode, portalSession }) {
    return customerApi.chooseReward(grantId, { benefitId, fulfillMode }, portalSession)
  },
  listCoupons({ portalSession }) {
    return customerApi.listCoupons(portalSession)
  },
  redeemCoupon({ couponId, portalSession }) {
    return customerApi.redeemCoupon(couponId, portalSession)
  },
  getPrivacyNotice({ storeId }) {
    return customerApi.getPrivacyNotice(storeId)
  },
}

export const customerPortalService =
  env.useCustomerApi && isApiConfigured ? apiCustomerService : mockCustomerService
