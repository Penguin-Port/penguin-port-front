import type { AdminPassResponse, AiRecommendationResponse } from '../types/api'
import type { LivePass, TimeSaleRecommendation, TimeSaleStatus } from '../types/admin'

function formatMinutes(totalMinutes: number) {
  if (totalMinutes <= 0) return '종료'
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes}분`
  if (minutes === 0) return `${hours}시간`
  return `${hours}시간 ${minutes}분`
}

function formatTimeRange(startsAt: unknown, endsAt: unknown) {
  if (typeof startsAt !== 'string' || typeof endsAt !== 'string') return '시간 미정'
  const start = new Date(startsAt)
  const end = new Date(endsAt)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '시간 미정'
  const formatter = new Intl.DateTimeFormat('ko-KR', { hour: 'numeric', minute: '2-digit' })
  return `${formatter.format(start)}~${formatter.format(end)}`
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : ''
}

export function mapApiPass(pass: AdminPassResponse, serverTime: string): LivePass {
  const now = new Date(serverTime).getTime()
  const issuedAt = new Date(pass.issuedAt).getTime()
  const expiresAt = new Date(pass.expiresAt).getTime()
  const remainingMinutes = Math.max(0, Math.ceil((expiresAt - now) / 60_000))
  const totalMinutes = Math.max(0, Math.round((expiresAt - issuedAt) / 60_000))
  const status: LivePass['status'] = pass.status === 'EXPIRED'
    ? 'ended'
    : pass.status === 'ACTIVE'
      ? 'active'
      : 'renewable'

  return {
    id: pass.passId,
    phone: pass.phone ?? pass.customerPhone ?? '정보 없음',
    remaining: formatMinutes(remainingMinutes),
    totalProvided: formatMinutes(totalMinutes),
    source: 'API 연동',
    status,
  }
}

export function mapApiRecommendation(item: AiRecommendationResponse): TimeSaleRecommendation {
  const payload = item.payload
  const title = stringValue(payload.title) || 'AI 타임세일 추천'
  const discountFromPayload = Number(payload.discountRate ?? payload.discountPercent)
  const discountFromTitle = Number(title.match(/(\d+)\s*%/)?.[1])
  const discountRate = Number.isFinite(discountFromPayload)
    ? discountFromPayload
    : Number.isFinite(discountFromTitle)
      ? discountFromTitle
      : 0
  const menu = stringValue(payload.menuName)
    || stringValue(payload.productName)
    || title.replace(/\s*\d+\s*%\s*(할인)?\s*(추천)?\s*$/, '')
  const statusMap: Record<AiRecommendationResponse['status'], TimeSaleStatus> = {
    PENDING: 'review',
    EDITED: 'edited',
    ACCEPTED: 'scheduled',
    REJECTED: 'rejected',
  }
  const confidenceValue = item.confidence ?? payload.confidence
  const confidence = Number(confidenceValue)
  const menuIds = Array.isArray(payload.menuIds)
    ? payload.menuIds.filter((value): value is string => typeof value === 'string')
    : undefined

  return {
    id: item.recommendationId,
    title,
    menu,
    menuIds,
    discountRate,
    timeRange: stringValue(payload.timeRange) || formatTimeRange(payload.startsAt, payload.endsAt),
    startsAt: stringValue(payload.startsAt) || undefined,
    endsAt: stringValue(payload.endsAt) || undefined,
    status: statusMap[item.status],
    reasons: item.reason ? [item.reason] : ['AI 추천'],
    evidence: item.evidence,
    apiVersion: item.version,
    expectedEffect: stringValue(payload.expectedEffect) || stringValue(payload.expectedImpact),
    confidence: confidenceValue !== null && confidenceValue !== undefined && Number.isFinite(confidence)
      ? confidence
      : undefined,
    createdAt: stringValue(payload.createdAt) || item.createdAt,
    recommendationType: item.type,
    source: stringValue(payload.source) || undefined,
    model: stringValue(payload.model) || undefined,
  }
}
