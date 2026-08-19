interface SalesLineChartProps {
  values: number[]
  labels: string[]
  color?: string
  fill?: string
  max?: number
}

function toPoints(values: number[], max: number) {
  if (values.length === 1) return [{ x: 150, y: 74 - (values[0] / max) * 58 }]
  return values.map((value, index) => {
    const x = 12 + (index * 276) / (values.length - 1)
    const y = 74 - (value / max) * 58
    return { x, y }
  })
}

export function SalesLineChart({
  values,
  labels,
  color = '#171a20',
  fill = '#ececef',
  max = 100,
}: SalesLineChartProps) {
  const points = toPoints(values, max)
  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`).join(' ')
  const areaPath = `${linePath} L288 80 L12 80 Z`

  return (
    <svg className="sales-line-chart" viewBox="0 0 300 100" role="img" aria-label="시간별 추이 차트">
      <line x1="12" y1="22" x2="288" y2="22" className="chart-grid-line" />
      <line x1="12" y1="51" x2="288" y2="51" className="chart-grid-line" />
      <line x1="12" y1="80" x2="288" y2="80" className="chart-grid-line" />
      <path d={areaPath} fill={fill} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((point, index) => (
        <circle key={`${point.x}-${point.y}`} cx={point.x} cy={point.y} r={index % 3 === 0 ? 2.3 : 0} fill="#ff4d70" />
      ))}
      {labels.map((label, index) => (
        <text key={label} x={12 + (index * 276) / (labels.length - 1)} y="96" textAnchor="middle">{label}</text>
      ))}
    </svg>
  )
}
