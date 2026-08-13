const viteEnv = import.meta.env

export type AppMode = 'all' | 'admin' | 'customer'

function resolveAppMode(): AppMode {
  const configuredMode = viteEnv.VITE_APP_MODE
  if (configuredMode === 'admin' || configuredMode === 'customer') return configuredMode
  if (viteEnv.MODE === 'admin' || viteEnv.MODE === 'customer') return viteEnv.MODE
  return 'all'
}

export const env = {
  appMode: resolveAppMode(),
  apiBaseUrl: viteEnv.VITE_API_BASE_URL ?? '',
  useCustomerApi: viteEnv.VITE_USE_CUSTOMER_API === '1',
  customerAppUrl: viteEnv.VITE_CUSTOMER_APP_URL ?? '',
  demoStoreId: viteEnv.VITE_DEMO_STORE_ID ?? '',
  demoProductId: viteEnv.VITE_DEMO_PRODUCT_ID ?? '',
  adminUsername: viteEnv.VITE_ADMIN_USERNAME ?? (viteEnv.DEV ? 'demo-owner' : ''),
  adminPassword: viteEnv.VITE_ADMIN_PASSWORD ?? (viteEnv.DEV ? 'demo-password' : ''),
} as const

export const isApiConfigured = env.apiBaseUrl.trim().length > 0
