import { useEffect, useMemo, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { CheckIcon, WifiIcon, WifiSmallIcon } from './components/CustomerIcons'
import { GuestOrderSummary } from './components/GuestOrderSummary'
import { GuestOtpPanel } from './components/GuestOtpPanel'
import {
  createMockPortalOrder,
  demoOtpCode,
  guestPasses,
  lookupPhone,
  menuItems,
  pass,
  steps,
} from './customerMock'
import type {
  CustomerType,
  HomeScreenProps,
  MenuItem,
  PortalOrder,
  Screen,
} from './customerTypes'
import '../../styles/customer.css'

export function CustomerPortalPage() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const orderClaim = searchParams.get('orderClaim')?.trim() ?? ''
  const isConnectRoute = location.pathname === '/connect'
  const [screen, setScreen] = useState<Screen>(() =>
    isConnectRoute ? (orderClaim ? 'complete' : 'claimMissing') : 'home',
  )
  const [customerType, setCustomerType] = useState<CustomerType>('guest')
  const [guestPhone, setGuestPhone] = useState('')
  const [memberName, setMemberName] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(6512)
  const [now, setNow] = useState(() => new Date())
  const [selectedMenuIds, setSelectedMenuIds] = useState<string[]>([])
  const [completedOrderItems, setCompletedOrderItems] = useState<MenuItem[]>([])
  const [portalSession, setPortalSession] = useState('')

  const portalOrder = useMemo(
    () => createMockPortalOrder(orderClaim, completedOrderItems),
    [completedOrderItems, orderClaim],
  )
  const selectedMenuItems = useMemo(
    () => menuItems.filter((item) => selectedMenuIds.includes(item.id)),
    [selectedMenuIds],
  )
  const completedOrderTotal = completedOrderItems.reduce(
    (total, item) => total + item.price,
    0,
  )
  const completedOrderLabel =
    completedOrderItems.map((item) => `${item.name} 1개`).join(', ') || pass.item

  useEffect(() => {
    if (!isConnectRoute) return

    setScreen(orderClaim ? 'complete' : 'claimMissing')
  }, [isConnectRoute, orderClaim])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date())
      if (screen === 'active') {
        setSecondsLeft((seconds) => Math.max(0, seconds - 1))
      }
    }, 1000)

    return () => window.clearInterval(timer)
  }, [screen])

  const currentStep = getCurrentStep(screen)

  const handlePrimaryAction = () => {
    if (screen === 'home') {
      if (isConnectRoute || portalSession) {
        setScreen('active')
        return
      }

      setSelectedMenuIds([])
      setScreen('menu')
    }
    if (screen === 'menu') {
      setCompletedOrderItems(selectedMenuItems)
      setSelectedMenuIds([])
      setScreen('complete')
    }
    if (screen === 'complete') setScreen('home')
  }

  const handleStepChange = (nextScreen: Screen) => {
    if (screen === 'menu' || nextScreen === 'menu') {
      setSelectedMenuIds([])
    }

    setScreen(nextScreen)
  }

  const handleOtpVerified = () => {
    const nextSession = `mock-portal-session-${portalOrder.orderClaim}`

    // Mock boundary: replace this with POST /public/otp/confirm later.
    setPortalSession(nextSession)
    window.sessionStorage.setItem('portalSession', nextSession)

    if (isConnectRoute) {
      window.history.replaceState(null, '', location.pathname)
    }
  }

  const handleOtpReset = () => {
    setPortalSession('')
    window.sessionStorage.removeItem('portalSession')
  }

  return (
    <main className="customer-portal">
      <section className="customer-page" aria-label="펭귄포트 고객 포털">
        <DesktopSummary />
        <div className="portal-stage">
          <div className="portal-brand">
            <BrandMark compact={screen !== 'home'} />
          </div>
          {screen === 'claimMissing' && <ClaimMissingScreen />}
          {screen === 'home' && (
            <HomeScreen
              customerType={customerType}
              guestPhone={guestPhone}
              memberName={memberName}
              portalSession={portalSession}
              isConnectFlow={isConnectRoute}
              portalOrder={portalOrder}
              onCustomerTypeChange={setCustomerType}
              onGuestPhoneChange={setGuestPhone}
              onMemberLogin={setMemberName}
              onOtpReset={handleOtpReset}
              onVerified={handleOtpVerified}
              onPrimaryAction={handlePrimaryAction}
              onLookup={() => setScreen('lookup')}
            />
          )}
          {screen === 'menu' && (
            <MenuScreen
              selectedMenuIds={selectedMenuIds}
              onBack={() => {
                setSelectedMenuIds([])
                setScreen('home')
              }}
              onCheckout={handlePrimaryAction}
              onToggleMenu={(menuId) =>
                setSelectedMenuIds((currentIds) =>
                  currentIds.includes(menuId)
                    ? currentIds.filter((id) => id !== menuId)
                    : [...currentIds, menuId],
                )
              }
            />
          )}
          {screen === 'complete' && (
            <CompleteScreen
              portalOrder={portalOrder}
              orderItemLabel={completedOrderLabel}
              paymentAmount={completedOrderTotal || parseWon(pass.amount)}
              onPrimaryAction={handlePrimaryAction}
            />
          )}
          {screen === 'active' && (
            <ActiveScreen
              currentTime={now}
              secondsLeft={secondsLeft}
              onExtend={() => setScreen('extend')}
            />
          )}
          {screen === 'lookup' && (
            <LookupScreen
              onBack={() => setScreen('home')}
              onConfirm={() => setScreen('active')}
            />
          )}
          {screen === 'extend' && (
            <ExtendScreen
              onBack={() => setScreen('active')}
              onOrder={() => {
                setSelectedMenuIds([])
                setScreen('menu')
              }}
            />
          )}
          <StepRail currentStep={currentStep} onStepChange={handleStepChange} />
        </div>
      </section>
    </main>
  )
}

function getCurrentStep(screen: Screen) {
  if (screen === 'lookup' || screen === 'claimMissing') return 0
  if (screen === 'extend') return 3
  if (screen === 'complete') return 1

  return steps.findIndex((step) => step.id === screen)
}

function ClaimMissingScreen() {
  return (
    <div className="screen centered-screen claim-missing-screen">
      <div className="wifi-orb" aria-hidden="true">
        <WifiIcon dark />
      </div>
      <h1>주문 QR을 다시 확인해주세요</h1>
      <p className="claim-missing-copy">
        이용권을 연결하려면 주문표 QR의 orderClaim 정보가 필요합니다.
      </p>
      <div className="notice-card warning">
        <strong>QR 정보가 없습니다</strong>
        <span>직원에게 주문표 QR을 다시 요청하거나, 새 QR로 접속해주세요.</span>
      </div>
      <p className="helper-text">예상 주소 형식: /connect?orderClaim=...</p>
    </div>
  )
}

function DesktopSummary() {
  return (
    <aside className="desktop-summary" aria-label="카페 프로모션 영역">
      <div>
        <BrandMark />
        <div className="desktop-copy">
          <h2>카페 혜택과 소식을 한곳에서 확인하세요</h2>
          <p>이 영역은 이후 매장 광고, 시즌 메뉴, 리워드 배너를 노출하는 자리로 사용할 수 있습니다.</p>
        </div>
      </div>

      <div className="ad-banner-card">
        <span className="summary-label">COMING SOON</span>
        <strong>광고 배너 영역</strong>
        <p>오늘의 추천 메뉴, 쿠폰, 제휴 이벤트 이미지를 넣을 수 있습니다.</p>
      </div>

      <div className="ad-banner-card muted">
        <span className="summary-label">WiFi PASS</span>
        <strong>주문 고객 전용 이용권</strong>
        <p>주문, 인증, 이용권 활성화 흐름은 오른쪽 포털 화면에서 이어집니다.</p>
      </div>
    </aside>
  )
}

function BrandMark({ compact }: { compact?: boolean }) {
  return (
    <div className={compact ? 'brand compact' : 'brand'}>
      {!compact && (
        <div className="hero-icon" aria-hidden="true">
          <WifiIcon />
        </div>
      )}
      <div className="brand-name">
        <WifiSmallIcon />
        <strong>{pass.brand}</strong>
      </div>
      {!compact && <span>Smart WiFi Pass</span>}
    </div>
  )
}

function HomeScreen({
  customerType,
  guestPhone,
  memberName,
  portalSession,
  isConnectFlow,
  portalOrder,
  onCustomerTypeChange,
  onGuestPhoneChange,
  onMemberLogin,
  onOtpReset,
  onVerified,
  onPrimaryAction,
  onLookup,
}: HomeScreenProps) {
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [signupName, setSignupName] = useState('')
  const [signupId, setSignupId] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const isGuest = customerType === 'guest'
  const canSendOtp = guestPhone.length === 11 && cooldownSeconds === 0
  const canConfirmOtp = otpCode.length === 6
  const hasGuestSession = otpVerified || Boolean(portalSession)
  const canContinueAsGuest = guestPhone.length === 11 && hasGuestSession
  const { title, description } = getHomeCopy({
    isConnectFlow,
    isGuest,
    memberName,
  })
  const canLogin = loginId.trim().length > 0 && password.trim().length > 0
  const canSignup =
    signupName.trim().length > 0 &&
    signupId.trim().length > 0 &&
    signupPassword.trim().length > 0

  useEffect(() => {
    if (cooldownSeconds === 0) return

    const timer = window.setInterval(() => {
      setCooldownSeconds((seconds) => Math.max(0, seconds - 1))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [cooldownSeconds])

  const handleGuestPhoneChange = (value: string) => {
    onGuestPhoneChange(normalizeDigits(value))
    setOtpSent(false)
    setOtpVerified(false)
    setErrorMessage('')
    setOtpCode('')
    onOtpReset()
  }

  const handleSendOtp = () => {
    if (!canSendOtp) return

    setOtpSent(true)
    setOtpVerified(false)
    setOtpCode('')
    setErrorMessage('')
    setCooldownSeconds(30)
  }

  const handleConfirmOtp = () => {
    if (!canConfirmOtp) return

    if (otpCode !== demoOtpCode) {
      setErrorMessage('인증번호가 일치하지 않습니다. 데모 코드는 123456입니다.')
      return
    }

    setErrorMessage('')
    setOtpVerified(true)
    onVerified()
  }

  const handleOtpCodeChange = (value: string) => {
    setOtpCode(normalizeDigits(value))
    setErrorMessage('')
  }

  return (
    <div className="screen home-screen">
      <div className="main-copy">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      <div className="customer-switch" aria-label="고객 유형 선택">
        <button
          type="button"
          className={customerType === 'guest' ? 'selected' : ''}
          onClick={() => onCustomerTypeChange('guest')}
        >
          비회원
        </button>
        <button
          type="button"
          className={customerType === 'member' ? 'selected' : ''}
          onClick={() => onCustomerTypeChange('member')}
        >
          회원
        </button>
      </div>

      {isGuest && (
        <div className="entry-panel">
          {isConnectFlow && <GuestOrderSummary portalOrder={portalOrder} />}
          <GuestOtpPanel
            phone={guestPhone}
            otpCode={otpCode}
            otpSent={otpSent}
            otpVerified={hasGuestSession}
            errorMessage={errorMessage}
            cooldownSeconds={cooldownSeconds}
            canSendOtp={canSendOtp}
            canConfirmOtp={canConfirmOtp}
            onPhoneChange={handleGuestPhoneChange}
            onSendOtp={handleSendOtp}
            onOtpCodeChange={handleOtpCodeChange}
            onConfirmOtp={handleConfirmOtp}
          />
          <button
            type="button"
            className="primary-button"
            disabled={!canContinueAsGuest}
            onClick={onPrimaryAction}
          >
            {isConnectFlow ? 'WiFi 이용 시작' : '비회원으로 계속'}
          </button>
          <button type="button" className="link-button" onClick={onLookup}>
            발급받은 이용권 확인
          </button>
        </div>
      )}

      {!isGuest && !memberName && authMode === 'login' && (
        <form
          className="entry-panel"
          onSubmit={(event) => {
            event.preventDefault()
            if (!canLogin) return
            onMemberLogin(loginId.trim())
          }}
        >
          <label>
            <span>아이디</span>
            <input
              value={loginId}
              placeholder="penguin"
              onChange={(event) => setLoginId(event.target.value)}
            />
          </label>
          <label>
            <span>비밀번호</span>
            <input
              value={password}
              type="password"
              placeholder="비밀번호"
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button type="submit" className="outline-button" disabled={!canLogin}>
            로그인
          </button>
          <button
            type="button"
            className="link-button compact-link"
            onClick={() => setAuthMode('signup')}
          >
            회원가입
          </button>
        </form>
      )}

      {!isGuest && !memberName && authMode === 'signup' && (
        <form
          className="entry-panel"
          onSubmit={(event) => {
            event.preventDefault()
            if (!canSignup) return
            onMemberLogin(signupName.trim())
          }}
        >
          <label>
            <span>이름</span>
            <input
              value={signupName}
              placeholder="펭귄"
              onChange={(event) => setSignupName(event.target.value)}
            />
          </label>
          <label>
            <span>아이디</span>
            <input
              value={signupId}
              placeholder="penguin"
              onChange={(event) => setSignupId(event.target.value)}
            />
          </label>
          <label>
            <span>비밀번호</span>
            <input
              value={signupPassword}
              type="password"
              placeholder="비밀번호"
              onChange={(event) => setSignupPassword(event.target.value)}
            />
          </label>
          <button type="submit" className="primary-button" disabled={!canSignup}>
            가입하기
          </button>
          <button
            type="button"
            className="link-button compact-link"
            onClick={() => setAuthMode('login')}
          >
            로그인으로 돌아가기
          </button>
        </form>
      )}

      {!isGuest && memberName && (
        <div className="entry-panel">
          <div className="member-ready-card">
            <span className="summary-label">로그인 완료</span>
            <strong>{memberName}님으로 접속 중</strong>
            <p>회원 혜택과 쿠폰 정보를 이어서 확인할 수 있습니다.</p>
          </div>
          <button type="button" className="primary-button" onClick={onPrimaryAction}>
            회원으로 계속
          </button>
          <button type="button" className="link-button" onClick={() => onMemberLogin('')}>
            다른 계정으로 로그인
          </button>
        </div>
      )}

      <div className="inline-ad-slot" aria-label="프로모션 배너">
        <span className="summary-label">AD</span>
        <strong>오늘의 카페 배너</strong>
        <p>시즌 메뉴, 쿠폰, 제휴 이벤트 이미지를 이 영역에 넣을 수 있습니다.</p>
      </div>
    </div>
  )
}

function getHomeCopy({
  isConnectFlow,
  isGuest,
  memberName,
}: {
  isConnectFlow: boolean
  isGuest: boolean
  memberName: string
}) {
  if (memberName) {
    return {
      title: `${memberName}님!`,
      description: '회원 혜택과 WiFi 이용권을 이어서 확인할 수 있습니다.',
    }
  }

  if (!isGuest) {
    return {
      title: '회원으로 로그인하세요',
      description: '아이디와 비밀번호를 입력하면 회원 혜택 화면으로 이어집니다.',
    }
  }

  if (isConnectFlow) {
    return {
      title: '전화번호 인증 후 WiFi를 시작하세요',
      description: '주문 시 입력한 전화번호로 이용권을 안전하게 연결합니다.',
    }
  }

  return {
    title: '비회원으로 WiFi 이용권을 받으세요',
    description: '전화번호만 입력하면 주문과 이용권을 안전하게 연결합니다.',
  }
}

function MenuScreen({
  selectedMenuIds,
  onBack,
  onCheckout,
  onToggleMenu,
}: {
  selectedMenuIds: string[]
  onBack: () => void
  onCheckout: () => void
  onToggleMenu: (menuId: string) => void
}) {
  const cartItems = menuItems.filter((item) => selectedMenuIds.includes(item.id))
  const totalAmount = cartItems.reduce((total, item) => total + item.price, 0)
  const canCheckout = cartItems.length > 0

  return (
    <div className="screen menu-screen">
      <div className="screen-heading">
        <h1>메뉴 선택</h1>
        <p>사진은 나중에 연결하고, 지금은 카드로 주문 흐름을 먼저 확인합니다.</p>
      </div>

      <div className="menu-card-grid" aria-label="메뉴 목록">
        {menuItems.map((item) => {
          const isSelected = selectedMenuIds.includes(item.id)

          return (
            <button
              key={item.id}
              type="button"
              className={isSelected ? 'menu-card selected' : 'menu-card'}
              aria-pressed={isSelected}
              onClick={() => onToggleMenu(item.id)}
            >
              <span className="menu-image-placeholder" aria-hidden="true" />
              <span className="menu-card-copy">
                <strong>{item.name}</strong>
                <small>{item.description}</small>
              </span>
              <span className="menu-price">{formatWon(item.price)}</span>
            </button>
          )
        })}
      </div>

      <div className="cart-panel">
        <div>
          <span className="summary-label">장바구니</span>
          <strong>메뉴 {cartItems.length}개</strong>
        </div>
        <dl>
          <div>
            <dt>결제금액</dt>
            <dd>{formatWon(totalAmount)}</dd>
          </div>
          <div>
            <dt>제공 이용시간</dt>
            <dd>{pass.minutes}분</dd>
          </div>
        </dl>
      </div>

      <div className="bottom-actions single">
        <button
          type="button"
          className="primary-button"
          disabled={!canCheckout}
          onClick={onCheckout}
        >
          결제하기
        </button>
        <button type="button" className="link-button" onClick={onBack}>
          처음으로
        </button>
      </div>
    </div>
  )
}

function CompleteScreen({
  portalOrder,
  orderItemLabel,
  paymentAmount,
  onPrimaryAction,
}: {
  portalOrder: PortalOrder
  orderItemLabel: string
  paymentAmount: number
  onPrimaryAction: () => void
}) {
  return (
    <div className="screen centered-screen">
      <div className="success-orb" aria-hidden="true">
        <CheckIcon />
      </div>
      <h1>주문이 완료되었습니다!</h1>
      <div className="claim-meta">
        <span>{portalOrder.storeName}</span>
        <strong>QR 주문 연결 완료</strong>
      </div>
      <InfoPanel
        rows={[
          ['주문번호', portalOrder.orderNo],
          ['주문 내역', orderItemLabel || portalOrder.items],
          ['결제금액', formatWon(paymentAmount || portalOrder.paidAmount)],
        ]}
      />
      <div className="notice-card">
        <strong>WiFi 이용권이 발급되었습니다</strong>
        <span>이용 가능 시간 {portalOrder.providedMinutes}분</span>
      </div>
      <div className="bottom-actions single">
        <button
          type="button"
          className="primary-button confirm-button"
          onClick={onPrimaryAction}
        >
          확인
        </button>
      </div>
    </div>
  )
}

function ActiveScreen({
  currentTime,
  secondsLeft,
  onExtend,
}: {
  currentTime: Date
  secondsLeft: number
  onExtend: () => void
}) {
  const timeLabel = useMemo(() => formatSeconds(secondsLeft), [secondsLeft])
  const currentTimeLabel = useMemo(() => formatClock(currentTime), [currentTime])
  const endTimeLabel = useMemo(
    () => formatClock(new Date(currentTime.getTime() + secondsLeft * 1000)),
    [currentTime, secondsLeft],
  )

  return (
    <div className="screen active-screen">
      <h1>WiFi 이용 중</h1>
      <div className="timer-block">
        <div>
          <span>현재 시간</span>
          <strong className="current-time">{currentTimeLabel}</strong>
        </div>
        <div>
          <span>남은 시간</span>
          <strong>{timeLabel}</strong>
        </div>
      </div>
      <p className="end-time">종료 예정 시간 {endTimeLabel}</p>
      <div className="bottom-actions single">
        <button type="button" className="outline-button" onClick={onExtend}>
          이용 연장 / 추가 주문
        </button>
        <p className="helper-text">이용 종료 5분 전에 안내 메시지가 발송됩니다.</p>
      </div>
    </div>
  )
}

function LookupScreen({
  onBack,
  onConfirm,
}: {
  onBack: () => void
  onConfirm: () => void
}) {
  const [phone, setPhone] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const normalizedPhone = normalizeDigits(phone)
  const passes = hasSearched && normalizedPhone === lookupPhone ? guestPasses : []
  const activePass = passes.find((item) => item.status === 'ACTIVE')
  const canSearch = normalizedPhone.length === 11

  return (
    <div className="screen form-screen">
      <div className="screen-heading">
        <h1>발급받은 이용권 확인</h1>
        <p>비회원은 전화번호로 현재 이용권과 이전 구매 이용권을 확인할 수 있습니다.</p>
      </div>

      <div className="field-stack">
        <label>
          <span>전화번호</span>
          <input
            value={phone}
            maxLength={11}
            placeholder="01011111111"
            inputMode="numeric"
            onChange={(event) => {
              setPhone(normalizeDigits(event.target.value))
              setHasSearched(false)
            }}
          />
        </label>
      </div>

      <button
        type="button"
        className="lookup-button"
        disabled={!canSearch}
        onClick={() => setHasSearched(true)}
      >
        이용권 조회
      </button>

      <div className="pass-result-area" aria-live="polite">
        {hasSearched && passes.length === 0 && (
          <div className="pass-preview-card empty">
            <span className="summary-label">조회 결과 없음</span>
            <strong>확인된 이용권이 없습니다</strong>
            <p>전화번호를 다시 확인해 주세요.</p>
          </div>
        )}

        {passes.length > 0 && (
          <div className="pass-list">
            {passes.map((item) => (
              <button
                key={item.id}
                type="button"
                className="pass-preview-card pass-list-item"
                onClick={item.status === 'ACTIVE' ? onConfirm : undefined}
              >
                <span className="pass-card-topline">
                  <span className="summary-label">{item.label}</span>
                  <span className={`status-pill ${item.status.toLowerCase()}`}>
                    {item.status === 'ACTIVE' ? '이용 중' : '종료'}
                  </span>
                </span>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
                <dl className="ticket-meta">
                  <div>
                    <dt>주문번호</dt>
                    <dd>{item.orderNo}</dd>
                  </div>
                  <div>
                    <dt>구매일시</dt>
                    <dd>{item.purchasedAt}</dd>
                  </div>
                </dl>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bottom-actions single">
        <button
          type="button"
          className="primary-button"
          disabled={!activePass}
          onClick={onConfirm}
        >
          현재 이용권으로 이동
        </button>
        <button type="button" className="link-button" onClick={onBack}>
          처음으로
        </button>
      </div>
    </div>
  )
}

function ExtendScreen({
  onBack,
  onOrder,
}: {
  onBack: () => void
  onOrder: () => void
}) {
  return (
    <div className="screen form-screen">
      <div className="screen-heading">
        <h1>이용 연장 / 추가 주문</h1>
        <p>추가 주문하면 WiFi 이용 시간이 자동으로 연장됩니다.</p>
      </div>

      <div className="extension-card">
        <span className="summary-label">다음 리워드까지</span>
        <strong>1,500원 남았어요</strong>
        <p>케이크 또는 샷 추가를 주문하면 무료 사이즈업 혜택에 가까워집니다.</p>
      </div>

      <div className="menu-list" aria-label="추천 메뉴">
        <button type="button">
          <span>아메리카노 추가</span>
          <strong>4,500원</strong>
        </button>
        <button type="button">
          <span>케이크 세트</span>
          <strong>6,800원</strong>
        </button>
      </div>

      <div className="bottom-actions single">
        <button type="button" className="primary-button" onClick={onOrder}>
          추가 주문하기
        </button>
        <button type="button" className="link-button" onClick={onBack}>
          이용 중 화면으로
        </button>
      </div>
    </div>
  )
}

function InfoPanel({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="info-panel">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function StepRail({
  currentStep,
  onStepChange,
}: {
  currentStep: number
  onStepChange: (screen: Screen) => void
}) {
  return (
    <nav className="step-rail" aria-label="화면 이동">
      {steps.map((step, index) => (
        <button
          key={step.key}
          type="button"
          className={index === currentStep ? 'active' : ''}
          onClick={() => onStepChange(step.id)}
        >
          {step.label}
        </button>
      ))}
    </nav>
  )
}

function formatSeconds(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return [hours, minutes, seconds]
    .map((value) => value.toString().padStart(2, '0'))
    .join(':')
}

function formatWon(value: number) {
  return `${value.toLocaleString('ko-KR')}원`
}

function parseWon(value: string) {
  return Number(value.replace(/\D/g, ''))
}

function formatClock(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)
}

function normalizeDigits(value: string) {
  return value.replace(/\D/g, '')
}
