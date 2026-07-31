import { useState } from 'react'
import { NOTIFICATION_TEMPLATES, SENT_NOTIFICATIONS } from '../../../constants/adminNotifications'
import { ADMIN_ROUTES } from '../../../constants/adminRoutes'

export function AdminNotificationsPage() {
  const [isOtpSkipEnabled, setIsOtpSkipEnabled] = useState(true)
  const [selectedTemplateId, setSelectedTemplateId] = useState(NOTIFICATION_TEMPLATES[0].id)

  return (
    <>
      <section className="notifications-heading">
        <p className="eyebrow">NOTIFICATIONS <span>/ {ADMIN_ROUTES.notifications.slice(1)}</span></p>
        <h1>알림 · 알림톡</h1>
        <p>프랜차이즈는 회원 딥링크로 OTP 단계를 건너뛸 수 있습니다.</p>
      </section>

      <section className="otp-skip-panel">
        <div><strong>회원 딥링크 OTP 스킵</strong><small>회원 토큰이 확인된 고객만 적용됩니다.</small></div>
        <button
          className={`switch ${isOtpSkipEnabled ? 'is-on' : ''}`}
          role="switch"
          aria-checked={isOtpSkipEnabled}
          aria-label="회원 딥링크 OTP 스킵"
          onClick={() => setIsOtpSkipEnabled((enabled) => !enabled)}
        ><span /></button>
      </section>

      <section className="notifications-grid">
        <article className="notification-panel">
          <h2>템플릿 / Templates</h2>
          <div className="notification-template-list">
            {NOTIFICATION_TEMPLATES.map((template) => (
              <button
                className={selectedTemplateId === template.id ? 'active' : ''}
                key={template.id}
                onClick={() => setSelectedTemplateId(template.id)}
              >
                <strong>{template.title}</strong>
                <span>{template.message}</span>
              </button>
            ))}
          </div>
        </article>

        <article className="notification-panel">
          <h2>발송 이력 / Sent</h2>
          <div className="sent-notification-list">
            {SENT_NOTIFICATIONS.map((notification) => (
              <div key={notification.id}>
                <span><strong>{notification.title}</strong><small>{notification.phone}</small></span>
                <time>{notification.time}</time>
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  )
}
