import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '../../../api'
import { ConfirmModal, EmptyState, ErrorState, LoadingState, useToast } from '../../../components/admin'
import { isApiConfigured } from '../../../config/env'
import { ADMIN_ROUTES } from '../../../constants/adminRoutes'
import { TIME_SALE_RECOMMENDATIONS } from '../../../constants/adminTimeSales'
import type { TimeSaleRecommendation } from '../../../types/admin'
import { mapApiRecommendation } from '../../../utils/adminApiMappers'
import { TimeSaleCard } from './TimeSaleCard'
import { RecommendationDetailModal } from './RecommendationDetailModal'

export function AdminTimeSalesPage() {
  const { showToast } = useToast()
  const [isAutoApproveEnabled, setIsAutoApproveEnabled] = useState(false)
  const [recommendations, setRecommendations] = useState(
    isApiConfigured ? [] : TIME_SALE_RECOMMENDATIONS,
  )
  const [isLoading, setIsLoading] = useState(isApiConfigured)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [decision, setDecision] = useState<{ id: string; type: 'approve' | 'reject' } | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const detailRecommendation = recommendations.find((item) => item.id === detailId) ?? null

  const openDecision = (id: string, type: 'approve' | 'reject') => {
    setDetailId(null)
    setDecision({ id, type })
  }

  const loadRecommendations = useCallback(async (signal?: AbortSignal) => {
    if (!isApiConfigured) return
    setIsLoading(true)
    try {
      const response = await adminApi.getRecommendations(signal)
      setRecommendations(response.data.map(mapApiRecommendation))
      setErrorMessage('')
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setErrorMessage('백엔드 연결 상태와 관리자 인증 정보를 확인해주세요.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void loadRecommendations(controller.signal)
    return () => controller.abort()
  }, [loadRecommendations])

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
      showToast('타임세일 추천을 승인했습니다.', 'success')
      setDecision(null)
      return
    }

    setPendingId(id)
    try {
      await adminApi.acceptRecommendation(id, recommendation.apiVersion)
      updateRecommendation(id, (item) => ({ ...item, status: 'scheduled' }))
      setErrorMessage('')
      showToast('추천이 승인되어 프로모션이 생성됐습니다.', 'success')
      setDecision(null)
    } catch {
      setErrorMessage('추천 승인에 실패했습니다. 이미 처리됐거나 추천 버전이 변경됐을 수 있습니다.')
      showToast('추천 승인에 실패했습니다.', 'error')
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
      showToast('타임세일 추천을 거절했습니다.', 'success')
      setDecision(null)
      return
    }

    setPendingId(id)
    try {
      await adminApi.rejectRecommendation(id, '관리자 화면에서 거절')
      updateRecommendation(id, (item) => ({ ...item, status: 'rejected' }))
      setErrorMessage('')
      showToast('추천을 거절했습니다.', 'success')
      setDecision(null)
    } catch {
      setErrorMessage('추천 거절에 실패했습니다. 이미 처리된 추천인지 확인해주세요.')
      showToast('추천 거절에 실패했습니다.', 'error')
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

      {!isApiConfigured && <p className="api-feedback">백엔드 미연동 모드 · 샘플 추천을 표시합니다.</p>}
      {isLoading ? (
        <LoadingState count={3} label="AI 추천을 불러오는 중입니다." />
      ) : errorMessage && recommendations.length === 0 ? (
        <ErrorState description={errorMessage} onRetry={() => void loadRecommendations()} />
      ) : recommendations.length === 0 ? (
        <EmptyState
          title="현재 AI 추천이 없습니다"
          description="새로운 추천이 생성되면 이 목록에서 검토하고 승인할 수 있습니다."
        />
      ) : (
        <section className="time-sale-list" aria-label="타임세일 추천 목록">
          {errorMessage && <p className="api-feedback is-error" role="alert">{errorMessage}</p>}
          {recommendations.map((recommendation) => (
            <TimeSaleCard
              key={recommendation.id}
              recommendation={recommendation}
              isPending={pendingId === recommendation.id}
              onApprove={(id) => openDecision(id, 'approve')}
              onEdit={editRecommendation}
              onReject={(id) => openDecision(id, 'reject')}
              onOpenDetail={setDetailId}
            />
          ))}
        </section>
      )}

      <RecommendationDetailModal
        recommendation={detailRecommendation}
        onClose={() => setDetailId(null)}
        onApprove={(id) => openDecision(id, 'approve')}
        onReject={(id) => openDecision(id, 'reject')}
      />

      <ConfirmModal
        isOpen={decision !== null}
        title={decision?.type === 'reject' ? '추천을 거절할까요?' : '추천을 승인할까요?'}
        description={decision?.type === 'reject'
          ? '거절한 추천은 현재 목록에서 REJECTED 상태로 변경됩니다.'
          : '승인하면 추천 내용을 기반으로 타임세일 프로모션이 생성됩니다.'}
        confirmLabel={decision?.type === 'reject' ? '추천 거절' : '승인하기'}
        tone={decision?.type === 'reject' ? 'danger' : 'default'}
        isPending={decision !== null && pendingId === decision.id}
        onClose={() => setDecision(null)}
        onConfirm={() => {
          if (!decision) return
          void (decision.type === 'approve'
            ? approveRecommendation(decision.id)
            : rejectRecommendation(decision.id))
        }}
      />
    </>
  )
}
