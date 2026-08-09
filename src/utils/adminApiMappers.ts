import type {
  AdminPassResponse,
  AiRecommendationResponse,
  AuditLogResponse,
  InventoryItemResponse,
  MenuTrendResponse,
  RewardTierResponse,
  TeamMemberResponse,
} from '../types/api'
import type {
  AuditLogItem,
  InventoryItem,
  InventoryRisk,
  LivePass,
  MenuTrend,
  RewardTier,
  TeamMember,
  TeamRole,
  TimeSaleRecommendation,
  TimeSaleStatus,
} from '../types/admin'
import { TEAM_ROLE_PERMISSIONS } from '../constants/adminTeam'

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
  const remainingMinutes = Math.max(
    0,
    Math.ceil(
      typeof pass.remainingSeconds === 'number'
        ? pass.remainingSeconds / 60
        : (expiresAt - now) / 60_000,
    ),
  )
  const totalMinutes = Math.max(0, Math.round((expiresAt - issuedAt) / 60_000))
  const status: LivePass['status'] = ['EXPIRED', 'BLOCKED', 'CANCELLED', 'FAILED'].includes(pass.status)
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

function inventoryRisk(score: number, quantity: number, threshold: number): InventoryRisk {
  if (score >= 45) return 'high'
  if (quantity > Math.max(threshold * 3, 20)) return 'overstock'
  return 'low'
}

function expiryLabel(expiresOn: string | null) {
  if (!expiresOn) return '-'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(`${expiresOn}T00:00:00`)
  const days = Math.ceil((expiry.getTime() - today.getTime()) / 86_400_000)
  return days >= 0 ? `D-${days}` : `D+${Math.abs(days)}`
}

export function mapApiInventoryItem(item: InventoryItemResponse): InventoryItem {
  return {
    id: item.inventoryItemId,
    name: item.productName ?? item.productId,
    quantity: `${item.quantity.toLocaleString('ko-KR')}${item.unit}`,
    expiry: expiryLabel(item.expiresOn),
    risk: inventoryRisk(item.riskScore, item.quantity, item.lowStockThreshold),
  }
}

export function mapApiMenuTrend(item: MenuTrendResponse, index: number): MenuTrend {
  return {
    id: `${item.source}-${index}-${item.menuName}`,
    name: item.menuName,
    description: item.reason,
    status: index === 0 ? 'new' : 'reviewing',
  }
}

export function mapApiRewardTier(item: RewardTierResponse): RewardTier {
  return {
    id: item.tierId,
    name: item.name,
    threshold: item.thresholdAmount,
    sortOrder: item.sortOrder,
    benefits: item.benefits.map((benefit) => {
      const weight = Number(benefit.payload.weight)
      return {
        id: benefit.benefitId,
        name: benefit.title,
        weight: Number.isFinite(weight) ? weight : 1,
        benefitType: benefit.benefitType,
        payload: benefit.payload,
      }
    }),
  }
}

const TEAM_ROLE_MAP: Record<TeamMemberResponse['role'], TeamRole> = {
  OWNER: 'owner',
  MANAGER: 'manager',
  STAFF: 'staff',
  VIEWER: 'viewer',
}

export function mapApiTeamMember(item: TeamMemberResponse): TeamMember {
  const role = TEAM_ROLE_MAP[item.role]
  return {
    id: item.adminId,
    name: item.username,
    email: item.isActive ? '활성 계정' : '비활성 계정',
    role,
    permissions: TEAM_ROLE_PERMISSIONS[role],
    isActive: item.isActive,
  }
}

function metadataLabel(metadata: Record<string, unknown>) {
  const entries = Object.entries(metadata)
  if (entries.length === 0) return '-'
  return entries.map(([key, value]) => `${key}: ${String(value)}`).join(' · ')
}

export function mapApiAuditLog(item: AuditLogResponse): AuditLogItem {
  const createdAt = item.createdAt ? new Date(item.createdAt) : null
  return {
    id: item.auditId,
    time: createdAt && !Number.isNaN(createdAt.getTime())
      ? createdAt.toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
      : '-',
    actor: item.actorId ?? item.actorType,
    action: item.action,
    change: `${item.resourceType} ${item.resourceId} · ${metadataLabel(item.metadata)}`,
  }
}
