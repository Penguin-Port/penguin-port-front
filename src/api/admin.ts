import { env } from '../config/env'
import type {
  AdminLoginResponse,
  AdminPassResponse,
  AiRecommendationResponse,
  ApiRecommendationType,
  EditedRecommendationResponse,
  PromotionResponse,
  RecommendationPatchInput,
  RejectedRecommendationResponse,
} from '../types/api'
import { ApiError, apiRequest } from './client'

const ADMIN_SESSION_KEY = 'penguin-port-admin-session'

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
    body: JSON.stringify({
      username: env.adminUsername,
      password: env.adminPassword,
    }),
  })

  window.sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(response.data))
  return response.data
}

async function getSession() {
  return readAdminSession() ?? login()
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
