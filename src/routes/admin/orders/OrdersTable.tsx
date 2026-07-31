import type { AdminOrder } from '../../../types/admin'

interface OrdersTableProps {
  orders: AdminOrder[]
}

export function OrdersTable({ orders }: OrdersTableProps) {
  return (
    <div className="orders-table-wrap">
      <table className="orders-table">
        <thead>
          <tr><th>시각</th><th>주문번호</th><th>금액</th><th>Wi-Fi 이용권</th><th>리워드</th></tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.time}</td>
              <td>{order.orderNumber}</td>
              <td>{order.amount.toLocaleString('ko-KR')}원</td>
              <td>{order.wifiPass}</td>
              <td>{order.reward}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {orders.length === 0 && <p className="orders-empty">조건에 해당하는 주문이 없습니다.</p>}
    </div>
  )
}
