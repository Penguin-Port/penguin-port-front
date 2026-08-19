import { useEffect, useRef, useState } from 'react'
import { adminApi } from '../api'

export type AdminEventStreamStatus = 'disabled' | 'connecting' | 'connected' | 'polling'

const ADMIN_REFRESH_EVENTS = [
  'order.created',
  'wifi.pass.activated',
  'wifi.pass.extended',
  'wifi.pass.blocked',
  'wifi.pass.expired',
  'order.refunded',
] as const

export function useAdminEventStream(onEvent: () => void, enabled: boolean) {
  const [status, setStatus] = useState<AdminEventStreamStatus>(
    enabled ? 'connecting' : 'disabled',
  )
  const onEventRef = useRef(onEvent)

  useEffect(() => {
    onEventRef.current = onEvent
  }, [onEvent])

  useEffect(() => {
    if (!enabled || typeof EventSource === 'undefined') {
      setStatus(enabled ? 'polling' : 'disabled')
      return
    }

    let disposed = false
    let eventSource: EventSource | null = null

    const connect = async () => {
      try {
        const url = await adminApi.getEventStreamUrl()
        if (disposed) return

        eventSource = new EventSource(url, { withCredentials: true })
        eventSource.onopen = () => setStatus('connected')
        eventSource.onerror = () => {
          if (!disposed) setStatus('polling')
          // EventSource의 기본 재연결과 Last-Event-ID 처리를 그대로 사용합니다.
        }

        const refresh = (event: Event) => {
          if (!(event instanceof MessageEvent)) return
          try {
            JSON.parse(event.data as string)
            onEventRef.current()
          } catch {
            // 형식이 올바르지 않은 이벤트는 목록 갱신에 사용하지 않습니다.
          }
        }

        ADMIN_REFRESH_EVENTS.forEach((eventName) => {
          eventSource?.addEventListener(eventName, refresh)
        })
      } catch {
        if (!disposed) setStatus('polling')
      }
    }

    setStatus('connecting')
    void connect()

    return () => {
      disposed = true
      eventSource?.close()
    }
  }, [enabled])

  return status
}
