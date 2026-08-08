const viteEnv = import.meta.env

export const env = {
  apiBaseUrl: viteEnv.VITE_API_BASE_URL ?? '',
  useCustomerApi: viteEnv.VITE_USE_CUSTOMER_API === '1',
  adminUsername: viteEnv.VITE_ADMIN_USERNAME ?? (viteEnv.DEV ? 'demo-owner' : ''),
  adminPassword: viteEnv.VITE_ADMIN_PASSWORD ?? (viteEnv.DEV ? 'demo-password' : ''),
} as const

export const isApiConfigured = env.apiBaseUrl.trim().length > 0
