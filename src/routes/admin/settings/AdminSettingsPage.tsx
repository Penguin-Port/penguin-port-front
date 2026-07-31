import { ADMIN_ROUTES } from '../../../constants/adminRoutes'
import { ADMIN_SETTINGS_SECTIONS } from '../../../constants/adminSettings'
import { SettingsCard } from './SettingsCard'

export function AdminSettingsPage() {
  return (
    <>
      <section className="settings-heading">
        <p className="eyebrow">SETTINGS <span>/ {ADMIN_ROUTES.settings.slice(1)}</span></p>
        <h1>설정</h1>
      </section>
      <section className="settings-grid" aria-label="관리자 설정">
        {ADMIN_SETTINGS_SECTIONS.map((section) => (
          <SettingsCard key={section.id} title={section.title} items={section.items} />
        ))}
      </section>
    </>
  )
}
