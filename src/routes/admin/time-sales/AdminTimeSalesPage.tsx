import { useEffect, useState } from 'react'
import { adminApi } from '../../../api'
import { isApiConfigured } from '../../../config/env'
import { ADMIN_ROUTES } from '../../../constants/adminRoutes'
import { TIME_SALE_RECOMMENDATIONS } from '../../../constants/adminTimeSales'
import type { TimeSaleRecommendation } from '../../../types/admin'
import { mapApiRecommendation } from '../../../utils/adminApiMappers'
import { TimeSaleCard } from './TimeSaleCard'

export function AdminTimeSalesPage() {
  const [isAutoApproveEnabled, setIsAutoApproveEnabled] = useState(false)
  const [recommendations, setRecommendations] = useState(TIME_SALE_RECOMMENDATIONS)
  const [isLoading, setIsLoading] = useState(isApiConfigured)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!isApiConfigured) return
    const controller = new AbortController()

    adminApi.getRecommendations(controller.signal)
      .then((response) => {
        setRecommendations(response.data.map(mapApiRecommendation))
        setErrorMessage('')
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setErrorMessage('API 연결에 실패해 샘플 데이터를 표시하고 있습니다.')
      })
      .finally(() => setIsLoading(false))

    return () => controller.abort()
  }, [])

  const updateRecommendation = (
    id: string,
    updater: (recommendation: TimeSaleRecommendation) => TimeSaleRecommendation,
  ) => {
    setRecommendations((current) => current.map((item) => item.id === id ? updater(item) : item))
  }

  const approveRecommendation = async (id: string) => {
    const recommendation = recommendations.find((item) => item.id === id)
    if (!recommendation) return
    if (!isApiConfigured || recommendation.apiVersion === undefined) {
      updateRecommendation(id, (item) => ({ ...item, status: 'scheduled' }))
      return
    }

    setPendingId(id)
    try {
      await adminApi.acceptRecommendation(id, recommendation.apiVersion)
      updateRecommendation(id, (item) => ({ ...item, status: 'scheduled' }))
      setErrorMessage('')
    } catch {
      setErrorMessage('추천 승인에 실패했습니다. 이미 처리됐거나 추천 버전이 변경됐을 수 있습니다.')
    } finally {
      setPendingId(null)
    }
  }

  const editRecommendation = (id: string) => {
    updateRecommendation(id, (item) => ({
      ...item,
      discountRate: item.discountRate === 30 ? 10 : item.discountRate + 5,
    }))
  }

  const rejectRecommendation = async (id: string) => {
    if (!isApiConfigured) {
      updateRecommendation(id, (item) => ({ ...item, status: 'rejected' }))
      return
    }

    setPendingId(id)
    try {
      await adminApi.rejectRecommendation(id, '관리자 화면에서 거절')
      updateRecommendation(id, (item) => ({ ...item, status: 'rejected' }))
      setErrorMessage('')
    } catch {
      setErrorMessage('추천 거절에 실패했습니다. 이미 처리된 추천인지 확인해주세요.')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <>
      <section className="time-sales-heading">
        <p className="eyebrow">AI TIME SALES <span>/ {ADMIN_ROUTES.aiTimeSales.slice(1)}</span></p>
        <h1>타임세일 추천 · 승인</h1>
        <p>추천은 자동 게시되지 않습니다. 승인하면 저장된 추천 내용으로 프로모션이 생성됩니다.</p>
      </section>

      <section className="auto-approve-panel">
        <strong>자동 승인 / Auto-approve</strong>
        <button
          type="button"
          className={`switch ${isAutoApproveEnabled ? 'is-on' : ''}`}
          role="switch"
          aria-checked={isAutoApproveEnabled}
          onClick={() => setIsAutoApproveEnabled((enabled) => !enabled)}
        >
          <span />
        </button>
        <span>{isAutoApproveEnabled ? 'ON' : 'OFF'} · 화면 설정</span>
      </section>

      {isLoading && <p className="api-feedback">AI 추천을 불러오는 중입니다.</p>}
      {errorMessage && <p className="api-feedback is-error" role="alert">{errorMessage}</p>}
      {!isApiConfigured && <p className="api-feedback">백엔드 미연동 모드 · 샘플 추천을 표시합니다.</p>}

      <section className="time-sale-list" aria-label="타임세일 추천 목록">
        {recommendations.map((recommendation) => (
          <TimeSaleCard
            key={recommendation.id}
            recommendation={recommendation}
            isPending={pendingId === recommendation.id}
            onApprove={approveRecommendation}
            onEdit={editRecommendation}
            onReject={rejectRecommendation}
          />
        ))}
        {!isLoading && recommendations.length === 0 && (
          <p className="empty-card">현재 등록된 AI 추천이 없습니다.</p>
        )}
      </section>
    </>
  )
}
