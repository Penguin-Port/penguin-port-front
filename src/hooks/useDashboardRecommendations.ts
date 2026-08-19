import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '../api'
import { isApiConfigured } from '../config/env'
import { TIME_SALE_RECOMMENDATIONS } from '../constants/adminTimeSales'
import type { TimeSaleRecommendation } from '../types/admin'
import { mapApiRecommendation } from '../utils/adminApiMappers'

export function useDashboardRecommendations() {
  const [data, setData] = useState<TimeSaleRecommendation[]>(
    isApiConfigured ? [] : TIME_SALE_RECOMMENDATIONS,
  )
  const [isLoading, setIsLoading] = useState(isApiConfigured)
  const [error, setError] = useState('')
  const [serverTime, setServerTime] = useState<string | null>(null)

  const refetch = useCallback(async (signal?: AbortSignal, showLoading = true) => {
    if (!isApiConfigured) return
    if (showLoading) setIsLoading(true)
    try {
      const response = await adminApi.getRecommendations(signal)
      setData(response.data.map(mapApiRecommendation))
      setServerTime(response.meta.serverTime)
      setError('')
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === 'AbortError') return
      setError('AI 추천 현황을 불러오지 못했습니다.')
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void refetch(controller.signal)
    const interval = window.setInterval(() => void refetch(undefined, false), 10_000)
    return () => {
      controller.abort()
      window.clearInterval(interval)
    }
  }, [refetch])

  return { data, isLoading, error, serverTime, refetch, isApiConnected: isApiConfigured }
}
