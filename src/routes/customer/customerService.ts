import {
  customerApi,
  type CustomerPass,
  type OrderClaimExchangeResponse,
  type OtpConfirmResponse,
  type OtpSendResponse,
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
}

export const customerPortalService =
  env.useCustomerApi && isApiConfigured ? apiCustomerService : mockCustomerService
