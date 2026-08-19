import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '../../../api'
import { EmptyState, ErrorState, LoadingState } from '../../../components/admin'
import { isApiConfigured } from '../../../config/env'
import { MENU_TRENDS } from '../../../constants/adminMenuTrends'
import { ADMIN_ROUTES } from '../../../constants/adminRoutes'
import type { MenuTrend } from '../../../types/admin'
import { mapApiMenuTrend } from '../../../utils/adminApiMappers'
import { MenuTrendCard } from './MenuTrendCard'

export function AdminMenuTrendsPage() {
  const [trends, setTrends] = useState<MenuTrend[]>(isApiConfigured ? [] : MENU_TRENDS)
  const [savedDraftIds, setSavedDraftIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(isApiConfigured)
  const [error, setError] = useState('')

  const loadTrends = useCallback(async (signal?: AbortSignal) => {
    if (!isApiConfigured) return
    setIsLoading(true)
    setError('')
    try {
      const response = await adminApi.getMenuTrends(signal)
      setTrends(response.data.map(mapApiMenuTrend))
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === 'AbortError') return
      setError('신메뉴 트렌드 추천을 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void loadTrends(controller.signal)
    return () => controller.abort()
  }, [loadTrends])

  const toggleInterest = (id: string) => {
    setTrends((current) => current.map((trend): MenuTrend => {
      if (trend.id !== id) return trend
      return { ...trend, status: trend.status === 'interested' ? 'reviewing' : 'interested' }
    }))
  }

  const saveDraft = (id: string) => {
    setSavedDraftIds((current) => current.includes(id) ? current : [...current, id])
  }

  return (
    <>
      <section className="menu-trends-heading">
        <p className="eyebrow">AI MENU TRENDS <span>/ {ADMIN_ROUTES.aiMenuTrends.slice(1)}</span></p>
        <h1>트렌드 신메뉴 추천</h1>
        <p>백엔드 추천 후보만 표시하며, 관심 표시와 초안 저장은 현재 브라우저에서만 유지됩니다.</p>
      </section>

      {isLoading && <LoadingState label="신메뉴 추천을 불러오는 중입니다." />}
      {error && <ErrorState description={error} onRetry={() => void loadTrends()} />}
      {!isLoading && !error && trends.length === 0 && (
        <EmptyState title="추천 신메뉴가 없습니다" description="백엔드 분석 결과가 생성되면 이곳에 표시됩니다." />
      )}
      {!isLoading && !error && trends.length > 0 && (
        <section className="menu-trend-grid" aria-label="트렌드 신메뉴 추천 목록">
          {trends.map((trend) => (
            <MenuTrendCard
              key={trend.id}
              trend={trend}
              isDraftSaved={savedDraftIds.includes(trend.id)}
              onToggleInterest={toggleInterest}
              onSaveDraft={saveDraft}
            />
          ))}
        </section>
      )}
    </>
  )
}
