import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  createMockPortalOrder,
  portalDemo,
  recommendedItems,
  rewardOptions,
} from './customerMock'
import {
  activatePassMock,
  confirmOtpMock,
  exchangeOrderClaimMock,
  sendOtpMock,
} from './customerMockService'
import type { PortalOrder, Screen } from './customerTypes'
import type { CustomerPass, CustomerPassStatus } from '../../api/customer'
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

  const goToScreen = (
    nextScreen: Screen,
    options?: { replace?: boolean; clearOrderClaim?: boolean },
  ) => {
    setScreen(nextScreen)

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
      if (screenParam === 'active' && savedPassId && !activePass) {
        activatePassMock(savedPassId).then((response) => {
          setActivePass(response)
          setSecondsLeft(response.remainingSeconds)
        })
      }
      return
    }

    if (!orderClaim && savedSession && savedPassId) {
      setScreen('active')
      activatePassMock(savedPassId).then((response) => {
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

    exchangeOrderClaimMock(claimForDemo).then((response) => {
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

      const response = await sendOtpMock()

      setChallengeId(response.challengeId)
      setDemoCode(response.demoCode)
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

      const response = await confirmOtpMock(challengeId, otpCode, passId || null)

      setPassId(response.passId ?? '')
      setOtpVerified(true)
      window.sessionStorage.setItem('portalSession', response.portalSession)
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

    const response = await activatePassMock(passId)

    setActivePass(response)
    setSecondsLeft(response.remainingSeconds)
    goToScreen('active')
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
            selectedRewardId={selectedRewardId}
            onSelectReward={setSelectedRewardId}
            onCoupons={() => goToScreen('coupons')}
          />
        )}
        {screen === 'coupons' && <CouponsScreen />}
        {screen === 'extend' && <ExtendScreen />}
        {screen === 'expired' && (
          <ExpiredScreen
            onExtend={() => goToScreen('extend')}
            onCoupons={() => goToScreen('coupons')}
          />
        )}
        {screen === 'blocked' && (
          <BlockedScreen
            onReconnect={() => goToScreen(orderClaim ? 'qr' : 'claimMissing')}
            onPrivacy={() => goToScreen('privacy')}
          />
        )}
        {screen === 'error' && <ErrorScreen onRetry={() => goToScreen('active')} />}
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
  currentTime,
  secondsLeft,
  onReward,
  onCoupons,
  onExtend,
  onPrivacy,
}: {
  pass: CustomerPass | null
  currentTime: Date
  secondsLeft: number
  onReward: () => void
  onCoupons: () => void
  onExtend: () => void
  onPrivacy: () => void
}) {
  const status = getEffectivePassStatus(pass?.status ?? 'ACTIVE', secondsLeft)
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
          <strong>{formatWon(portalDemo.dailyTotal)}</strong>
        </div>
        <div className="progress-bar">
          <span style={{ width: '50%' }} />
        </div>
        <div className="split-line">
          <span>다음 티어 {formatWon(portalDemo.nextTierAmount)}</span>
          <strong>{formatWon(portalDemo.nextTierAmount - portalDemo.dailyTotal)} 남음</strong>
        </div>
        <p>
          Wi-Fi 종일권 · 음료 할인 · 신메뉴 시식권 중에서 고를 수 있습니다.
        </p>
      </section>
      <button type="button" className="portal-button primary" onClick={onReward}>
        혜택 선택하기
      </button>
      <div className="mini-actions">
        <button type="button" onClick={onCoupons}>
          쿠폰함 1장
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
  selectedRewardId,
  onSelectReward,
  onCoupons,
}: {
  selectedRewardId: string
  onSelectReward: (benefitId: string) => void
  onCoupons: () => void
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
        >
          지금 바로 사용
        </button>
        <button
          type="button"
          className="portal-button secondary"
          disabled={!selectedRewardId}
          onClick={onCoupons}
        >
          쿠폰으로 저장 (7일)
        </button>
        <span>최종 적용 결과는 결제 응답 기준으로 확정됩니다.</span>
      </div>
    </PortalScreen>
  )
}

function CouponsScreen() {
  return (
    <PortalScreen eyebrow="COUPONS">
      <h1>쿠폰함 1장</h1>
      <p className="screen-copy">저장한 쿠폰은 7일 이내에 사용할 수 있습니다.</p>
      <section className="coupon-card">
        <span>
          <strong>디저트 10% 할인</strong>
          <small>8월 5일까지 사용</small>
        </span>
        <button type="button">사용</button>
      </section>
    </PortalScreen>
  )
}

function ExtendScreen() {
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
  onReconnect,
  onPrivacy,
}: {
  onReconnect: () => void
  onPrivacy: () => void
}) {
  return (
    <PortalScreen eyebrow="/blocked">
      <h1>이용권 연결을 다시 확인해 주세요</h1>
      <p className="screen-copy dark">
        이 기기에서 이용권을 확인하지 못했습니다. 주문표 QR을 다시
        스캔하시거나 직원에게 말씀해 주세요.
      </p>
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

function ErrorScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <PortalScreen eyebrow="/error">
      <h1>잠시 후 다시 시도해 주세요</h1>
      <p className="screen-copy dark">
        이용권 정보를 불러오지 못했습니다. 남은 이용 시간은 그대로 유지되며,
        직원에게 말씀하시면 바로 확인해 드립니다.
      </p>
      <section className="request-card">
        <strong>요청 ID</strong>
        <span>req_7f21c9 · 14:31:08</span>
      </section>
      <button type="button" className="portal-button primary" onClick={onRetry}>
        다시 시도
      </button>
    </PortalScreen>
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
  return error instanceof Error
    ? error.message
    : '요청 처리 중 문제가 발생했습니다.'
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

function normalizeDigits(value: string) {
  return value.replace(/\D/g, '')
}
