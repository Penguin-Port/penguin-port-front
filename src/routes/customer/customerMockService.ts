import type {
  CustomerPass,
  OrderClaimExchangeResponse,
  OtpConfirmResponse,
  OtpSendResponse,
} from '../../api/customer'
import { createMockPortalOrder, demoOtpCode } from './customerMock'
import type { MenuItem } from './customerTypes'

const mockRequestDelay = 180

export async function exchangeOrderClaimMock(
  orderClaim: string,
  items: MenuItem[],
): Promise<OrderClaimExchangeResponse> {
  await delay(mockRequestDelay)

  const portalOrder = createMockPortalOrder(orderClaim, items)

  return {
    verificationTicket: `mock-verification-ticket-${portalOrder.orderClaim}`,
    requiresVerification: true,
    passId: `mock-pass-${portalOrder.orderClaim}`,
    expiresIn: 600,
    storeName: portalOrder.storeName,
    orderNo: portalOrder.orderNo,
    items: portalOrder.items,
    paidAmount: portalOrder.paidAmount,
    providedMinutes: portalOrder.providedMinutes,
  }
}

export async function sendOtpMock(): Promise<OtpSendResponse> {
  await delay(mockRequestDelay)

  return {
    challengeId: `mock-challenge-${Date.now()}`,
    expiresAt: new Date(Date.now() + 3 * 60 * 1000).toISOString(),
    maxAttempts: 5,
    demoCode: demoOtpCode,
  }
}

export async function confirmOtpMock(
  challengeId: string,
  code: string,
  passId: string | null,
): Promise<OtpConfirmResponse> {
  await delay(mockRequestDelay)

  if (!challengeId || code !== demoOtpCode) {
    throw new Error('인증번호가 일치하지 않습니다. 데모 코드는 123456입니다.')
  }

  return {
    portalSession: `mock-portal-session-${challengeId}`,
    passId,
    expiresIn: 86400,
  }
}

export async function activatePassMock(passId: string): Promise<CustomerPass> {
  await delay(mockRequestDelay)

  const now = new Date()
  const expiresAt = new Date(now.getTime() + 120 * 60 * 1000)

  return {
    passId,
    status: 'ACTIVE',
    issuedAt: now.toISOString(),
    activatedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    remainingSeconds: 120 * 60,
    version: 1,
    policySnapshot: { baseMinutes: 120 },
    dailyTotal: 8500,
  }
}

function delay(milliseconds: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds)
  })
}
