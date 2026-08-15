import { useCallback, useEffect, useMemo, useState } from 'react'
import { adminApi } from '../../../api'
import { EmptyState, ErrorState, LoadingState } from '../../../components/admin'
import { isApiConfigured } from '../../../config/env'
import { ADMIN_ORDERS } from '../../../constants/adminOrders'
import { ADMIN_ROUTES } from '../../../constants/adminRoutes'
import type { AdminOrder } from '../../../types/admin'
import type { AdminOrderResponse } from '../../../types/api'
import { OrdersTable } from './OrdersTable'

type OrderFilter = 'all' | 'wifi' | 'reward'

function mapOrder(order: AdminOrderResponse): AdminOrder {
  const paidAt = new Date(order.paidAt)
  const hasWifiPass = order.wifiPassStatus !== null || order.wifiMinutes > 0
  const hasReward = order.rewardStatus !== null

  return {
    id: order.orderId,
    time: Number.isNaN(paidAt.getTime())
      ? order.paidAt
      : paidAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    orderNumber: order.externalOrderId,
    amount: order.totalAmount - order.refundedAmount,
    wifiPass: hasWifiPass
      ? `${order.wifiMinutes}분 · ${order.wifiPassStatus ?? '발급'}`
      : '없음',
    reward: order.rewardStatus ?? '없음',
    hasWifiPass,
    hasReward,
  }
}

export function AdminOrdersPage() {
  const [filter, setFilter] = useState<OrderFilter>('all')
  const [orders, setOrders] = useState<AdminOrder[]>(isApiConfigured ? [] : ADMIN_ORDERS)
  const [isLoading, setIsLoading] = useState(isApiConfigured)
  const [errorMessage, setErrorMessage] = useState('')

  const loadOrders = useCallback(async (signal?: AbortSignal) => {
    if (!isApiConfigured) return
    setIsLoading(true)
    try {
      const response = await adminApi.getOrders(signal)
      setOrders(response.data.map(mapOrder))
      setErrorMessage('')
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setErrorMessage('주문 내역을 불러오지 못했습니다. 백엔드 연결과 관리자 계정을 확인해주세요.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void loadOrders(controller.signal)
    return () => controller.abort()
  }, [loadOrders])

  useEffect(() => {
    if (!isApiConfigured) return
    const intervalId = window.setInterval(() => void loadOrders(), 5_000)
    return () => window.clearInterval(intervalId)
  }, [loadOrders])

  const filteredOrders = useMemo(() => orders.filter((order) => {
    if (filter === 'wifi') return order.hasWifiPass
    if (filter === 'reward') return order.hasReward
    return true
  }), [filter, orders])

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

      {isLoading && orders.length === 0 ? (
        <LoadingState variant="table" count={5} label="주문 내역을 불러오는 중입니다." />
      ) : errorMessage && orders.length === 0 ? (
        <ErrorState description={errorMessage} onRetry={() => void loadOrders()} isRetrying={isLoading} />
      ) : filteredOrders.length === 0 ? (
        <EmptyState title="주문 내역이 없습니다" description="새 주문이 생성되면 이 화면에 자동으로 표시됩니다." />
      ) : (
        <>
          {errorMessage && <p className="api-feedback is-error" role="alert">{errorMessage}</p>}
          <OrdersTable orders={filteredOrders} />
        </>
      )}
    </>
  )
}
