import { env } from '../config/env'
import type {
  AdminLoginResponse,
  AdminOrderResponse,
  AdminRewardHistoryResponse,
  AdminPassResponse,
  AiRecommendationResponse,
  AuditLogResponse,
  ApiRecommendationType,
  EditedRecommendationResponse,
  InventoryItemResponse,
  InventoryRecommendationResponse,
  MenuTrendResponse,
  PromotionResponse,
  RecommendationPatchInput,
  RejectedRecommendationResponse,
  RewardTierResponse,
  RewardTierUpsertInput,
  SalesSummaryResponse,
  TeamMemberCreateInput,
  TeamMemberResponse,
  WifiPolicyResponse,
  WifiPolicySimulationResponse,
} from '../types/api'
import { ApiError, apiRequest } from './client'

const ADMIN_SESSION_KEY = 'penguin-port-admin-session'
let loginPromise: Promise<AdminLoginResponse> | null = null

function readAdminSession() {
  const raw = window.sessionStorage.getItem(ADMIN_SESSION_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as AdminLoginResponse
  } catch {
    window.sessionStorage.removeItem(ADMIN_SESSION_KEY)
    return null
  }
}

async function login() {
  if (!env.adminUsername || !env.adminPassword) {
    throw new Error('관리자 API 계정이 설정되지 않았습니다.')
  }

  const response = await apiRequest<AdminLoginResponse>('/admin/login', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({
      username: env.adminUsername,
      password: env.adminPassword,
    }),
  })

  window.sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(response.data))
  return response.data
}

async function establishSession() {
  if (!loginPromise) {
    loginPromise = login().finally(() => {
      loginPromise = null
    })
  }

  return loginPromise
}

async function getSession() {
  const session = readAdminSession()
  if (session) return session

  return establishSession()
}

async function authenticatedRequest<T>(
  path: string,
  options?: RequestInit,
  canRetry = true,
) {
  const session = await getSession()

  try {
    const response = await apiRequest<T>(path, {
      ...options,
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        ...options?.headers,
      },
    })
    return { ...response, session }
  } catch (error) {
    if (canRetry && error instanceof ApiError && error.status === 401) {
      window.sessionStorage.removeItem(ADMIN_SESSION_KEY)
      return authenticatedRequest<T>(path, options, false)
    }
    throw error
  }
}

export const adminApi = {
  logout() {
    window.sessionStorage.removeItem(ADMIN_SESSION_KEY)
  },

  async getActivePasses(signal?: AbortSignal) {
    return authenticatedRequest<AdminPassResponse[]>('/admin/passes/active', { signal })
  },

  async getOrders(signal?: AbortSignal) {
    return authenticatedRequest<AdminOrderResponse[]>('/admin/orders', { signal })
  },

  async extendPass(passId: string, minutes: number) {
    const session = await getSession()
    return authenticatedRequest<AdminPassResponse>(`/admin/passes/${passId}/extend`, {
      method: 'POST',
      body: JSON.stringify({ storeId: session.storeId, minutes }),
    })
  },

  async expirePass(passId: string) {
    const session = await getSession()
    return authenticatedRequest<AdminPassResponse>(`/admin/passes/${passId}/expire`, {
      method: 'POST',
      body: JSON.stringify({ storeId: session.storeId }),
    })
  },

  async blockPass(passId: string, reason = '관리자 화면에서 수동 차단') {
    const session = await getSession()
    return authenticatedRequest<AdminPassResponse>(`/admin/passes/${passId}/block`, {
      method: 'POST',
      body: JSON.stringify({ storeId: session.storeId, reason }),
    })
  },

  async getEventStreamUrl() {
    // native EventSource는 Authorization 헤더를 보낼 수 없으므로
    // 저장된 토큰과 별개로 HttpOnly 인증 쿠키를 확실히 재발급합니다.
    const session = await establishSession()
    const query = new URLSearchParams({ storeId: session.storeId })
    return `${env.apiBaseUrl}/admin/events?${query.toString()}`
  },

  async getSalesSummary(signal?: AbortSignal) {
    return authenticatedRequest<SalesSummaryResponse>('/admin/ai/sales-summary', { signal })
  },

  async getInventory(signal?: AbortSignal) {
    return authenticatedRequest<InventoryItemResponse[]>('/admin/inventory', { signal })
  },

  async getInventoryRecommendations(signal?: AbortSignal) {
    return authenticatedRequest<InventoryRecommendationResponse[]>('/admin/ai/inventory', { signal })
  },

  async scanInventory() {
    return authenticatedRequest<InventoryRecommendationResponse[]>('/admin/inventory/scan', {
      method: 'POST',
    })
  },

  async getMenuTrends(signal?: AbortSignal) {
    return authenticatedRequest<MenuTrendResponse[]>('/admin/ai/menu-trends', { signal })
  },

  async getRewardTiers(signal?: AbortSignal) {
    return authenticatedRequest<RewardTierResponse[]>('/admin/rewards/tiers', { signal })
  },

  async getRewardHistory(signal?: AbortSignal) {
    return authenticatedRequest<AdminRewardHistoryResponse[]>('/admin/rewards/history', { signal })
  },

  async saveRewardTier(input: RewardTierUpsertInput) {
    const session = await getSession()
    return authenticatedRequest<RewardTierResponse>('/admin/rewards/tiers', {
      method: 'POST',
      body: JSON.stringify({ storeId: session.storeId, ...input }),
    })
  },

  async getWifiPolicy(signal?: AbortSignal) {
    return authenticatedRequest<WifiPolicyResponse>('/admin/wifi/policies', { signal })
  },

  async simulateWifiPolicy(amount: number, orderType: 'FIRST' | 'ADDITIONAL' = 'FIRST') {
    return authenticatedRequest<WifiPolicySimulationResponse>('/admin/wifi/policies/simulate', {
      method: 'POST',
      body: JSON.stringify({ amount, orderType }),
    })
  },

  async publishWifiPolicy(input: Omit<WifiPolicyResponse, 'storeId'>) {
    return authenticatedRequest<WifiPolicyResponse>('/admin/wifi/policies/publish', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  async getTeam(signal?: AbortSignal) {
    return authenticatedRequest<TeamMemberResponse[]>('/admin/team', { signal })
  },

  async createTeamMember(input: TeamMemberCreateInput) {
    const session = await getSession()
    return authenticatedRequest<TeamMemberResponse>('/admin/team', {
      method: 'POST',
      body: JSON.stringify({ storeId: session.storeId, ...input }),
    })
  },

  async getAuditLogs(limit = 100, signal?: AbortSignal) {
    return authenticatedRequest<AuditLogResponse[]>(`/admin/audit?limit=${limit}`, { signal })
  },

  async getRecommendations(signal?: AbortSignal) {
    return authenticatedRequest<AiRecommendationResponse[]>('/admin/ai/recommendations', { signal })
  },

  async generateRecommendations(type: ApiRecommendationType = 'TIME_SALE') {
    const session = await getSession()
    return authenticatedRequest<AiRecommendationResponse[]>('/admin/ai/recommendations/generate', {
      method: 'POST',
      body: JSON.stringify({ storeId: session.storeId, type }),
    })
  },

  async updateRecommendation(
    recommendationId: string,
    version: number,
    input: RecommendationPatchInput,
  ) {
    const session = await getSession()
    return authenticatedRequest<EditedRecommendationResponse>(
      `/admin/ai/recommendations/${recommendationId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ storeId: session.storeId, version, ...input }),
      },
    )
  },

  async acceptRecommendation(recommendationId: string, version: number) {
    const session = await getSession()
    return authenticatedRequest<PromotionResponse>(
      `/admin/ai/recommendations/${recommendationId}/accept`,
      {
        method: 'POST',
        body: JSON.stringify({ storeId: session.storeId, version }),
      },
    )
  },

  async rejectRecommendation(recommendationId: string, reason?: string) {
    const session = await getSession()
    return authenticatedRequest<RejectedRecommendationResponse>(
      `/admin/ai/recommendations/${recommendationId}/reject`,
      {
        method: 'POST',
        body: JSON.stringify({ storeId: session.storeId, reason }),
      },
    )
  },
}
