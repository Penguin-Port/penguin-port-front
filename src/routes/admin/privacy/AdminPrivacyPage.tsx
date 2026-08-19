import { PRIVACY_METRICS } from '../../../constants/adminPrivacy'
import { ADMIN_ROUTES } from '../../../constants/adminRoutes'

export function AdminPrivacyPage() {
  return (
    <>
      <section className="privacy-heading">
        <p className="eyebrow">PRIVACY <span>/ {ADMIN_ROUTES.privacy.slice(1)}</span></p>
        <h1>개인정보 보관 · 폐기</h1>
        <p>전화번호는 암호화 보관하고 기간이 지나면 자동 폐기합니다. 불법 접속 대응은 점주 보호 목적으로만 사용합니다.</p>
      </section>

      <section className="privacy-metric-grid" aria-label="개인정보 보관 및 폐기 현황">
        {PRIVACY_METRICS.map((metric) => (
          <article className="privacy-metric-card" key={metric.id}>
            <p>{metric.label}</p>
            <strong>{metric.value}</strong>
            <small>{metric.description}</small>
          </article>
        ))}
      </section>

      <section className="not-collected-card">
        <h2>수집하지 않는 항목 / Not collected</h2>
        <p>브라우저에서 MAC 주소를 수집하지 않으며, 기기 지문(deviceId)을 임의로 생성하지 않습니다. 포털에서는 팝업과 소셜 로그인을 사용하지 않습니다.</p>
      </section>
    </>
  )
}
