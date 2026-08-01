import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '../../../api'
import { isApiConfigured } from '../../../config/env'
import { LIVE_PASSES } from '../../../constants/adminLivePasses'
import { ADMIN_ROUTES } from '../../../constants/adminRoutes'
import type { LivePass } from '../../../types/admin'
import { mapApiPass } from '../../../utils/adminApiMappers'
import { LivePassesTable } from './LivePassesTable'

export function AdminLivePassesPage() {
  const [passes, setPasses] = useState<LivePass[]>(LIVE_PASSES)
  const [lastUpdatedAt, setLastUpdatedAt] = useState(new Date())
  const [isLoading, setIsLoading] = useState(isApiConfigured)
  const [errorMessage, setErrorMessage] = useState('')
  const [pendingPassId, setPendingPassId] = useState<string | null>(null)

  const loadPasses = useCallback(async (signal?: AbortSignal) => {
    if (!isApiConfigured) return
    try {
      const response = await adminApi.getActivePasses(signal)
      setPasses(response.data.map((pass) => mapApiPass(pass, response.meta.serverTime)))
      setLastUpdatedAt(new Date(response.meta.serverTime))
      setErrorMessage('')
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setErrorMessage('API 연결에 실패해 마지막 데이터를 표시하고 있습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void loadPasses(controller.signal)
    const intervalId = window.setInterval(() => void loadPasses(), 10_000)
    return () => {
      controller.abort()
      window.clearInterval(intervalId)
    }
  }, [loadPasses])

  const extendPass = async (passId: string) => {
    setPendingPassId(passId)
    try {
      await adminApi.extendPass(passId, 15)
      await loadPasses()
    } catch {
      setErrorMessage('이용권 연장에 실패했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setPendingPassId(null)
    }
  }

  const expirePass = async (passId: string) => {
    if (!window.confirm('이 이용권을 즉시 종료할까요?')) return
    setPendingPassId(passId)
    try {
      await adminApi.expirePass(passId)
      await loadPasses()
    } catch {
      setErrorMessage('이용권 종료에 실패했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setPendingPassId(null)
    }
  }

  return (
    <>
      <section className="live-passes-heading">
        <div>
          <p className="eyebrow">LIVE PASSES <span>/ {ADMIN_ROUTES.livePasses.slice(1)}</span></p>
          <h1>실시간 이용권</h1>
          <p>서버 시간 기준 잔여 시간입니다. 활성 이용권 목록은 10초마다 자동 갱신됩니다.</p>
        </div>
        <span className="polling-badge"><i /> {isLoading ? '연결 중' : `10초마다 갱신 · ${lastUpdatedAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`}</span>
      </section>

      {errorMessage && <p className="api-feedback is-error" role="alert">{errorMessage}</p>}
      {!isApiConfigured && <p className="api-feedback">백엔드 미연동 모드 · `.env`에 VITE_API_BASE_URL을 설정하면 실제 데이터를 불러옵니다.</p>}

      <LivePassesTable
        passes={passes}
        isApiConnected={isApiConfigured}
        pendingPassId={pendingPassId}
        onExtend={extendPass}
        onExpire={expirePass}
      />
    </>
  )
}
