interface SettingsCardProps {
  title: string
  items: readonly { label: string; value: string }[]
}

export function SettingsCard({ title, items }: SettingsCardProps) {
  return (
    <article className="settings-card">
      <h2>{title}</h2>
      <dl>
        {items.map((item) => (
          <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>
        ))}
      </dl>
    </article>
  )
}
