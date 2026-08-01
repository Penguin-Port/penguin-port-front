const viteEnv = import.meta.env

export const env = {
  apiBaseUrl: viteEnv.VITE_API_BASE_URL ?? '',
  adminUsername: viteEnv.VITE_ADMIN_USERNAME ?? (viteEnv.DEV ? 'demo-owner' : ''),
  adminPassword: viteEnv.VITE_ADMIN_PASSWORD ?? (viteEnv.DEV ? 'demo-password' : ''),
} as const

export const isApiConfigured = env.apiBaseUrl.trim().length > 0
