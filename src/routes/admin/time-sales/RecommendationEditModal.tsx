import { useEffect, useState, type FormEvent } from 'react'
import { Modal } from '../../../components/admin'
import type { RecommendationPatchInput } from '../../../types/api'
import type { TimeSaleRecommendation } from '../../../types/admin'

interface RecommendationEditModalProps {
  recommendation: TimeSaleRecommendation | null
  isPending: boolean
  onClose: () => void
  onSubmit: (input: RecommendationPatchInput) => void
}

function toDateTimeLocal(value?: string) {
  const date = value ? new Date(value) : new Date(Date.now() + 60 * 60 * 1000)
  const safeDate = Number.isNaN(date.getTime()) ? new Date(Date.now() + 60 * 60 * 1000) : date
  safeDate.setSeconds(0, 0)
  const offset = safeDate.getTimezoneOffset() * 60_000
  return new Date(safeDate.getTime() - offset).toISOString().slice(0, 16)
}

function defaultEnd(value?: string, startValue?: string) {
  if (value) return toDateTimeLocal(value)
  const start = new Date(startValue || Date.now() + 60 * 60 * 1000)
  return toDateTimeLocal(new Date(start.getTime() + 2 * 60 * 60 * 1000).toISOString())
}

export function RecommendationEditModal({
  recommendation,
  isPending,
  onClose,
  onSubmit,
}: RecommendationEditModalProps) {
  const [discountRate, setDiscountRate] = useState(15)
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!recommendation) return
    setDiscountRate(recommendation.discountRate)
    setStartsAt(toDateTimeLocal(recommendation.startsAt))
    setEndsAt(defaultEnd(recommendation.endsAt, recommendation.startsAt))
    setErrorMessage('')
  }, [recommendation])

  if (!recommendation) return null

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const start = new Date(startsAt)
    const end = new Date(endsAt)
    if (!Number.isInteger(discountRate) || discountRate < 1 || discountRate > 100) {
      setErrorMessage('할인율은 1~100 사이의 정수로 입력해주세요.')
      return
    }
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      setErrorMessage('종료 시각은 시작 시각보다 늦어야 합니다.')
      return
    }

    onSubmit({
      discountRate,
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
      menuIds: recommendation.menuIds?.length ? recommendation.menuIds : undefined,
    })
  }

  return (
    <Modal
      isOpen
      title="타임세일 추천 수정"
      description="추천 메뉴는 유지하고 할인율과 적용 시간을 조정할 수 있습니다."
      onClose={() => !isPending && onClose()}
    >
      <form className="recommendation-edit-form" onSubmit={handleSubmit}>
        <label>
          대상 메뉴
          <span className="recommendation-readonly-field">{recommendation.menu}</span>
        </label>
        <label>
          할인율 (%)
          <input
            type="number"
            min="1"
            max="100"
            step="1"
            value={discountRate}
            disabled={isPending}
            onChange={(event) => setDiscountRate(Number(event.target.value))}
          />
        </label>
        <div className="recommendation-edit-time-grid">
          <label>
            시작 시각
            <input
              type="datetime-local"
              value={startsAt}
              disabled={isPending}
              onChange={(event) => setStartsAt(event.target.value)}
            />
          </label>
          <label>
            종료 시각
            <input
              type="datetime-local"
              value={endsAt}
              disabled={isPending}
              onChange={(event) => setEndsAt(event.target.value)}
            />
          </label>
        </div>
        {errorMessage && <p className="recommendation-edit-error" role="alert">{errorMessage}</p>}
        <div className="admin-modal-actions recommendation-edit-actions">
          <button type="button" disabled={isPending} onClick={onClose}>취소</button>
          <button type="submit" className="confirm" disabled={isPending}>
            {isPending ? '저장 중' : '수정 저장'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
