import { useEffect, useState, type FormEvent } from 'react'
import { Modal } from '../../../components/admin'
import type { RewardTier } from '../../../types/admin'

export interface RewardBenefitDraft {
  name: string
  benefitType: string
  weight: number
  payload: Record<string, unknown>
}

interface RewardBenefitModalProps {
  tier: RewardTier | null
  isPending: boolean
  onClose: () => void
  onSubmit: (draft: RewardBenefitDraft) => void
}

const BENEFIT_OPTIONS = [
  { value: 'FREE_SIZE_UP', label: '무료 사이즈업' },
  { value: 'FREE_SHOT', label: '무료 샷 추가' },
  { value: 'DESSERT_DISCOUNT', label: '디저트 할인' },
  { value: 'DRINK_DISCOUNT', label: '음료 할인' },
  { value: 'WIFI_DAY_PASS', label: 'Wi-Fi 종일권' },
  { value: 'CUSTOM', label: '기타 혜택' },
] as const

function defaultPayload(benefitType: string) {
  switch (benefitType) {
    case 'FREE_SHOT': return { count: 1 }
    case 'DESSERT_DISCOUNT': return { discountAmount: 1_000 }
    case 'DRINK_DISCOUNT': return { discountRate: 10 }
    case 'WIFI_DAY_PASS': return { until: 'BUSINESS_DAY_END' }
    default: return {}
  }
}

export function RewardBenefitModal({
  tier,
  isPending,
  onClose,
  onSubmit,
}: RewardBenefitModalProps) {
  const [name, setName] = useState('')
  const [benefitType, setBenefitType] = useState('FREE_SIZE_UP')
  const [weight, setWeight] = useState(1)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!tier) return
    setName('')
    setBenefitType('FREE_SIZE_UP')
    setWeight(1)
    setError('')
  }, [tier])

  if (!tier) return null

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('혜택 이름을 입력해주세요.')
      return
    }
    if (!Number.isFinite(weight) || weight < 0.1 || weight > 10) {
      setError('가중치는 0.1~10 사이로 입력해주세요.')
      return
    }
    onSubmit({
      name: trimmedName,
      benefitType,
      weight,
      payload: { ...defaultPayload(benefitType), weight },
    })
  }

  return (
    <Modal
      isOpen
      title="리워드 혜택 추가"
      description={`${tier.threshold.toLocaleString('ko-KR')}원 티어에 고객이 선택할 혜택을 추가합니다.`}
      onClose={() => !isPending && onClose()}
    >
      <form className="reward-benefit-form" onSubmit={handleSubmit}>
        <label>
          혜택 이름
          <input
            required
            maxLength={120}
            value={name}
            disabled={isPending}
            placeholder="예: 무료 사이즈업"
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label>
          혜택 유형
          <select
            value={benefitType}
            disabled={isPending}
            onChange={(event) => setBenefitType(event.target.value)}
          >
            {BENEFIT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label>
          AI 정렬 가중치
          <input
            type="number"
            min="0.1"
            max="10"
            step="0.1"
            value={weight}
            disabled={isPending}
            onChange={(event) => setWeight(Number(event.target.value))}
          />
        </label>
        {error && <p className="reward-benefit-form-error" role="alert">{error}</p>}
        <div className="admin-modal-actions">
          <button type="button" disabled={isPending} onClick={onClose}>취소</button>
          <button type="submit" className="confirm" disabled={isPending}>
            {isPending ? '저장 중…' : '혜택 저장'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
