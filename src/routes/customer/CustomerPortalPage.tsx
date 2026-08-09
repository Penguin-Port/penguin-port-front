import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  createMockPortalOrder,
  portalDemo,
  recommendedItems,
  rewardOptions as fallbackRewardOptions,
} from './customerMock'
import { customerPortalService } from './customerService'
import type { PortalOrder, Screen } from './customerTypes'
import type {
  CustomerCoupon,
  CustomerPass,
  CustomerPassStatus,
  RewardFulfillMode,
  RewardOption,
  UpsellHintResponse,
} from '../../api/customer'
import { ApiError } from '../../api/client'
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

type PortalErrorInfo = {
  title: string
  message: string
  requestId: string
  status?: number
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
  const [rewardError, setRewardError] = useState('')
  const [couponCount, setCouponCount] = useState(0)
  const [coupons, setCoupons] = useState<CustomerCoupon[]>([])
  const [couponError, setCouponError] = useState('')
  const [lastPortalError, setLastPortalError] = useState<PortalErrorInfo | null>(null)

  const goToScreen = (
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
  }

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
          storeName: response.storeName,
          orderNo: response.orderNo,
          items: response.items,
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
  }, [isConnectRoute, orderClaim])

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

    const refreshPass = async () => {
      const savedSession = window.sessionStorage.getItem('portalSession')
      if (!savedSession) return

      try {
        const response = await customerPortalService.getPass({
          passId,
          portalSession: savedSession,
        })
        if (isCanceled) return

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

    const timer = window.setInterval(() => {
      void refreshPass()
    }, 30000)

    window.addEventListener('focus', refreshPass)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      isCanceled = true
      window.clearInterval(timer)
      window.removeEventListener('focus', refreshPass)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [passId, screen])

  useEffect(() => {
    if (screen !== 'active') return

    const savedSession = window.sessionStorage.getItem('portalSession')
    if (!savedSession) return

    customerPortalService
      .getUpsellHint({ portalSession: savedSession })
      .then(setUpsellHint)
      .catch(() => {
        setUpsellHint(null)
      })
  }, [screen, activePass?.version])

  useEffect(() => {
    if (screen !== 'reward') return

    const savedSession = window.sessionStorage.getItem('portalSession')
    const grantId = rewardGrantIds[0]
    if (!savedSession || !grantId) {
      setAvailableRewardOptions([])
      return
    }

    customerPortalService
      .getRewardOptions({ grantId, portalSession: savedSession })
      .then((response) => {
        setAvailableRewardOptions(response.options.map(toDisplayRewardOption))
        setRewardError('')
      })
      .catch((error) => {
        setRewardError(getErrorMessage(error))
        setAvailableRewardOptions([])
      })
  }, [rewardGrantIds, screen])

  useEffect(() => {
    if (screen !== 'coupons') return

    const savedSession = window.sessionStorage.getItem('portalSession')
    if (!savedSession) return

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
    } catch (error) {
      setCouponError(getErrorMessage(error))
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
            onRedeemCoupon={handleRedeemCoupon}
          />
        )}
        {screen === 'extend' && (
          <ExtendScreen onAdditionalOrder={() => navigate('/app/demo-pos?mode=extend')} />
        )}
        {screen === 'expired' && (
          <ExpiredScreen
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
        {screen === 'privacy' && <PrivacyScreen onBack={() => goToScreen('active')} />}
      </section>
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
        무료 Wi-Fi 이용권 2시간 제공
      </h1>
      <p className="screen-copy">
        주문표 QR로 안전하게 이용권을 연결합니다. 추가 주문 시 이용 시간이
        자동으로 늘어납니다.
      </p>
      <InfoCard
        title="확인된 주문 / orderClaim"
        rows={[
          ['매장', portalOrder.storeName.replace('팽귄포트 ', '')],
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
  const bonusMinutes = Math.max(0, portalOrder.providedMinutes - portalDemo.baseMinutes)

  return (
    <PortalScreen eyebrow="STEP 3 · 이용 시작">
      <h1>Wi-Fi 이용권 {formatMinutes(portalOrder.providedMinutes)} 제공</h1>
      <p className="screen-copy">
        주문 금액에 따라 제공되는 시간입니다. 추가 주문 시 자동으로 연장됩니다.
      </p>
      <InfoCard
        rows={[
          ['첫 주문 기본', formatMinutes(portalDemo.baseMinutes)],
          ['금액 구간 보너스', `+${bonusMinutes}분`],
          ['이용 종료 예정', '오후 5:01'],
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
  currentTime: Date
  secondsLeft: number
  onReward: () => void
  onCoupons: () => void
  onExtend: () => void
  onPrivacy: () => void
}) {
  const status = getEffectivePassStatus(pass?.status ?? 'ACTIVE', secondsLeft)
  const dailyTotal = upsellHint?.dailyTotal ?? pass?.dailyTotal ?? portalDemo.dailyTotal
  const nextTierAmount = upsellHint?.nextTierAmount ?? portalDemo.nextTierAmount
  const remainingAmount =
    upsellHint?.remainingAmountToNextTier ?? Math.max(0, nextTierAmount - dailyTotal)
  const progressPercent = nextTierAmount
    ? Math.min(100, Math.round((dailyTotal / nextTierAmount) * 100))
    : 100
  const benefitsPreview =
    upsellHint?.nextTierBenefitsPreview?.join(' · ') ??
    'Wi-Fi 종일권 · 음료 할인 · 신메뉴 시식권'
  const endTimeLabel = useMemo(
    () => formatShortTime(pass ? new Date(pass.expiresAt) : currentTime),
    [currentTime, pass],
  )

  return (
    <PortalScreen className="active-view">
      <div className="chips">
        <span className="chip live">{getPassStatusLabel(status)}</span>
        <span className="chip">한산 시간대 자동연장</span>
      </div>
      <p className="timer-label">남은 이용 시간</p>
      <p className="timer-large">{formatRemaining(secondsLeft)}</p>
      <p className="caption">오후 {endTimeLabel} 까지 · 매장 시간 기준</p>
      <section className="progress-card">
        <div className="amount-line">
          <span>오늘 누적 구매액</span>
          <strong>{formatWon(dailyTotal)}</strong>
        </div>
        <div className="progress-bar">
          <span style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="split-line">
          <span>다음 티어 {formatWon(nextTierAmount)}</span>
          <strong>{formatWon(remainingAmount)} 남음</strong>
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
        <div>
          <dt>첫 주문 기본</dt>
          <dd>2시간</dd>
        </div>
        <div>
          <dt>금액 구간 보너스</dt>
          <dd>+30분</dd>
        </div>
        <div>
          <dt>한산 시간대 자동연장</dt>
          <dd>적용 대상</dd>
        </div>
      </dl>
      <button type="button" className="text-link left" onClick={onPrivacy}>
        개인정보 · 보안 안내
      </button>
    </PortalScreen>
  )
}

function RewardScreen({
  rewardOptions,
  selectedRewardId,
  onSelectReward,
  onChooseReward,
  errorMessage,
}: {
  rewardOptions: DisplayRewardOption[]
  selectedRewardId: string
  onSelectReward: (benefitId: string) => void
  onChooseReward: (fulfillMode: RewardFulfillMode) => void
  errorMessage: string
}) {
  return (
    <PortalScreen eyebrow="REWARD UNLOCKED" accentEyebrow>
      <h1>누적 구매액 10,000원 달성!</h1>
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
  onRedeemCoupon,
}: {
  coupons: CustomerCoupon[]
  couponCount: number
  errorMessage: string
  onRedeemCoupon: (couponId: string) => void
}) {
  return (
    <PortalScreen eyebrow="COUPONS">
      <h1>쿠폰함 {couponCount}장</h1>
      <p className="screen-copy">저장한 쿠폰은 7일 이내에 사용할 수 있습니다.</p>
      {coupons.length === 0 ? (
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

function ExtendScreen({ onAdditionalOrder }: { onAdditionalOrder: () => void }) {
  return (
    <PortalScreen eyebrow="EXTEND">
      <h1>추가 주문하시면 이용 시간이 늘어납니다</h1>
      <p className="screen-copy">
        주문은 키오스크 또는 카운터에서 진행합니다. 결제가 끝나면 이 화면의
        시간이 자동으로 늘어납니다.
      </p>
      <div className="tier-list">
        <TierItem label="3,000원 이상 추가 주문" value="+20분" />
        <TierItem label="5,000원 이상 추가 주문" value="+30분" />
        <TierItem label="8,000원 이상 추가 주문" value="+45분" />
        <TierItem label="누적 20,000원 티어 혜택" value="종일권" />
      </div>
      <section className="recommend-card">
        <p>오늘 추천 · 누적 리워드까지</p>
        <h2>1,500원만 더 구매하면 무료 사이즈업 혜택을 받을 수 있습니다.</h2>
        {recommendedItems.map((item) => (
          <div key={item.id} className="menu-row">
            <span>
              <strong>{item.name}</strong>
              <small>{item.description}</small>
            </span>
            <b>{formatWon(item.price)}</b>
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
  onExtend,
  onCoupons,
}: {
  onExtend: () => void
  onCoupons: () => void
}) {
  return (
    <PortalScreen eyebrow="/expired">
      <h1>이용 시간이 모두 사용되었습니다</h1>
      <p className="screen-copy dark">
        추가 주문과 당일 누적 리워드로 이용을 이어갈 수 있습니다. 오늘 누적
        8,500원 · 1,500원 더 구매하면 무료 사이즈업 · 무료 샷 추가 · 디저트
        할인 중에서 선택할 수 있습니다.
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

function PrivacyScreen({ onBack }: { onBack: () => void }) {
  return (
    <PortalScreen eyebrow="/privacy">
      <h1>개인정보 · 보안 안내</h1>
      <div className="privacy-list">
        <PrivacyItem
          title="무엇을 보관하나요"
          description="이용권 연결에 필요한 전화번호만 암호화해 보관합니다."
        />
        <PrivacyItem
          title="언제 폐기하나요"
          description="보관 기간 30일이 지나면 자동 폐기하고, 폐기 결과를 기록합니다."
        />
        <PrivacyItem
          title="수집하지 않는 것"
          description="MAC 주소를 수집하지 않고, 기기 지문을 임의로 만들지 않습니다. 팝업 · 소셜 로그인도 사용하지 않습니다."
        />
        <PrivacyItem
          title="왜 안내하나요"
          description="불법 접속으로부터 매장을 보호하기 위한 최소한의 기록만 남깁니다."
        />
      </div>
      <p className="caption">
        불법 접속 대응 기록은 점주 보호 목적으로만 보관하며, 목적을 달성하면
        폐기합니다. 마케팅에는 사용하지 않습니다.
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
    const title =
      getStringValue(body?.title) ??
      getPortalErrorTitle(error.status) ??
      '요청을 처리하지 못했습니다'
    const message =
      getStringValue(body?.detail) ??
      getStringValue(body?.message) ??
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

function toDisplayRewardOption(option: RewardOption): DisplayRewardOption {
  return {
    benefitId: option.benefitId,
    title: option.title,
    description: getRewardDescription(option),
    recommended: option.recommended,
  }
}

function getRewardDescription(option: RewardOption) {
  const descriptions: Record<string, string> = {
    FREE_SIZE_UP: '라떼를 자주 주문하셨습니다',
    FREE_SHOT: '오늘 두 잔 이상 주문하셨습니다',
    DESSERT_DISCOUNT: '디저트를 자주 주문하셨습니다',
    WIFI_DAY_PASS: '오늘 하루 Wi-Fi를 계속 이용할 수 있습니다',
    DRINK_DISCOUNT: '음료 할인 혜택을 받을 수 있습니다',
  }

  return descriptions[option.type] ?? '선택 가능한 리워드 혜택입니다'
}

function getCouponTitle(coupon: CustomerCoupon) {
  const title = coupon.benefit.title
  if (typeof title === 'string') return title

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

