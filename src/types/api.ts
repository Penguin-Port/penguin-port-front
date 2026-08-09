export interface ApiMeta {
  requestId: string
  serverTime: string
}

export interface ApiEnvelope<T> {
  data: T
  meta: ApiMeta
}

export interface AdminLoginResponse {
  adminId: string
  storeId: string
  username: string
  role: 'OWNER' | 'MANAGER' | 'STAFF' | 'VIEWER'
  accessToken: string
  accessExpiresIn: number
}

export type ApiPassStatus =
  | 'ISSUED'
  | 'ACTIVE'
  | 'EXPIRING_SOON'
  | 'EXPIRED'
  | 'BLOCKED'
  | 'CANCELLED'
  | 'FAILED'

export interface AdminPassResponse {
  passId: string
  status: ApiPassStatus
  issuedAt: string
  activatedAt: string | null
  expiresAt: string
  remainingSeconds?: number
  version: number
  policySnapshot: Record<string, unknown>
  phone?: string
  customerPhone?: string
}

export type ApiRecommendationStatus = 'PENDING' | 'EDITED' | 'ACCEPTED' | 'REJECTED'

export type ApiRecommendationType =
  | 'TIME_SALE'
  | 'SALES_SUMMARY'
  | 'INVENTORY_PROMOTION'
  | 'MENU_TREND'

export interface AiRecommendationResponse {
  recommendationId: string
  type: string
  payload: Record<string, unknown>
  reason: string
  evidence?: Record<string, unknown>
  confidence?: number | null
  status: ApiRecommendationStatus
  version: number
  createdAt?: string
  decidedAt?: string | null
}

export interface RecommendationPatchInput {
  menuIds?: string[]
  discountRate: number
  startsAt: string
  endsAt: string
}

export interface EditedRecommendationResponse {
  recommendationId: string
  payload: Record<string, unknown>
  status: 'EDITED'
  version: number
}

export interface PromotionResponse {
  promotionId: string
  title: string
  startsAt: string
  endsAt: string
}

export interface RejectedRecommendationResponse {
  recommendationId: string
  status: 'REJECTED'
  version: number
}

export interface SalesHourlyResponse {
  bucketStart: string
  orderCount: number
  grossSales: number
}

export interface SalesSummaryResponse {
  businessDate: string
  totalSales: number
  totalOrders: number
  repeatCustomerCount: number
  wifiActiveCount: number
  wifiActiveMinutes: number
  hourly: SalesHourlyResponse[]
  topItems: Array<{ name: string; quantity: number }>
  recommendation: {
    recommendationId: string
    summary: string | null
    reason: string
    evidence: Record<string, unknown>
    confidence: number | null
  }
}

export interface InventoryItemResponse {
  inventoryItemId: string
  productId: string
  productName: string | null
  quantity: number
  unit: string
  lowStockThreshold: number
  expiresOn: string | null
  riskScore: number
  updatedAt: string | null
}

export interface InventoryRecommendationResponse {
  recommendationId: string
  type?: string
  payload: Record<string, unknown>
  reason: string
  evidence: Record<string, unknown>
  confidence: number | null
  status: ApiRecommendationStatus
  version: number
}

export interface MenuTrendResponse {
  menuName: string
  reason: string
  source: string
}

export interface RewardBenefitResponse {
  benefitId: string
  benefitType: string
  title: string
  payload: Record<string, unknown>
}

export interface RewardTierResponse {
  tierId: string
  name: string
  thresholdAmount: number
  sortOrder: number
  benefits: RewardBenefitResponse[]
}

export interface RewardTierUpsertInput {
  tierId?: string
  name: string
  thresholdAmount: number
  sortOrder: number
  benefits: Array<{
    benefitId?: string
    benefitType: string
    title: string
    payload: Record<string, unknown>
  }>
}

export interface PolicyTierResponse {
  minAmount: number
  minutes: number
}

export interface WifiPolicyResponse {
  storeId: string
  version: number
  baseMinutes: number
  firstOrderTiers: PolicyTierResponse[]
  additionalOrderTiers: PolicyTierResponse[]
}

export interface WifiPolicySimulationResponse {
  minutes: number
  breakdown: Record<string, unknown>
  policyVersion: number
}

export interface TeamMemberResponse {
  adminId: string
  storeId: string
  username: string
  role: 'OWNER' | 'MANAGER' | 'STAFF' | 'VIEWER'
  isActive: boolean
  createdAt: string | null
}

export interface TeamMemberCreateInput {
  username: string
  password: string
  role: TeamMemberResponse['role']
}

export interface AuditLogResponse {
  auditId: string
  action: string
  resourceType: string
  resourceId: string
  actorType: string
  actorId: string | null
  metadata: Record<string, unknown>
  createdAt: string | null
}
