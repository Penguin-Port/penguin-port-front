import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '../../../api'
import { ConfirmModal, EmptyState, ErrorState, LoadingState, useToast } from '../../../components/admin'
import { isApiConfigured } from '../../../config/env'
import { LIVE_PASSES } from '../../../constants/adminLivePasses'
import { ADMIN_ROUTES } from '../../../constants/adminRoutes'
import type { LivePass } from '../../../types/admin'
import { mapApiPass } from '../../../utils/adminApiMappers'
import { LivePassesTable } from './LivePassesTable'

export function AdminLivePassesPage() {
  const { showToast } = useToast()
  const [passes, setPasses] = useState<LivePass[]>(isApiConfigured ? [] : LIVE_PASSES)
  const [lastUpdatedAt, setLastUpdatedAt] = useState(new Date())
  const [isLoading, setIsLoading] = useState(isApiConfigured)
  const [errorMessage, setErrorMessage] = useState('')
  const [pendingPassId, setPendingPassId] = useState<string | null>(null)
  const [expireTargetId, setExpireTargetId] = useState<string | null>(null)

  const loadPasses = useCallback(async (signal?: AbortSignal, showLoading = false) => {
    if (!isApiConfigured) return
    if (showLoading) setIsLoading(true)
    try {
      const response = await adminApi.getActivePasses(signal)
      setPasses(response.data.map((pass) => mapApiPass(pass, response.meta.serverTime)))
      setLastUpdatedAt(new Date(response.meta.serverTime))
      setErrorMessage('')
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setErrorMessage('백엔드 연결 상태와 관리자 인증 정보를 확인해주세요.')
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
      showToast('이용권을 15분 연장했습니다.', 'success')
    } catch {
      setErrorMessage('이용권 연장에 실패했습니다. 잠시 후 다시 시도해주세요.')
      showToast('이용권 연장에 실패했습니다.', 'error')
    } finally {
      setPendingPassId(null)
    }
  }

  const expirePass = async (passId: string) => {
    setPendingPassId(passId)
    try {
      await adminApi.expirePass(passId)
      await loadPasses()
      showToast('이용권을 종료했습니다.', 'success')
      setExpireTargetId(null)
    } catch {
      setErrorMessage('이용권 종료에 실패했습니다. 잠시 후 다시 시도해주세요.')
      showToast('이용권 종료에 실패했습니다.', 'error')
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

      {!isApiConfigured && <p className="api-feedback">백엔드 미연동 모드 · `.env`에 VITE_API_BASE_URL을 설정하면 실제 데이터를 불러옵니다.</p>}
      {isLoading && passes.length === 0 ? (
        <LoadingState variant="table" count={5} label="활성 이용권을 불러오는 중입니다." />
      ) : errorMessage && passes.length === 0 ? (
        <ErrorState description={errorMessage} onRetry={() => void loadPasses(undefined, true)} isRetrying={isLoading} />
      ) : passes.length === 0 ? (
        <EmptyState
          title="현재 활성 이용권이 없습니다"
          description="고객이 이용권을 활성화하면 이 목록에 실시간으로 표시됩니다."
        />
      ) : (
        <>
          {errorMessage && <p className="api-feedback is-error" role="alert">{errorMessage}</p>}
          <LivePassesTable
            passes={passes}
            isApiConnected={isApiConfigured}
            pendingPassId={pendingPassId}
            onExtend={extendPass}
            onExpire={setExpireTargetId}
          />
        </>
      )}

      <ConfirmModal
        isOpen={expireTargetId !== null}
        title="이용권을 즉시 종료할까요?"
        description="종료된 이용권은 다시 활성화할 수 없으며 연결된 Demo Network 접근도 해제됩니다."
        confirmLabel="이용권 종료"
        tone="danger"
        isPending={expireTargetId !== null && pendingPassId === expireTargetId}
        onClose={() => setExpireTargetId(null)}
        onConfirm={() => expireTargetId && void expirePass(expireTargetId)}
      />
    </>
  )
}
