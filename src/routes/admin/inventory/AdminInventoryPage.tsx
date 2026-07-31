import { useState } from 'react'
import { ADMIN_ROUTES } from '../../../constants/adminRoutes'
import { InventoryTable } from './InventoryTable'

type GeneratedPromotion = 'time-sale' | 'one-time' | null

export function AdminInventoryPage() {
  const [generatedPromotion, setGeneratedPromotion] = useState<GeneratedPromotion>(null)

  return (
    <>
      <section className="inventory-heading">
        <p className="eyebrow">AI INVENTORY <span>/ {ADMIN_ROUTES.aiInventory.slice(1)}</span></p>
        <h1>재고 · 유통기한 프로모션</h1>
      </section>

      <section className="inventory-recommendation">
        <div className="inventory-recommendation-copy">
          <span className="inventory-ai-label">AI 추천</span>
          <h2>우유 유통기한 임박 · 케이크 재고 과다 → 오늘 케이크 세트 할인 추천</h2>
          <p>승인 시 선택한 유형의 프로모션 초안이 생성됩니다.</p>
        </div>
        <div className="inventory-actions">
          <button className="primary" onClick={() => setGeneratedPromotion('time-sale')}>타임세일 초안 생성</button>
          <button onClick={() => setGeneratedPromotion('one-time')}>일회성 프로모션</button>
        </div>
      </section>

      {generatedPromotion && (
        <div className="inventory-feedback" role="status">
          <span>✓</span>
          {generatedPromotion === 'time-sale'
            ? '케이크 세트 타임세일 초안을 생성했습니다.'
            : '케이크 세트 일회성 프로모션 초안을 생성했습니다.'}
        </div>
      )}

      <InventoryTable />
    </>
  )
}
