import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '../../../api'
import { EmptyState, ErrorState, LoadingState, useToast } from '../../../components/admin'
import { isApiConfigured } from '../../../config/env'
import { INVENTORY_ITEMS } from '../../../constants/adminInventory'
import { ADMIN_ROUTES } from '../../../constants/adminRoutes'
import type { InventoryItem } from '../../../types/admin'
import type { InventoryRecommendationResponse } from '../../../types/api'
import { mapApiInventoryItem } from '../../../utils/adminApiMappers'
import { InventoryTable } from './InventoryTable'

function recommendationTitle(item: InventoryRecommendationResponse | null) {
  const title = item?.payload.title
  return typeof title === 'string' ? title : '현재 생성된 재고 프로모션 추천이 없습니다.'
}

export function AdminInventoryPage() {
  const { showToast } = useToast()
  const [items, setItems] = useState<InventoryItem[]>(isApiConfigured ? [] : INVENTORY_ITEMS)
  const [recommendation, setRecommendation] = useState<InventoryRecommendationResponse | null>(null)
  const [isLoading, setIsLoading] = useState(isApiConfigured)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState('')

  const loadInventory = useCallback(async (signal?: AbortSignal) => {
    if (!isApiConfigured) return
    setIsLoading(true)
    setError('')
    try {
      const [inventoryResponse, recommendationResponse] = await Promise.all([
        adminApi.getInventory(signal),
        adminApi.getInventoryRecommendations(signal),
      ])
      setItems(inventoryResponse.data.map(mapApiInventoryItem))
      setRecommendation(recommendationResponse.data[0] ?? null)
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === 'AbortError') return
      setError('재고와 AI 프로모션 추천을 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void loadInventory(controller.signal)
    return () => controller.abort()
  }, [loadInventory])

  const scanInventory = async () => {
    if (!isApiConfigured || isScanning) return
    setIsScanning(true)
    try {
      const response = await adminApi.scanInventory()
      setRecommendation(response.data[0] ?? null)
      await loadInventory(undefined)
      showToast(response.data.length > 0 ? '재고 위험 분석과 추천 생성을 완료했습니다.' : '새로운 재고 위험이 없습니다.', 'success')
    } catch {
      showToast('재고 위험 분석에 실패했습니다.', 'error')
    } finally {
      setIsScanning(false)
    }
  }

  return (
    <>
      <section className="inventory-heading">
        <p className="eyebrow">AI INVENTORY <span>/ {ADMIN_ROUTES.aiInventory.slice(1)}</span></p>
        <h1>재고 · 유통기한 프로모션</h1>
      </section>

      {isLoading && <LoadingState count={2} label="재고 데이터를 불러오는 중입니다." />}
      {error && <ErrorState description={error} onRetry={() => void loadInventory()} />}
      {!isLoading && !error && (
        <>
          <section className="inventory-recommendation">
            <div className="inventory-recommendation-copy">
              <span className="inventory-ai-label">AI 추천</span>
              <h2>{isApiConfigured ? recommendationTitle(recommendation) : '우유 유통기한 임박 · 케이크 재고 과다 → 오늘 케이크 세트 할인 추천'}</h2>
              <p>{recommendation?.reason ?? '재고 수량과 유통기한 위험 점수를 기준으로 분석합니다.'}</p>
            </div>
            <div className="inventory-actions">
              <button className="primary" disabled={!isApiConfigured || isScanning} onClick={() => void scanInventory()}>
                {isScanning ? '분석 중…' : '재고 위험 다시 분석'}
              </button>
            </div>
          </section>

          {items.length > 0
            ? <InventoryTable items={items} />
            : <EmptyState title="등록된 재고가 없습니다" description="백엔드에 상품 재고를 등록하면 위험도가 표시됩니다." />}
        </>
      )}
    </>
  )
}
