interface PolicyTier {
  threshold: string
  benefit: string
}

interface PolicyTierListProps {
  tiers: PolicyTier[]
}

export function PolicyTierList({ tiers }: PolicyTierListProps) {
  return (
    <div className="policy-tier-list">
      {tiers.map((tier) => (
        <div className="policy-tier-row" key={tier.threshold}>
          <span>{tier.threshold}</span>
          <strong>{tier.benefit}</strong>
        </div>
      ))}
    </div>
  )
}
