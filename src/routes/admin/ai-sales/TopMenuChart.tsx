import { TOP_MENUS } from '../../../constants/adminSales'

export function TopMenuChart() {
  const max = Math.max(...TOP_MENUS.map((menu) => menu.value))

  return (
    <div className="top-menu-chart" role="img" aria-label="인기 메뉴 순위 차트">
      {TOP_MENUS.map((menu, index) => (
        <div className="menu-bar-row" key={menu.name}>
          <span>{menu.name}</span>
          <div><i style={{ width: `${(menu.value / max) * 100}%` }} className={index === 0 ? 'is-leading' : ''} /></div>
          <small>{menu.value}잔</small>
        </div>
      ))}
    </div>
  )
}
