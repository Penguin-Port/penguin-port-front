import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '../../../api'
import { ConfirmModal, EmptyState, ErrorState, LoadingState, useToast } from '../../../components/admin'
import { isApiConfigured } from '../../../config/env'
import { ADMIN_ROUTES } from '../../../constants/adminRoutes'
import { TIME_SALE_RECOMMENDATIONS } from '../../../constants/adminTimeSales'
import type { RecommendationPatchInput } from '../../../types/api'
import type { TimeSaleRecommendation } from '../../../types/admin'
import { mapApiRecommendation } from '../../../utils/adminApiMappers'
import { TimeSaleCard } from './TimeSaleCard'
import { RecommendationDetailModal } from './RecommendationDetailModal'
import { RecommendationEditModal } from './RecommendationEditModal'

function formatEditedTimeRange(startsAt: string, endsAt: string) {
  const formatter = new Intl.DateTimeFormat('ko-KR', { hour: 'numeric', minute: '2-digit' })
  return `${formatter.format(new Date(startsAt))}~${formatter.format(new Date(endsAt))}`
}

export function AdminTimeSalesPage() {
  const { showToast } = useToast()
  const [isAutoApproveEnabled, setIsAutoApproveEnabled] = useState(false)
  const [recommendations, setRecommendations] = useState(
    isApiConfigured ? [] : TIME_SALE_RECOMMENDATIONS,
  )
  const [isLoading, setIsLoading] = useState(isApiConfigured)
  const [isGenerating, setIsGenerating] = useState(false)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [decision, setDecision] = useState<{ id: string; type: 'approve' | 'reject' } | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const detailRecommendation = recommendations.find((item) => item.id === detailId) ?? null
  const editRecommendationTarget = recommendations.find((item) => item.id === editId) ?? null

  const openDecision = (id: string, type: 'approve' | 'reject') => {
    setDetailId(null)
    setDecision({ id, type })
  }

  const loadRecommendations = useCallback(async (signal?: AbortSignal, showLoading = true) => {
    if (!isApiConfigured) return
    if (showLoading) setIsLoading(true)
    try {
      const response = await adminApi.getRecommendations(signal)
      setRecommendations(response.data.map(mapApiRecommendation))
      setErrorMessage('')
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setErrorMessage('백엔드 연결 상태와 관리자 인증 정보를 확인해주세요.')
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void loadRecommendations(controller.signal)
    return () => controller.abort()
  }, [loadRecommendations])

  const generateRecommendation = async () => {
    if (!isApiConfigured || isGenerating || isLoading) return

    setIsGenerating(true)
    try {
      const response = await adminApi.generateRecommendations('TIME_SALE')
      const generated = response.data.map(mapApiRecommendation)
      const generatedIds = new Set(generated.map((item) => item.id))
      setRecommendations((current) => [
        ...generated,
        ...current.filter((item) => !generatedIds.has(item.id)),
      ])
      await loadRecommendations(undefined, false)
      showToast('새 AI 타임세일 추천을 생성했습니다.', 'success')
    } catch {
      setErrorMessage('AI 추천 생성에 실패했습니다. 백엔드 연결과 OpenAI 설정을 확인해주세요.')
      showToast('AI 추천 생성에 실패했습니다.', 'error')
    } finally {
      setIsGenerating(false)
    }
  }

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

  const openEditRecommendation = (id: string) => {
    setDetailId(null)
    setEditId(id)
  }

  const editRecommendation = async (input: RecommendationPatchInput) => {
    const recommendation = recommendations.find((item) => item.id === editId)
    if (!recommendation) return

    if (!isApiConfigured || recommendation.apiVersion === undefined) {
      updateRecommendation(recommendation.id, (item) => ({
        ...item,
        ...input,
        status: 'edited',
        timeRange: formatEditedTimeRange(input.startsAt, input.endsAt),
      }))
      setEditId(null)
      showToast('타임세일 추천을 수정했습니다.', 'success')
      return
    }

    setPendingId(recommendation.id)
    try {
      const response = await adminApi.updateRecommendation(
        recommendation.id,
        recommendation.apiVersion,
        input,
      )
      updateRecommendation(recommendation.id, (item) => ({
        ...item,
        ...input,
        status: 'edited',
        apiVersion: response.data.version,
        timeRange: formatEditedTimeRange(input.startsAt, input.endsAt),
      }))
      await loadRecommendations(undefined, false)
      setEditId(null)
      showToast('수정한 추천을 서버에 저장했습니다.', 'success')
    } catch {
      setErrorMessage('추천 수정에 실패했습니다. 추천 버전 또는 입력값을 확인해주세요.')
      showToast('추천 수정에 실패했습니다.', 'error')
    } finally {
      setPendingId(null)
    }
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
        <div>
          <p className="eyebrow">AI TIME SALES <span>/ {ADMIN_ROUTES.aiTimeSales.slice(1)}</span></p>
          <h1>타임세일 추천 · 승인</h1>
          <p>추천은 자동 게시되지 않습니다. 승인하면 저장된 추천 내용으로 프로모션이 생성됩니다.</p>
        </div>
        <button
          type="button"
          className="generate-recommendation-button"
          disabled={!isApiConfigured || isGenerating || isLoading}
          title={isApiConfigured ? undefined : '백엔드를 연결하면 AI 추천을 생성할 수 있습니다.'}
          onClick={() => void generateRecommendation()}
        >
          {isGenerating && <span className="button-spinner" aria-hidden="true" />}
          {isGenerating ? 'AI 분석 중' : 'AI 추천 생성'}
        </button>
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
              onEdit={openEditRecommendation}
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

      <RecommendationEditModal
        recommendation={editRecommendationTarget}
        isPending={editId !== null && pendingId === editId}
        onClose={() => setEditId(null)}
        onSubmit={(input) => void editRecommendation(input)}
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
