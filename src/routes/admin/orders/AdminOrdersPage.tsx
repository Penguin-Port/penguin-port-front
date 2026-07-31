import { useMemo, useState } from 'react'
import { ADMIN_ORDERS } from '../../../constants/adminOrders'
import { ADMIN_ROUTES } from '../../../constants/adminRoutes'
import { OrdersTable } from './OrdersTable'

type OrderFilter = 'all' | 'wifi' | 'reward'

export function AdminOrdersPage() {
  const [filter, setFilter] = useState<OrderFilter>('all')

  const filteredOrders = useMemo(() => ADMIN_ORDERS.filter((order) => {
    if (filter === 'wifi') return order.hasWifiPass
    if (filter === 'reward') return order.hasReward
    return true
  }), [filter])

  return (
    <>
      <section className="orders-heading">
        <p className="eyebrow">ORDERS <span>/ {ADMIN_ROUTES.orders.slice(1)}</span></p>
        <h1>주문 내역</h1>
      </section>

      <div className="order-filters" role="group" aria-label="주문 필터">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>전체</button>
        <button className={filter === 'wifi' ? 'active' : ''} onClick={() => setFilter('wifi')}>Wi-Fi 이용권</button>
        <button className={filter === 'reward' ? 'active' : ''} onClick={() => setFilter('reward')}>리워드</button>
      </div>

      <OrdersTable orders={filteredOrders} />
    </>
  )
}
