import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '../../../api'
import { EmptyState, ErrorState, LoadingState } from '../../../components/admin'
import { isApiConfigured } from '../../../config/env'
import { REWARD_HISTORY, REWARD_HISTORY_STATUS_LABELS } from '../../../constants/adminRewardHistory'
import { ADMIN_ROUTES } from '../../../constants/adminRoutes'
import type { RewardHistoryItem, RewardHistoryStatus } from '../../../types/admin'
import type { AdminRewardHistoryResponse } from '../../../types/api'

function mapStatus(status: string): RewardHistoryStatus {
  if (['REDEEMED', 'CONSUMED', 'FULFILLED'].includes(status)) return 'used'
  if (['EXPIRED', 'REVOKED', 'CANCELLED'].includes(status)) return 'expired'
  if (status === 'AVAILABLE') return 'saved'
  return 'pending'
}

function mapRewardHistory(item: AdminRewardHistoryResponse): RewardHistoryItem {
  const occurredAt = item.occurredAt ? new Date(item.occurredAt) : null
  return {
    id: item.rewardGrantId,
    time: occurredAt && !Number.isNaN(occurredAt.getTime())
      ? occurredAt.toLocaleString('ko-KR', {
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '-',
    tier: item.tierAmount,
    benefit: item.benefitTitle ?? '혜택 선택 대기',
    usageType: item.fulfillMode === 'IMMEDIATE'
      ? '즉시 사용'
      : item.fulfillMode === 'COUPON_7D'
        ? '쿠폰 저장'
        : '미선택',
    status: mapStatus(item.status),
  }
}

export function AdminRewardHistoryPage() {
  const [history, setHistory] = useState<RewardHistoryItem[]>(isApiConfigured ? [] : REWARD_HISTORY)
  const [isLoading, setIsLoading] = useState(isApiConfigured)
  const [errorMessage, setErrorMessage] = useState('')

  const loadHistory = useCallback(async (signal?: AbortSignal) => {
    if (!isApiConfigured) return
    try {
      const response = await adminApi.getRewardHistory(signal)
      setHistory(response.data.map(mapRewardHistory))
      setErrorMessage('')
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setErrorMessage('리워드 이력을 불러오지 못했습니다. 백엔드 연결을 확인해 주세요.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void loadHistory(controller.signal)
    return () => controller.abort()
  }, [loadHistory])

  useEffect(() => {
    if (!isApiConfigured) return
    const intervalId = window.setInterval(() => void loadHistory(), 5_000)
    return () => window.clearInterval(intervalId)
  }, [loadHistory])

  return (
    <>
      <section className="reward-history-heading">
        <p className="eyebrow">REWARD HISTORY <span>/ {ADMIN_ROUTES.rewardHistory.slice(1)}</span></p>
        <h1>지급 · 선택 · 사용 이력</h1>
      </section>

      {isLoading && history.length === 0 ? (
        <LoadingState variant="table" count={5} label="리워드 이력을 불러오는 중입니다." />
      ) : errorMessage && history.length === 0 ? (
        <ErrorState description={errorMessage} onRetry={() => void loadHistory()} isRetrying={isLoading} />
      ) : history.length === 0 ? (
        <EmptyState title="리워드 이력이 없습니다" description="고객이 리워드를 지급받거나 사용하면 이곳에 표시됩니다." />
      ) : (
        <div className="reward-history-table-wrap">
          {errorMessage && <p className="api-feedback is-error" role="alert">{errorMessage}</p>}
          <table className="reward-history-table">
            <thead>
              <tr>
                <th>시각</th>
                <th>티어</th>
                <th>선택 혜택</th>
                <th>사용 방식</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
                  <td>{item.time}</td>
                  <td>{item.tier.toLocaleString('ko-KR')}원</td>
                  <td>{item.benefit}</td>
                  <td>{item.usageType}</td>
                  <td><span className={`reward-history-status ${item.status}`}>{REWARD_HISTORY_STATUS_LABELS[item.status]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
