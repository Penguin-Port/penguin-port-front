import {
  customerApi,
  type CustomerPass,
  type OrderClaimExchangeResponse,
  type OtpConfirmResponse,
  type OtpSendResponse,
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
  chooseReward(input: {
    grantId: string
    benefitId: string
    fulfillMode: RewardFulfillMode
    portalSession: string
  }): Promise<RewardChooseResponse>
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
  chooseReward({ grantId, benefitId, fulfillMode, portalSession }) {
    return customerApi.chooseReward(grantId, { benefitId, fulfillMode }, portalSession)
  },
}

export const customerPortalService =
  env.useCustomerApi && isApiConfigured ? apiCustomerService : mockCustomerService
