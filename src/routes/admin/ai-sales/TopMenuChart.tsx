import { TOP_MENUS } from '../../../constants/adminSales'

interface TopMenuChartProps {
  items?: Array<{ name: string; value: number }>
}

export function TopMenuChart({ items = TOP_MENUS }: TopMenuChartProps) {
  const max = Math.max(1, ...items.map((menu) => menu.value))

  return (
    <div className="top-menu-chart" role="img" aria-label="인기 메뉴 순위 차트">
      {items.map((menu, index) => (
        <div className="menu-bar-row" key={menu.name}>
          <span>{menu.name}</span>
          <div><i style={{ width: `${(menu.value / max) * 100}%` }} className={index === 0 ? 'is-leading' : ''} /></div>
          <small>{menu.value}잔</small>
        </div>
      ))}
    </div>
  )
}
