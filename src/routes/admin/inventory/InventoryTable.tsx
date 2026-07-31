import { INVENTORY_ITEMS, INVENTORY_RISK_LABELS } from '../../../constants/adminInventory'

export function InventoryTable() {
  return (
    <div className="inventory-table-wrap">
      <table className="inventory-table">
        <thead>
          <tr>
            <th>품목 / Item</th>
            <th>수량</th>
            <th>유통기한</th>
            <th>위험도</th>
          </tr>
        </thead>
        <tbody>
          {INVENTORY_ITEMS.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>{item.expiry}</td>
              <td><span className={`inventory-risk ${item.risk}`}><i />{INVENTORY_RISK_LABELS[item.risk]}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
