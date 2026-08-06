import type { PortalOrder } from '../customerTypes'

export function GuestOrderSummary({ portalOrder }: { portalOrder: PortalOrder }) {
  return (
    <div className="guest-order-summary">
      <div>
        <span>매장</span>
        <strong>{portalOrder.storeName}</strong>
      </div>
      <div>
        <span>주문번호</span>
        <strong>{portalOrder.orderNo}</strong>
      </div>
      <div>
        <span>이용 가능 시간</span>
        <strong>{portalOrder.providedMinutes}분</strong>
      </div>
    </div>
  )
}
