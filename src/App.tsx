import { useEffect, useMemo, useState } from 'react'
import './App.css'

type Screen = 'home' | 'complete' | 'verify' | 'active'
type CustomerType = 'guest' | 'member'

const pass = {
  brand: '펭귄포트',
  orderNo: '20260728-0012',
  item: '아메리카노 1잔, 케이크 1개',
  amount: '8,500원',
  minutes: 120,
  endsAt: '16:30',
}

const steps: { id: Screen; label: string }[] = [
  { id: 'home', label: '홈' },
  { id: 'complete', label: '주문' },
  { id: 'verify', label: '인증' },
  { id: 'active', label: '이용 중' },
]

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [customerType, setCustomerType] = useState<CustomerType>('guest')
  const [secondsLeft, setSecondsLeft] = useState(6512)

  useEffect(() => {
    if (screen !== 'active') return

    const timer = window.setInterval(() => {
      setSecondsLeft((seconds) => Math.max(0, seconds - 1))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [screen])

  const currentStep = steps.findIndex((step) => step.id === screen)

  const handlePrimaryAction = () => {
    if (screen === 'home') setScreen('complete')
    if (screen === 'complete') setScreen('verify')
    if (screen === 'verify') setScreen('active')
  }

  return (
    <main className="app-shell">
      <section className="customer-page" aria-label="펭귄포트 고객 포털">
        <DesktopSummary currentStep={currentStep} />
        <div className="portal-stage">
          <BrandMark compact={screen !== 'home'} />
          {screen === 'home' && (
            <HomeScreen
              customerType={customerType}
              onCustomerTypeChange={setCustomerType}
              onPrimaryAction={handlePrimaryAction}
            />
          )}
          {screen === 'complete' && (
            <CompleteScreen onPrimaryAction={handlePrimaryAction} />
          )}
          {screen === 'verify' && (
            <VerifyScreen onPrimaryAction={handlePrimaryAction} />
          )}
          {screen === 'active' && <ActiveScreen secondsLeft={secondsLeft} />}
          <StepRail
            currentStep={currentStep}
            onStepChange={(nextScreen) => setScreen(nextScreen)}
          />
        </div>
      </section>
    </main>
  )
}

function DesktopSummary({ currentStep }: { currentStep: number }) {
  return (
    <aside className="desktop-summary" aria-label="주문 및 이용권 요약">
      <div>
        <BrandMark />
        <div className="desktop-copy">
          <h2>주문 고객에게 WiFi 이용권을 제공합니다</h2>
          <p>주문 확인부터 인증, 이용권 활성화까지 한 화면에서 이어집니다.</p>
        </div>
      </div>

      <div className="summary-card">
        <span className="summary-label">주문 요약</span>
        <InfoPanel
          rows={[
            ['주문번호', pass.orderNo],
            ['주문 내역', pass.item],
            ['결제금액', pass.amount],
          ]}
        />
      </div>

      <div className="summary-card reward-card">
        <span className="summary-label">제공 혜택</span>
        <strong>WiFi 이용권 {pass.minutes}분</strong>
        <p>추가 주문 시 이용 시간이 자동 연장되고 누적 리워드가 반영됩니다.</p>
      </div>

      <ol className="desktop-steps">
        {steps.map((step, index) => (
          <li key={step.id} className={index <= currentStep ? 'done' : ''}>
            <span>{index + 1}</span>
            {step.label}
          </li>
        ))}
      </ol>
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
  onCustomerTypeChange,
  onPrimaryAction,
}: {
  customerType: CustomerType
  onCustomerTypeChange: (type: CustomerType) => void
  onPrimaryAction: () => void
}) {
  return (
    <div className="screen home-screen">
      <div className="main-copy">
        <h1>주문하고 무료 WiFi를 이용하세요</h1>
        <p>결제와 동시에 WiFi 이용권이 자동 발급됩니다.</p>
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

      <div className="bottom-actions">
        <button type="button" className="coupon-card">
          <span className="star" aria-hidden="true">
            ☆
          </span>
          <span>
            <strong>이용 시간을 모아 쿠폰 받기</strong>
            <small>누적 이용 시간에 따라 할인 쿠폰이 자동 발급돼요.</small>
          </span>
          <span aria-hidden="true">›</span>
        </button>
        <button type="button" className="primary-button" onClick={onPrimaryAction}>
          주문하기
        </button>
        <button type="button" className="link-button">
          발급받은 이용권 확인
        </button>
      </div>
    </div>
  )
}

function CompleteScreen({ onPrimaryAction }: { onPrimaryAction: () => void }) {
  return (
    <div className="screen centered-screen">
      <div className="success-orb" aria-hidden="true">
        <CheckIcon />
      </div>
      <h1>주문이 완료되었습니다!</h1>
      <InfoPanel
        rows={[
          ['주문번호', pass.orderNo],
          ['주문 내역', pass.item],
          ['결제금액', pass.amount],
        ]}
      />
      <div className="notice-card">
        <strong>WiFi 이용권이 발급되었습니다</strong>
        <span>이용 가능 시간 {pass.minutes}분</span>
      </div>
      <div className="bottom-actions single">
        <button type="button" className="primary-button" onClick={onPrimaryAction}>
          확인
        </button>
      </div>
    </div>
  )
}

function VerifyScreen({ onPrimaryAction }: { onPrimaryAction: () => void }) {
  return (
    <div className="screen centered-screen">
      <h1>WiFi 인증</h1>
      <div className="wifi-orb" aria-hidden="true">
        <WifiIcon dark />
      </div>
      <InfoPanel
        rows={[
          ['주문번호', pass.orderNo],
          ['이용시간', `${pass.minutes}분`],
        ]}
      />
      <div className="bottom-actions single">
        <button type="button" className="primary-button" onClick={onPrimaryAction}>
          WiFi 이용 시작
        </button>
        <p className="helper-text">이 버튼을 누르면 WiFi 연결이 완료됩니다.</p>
      </div>
    </div>
  )
}

function ActiveScreen({ secondsLeft }: { secondsLeft: number }) {
  const timeLabel = useMemo(() => formatSeconds(secondsLeft), [secondsLeft])

  return (
    <div className="screen active-screen">
      <h1>WiFi 이용 중</h1>
      <div className="timer-block">
        <span>남은 시간</span>
        <strong>{timeLabel}</strong>
      </div>
      <p className="end-time">종료 예정 시간 {pass.endsAt}</p>
      <div className="bottom-actions single">
        <button type="button" className="outline-button">
          이용 연장 / 추가 주문
        </button>
        <p className="helper-text">이용 종료 5분 전에 안내 메시지가 발송됩니다.</p>
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
          key={step.id}
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

function WifiIcon({ dark }: { dark?: boolean }) {
  return (
    <svg viewBox="0 0 48 48" role="img" aria-label="WiFi">
      <path
        className={dark ? 'icon-dark' : ''}
        d="M24 34.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Zm0-11.5c5.4 0 10.4 2.2 14 5.7l-4.3 4.3A13.7 13.7 0 0 0 24 29a13.7 13.7 0 0 0-9.7 4l-4.3-4.3A19.8 19.8 0 0 1 24 23Zm0-11.5c8.6 0 16.4 3.5 22 9.1l-4.3 4.3A24.8 24.8 0 0 0 24 17.5a24.8 24.8 0 0 0-17.7 7.4L2 20.6a31 31 0 0 1 22-9.1Z"
      />
    </svg>
  )
}

function WifiSmallIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 17.7a1.7 1.7 0 1 1 0 3.4 1.7 1.7 0 0 1 0-3.4Zm0-5.1c2.3 0 4.4.9 5.9 2.4l-2 2a5.5 5.5 0 0 0-7.8 0l-2-2a8.3 8.3 0 0 1 5.9-2.4Zm0-5.2c3.7 0 7 1.5 9.4 3.9l-2 2A10.5 10.5 0 0 0 12 10.2a10.5 10.5 0 0 0-7.4 3.1l-2-2A13.2 13.2 0 0 1 12 7.4Z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 48 48" role="img" aria-label="완료">
      <path d="m19.8 31.1-7-7 2.8-2.8 4.2 4.2L32.4 13l2.8 2.8-15.4 15.3Z" />
    </svg>
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

export default App
