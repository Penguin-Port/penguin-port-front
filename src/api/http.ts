const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? ''

export type ApiErrorBody = {
  code?: string
  message?: string
  detail?: string
}

export class ApiError extends Error {
  status: number
  body: ApiErrorBody | null

  constructor(status: number, body: ApiErrorBody | null) {
    super(body?.message ?? body?.detail ?? `API request failed with ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  token?: string
  demoKey?: string
}

export async function apiRequest<T>(
  path: string,
  { method = 'GET', body, token, demoKey }: RequestOptions = {},
) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: buildHeaders({ body, token, demoKey }),
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (response.status === 204) return undefined as T

  const data = await readJson(response)

  if (!response.ok) {
    throw new ApiError(response.status, data as ApiErrorBody | null)
  }

  return data as T
}

function buildHeaders({
  body,
  token,
  demoKey,
}: Pick<RequestOptions, 'body' | 'token' | 'demoKey'>) {
  const headers = new Headers()

  if (body !== undefined) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (demoKey) headers.set('X-Demo-Key', demoKey)

  return headers
}

async function readJson(response: Response) {
  const text = await response.text()

  if (!text) return null

  try {
    return JSON.parse(text) as unknown
  } catch {
    return { message: text }
  }
}
