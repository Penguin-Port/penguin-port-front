import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useCallback } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  createMockPortalOrder,
  portalDemo,
  recommendedItems,
  rewardOptions as fallbackRewardOptions,
} from './customerMock'
import { customerPortalService } from './customerService'
import type { MenuItem, PortalOrder, Screen } from './customerTypes'
import type {
  CustomerCoupon,
  CustomerPass,
  CustomerPassStatus,
  PrivacyNoticeResponse,
  RewardFulfillMode,
  RewardOption,
  UpsellHintResponse,
} from '../../api/customer'
import { ApiError } from '../../api/client'
import { ConfirmModal } from '../../components/admin'
import { env } from '../../config/env'
import '../../styles/customer.css'

const screenParamSet = new Set<Screen>([
  'qr',
  'auth',
  'start',
  'active',
  'reward',
  'coupons',
  'extend',
  'expired',
  'blocked',
  'error',
  'privacy',
  'claimMissing',
])

type DisplayRewardOption = {
  benefitId: string
  title: string
  description: string
  recommended: boolean
}

type PolicyTier = {
  minAmount: number
  bonusMinutes: number
}

type PortalErrorInfo = {
  title: string
  message: string
  requestId: string
  status?: number
}

const fallbackPrivacyNotice: PrivacyNoticeResponse = {
  storeId: '',
  storeName: '펭귄 카페 MVP',
  phoneStorage: '이용권 연결에 필요한 전화번호만 암호화해 보관합니다.',
  phoneRetentionDays: 30,
  automaticDeletion: true,
  purpose: 'Wi-Fi 이용권 연결, OTP 인증, 매장 보호를 위한 최소 정보 처리',
  supportNote:
    '불법 접속 대응 기록은 점주 보호 목적으로만 보관하며, 목적을 달성하면 폐기합니다. 마케팅에는 사용하지 않습니다.',
}

export function CustomerPortalPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const orderClaim = searchParams.get('orderClaim')?.trim() ?? ''
  const screenParam = searchParams.get('screen') as Screen | null
  const isConnectRoute = location.pathname === '/connect'
  const storedSession = window.sessionStorage.getItem('portalSession')
  const storedPassId = window.sessionStorage.getItem('portalPassId')
  const initialScreen = getInitialScreen({
    isConnectRoute,
    orderClaim,
    screenParam,
    hasSession: Boolean(storedSession && storedPassId),
  })

  const [screen, setScreen] = useState<Screen>(initialScreen)
  const [portalOrder, setPortalOrder] = useState<PortalOrder>(() =>
    createMockPortalOrder(orderClaim || 'demo-order-claim'),
  )
  const [guestPhone, setGuestPhone] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(Boolean(storedSession))
  const [otpError, setOtpError] = useState('')
  const [demoCode, setDemoCode] = useState('')
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const [isOtpSubmitting, setIsOtpSubmitting] = useState(false)
  const [verificationTicket, setVerificationTicket] = useState('')
  const [challengeId, setChallengeId] = useState('')
  const [passId, setPassId] = useState(storedPassId ?? '')
  const [activePass, setActivePass] = useState<CustomerPass | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(
    portalOrder.providedMinutes * 60,
  )
  const [now, setNow] = useState(() => new Date())
  const [hasPassConsent, setHasPassConsent] = useState(false)
  const [hasPrivacyConsent, setHasPrivacyConsent] = useState(false)
  const [selectedRewardId, setSelectedRewardId] = useState('')
  const [rewardGrantIds, setRewardGrantIds] = useState<string[]>(() =>
    readStoredRewardGrantIds(),
  )
  const [upsellHint, setUpsellHint] = useState<UpsellHintResponse | null>(null)
  const [availableRewardOptions, setAvailableRewardOptions] = useState<
    DisplayRewardOption[]
  >([])
  const [rewardTierAmount, setRewardTierAmount] = useState<number | null>(null)
  const [rewardError, setRewardError] = useState('')
  const [couponCount, setCouponCount] = useState(0)
  const [coupons, setCoupons] = useState<CustomerCoupon[]>([])
  const [couponError, setCouponError] = useState('')
  const [couponNotice, setCouponNotice] = useState('')
  const [couponRedeemTargetId, setCouponRedeemTargetId] = useState<string | null>(null)
  const [isCouponRedeeming, setIsCouponRedeeming] = useState(false)
  const [isCouponLoading, setIsCouponLoading] = useState(false)
  const [lastPortalError, setLastPortalError] = useState<PortalErrorInfo | null>(null)
  const [syncNotice, setSyncNotice] = useState('')
  const [privacyNotice, setPrivacyNotice] =
    useState<PrivacyNoticeResponse>(fallbackPrivacyNotice)

  const goToScreen = useCallback(
    (
      nextScreen: Screen,
      options?: { replace?: boolean; clearOrderClaim?: boolean },
    ) => {
      setScreen(nextScreen)
      if (nextScreen !== 'blocked' && nextScreen !== 'error') {
        setLastPortalError(null)
      }

      if (!isConnectRoute) return

      const nextParams = new URLSearchParams()
      if (orderClaim && !options?.clearOrderClaim) {
        nextParams.set('orderClaim', orderClaim)
      }
      nextParams.set('screen', nextScreen)

      navigate(`${location.pathname}?${nextParams.toString()}`, {
        replace: options?.replace ?? false,
      })
    },
    [isConnectRoute, location.pathname, navigate, orderClaim],
  )

  useEffect(() => {
    if (!isConnectRoute) return
    const savedSession = window.sessionStorage.getItem('portalSession')
    const savedPassId = window.sessionStorage.getItem('portalPassId')

    if (screenParam && screenParamSet.has(screenParam)) {
      setScreen(screenParam)
      if (screenParam === 'active' && savedSession && savedPassId && !activePass) {
        customerPortalService.getPass({
          passId: savedPassId,
          portalSession: savedSession,
        }).then((response) => {
          setActivePass(response)
          setSecondsLeft(response.remainingSeconds)
        })
      }
      return
    }

    if (!orderClaim && savedSession && savedPassId) {
      setScreen('active')
      customerPortalService.getPass({
        passId: savedPassId,
        portalSession: savedSession,
      }).then((response) => {
        setActivePass(response)
        setSecondsLeft(response.remainingSeconds)
      })
      return
    }

    setScreen(orderClaim ? 'qr' : 'claimMissing')
  }, [activePass, isConnectRoute, orderClaim, screenParam])

  useEffect(() => {
    const claimForDemo = orderClaim || 'demo-order-claim'
    if (isConnectRoute && !orderClaim) return

    let isCanceled = false

    customerPortalService
      .exchangeOrderClaim(claimForDemo)
      .then((response) => {
        if (isCanceled) return

        setPortalOrder({
          orderClaim: claimForDemo,
          storeName: getCleanText(response.storeName, portalDemo.storeName),
          orderNo: response.orderNo,
          items: response.items.map((item) => ({
            ...item,
            name: getCleanText(item.name, '주문 상품'),
          })),
          paidAmount: response.paidAmount,
          providedMinutes: response.providedMinutes,
        })
        setVerificationTicket(response.verificationTicket)
        setPassId(response.passId ?? '')
        setSecondsLeft(response.providedMinutes * 60)
      })
      .catch((error) => {
        if (isCanceled) return
        setLastPortalError(toPortalErrorInfo(error, 'CLAIM_EXCHANGE'))

        if (isRecoverableClaimError(error)) {
          goToScreen('blocked', { replace: true, clearOrderClaim: true })
          return
        }

        goToScreen('error', { replace: true, clearOrderClaim: true })
      })

    return () => {
      isCanceled = true
    }
  }, [goToScreen, isConnectRoute, orderClaim])

  useEffect(() => {
    if (cooldownSeconds === 0) return

    const timer = window.setInterval(() => {
      setCooldownSeconds((seconds) => Math.max(0, seconds - 1))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [cooldownSeconds])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date())
      if (screen === 'active') {
        setSecondsLeft((seconds) => Math.max(0, seconds - 1))
      }
    }, 1000)

    return () => window.clearInterval(timer)
  }, [screen])

  useEffect(() => {
    if (screen !== 'active' || !passId) return

    let isCanceled = false
    let previousPass: CustomerPass | null = activePass

    const refreshPass = async () => {
      const savedSession = window.sessionStorage.getItem('portalSession')
      if (!savedSession) return

      try {
        const response = await customerPortalService.getPass({
          passId,
          portalSession: savedSession,
        })
        if (isCanceled) return

        if (previousPass && response.version > previousPass.version) {
          const delta = response.remainingSeconds - previousPass.remainingSeconds
          if (response.status === 'ACTIVE' && delta > 30) {
            setSyncNotice(`관리자 변경으로 이용 시간이 ${formatDeltaMinutes(delta)} 늘어났습니다.`)
          } else if (response.status === 'EXPIRED') {
            setSyncNotice('관리자 변경으로 이용권이 종료되었습니다.')
          } else if (response.status === 'BLOCKED') {
            setSyncNotice('관리자 변경으로 이용권 연결을 다시 확인해야 합니다.')
          } else {
            setSyncNotice('관리자 변경 사항이 이용권에 반영되었습니다.')
          }
        }
        previousPass = response

        setActivePass(response)
        setSecondsLeft(response.remainingSeconds)

        if (response.status === 'EXPIRED' || response.remainingSeconds <= 0) {
          goToScreen('expired', { replace: true, clearOrderClaim: true })
        } else if (response.status === 'BLOCKED') {
          goToScreen('blocked', { replace: true, clearOrderClaim: true })
        } else if (response.status === 'FAILED') {
          goToScreen('error', { replace: true, clearOrderClaim: true })
        }
      } catch {
        if (!isCanceled) {
          goToScreen('error', { replace: true, clearOrderClaim: true })
        }
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void refreshPass()
      }
    }

    void refreshPass()

    const timer = window.setInterval(() => {
      void refreshPass()
    }, PASS_REFRESH_INTERVAL_MS)

    window.addEventListener('focus', refreshPass)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      isCanceled = true
      window.clearInterval(timer)
      window.removeEventListener('focus', refreshPass)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [goToScreen, passId, screen])

  useEffect(() => {
    if (screen !== 'active') return

    const savedSession = window.sessionStorage.getItem('portalSession')
    if (!savedSession) return

    let isCanceled = false

    const refreshCustomerContext = async () => {
      const [upsellResult, couponResult] = await Promise.allSettled([
        customerPortalService.getUpsellHint({ portalSession: savedSession }),
        customerPortalService.listCoupons({ portalSession: savedSession }),
      ])
      if (isCanceled) return

      if (upsellResult.status === 'fulfilled') {
        setUpsellHint(upsellResult.value)
      } else {
        setUpsellHint(null)
      }

      if (couponResult.status === 'fulfilled') {
        const couponResponse = couponResult.value
        if (isCanceled) return
        setCoupons(couponResponse)
        setCouponCount(couponResponse.filter((coupon) => coupon.status === 'AVAILABLE').length)
      }
    }

    void refreshCustomerContext()

    const timer = window.setInterval(() => {
      void refreshCustomerContext()
    }, CUSTOMER_CONTEXT_REFRESH_INTERVAL_MS)

    return () => {
      isCanceled = true
      window.clearInterval(timer)
    }
  }, [screen, activePass?.version])

  useEffect(() => {
    if (!syncNotice) return

    const timer = window.setTimeout(() => {
      setSyncNotice('')
    }, 5000)

    return () => window.clearTimeout(timer)
  }, [syncNotice])

  useEffect(() => {
    if (screen !== 'reward') return

    const savedSession = window.sessionStorage.getItem('portalSession')
    const grantId = rewardGrantIds[0]
    if (!savedSession || !grantId) {
      setAvailableRewardOptions([])
      setRewardTierAmount(null)
      return
    }

    customerPortalService
      .getRewardOptions({ grantId, portalSession: savedSession })
      .then((response) => {
        setAvailableRewardOptions(response.options.map(toDisplayRewardOption))
        setRewardTierAmount(response.tierAmount)
        setRewardError('')
      })
      .catch((error) => {
        setRewardError(getErrorMessage(error))
        setAvailableRewardOptions([])
        setRewardTierAmount(null)
      })
  }, [rewardGrantIds, screen])

  useEffect(() => {
    if (screen !== 'coupons') return

    const savedSession = window.sessionStorage.getItem('portalSession')
    if (!savedSession) return

    setIsCouponLoading(true)
    customerPortalService
      .listCoupons({ portalSession: savedSession })
      .then((response) => {
        setCoupons(response)
        setCouponCount(response.filter((coupon) => coupon.status === 'AVAILABLE').length)
        setCouponError('')
      })
      .catch((error) => {
        setCouponError(getErrorMessage(error))
      })
      .finally(() => {
        setIsCouponLoading(false)
      })
  }, [screen])

  useEffect(() => {
    if (screen !== 'privacy') return

    const storeId = env.demoStoreId
    if (!storeId) {
      setPrivacyNotice(fallbackPrivacyNotice)
      return
    }

    customerPortalService
      .getPrivacyNotice({ storeId })
      .then((response) => {
        setPrivacyNotice(normalizePrivacyNotice(response))
      })
      .catch(() => {
        setPrivacyNotice(fallbackPrivacyNotice)
      })
  }, [screen])

  const canSendOtp =
    guestPhone.length === 11 && cooldownSeconds === 0 && !isOtpSubmitting
  const canConfirmOtp = otpCode.length === 6 && !isOtpSubmitting
  const canStartWifi = hasPassConsent && hasPrivacyConsent

  const handleSendOtp = async () => {
    if (!canSendOtp) return

    try {
      setIsOtpSubmitting(true)
      setOtpError('')
      setOtpCode('')

      if (!verificationTicket) {
        throw new Error('주문 인증 정보를 먼저 확인해 주세요.')
      }

      const response = await customerPortalService.sendOtp({
        verificationTicket,
        phone: guestPhone,
      })

      setChallengeId(response.challengeId)
      setDemoCode(response.demoCode ?? '')
      setOtpSent(true)
      setCooldownSeconds(30)
    } catch (error) {
      setOtpError(getErrorMessage(error))
    } finally {
      setIsOtpSubmitting(false)
    }
  }

  const handleConfirmOtp = async () => {
    if (!canConfirmOtp) return

    try {
      setIsOtpSubmitting(true)
      setOtpError('')

      const response = await customerPortalService.confirmOtp({
        challengeId,
        code: otpCode,
        passId: passId || null,
      })

      setPassId(response.passId ?? '')
      setOtpVerified(true)
      window.sessionStorage.setItem('portalSession', response.portalSession)
      window.sessionStorage.setItem('portalPhone', guestPhone)
      if (response.passId) {
        window.sessionStorage.setItem('portalPassId', response.passId)
      }
      goToScreen('start', { replace: true, clearOrderClaim: true })
    } catch (error) {
      setOtpError(getErrorMessage(error))
    } finally {
      setIsOtpSubmitting(false)
    }
  }

  const handleActivatePass = async () => {
    if (!canStartWifi || !passId) return

    try {
      const savedSession = window.sessionStorage.getItem('portalSession') ?? ''
      const response = await customerPortalService.activatePass({
        passId,
        portalSession: savedSession,
      })

      setActivePass(response)
      setSecondsLeft(response.remainingSeconds)
      goToScreen('active')
    } catch (error) {
      setLastPortalError(toPortalErrorInfo(error, 'PASS_ACTIVATE'))
      if (isBlockedPassError(error)) {
        goToScreen('blocked', { replace: true, clearOrderClaim: true })
        return
      }

      goToScreen('error', { replace: true, clearOrderClaim: true })
    }
  }

  const handleChooseReward = async (fulfillMode: RewardFulfillMode) => {
    const savedSession = window.sessionStorage.getItem('portalSession')
    const grantId = rewardGrantIds[0]
    if (!savedSession || !grantId || !selectedRewardId) return

    try {
      const response = await customerPortalService.chooseReward({
        grantId,
        benefitId: selectedRewardId,
        fulfillMode,
        portalSession: savedSession,
      })

      setRewardGrantIds((current) => current.filter((id) => id !== grantId))
      window.sessionStorage.setItem(
        'portalRewardGrantIds',
        JSON.stringify(rewardGrantIds.filter((id) => id !== grantId)),
      )
      setSelectedRewardId('')
      setRewardError('')

      if (response.coupon) {
        const savedCoupon = response.coupon
        setCoupons((current) => [
          {
            couponId: savedCoupon.couponId,
            status: savedCoupon.status,
            benefit: response.benefit,
            expiresAt: savedCoupon.expiresAt,
            redeemedAt: null,
          },
          ...current,
        ])
        setCouponCount((count) => count + 1)
        goToScreen('coupons')
        return
      }

      goToScreen('active')
    } catch (error) {
      setRewardError(getErrorMessage(error))
    }
  }

  const handleRedeemCoupon = async (couponId: string) => {
    const savedSession = window.sessionStorage.getItem('portalSession')
    if (!savedSession) return

    try {
      setIsCouponRedeeming(true)
      const response = await customerPortalService.redeemCoupon({
        couponId,
        portalSession: savedSession,
      })

      setCoupons((current) =>
        current.map((coupon) =>
          coupon.couponId === couponId
            ? {
                ...coupon,
                status: response.status,
                redeemedAt: response.redeemedAt,
              }
            : coupon,
        ),
      )
      setCouponCount((count) => Math.max(0, count - 1))
      setCouponError('')
      setCouponNotice('쿠폰이 사용되었습니다.')
      setCouponRedeemTargetId(null)
    } catch (error) {
      setCouponError(getErrorMessage(error))
    } finally {
      setIsCouponRedeeming(false)
    }
  }

  return (
    <main className="customer-portal">
      <section className="portal-phone" aria-label="팽귄포트 고객 포털">
        <PortalHeader storeName={portalOrder.storeName} />

        {screen === 'claimMissing' && <ClaimMissingScreen />}
        {screen === 'qr' && (
          <QrEntryScreen
            portalOrder={portalOrder}
            onNext={() => goToScreen('auth')}
            onMemberLink={() => goToScreen('start')}
          />
        )}
        {screen === 'auth' && (
          <AuthScreen
            phone={guestPhone}
            otpCode={otpCode}
            otpSent={otpSent}
            otpVerified={otpVerified}
            errorMessage={otpError}
            cooldownSeconds={cooldownSeconds}
            demoCode={demoCode}
            canSendOtp={canSendOtp}
            canConfirmOtp={canConfirmOtp}
            isSubmitting={isOtpSubmitting}
            onPhoneChange={(value) => {
              setGuestPhone(normalizeDigits(value))
              setOtpSent(false)
              setOtpVerified(false)
              setOtpError('')
              setOtpCode('')
              setDemoCode('')
              window.sessionStorage.removeItem('portalSession')
              window.sessionStorage.removeItem('portalPassId')
            }}
            onSendOtp={handleSendOtp}
            onOtpCodeChange={(value) => {
              setOtpCode(normalizeDigits(value))
              setOtpError('')
            }}
            onConfirmOtp={handleConfirmOtp}
          />
        )}
        {screen === 'start' && (
          <StartScreen
            portalOrder={portalOrder}
            hasPassConsent={hasPassConsent}
            hasPrivacyConsent={hasPrivacyConsent}
            canStartWifi={canStartWifi}
            onPassConsentChange={setHasPassConsent}
            onPrivacyConsentChange={setHasPrivacyConsent}
            onStart={handleActivatePass}
          />
        )}
        {screen === 'active' && (
          <ActiveScreen
            pass={activePass}
            upsellHint={upsellHint}
            rewardCount={rewardGrantIds.length}
            couponCount={couponCount}
            syncNotice={syncNotice}
            currentTime={now}
            secondsLeft={secondsLeft}
            onReward={() => goToScreen('reward')}
            onCoupons={() => goToScreen('coupons')}
            onExtend={() => goToScreen('extend')}
            onPrivacy={() => goToScreen('privacy')}
          />
        )}
        {screen === 'reward' && (
          <RewardScreen
            tierAmount={rewardTierAmount}
            rewardOptions={
              availableRewardOptions.length > 0
                ? availableRewardOptions
                : fallbackRewardOptions
            }
            selectedRewardId={selectedRewardId}
            onSelectReward={setSelectedRewardId}
            onChooseReward={handleChooseReward}
            errorMessage={rewardError}
          />
        )}
        {screen === 'coupons' && (
          <CouponsScreen
            coupons={coupons}
            couponCount={couponCount}
            errorMessage={couponError}
            noticeMessage={couponNotice}
            isLoading={isCouponLoading}
            onRedeemCoupon={(couponId) => {
              setCouponNotice('')
              setCouponError('')
              setCouponRedeemTargetId(couponId)
            }}
          />
        )}
        {screen === 'extend' && (
          <ExtendScreen
            pass={activePass}
            upsellHint={upsellHint}
            onAdditionalOrder={() => navigate('/app/demo-pos?mode=extend')}
          />
        )}
        {screen === 'expired' && (
          <ExpiredScreen
            pass={activePass}
            upsellHint={upsellHint}
            onExtend={() => goToScreen('extend')}
            onCoupons={() => goToScreen('coupons')}
          />
        )}
        {screen === 'blocked' && (
          <BlockedScreen
            errorInfo={lastPortalError}
            onReconnect={() => goToScreen(orderClaim ? 'qr' : 'claimMissing')}
            onPrivacy={() => goToScreen('privacy')}
          />
        )}
        {screen === 'error' && (
          <ErrorScreen
            errorInfo={lastPortalError}
            onRetry={() => goToScreen('active')}
          />
        )}
        {screen === 'privacy' && (
          <PrivacyScreen
            notice={privacyNotice}
            onBack={() => goToScreen('active')}
          />
        )}
      </section>
      <ConfirmModal
        isOpen={couponRedeemTargetId !== null}
        title="쿠폰을 사용하시겠습니까?"
        description="사용한 쿠폰은 취소하거나 다시 사용할 수 없습니다. 매장 직원에게 화면을 보여준 뒤 사용해 주세요."
        confirmLabel="쿠폰 사용"
        cancelLabel="취소"
        isPending={isCouponRedeeming}
        onClose={() => {
          if (!isCouponRedeeming) setCouponRedeemTargetId(null)
        }}
        onConfirm={() => {
          if (couponRedeemTargetId) void handleRedeemCoupon(couponRedeemTargetId)
        }}
      />
    </main>
  )
}

function PortalHeader({ storeName }: { storeName: string }) {
  return (
    <header className="portal-topbar">
      <p>{storeName}</p>
      <span>
        <i aria-hidden="true" />
        Wi-Fi 연결됨
      </span>
    </header>
  )
}

function QrEntryScreen({
  portalOrder,
  onNext,
  onMemberLink,
}: {
  portalOrder: PortalOrder
  onNext: () => void
  onMemberLink: () => void
}) {
  return (
    <PortalScreen eyebrow="STEP 1 · 주문표 QR">
      <h1>
        주문 고객에게
        <br />
        무료 Wi-Fi 이용권 {formatMinutes(portalOrder.providedMinutes)} 제공
      </h1>
      <p className="screen-copy">
        주문표 QR로 안전하게 이용권을 연결합니다. 추가 주문 시 이용 시간이
        자동으로 늘어납니다.
      </p>
      <InfoCard
        title="확인된 주문 / orderClaim"
        rows={[
          ['매장', portalOrder.storeName],
          ['주문번호', portalOrder.orderNo],
          ['주문 금액', formatWon(portalOrder.paidAmount)],
          ['제공 이용권', formatMinutes(portalOrder.providedMinutes)],
        ]}
      />
      <div className="button-stack">
        <button type="button" className="portal-button primary" onClick={onNext}>
          이용권 받기
        </button>
        <button type="button" className="text-link" onClick={onMemberLink}>
          회원이신가요? 알림톡 링크로 인증 없이 연결
        </button>
      </div>
    </PortalScreen>
  )
}

function AuthScreen({
  phone,
  otpCode,
  otpSent,
  otpVerified,
  errorMessage,
  cooldownSeconds,
  demoCode,
  canSendOtp,
  canConfirmOtp,
  isSubmitting,
  onPhoneChange,
  onSendOtp,
  onOtpCodeChange,
  onConfirmOtp,
}: {
  phone: string
  otpCode: string
  otpSent: boolean
  otpVerified: boolean
  errorMessage: string
  cooldownSeconds: number
  demoCode: string
  canSendOtp: boolean
  canConfirmOtp: boolean
  isSubmitting: boolean
  onPhoneChange: (value: string) => void
  onSendOtp: () => void
  onOtpCodeChange: (value: string) => void
  onConfirmOtp: () => void
}) {
  return (
    <PortalScreen eyebrow="STEP 2 · 본인확인">
      <h1>이용권을 연결할 번호를 알려주세요</h1>
      <p className="screen-copy">
        전화번호는 암호화해 보관하고, 보관 기간이 지나면 자동으로 폐기합니다.
      </p>
      <label className="field">
        <span>전화번호 / Phone</span>
        <input
          value={phone}
          maxLength={11}
          inputMode="numeric"
          placeholder="010-0000-0000"
          disabled={otpVerified}
          onChange={(event) => onPhoneChange(event.target.value)}
        />
      </label>
      <button
        type="button"
        className="portal-button secondary"
        disabled={!canSendOtp || otpVerified}
        onClick={onSendOtp}
      >
        {isSubmitting
          ? '발송 중'
          : cooldownSeconds > 0
            ? `재전송 ${cooldownSeconds}초`
            : '인증번호 받기'}
      </button>
      {otpSent && (
        <>
          <label className="field">
            <span>인증번호 6자리</span>
            <input
              value={otpCode}
              maxLength={6}
              inputMode="numeric"
              placeholder={demoCode || '123456'}
              disabled={otpVerified}
              aria-invalid={Boolean(errorMessage)}
              onChange={(event) => onOtpCodeChange(event.target.value)}
            />
          </label>
          <button
            type="button"
            className="portal-button primary"
            disabled={!canConfirmOtp || otpVerified}
            onClick={onConfirmOtp}
          >
            {isSubmitting ? '확인 중' : '인증번호 확인'}
          </button>
        </>
      )}
      {otpSent && !errorMessage && !otpVerified && (
        <p className="helper">데모 인증번호는 {demoCode || '123456'}입니다.</p>
      )}
      {errorMessage && (
        <p className="form-error" role="alert">
          {errorMessage}
        </p>
      )}
      {otpVerified && <p className="success-text">본인 인증이 완료되었습니다.</p>}
    </PortalScreen>
  )
}

function StartScreen({
  portalOrder,
  hasPassConsent,
  hasPrivacyConsent,
  canStartWifi,
  onPassConsentChange,
  onPrivacyConsentChange,
  onStart,
}: {
  portalOrder: PortalOrder
  hasPassConsent: boolean
  hasPrivacyConsent: boolean
  canStartWifi: boolean
  onPassConsentChange: (checked: boolean) => void
  onPrivacyConsentChange: (checked: boolean) => void
  onStart: () => void
}) {
  const expectedEndTime = new Date(
    Date.now() + portalOrder.providedMinutes * 60 * 1000,
  )

  return (
    <PortalScreen eyebrow="STEP 3 · 이용 시작">
      <h1>Wi-Fi 이용권 {formatMinutes(portalOrder.providedMinutes)} 제공</h1>
      <p className="screen-copy">
        주문 금액에 따라 제공되는 시간입니다. 추가 주문 시 자동으로 연장됩니다.
      </p>
      <InfoCard
        rows={[
          ['주문 금액', formatWon(portalOrder.paidAmount)],
          ['제공 이용시간', formatMinutes(portalOrder.providedMinutes)],
          ['이용 종료 예정', formatShortTime(expectedEndTime)],
        ]}
      />
      <ConsentCard
        checked={hasPassConsent}
        title="이용권 연결에 동의합니다"
        description="주문 정보와 이용권을 연결해 Wi-Fi를 제공합니다."
        onChange={onPassConsentChange}
      />
      <ConsentCard
        checked={hasPrivacyConsent}
        title="개인정보 보관·폐기 안내를 확인했습니다"
        description="전화번호는 암호화해 보관하고 기간이 지나면 자동 폐기합니다."
        onChange={onPrivacyConsentChange}
      />
      <button
        type="button"
        className="portal-button primary"
        disabled={!canStartWifi}
        onClick={onStart}
      >
        Wi-Fi 이용 시작
      </button>
    </PortalScreen>
  )
}

function ActiveScreen({
  pass,
  upsellHint,
  rewardCount,
  couponCount,
  syncNotice,
  currentTime,
  secondsLeft,
  onReward,
  onCoupons,
  onExtend,
  onPrivacy,
}: {
  pass: CustomerPass | null
  upsellHint: UpsellHintResponse | null
  rewardCount: number
  couponCount: number
  syncNotice: string
  currentTime: Date
  secondsLeft: number
  onReward: () => void
  onCoupons: () => void
  onExtend: () => void
  onPrivacy: () => void
}) {
  const status = getEffectivePassStatus(pass?.status ?? 'ACTIVE', secondsLeft)
  const policySummaryRows = getPolicySummaryRows(pass)
  const bonusMinutes = getPolicyBonusMinutes(pass)
  const dailyTotal = upsellHint?.dailyTotal ?? pass?.dailyTotal ?? portalDemo.dailyTotal
  const nextTierAmount = upsellHint ? upsellHint.nextTierAmount : portalDemo.nextTierAmount
  const remainingAmount =
    upsellHint?.remainingAmountToNextTier ??
    (nextTierAmount ? Math.max(0, nextTierAmount - dailyTotal) : 0)
  const progressPercent = nextTierAmount
    ? Math.min(100, Math.round((dailyTotal / nextTierAmount) * 100))
    : 100
  const benefitsPreview =
    upsellHint?.nextTierBenefitsPreview?.map(formatBenefitLabel).join(' · ') ??
    'Wi-Fi 종일권 · 음료 할인 · 신메뉴 시식권'
  const endTimeLabel = useMemo(
    () => formatShortTime(pass ? new Date(pass.expiresAt) : currentTime),
    [currentTime, pass],
  )

  return (
    <PortalScreen className="active-view">
      <div className="chips">
        <span className="chip live">{getPassStatusLabel(status)}</span>
        {bonusMinutes > 0 ? (
          <span className="chip">보너스 +{bonusMinutes}분</span>
        ) : (
          <span className="chip">정책 반영</span>
        )}
      </div>
      <p className="timer-label">남은 이용 시간</p>
      <p className="timer-large">{formatRemaining(secondsLeft)}</p>
      <p className="caption">{endTimeLabel} 까지 · 매장 시간 기준</p>
      {syncNotice && <p className="sync-notice">{syncNotice}</p>}
      <section className="progress-card">
        <div className="amount-line">
          <span>오늘 누적 구매액</span>
          <strong>{formatWon(dailyTotal)}</strong>
        </div>
        <div className="progress-bar">
          <span style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="split-line">
          {nextTierAmount ? (
            <>
              <span>다음 티어 {formatWon(nextTierAmount)}</span>
              <strong>{formatWon(remainingAmount)} 남음</strong>
            </>
          ) : (
            <>
              <span>오늘 적용 가능한 최고 티어</span>
              <strong>달성</strong>
            </>
          )}
        </div>
        <p>{benefitsPreview} 중에서 고를 수 있습니다.</p>
      </section>
      <button type="button" className="portal-button primary" onClick={onReward}>
        {rewardCount > 0 ? '혜택 선택하기' : '혜택 확인하기'}
      </button>
      <div className="mini-actions">
        <button type="button" onClick={onCoupons}>
          쿠폰함 {couponCount}장
        </button>
        <button type="button" onClick={onExtend}>
          시간 늘리는 방법
        </button>
      </div>
      <dl className="summary-list">
        {policySummaryRows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <button type="button" className="text-link left" onClick={onPrivacy}>
        개인정보 · 보안 안내
      </button>
    </PortalScreen>
  )
}

function RewardScreen({
  tierAmount,
  rewardOptions,
  selectedRewardId,
  onSelectReward,
  onChooseReward,
  errorMessage,
}: {
  tierAmount: number | null
  rewardOptions: DisplayRewardOption[]
  selectedRewardId: string
  onSelectReward: (benefitId: string) => void
  onChooseReward: (fulfillMode: RewardFulfillMode) => void
  errorMessage: string
}) {
  return (
    <PortalScreen eyebrow="REWARD UNLOCKED" accentEyebrow>
      <h1>
        {tierAmount
          ? `누적 구매액 ${formatWon(tierAmount)} 달성!`
          : '리워드 혜택이 열렸습니다!'}
      </h1>
      <p className="screen-copy">
        받은 혜택 하나를 선택해 주세요. 자동으로 선택되지 않습니다.
      </p>
      <div className="reward-list">
        {rewardOptions.map((option) => (
          <button
            key={option.benefitId}
            type="button"
            className={
              selectedRewardId === option.benefitId
                ? 'reward-card selected'
                : 'reward-card'
            }
            onClick={() => onSelectReward(option.benefitId)}
          >
            <span>
              <strong>{option.title}</strong>
              <small>{option.description}</small>
            </span>
            {option.recommended && <em>추천</em>}
          </button>
        ))}
      </div>
      <div className="reward-actions">
        <p>사용 방식</p>
        <button
          type="button"
          className="portal-button primary"
          disabled={!selectedRewardId}
          onClick={() => onChooseReward('IMMEDIATE')}
        >
          지금 바로 사용
        </button>
        <button
          type="button"
          className="portal-button secondary"
          disabled={!selectedRewardId}
          onClick={() => onChooseReward('COUPON_7D')}
        >
          쿠폰으로 저장 (7일)
        </button>
        {errorMessage && <span className="form-error">{errorMessage}</span>}
        <span>최종 적용 결과는 결제 응답 기준으로 확정됩니다.</span>
      </div>
    </PortalScreen>
  )
}

function CouponsScreen({
  coupons,
  couponCount,
  errorMessage,
  noticeMessage,
  isLoading,
  onRedeemCoupon,
}: {
  coupons: CustomerCoupon[]
  couponCount: number
  errorMessage: string
  noticeMessage: string
  isLoading: boolean
  onRedeemCoupon: (couponId: string) => void
}) {
  return (
    <PortalScreen eyebrow="COUPONS">
      <h1>쿠폰함 {couponCount}장</h1>
      <p className="screen-copy">저장한 쿠폰은 7일 이내에 사용할 수 있습니다.</p>
      {noticeMessage && <p className="success-text" role="status">{noticeMessage}</p>}
      {isLoading && coupons.length === 0 ? (
        <section className="notice-panel">
          <strong>쿠폰을 불러오는 중입니다</strong>
          <p>잠시만 기다려 주세요.</p>
        </section>
      ) : coupons.length === 0 ? (
        <section className="notice-panel">
          <strong>저장된 쿠폰이 없습니다</strong>
          <p>리워드 선택 화면에서 쿠폰으로 저장하면 이곳에 표시됩니다.</p>
        </section>
      ) : (
        coupons.map((coupon) => (
          <section className="coupon-card" key={coupon.couponId}>
            <span>
              <strong>{getCouponTitle(coupon)}</strong>
              <small>{getCouponMeta(coupon)}</small>
            </span>
            <button
              type="button"
              disabled={coupon.status !== 'AVAILABLE'}
              onClick={() => onRedeemCoupon(coupon.couponId)}
            >
              {coupon.status === 'AVAILABLE' ? '사용' : getCouponStatusLabel(coupon.status)}
            </button>
          </section>
        ))
      )}
      {errorMessage && <p className="form-error">{errorMessage}</p>}
    </PortalScreen>
  )
}

function ExtendScreen({
  pass,
  upsellHint,
  onAdditionalOrder,
}: {
  pass: CustomerPass | null
  upsellHint: UpsellHintResponse | null
  onAdditionalOrder: () => void
}) {
  const tierRows = getPolicyTierRows(pass)
  const nextTierAmount = upsellHint ? upsellHint.nextTierAmount : portalDemo.nextTierAmount
  const remainingAmount =
    upsellHint?.remainingAmountToNextTier ??
    (nextTierAmount
      ? Math.max(0, nextTierAmount - (upsellHint?.dailyTotal ?? portalDemo.dailyTotal))
      : 0)
  const benefitsPreview =
    upsellHint?.nextTierBenefitsPreview?.map(formatBenefitLabel).join(' · ') ??
    '다음 리워드'
  const suggestedItems = getSuggestedItems(upsellHint)

  return (
    <PortalScreen eyebrow="EXTEND">
      <h1>추가 주문하시면 이용 시간이 늘어납니다</h1>
      <p className="screen-copy">
        주문은 키오스크 또는 카운터에서 진행합니다. 결제가 끝나면 이 화면의
        시간이 자동으로 늘어납니다.
      </p>
      <div className="tier-list">
        {tierRows.map((tier) => (
          <TierItem
            key={`${tier.minAmount}-${tier.bonusMinutes}`}
            label={`${formatWon(tier.minAmount)} 이상 주문`}
            value={`+${tier.bonusMinutes}분`}
          />
        ))}
        {nextTierAmount ? (
          <TierItem
            label={`누적 ${formatWon(nextTierAmount)} 티어 혜택`}
            value={benefitsPreview}
          />
        ) : (
          <TierItem label="오늘 적용 가능한 최고 티어" value="달성" />
        )}
      </div>
      <section className="recommend-card">
        <p>오늘 추천 · 누적 리워드까지</p>
        <h2>
          {remainingAmount > 0
            ? `${formatWon(remainingAmount)}만 더 구매하면 ${benefitsPreview} 혜택에 가까워집니다.`
            : '오늘 선택 가능한 리워드 혜택을 확인해 보세요.'}
        </h2>
        {suggestedItems.map((item) => (
          <div key={item.id} className="menu-row">
            <span>
              <strong>{item.name}</strong>
              <small>{item.description}</small>
            </span>
            <span className="menu-price-stack">
              {item.discountRate ? <em>{item.discountRate}% 할인</em> : null}
              {item.originalPrice && item.originalPrice > item.price ? (
                <del>{formatWon(item.originalPrice)}</del>
              ) : null}
              <b>{formatWon(item.price)}</b>
            </span>
          </div>
        ))}
      </section>
      <button type="button" className="portal-button primary" onClick={onAdditionalOrder}>
        Demo POS에서 추가 주문하기
      </button>
    </PortalScreen>
  )
}

function ExpiredScreen({
  pass,
  upsellHint,
  onExtend,
  onCoupons,
}: {
  pass: CustomerPass | null
  upsellHint: UpsellHintResponse | null
  onExtend: () => void
  onCoupons: () => void
}) {
  const dailyTotal = upsellHint?.dailyTotal ?? pass?.dailyTotal ?? portalDemo.dailyTotal
  const remainingAmount = upsellHint?.remainingAmountToNextTier ?? portalDemo.remainingToReward
  const benefitsPreview =
    upsellHint?.nextTierBenefitsPreview?.map(formatBenefitLabel).join(' · ') ??
    '다음 리워드'

  return (
    <PortalScreen eyebrow="/expired">
      <h1>이용 시간이 모두 사용되었습니다</h1>
      <p className="screen-copy dark">
        추가 주문과 당일 누적 리워드로 이용을 이어갈 수 있습니다. 오늘 누적
        {` ${formatWon(dailyTotal)}`}
        {remainingAmount > 0
          ? ` · ${formatWon(remainingAmount)} 더 구매하면 ${benefitsPreview} 혜택에 가까워집니다.`
          : ` · ${benefitsPreview} 혜택을 확인해 보세요.`}
      </p>
      <button type="button" className="portal-button primary" onClick={onExtend}>
        시간 늘리는 방법 보기
      </button>
      <button type="button" className="portal-button secondary" onClick={onCoupons}>
        쿠폰함 열기
      </button>
    </PortalScreen>
  )
}

function BlockedScreen({
  errorInfo,
  onReconnect,
  onPrivacy,
}: {
  errorInfo: PortalErrorInfo | null
  onReconnect: () => void
  onPrivacy: () => void
}) {
  return (
    <PortalScreen eyebrow="/blocked">
      <h1>{errorInfo?.title ?? '이용권 연결을 다시 확인해 주세요'}</h1>
      <p className="screen-copy dark">
        {errorInfo?.message ??
          '이 기기에서 이용권을 확인하지 못했습니다. 주문표 QR을 다시 스캔하시거나 직원에게 말씀해 주세요.'}
      </p>
      {errorInfo && <RequestInfoCard errorInfo={errorInfo} />}
      <section className="notice-panel">
        <strong>확인해 볼 항목</strong>
        <p>· 주문표에 인쇄된 QR을 다시 스캔해 주세요.</p>
        <p>· 기기의 Wi-Fi가 매장 네트워크에 연결되어 있는지 확인해 주세요.</p>
        <p>· 그래도 연결되지 않으면 직원에게 주문번호를 알려 주세요.</p>
      </section>
      <button type="button" className="portal-button primary" onClick={onReconnect}>
        주문표 QR 다시 연결
      </button>
      <button type="button" className="portal-button secondary" onClick={onPrivacy}>
        안내 사항 보기
      </button>
    </PortalScreen>
  )
}

function ErrorScreen({
  errorInfo,
  onRetry,
}: {
  errorInfo: PortalErrorInfo | null
  onRetry: () => void
}) {
  return (
    <PortalScreen eyebrow="/error">
      <h1>{errorInfo?.title ?? '잠시 후 다시 시도해 주세요'}</h1>
      <p className="screen-copy dark">
        {errorInfo?.message ??
          '이용권 정보를 불러오지 못했습니다. 남은 이용 시간은 그대로 유지되며, 직원에게 말씀하시면 바로 확인해 드립니다.'}
      </p>
      {errorInfo && <RequestInfoCard errorInfo={errorInfo} />}
      <button type="button" className="portal-button primary" onClick={onRetry}>
        다시 시도
      </button>
    </PortalScreen>
  )
}

function RequestInfoCard({ errorInfo }: { errorInfo: PortalErrorInfo }) {
  return (
    <section className="request-card">
      <strong>요청 정보</strong>
      <span>
        {errorInfo.requestId}
        {errorInfo.status ? ` · HTTP ${errorInfo.status}` : ''}
      </span>
    </section>
  )
}

function PrivacyScreen({
  notice,
  onBack,
}: {
  notice: PrivacyNoticeResponse
  onBack: () => void
}) {
  return (
    <PortalScreen eyebrow="/privacy">
      <h1>개인정보 · 보안 안내</h1>
      <div className="privacy-list">
        <PrivacyItem
          title="무엇을 보관하나요"
          description={notice.phoneStorage}
        />
        <PrivacyItem
          title="언제 폐기하나요"
          description={`보관 기간 ${notice.phoneRetentionDays}일이 지나면 ${
            notice.automaticDeletion ? '자동 폐기하고' : '폐기 대상에 포함하고'
          }, 폐기 결과를 기록합니다.`}
        />
        <PrivacyItem
          title="수집하지 않는 것"
          description="MAC 주소를 수집하지 않고, 기기 지문을 임의로 만들지 않습니다. 팝업 · 소셜 로그인도 사용하지 않습니다."
        />
        <PrivacyItem
          title="왜 안내하나요"
          description={notice.purpose}
        />
      </div>
      <p className="caption">
        {notice.supportNote}
      </p>
      <button type="button" className="portal-button secondary" onClick={onBack}>
        이용권 화면으로
      </button>
    </PortalScreen>
  )
}

function ClaimMissingScreen() {
  return (
    <PortalScreen eyebrow="/blocked">
      <h1>주문표 QR을 다시 확인해 주세요</h1>
      <p className="screen-copy dark">
        이용권을 연결하려면 주문표 QR의 orderClaim 정보가 필요합니다.
      </p>
      <section className="notice-panel">
        <strong>QR 정보가 없습니다</strong>
        <p>· 예상 주소 형식은 /connect?orderClaim=... 입니다.</p>
        <p>· 주문표에 인쇄된 QR을 다시 스캔해 주세요.</p>
        <p>· 계속 보이면 직원에게 주문번호를 알려 주세요.</p>
      </section>
    </PortalScreen>
  )
}

function PortalScreen({
  eyebrow,
  accentEyebrow,
  className,
  children,
}: {
  eyebrow?: string
  accentEyebrow?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <div className={className ? `portal-screen ${className}` : 'portal-screen'}>
      {eyebrow && (
        <p className={accentEyebrow ? 'eyebrow accent' : 'eyebrow'}>{eyebrow}</p>
      )}
      {children}
    </div>
  )
}

function InfoCard({
  title,
  rows,
}: {
  title?: string
  rows: [string, string][]
}) {
  return (
    <section className="info-card">
      {title && <p className="card-title">{title}</p>}
      {rows.map(([label, value]) => (
        <div key={label} className="info-row">
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </section>
  )
}

function ConsentCard({
  checked,
  title,
  description,
  onChange,
}: {
  checked: boolean
  title: string
  description: string
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="consent-card">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span aria-hidden="true" />
      <div>
        <strong>{title}</strong>
        <small>{description}</small>
      </div>
    </label>
  )
}

function TierItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="tier-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function PrivacyItem({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <section className="privacy-item">
      <h2>{title}</h2>
      <p>{description}</p>
    </section>
  )
}

function getInitialScreen({
  isConnectRoute,
  orderClaim,
  screenParam,
  hasSession,
}: {
  isConnectRoute: boolean
  orderClaim: string
  screenParam: Screen | null
  hasSession: boolean
}): Screen {
  if (screenParam && screenParamSet.has(screenParam)) return screenParam
  if (isConnectRoute && hasSession && !orderClaim) return 'active'
  if (isConnectRoute) return orderClaim ? 'qr' : 'claimMissing'

  return 'qr'
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return getApiErrorDetail(error) ?? '요청 처리 중 문제가 발생했습니다.'
  }

  return error instanceof Error ? error.message : '요청 처리 중 문제가 발생했습니다.'
}

function toPortalErrorInfo(error: unknown, fallbackCode: string): PortalErrorInfo {
  if (error instanceof ApiError) {
    const body = getApiErrorBody(error)
    const apiTitle = getCleanText(getStringValue(body?.title), '')
    const title =
      apiTitle ||
      getPortalErrorTitle(error.status) ||
      '요청을 처리하지 못했습니다'
    const message =
      getCleanText(getStringValue(body?.detail), '') ||
      getCleanText(getStringValue(body?.message), '') ||
      '주문표 QR 또는 이용권 상태를 다시 확인해 주세요.'
    const requestId =
      getStringValue(body?.requestId) ??
      getStringValue(body?.meta?.requestId) ??
      `local_${fallbackCode.toLowerCase()}`

    return {
      title,
      message,
      requestId,
      status: error.status,
    }
  }

  return {
    title: '요청을 처리하지 못했습니다',
    message: getErrorMessage(error),
    requestId: `local_${fallbackCode.toLowerCase()}`,
  }
}

function getApiErrorDetail(error: ApiError) {
  const body = getApiErrorBody(error)
  if (!body) return null

  return (
    getStringValue(body.detail) ??
    getStringValue(body.message) ??
    getStringValue(body.error?.message)
  )
}

function getApiErrorBody(error: ApiError) {
  if (!error.body || typeof error.body !== 'object') return null

  return error.body as {
    detail?: unknown
    message?: unknown
    title?: unknown
    requestId?: unknown
    meta?: { requestId?: unknown }
    error?: { message?: unknown }
  }
}

function getStringValue(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

function getPortalErrorTitle(status: number) {
  if (status === 401 || status === 403) return '본인 확인이 다시 필요합니다'
  if (status === 404 || status === 410) return '주문표 QR을 다시 확인해 주세요'
  if (status === 409) return '이미 처리된 이용권입니다'
  if (status === 422) return '입력 정보를 다시 확인해 주세요'
  if (status >= 500) return '잠시 후 다시 시도해 주세요'

  return null
}

function isRecoverableClaimError(error: unknown) {
  return error instanceof ApiError && [404, 409, 410, 422].includes(error.status)
}

function isBlockedPassError(error: unknown) {
  return error instanceof ApiError && [401, 403, 404, 409, 410, 422].includes(error.status)
}

function readStoredRewardGrantIds() {
  const rawValue = window.sessionStorage.getItem('portalRewardGrantIds')
  if (!rawValue) return []

  try {
    const parsedValue = JSON.parse(rawValue)

    return Array.isArray(parsedValue)
      ? parsedValue.filter((item): item is string => typeof item === 'string')
      : []
  } catch {
    return []
  }
}

const PASS_REFRESH_INTERVAL_MS = 10_000
const CUSTOMER_CONTEXT_REFRESH_INTERVAL_MS = 15_000

function getPolicySummaryRows(pass: CustomerPass | null): [string, string][] {
  const snapshot = getPolicySnapshot(pass)
  const baseMinutes = getRecordNumber(snapshot, 'baseMinutes')
  const bonusMinutes = getRecordNumber(snapshot, 'bonusMinutes')
  const amount = getRecordNumber(snapshot, 'amount')
  const orderType = getRecordString(snapshot, 'orderType')
  const rows: [string, string][] = []

  if (baseMinutes !== null) rows.push(['기본 제공 시간', formatMinutes(baseMinutes)])
  if (bonusMinutes !== null && bonusMinutes > 0) {
    rows.push(['금액 구간 보너스', `+${bonusMinutes}분`])
  }
  if (amount !== null) rows.push(['정책 적용 금액', formatWon(amount)])
  if (orderType) rows.push(['주문 구분', getOrderTypeLabel(orderType)])

  return rows.length > 0
    ? rows
    : [
        ['기본 제공 시간', formatMinutes(portalDemo.baseMinutes)],
        ['금액 구간 보너스', `+${portalDemo.bonusMinutes}분`],
      ]
}

function getPolicyBonusMinutes(pass: CustomerPass | null) {
  return getRecordNumber(getPolicySnapshot(pass), 'bonusMinutes') ?? 0
}

function getPolicyTierRows(pass: CustomerPass | null): PolicyTier[] {
  const tiers = getPolicySnapshot(pass).tiers
  if (Array.isArray(tiers)) {
    const normalizedTiers = tiers
      .map((tier) => {
        if (!isRecord(tier)) return null

        const minAmount = getRecordNumber(tier, 'minAmount')
        const bonusMinutes = getRecordNumber(tier, 'bonusMinutes')
        if (minAmount === null || bonusMinutes === null) return null

        return { minAmount, bonusMinutes }
      })
      .filter((tier): tier is PolicyTier => Boolean(tier))

    if (normalizedTiers.length > 0) return normalizedTiers
  }

  return [
    {
      minAmount: portalDemo.paidAmount,
      bonusMinutes: portalDemo.bonusMinutes,
    },
  ]
}

function getPolicySnapshot(pass: CustomerPass | null) {
  return pass?.policySnapshot ?? {}
}

function getSuggestedItems(upsellHint: UpsellHintResponse | null): MenuItem[] {
  if (upsellHint?.suggestedItems && upsellHint.suggestedItems.length > 0) {
    return upsellHint.suggestedItems.map((item) => ({
      id: item.productId,
      name: getCleanText(item.name, '추천 메뉴'),
      description: item.discountRate
        ? getCleanText(item.promotionTitle ?? '', `${item.discountRate}% 할인 적용 중`)
        : '오늘 추천 메뉴',
      price: item.discountedPrice ?? item.price,
      originalPrice: item.originalPrice ?? item.price,
      discountRate: item.discountRate ?? undefined,
      promotionTitle: item.promotionTitle ?? undefined,
      promotionEndsAt: item.promotionEndsAt ?? undefined,
    }))
  }

  return recommendedItems.map((item) => ({
    ...item,
    name: getCleanText(item.name, '추천 메뉴'),
    description: getCleanText(item.description, '오늘 추천 메뉴'),
  }))
}

function getOrderTypeLabel(orderType: string) {
  const labels: Record<string, string> = {
    FIRST: '첫 주문',
    ADDITIONAL: '추가 주문',
  }

  return labels[orderType] ?? orderType
}

function getRecordNumber(record: Record<string, unknown>, key: string) {
  const value = record[key]

  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function getRecordString(record: Record<string, unknown>, key: string) {
  const value = record[key]

  return typeof value === 'string' && value.length > 0 ? value : null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function toDisplayRewardOption(option: RewardOption): DisplayRewardOption {
  return {
    benefitId: option.benefitId,
    title: getCleanText(option.title, formatBenefitLabel(option.type)),
    description: getRewardDescription(option),
    recommended: option.recommended,
  }
}

function normalizePrivacyNotice(
  notice: PrivacyNoticeResponse,
): PrivacyNoticeResponse {
  return {
    ...fallbackPrivacyNotice,
    storeId: notice.storeId || fallbackPrivacyNotice.storeId,
    storeName: getCleanText(notice.storeName, fallbackPrivacyNotice.storeName),
    phoneStorage: getCleanText(notice.phoneStorage, fallbackPrivacyNotice.phoneStorage),
    phoneRetentionDays:
      typeof notice.phoneRetentionDays === 'number'
        ? notice.phoneRetentionDays
        : fallbackPrivacyNotice.phoneRetentionDays,
    automaticDeletion:
      typeof notice.automaticDeletion === 'boolean'
        ? notice.automaticDeletion
        : fallbackPrivacyNotice.automaticDeletion,
    purpose: getCleanText(notice.purpose, fallbackPrivacyNotice.purpose),
    supportNote: getCleanText(notice.supportNote, fallbackPrivacyNotice.supportNote),
  }
}

function getCleanText(value: string | null | undefined, fallbackValue: string) {
  if (!value) return fallbackValue

  const repairedValue = repairMojibake(value).trim()
  if (!repairedValue || looksMojibake(repairedValue)) return fallbackValue

  return repairedValue
}

function repairMojibake(value: string) {
  if (!looksMojibake(value)) return value

  try {
    const bytes = Uint8Array.from([...value].map((char) => char.charCodeAt(0) & 0xff))
    return new TextDecoder('utf-8').decode(bytes)
  } catch {
    return value
  }
}

function looksMojibake(value: string) {
  return /[ÃÂ�]|[ìëíê][\u0080-\u00ff]?|[\u0080-\u009f]/.test(value)
}

function getRewardDescription(option: RewardOption) {
  const descriptions: Record<string, string> = {
    FREE_SIZE_UP: '라떼를 자주 주문하셨습니다',
    FREE_SHOT: '오늘 두 잔 이상 주문하셨습니다',
    DESSERT_DISCOUNT: '디저트를 자주 주문하셨습니다',
    WIFI_DAY_PASS: '오늘 하루 Wi-Fi를 계속 이용할 수 있습니다',
    DRINK_DISCOUNT: '음료 할인 혜택을 받을 수 있습니다',
  }

  return getCleanText(
    option.recommendationReason,
    descriptions[option.type] ?? '선택 가능한 리워드 혜택입니다',
  )
}

function formatBenefitLabel(value: string) {
  const labels: Record<string, string> = {
    FREE_SIZE_UP: '무료 사이즈업',
    FREE_SHOT: '샷 추가',
    DESSERT_DISCOUNT: '디저트 할인',
    WIFI_DAY_PASS: 'Wi-Fi 종일권',
    DRINK_DISCOUNT: '음료 할인',
  }

  return labels[value] ?? getCleanText(value, value)
}

function getCouponTitle(coupon: CustomerCoupon) {
  const title = coupon.benefit.title
  if (typeof title === 'string') return getCleanText(title, '리워드 쿠폰')

  const benefitType = coupon.benefit.benefitType
  if (benefitType === 'DESSERT_DISCOUNT') return '디저트 할인'
  if (benefitType === 'DRINK_DISCOUNT') return '음료 할인'
  if (benefitType === 'FREE_SIZE_UP') return '무료 사이즈업'

  return '리워드 쿠폰'
}

function getCouponMeta(coupon: CustomerCoupon) {
  if (coupon.status === 'REDEEMED' && coupon.redeemedAt) {
    return `${formatShortDate(new Date(coupon.redeemedAt))} 사용 완료`
  }

  if (coupon.status === 'EXPIRED') return '만료된 쿠폰'

  return `${formatShortDate(new Date(coupon.expiresAt))}까지 사용`
}

function getCouponStatusLabel(status: string) {
  const labels: Record<string, string> = {
    REDEEMED: '사용 완료',
    EXPIRED: '만료',
    REVOKED: '취소',
  }

  return labels[status] ?? status
}

function getEffectivePassStatus(
  status: CustomerPassStatus,
  secondsLeft: number,
): CustomerPassStatus {
  if (secondsLeft <= 0) return 'EXPIRED'
  if (status === 'ACTIVE' && secondsLeft <= 5 * 60) return 'EXPIRING_SOON'

  return status
}

function getPassStatusLabel(status: CustomerPassStatus) {
  const labels: Record<CustomerPassStatus, string> = {
    ISSUED: '발급 완료',
    ACTIVATING: '활성화 중',
    ACTIVE: '이용 중',
    EXPIRING_SOON: '종료 임박',
    EXPIRED: '종료',
    CANCELLED: '취소',
    BLOCKED: '차단',
    FAILED: '오류',
  }

  return labels[status]
}

function formatWon(value: number) {
  return `${value.toLocaleString('ko-KR')}원`
}

function formatMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours && minutes) return `${hours}시간 ${minutes}분`
  if (hours) return `${hours}시간`

  return `${minutes}분`
}

function formatDeltaMinutes(totalSeconds: number) {
  return formatMinutes(Math.max(1, Math.round(totalSeconds / 60)))
}

function formatRemaining(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  if (hours > 0) return `${hours}시간 ${minutes}분`

  return `${minutes}분`
}

function formatShortTime(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
  }).format(date)
}

function normalizeDigits(value: string) {
  return value.replace(/\D/g, '')
}

