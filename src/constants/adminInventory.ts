import type { InventoryItem } from '../types/admin'

export const INVENTORY_ITEMS: InventoryItem[] = [
  { id: 'inventory-1', name: '우유 1L', quantity: '6개', expiry: 'D-1', risk: 'high' },
  { id: 'inventory-2', name: '생크림 500ml', quantity: '3개', expiry: 'D-2', risk: 'high' },
  { id: 'inventory-3', name: '치즈케이크', quantity: '14조각', expiry: 'D-3', risk: 'overstock' },
  { id: 'inventory-4', name: '원두 (하우스 블렌드)', quantity: '22kg', expiry: 'D-40', risk: 'low' },
]

export const INVENTORY_RISK_LABELS = {
  high: '높음',
  overstock: '과다',
  low: '낮음',
} as const
