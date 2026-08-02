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
  accessToken: string
  accessExpiresIn: number
}

export type ApiPassStatus = 'ISSUED' | 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED'

export interface AdminPassResponse {
  passId: string
  status: ApiPassStatus
  issuedAt: string
  activatedAt: string | null
  expiresAt: string
  version: number
  policySnapshot: Record<string, unknown>
  phone?: string
  customerPhone?: string
}

export type ApiRecommendationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'

export interface AiRecommendationResponse {
  recommendationId: string
  type: string
  payload: Record<string, unknown>
  reason: string
  status: ApiRecommendationStatus
  version: number
  createdAt?: string
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
