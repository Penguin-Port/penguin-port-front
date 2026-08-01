import { env } from '../config/env'
import type { ApiEnvelope } from '../types/api'

export class ApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(
    status: number,
    body: unknown,
  ) {
    super(`API request failed: ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export async function apiRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<ApiEnvelope<T>> {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new ApiError(response.status, body)
  }

  return response.json() as Promise<ApiEnvelope<T>>
}
