const viteEnv = import.meta.env

export const env = {
  apiBaseUrl: viteEnv.VITE_API_BASE_URL ?? '',
} as const
