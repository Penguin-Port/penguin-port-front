import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '../../../api'
import { EmptyState, ErrorState, LoadingState, useToast } from '../../../components/admin'
import { isApiConfigured } from '../../../config/env'
import { REWARD_TIERS } from '../../../constants/adminRewardTiers'
import { ADMIN_ROUTES } from '../../../constants/adminRoutes'
import type { RewardTier } from '../../../types/admin'
import { mapApiRewardTier } from '../../../utils/adminApiMappers'
import { RewardBenefitModal, type RewardBenefitDraft } from './RewardBenefitModal'
import { RewardTierCard } from './RewardTierCard'

export function AdminRewardTiersPage() {
  const { showToast } = useToast()
  const [tiers, setTiers] = useState<RewardTier[]>(isApiConfigured ? [] : REWARD_TIERS)
  const [isLoading, setIsLoading] = useState(isApiConfigured)
  const [pendingTierId, setPendingTierId] = useState<string | null>(null)
  const [benefitTierId, setBenefitTierId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const benefitTier = tiers.find((tier) => tier.id === benefitTierId) ?? null

  const loadTiers = useCallback(async (signal?: AbortSignal) => {
    if (!isApiConfigured) return
    setIsLoading(true)
    setError('')
    try {
      const response = await adminApi.getRewardTiers(signal)
      setTiers(response.data.map(mapApiRewardTier))
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === 'AbortError') return
      setError('리워드 티어를 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void loadTiers(controller.signal)
    return () => controller.abort()
  }, [loadTiers])

  const addBenefit = async (draft: RewardBenefitDraft) => {
    const tierId = benefitTierId
    if (!tierId) return
    const tier = tiers.find((item) => item.id === tierId)
    if (!tier) return
    const newBenefit = {
      id: `${tier.id}-benefit-${Date.now()}`,
      ...draft,
    }

    if (!isApiConfigured) {
      setTiers((current) => current.map((item) => item.id === tierId
        ? { ...item, benefits: [...item.benefits, newBenefit] }
        : item))
      setBenefitTierId(null)
      return
    }

    setPendingTierId(tierId)
    try {
      const response = await adminApi.saveRewardTier({
        tierId: tier.id,
        name: tier.name ?? `${tier.threshold.toLocaleString('ko-KR')}원 티어`,
        thresholdAmount: tier.threshold,
        sortOrder: tier.sortOrder ?? 0,
        benefits: [...tier.benefits, newBenefit].map((benefit) => ({
          benefitId: benefit.id === newBenefit.id ? undefined : benefit.id,
          benefitType: benefit.benefitType ?? 'CUSTOM',
          title: benefit.name,
          payload: { ...(benefit.payload ?? {}), weight: benefit.weight },
        })),
      })
      const saved = mapApiRewardTier(response.data)
      setTiers((current) => current.map((item) => item.id === tierId ? saved : item))
      setBenefitTierId(null)
      showToast('새 리워드 혜택을 서버에 저장했습니다.', 'success')
    } catch {
      showToast('리워드 혜택 저장에 실패했습니다.', 'error')
    } finally {
      setPendingTierId(null)
    }
  }

  return (
    <>
      <section className="reward-tiers-heading">
        <p className="eyebrow">DAILY REWARD TIERS <span>/ {ADMIN_ROUTES.rewardTiers.slice(1)}</span></p>
        <h1>당일 누적 리워드 티어</h1>
        <p>매장 영업일 기준 누적 금액 티어와 서버의 선택 가능 혜택을 관리합니다.</p>
      </section>

      {isLoading && <LoadingState label="리워드 티어를 불러오는 중입니다." />}
      {error && <ErrorState description={error} onRetry={() => void loadTiers()} />}
      {!isLoading && !error && tiers.length === 0 && (
        <EmptyState title="등록된 리워드 티어가 없습니다" description="백엔드에 리워드 티어를 먼저 등록해주세요." />
      )}
      {!isLoading && !error && tiers.length > 0 && (
        <section className="reward-tier-list" aria-label="당일 누적 리워드 티어 목록">
          {tiers.map((tier) => (
            <RewardTierCard
              key={tier.id}
              tier={tier}
              isPending={pendingTierId === tier.id}
              onAddBenefit={setBenefitTierId}
            />
          ))}
        </section>
      )}
      <RewardBenefitModal
        tier={benefitTier}
        isPending={benefitTierId !== null && pendingTierId === benefitTierId}
        onClose={() => setBenefitTierId(null)}
        onSubmit={(draft) => void addBenefit(draft)}
      />
    </>
  )
}
