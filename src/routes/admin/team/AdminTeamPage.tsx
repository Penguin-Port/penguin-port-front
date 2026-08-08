import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '../../../api'
import { EmptyState, ErrorState, LoadingState, useToast } from '../../../components/admin'
import { isApiConfigured } from '../../../config/env'
import { ADMIN_ROUTES } from '../../../constants/adminRoutes'
import { TEAM_MEMBERS, TEAM_ROLE_PERMISSIONS } from '../../../constants/adminTeam'
import type { TeamMember, TeamRole } from '../../../types/admin'
import type { TeamMemberCreateInput } from '../../../types/api'
import { mapApiTeamMember } from '../../../utils/adminApiMappers'
import { InviteMemberModal } from './InviteMemberModal'
import { TeamTable } from './TeamTable'

const API_ROLE_MAP: Record<TeamMemberCreateInput['role'], TeamRole> = {
  OWNER: 'owner',
  MANAGER: 'manager',
  STAFF: 'staff',
  VIEWER: 'viewer',
}

export function AdminTeamPage() {
  const { showToast } = useToast()
  const [members, setMembers] = useState<TeamMember[]>(isApiConfigured ? [] : TEAM_MEMBERS)
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(isApiConfigured)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')

  const loadTeam = useCallback(async (signal?: AbortSignal) => {
    if (!isApiConfigured) return
    setIsLoading(true)
    setError('')
    try {
      const response = await adminApi.getTeam(signal)
      setMembers(response.data.map(mapApiTeamMember))
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === 'AbortError') return
      setError('팀 계정 목록을 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void loadTeam(controller.signal)
    return () => controller.abort()
  }, [loadTeam])

  const inviteMember = async (input: TeamMemberCreateInput) => {
    if (!isApiConfigured) {
      const role = API_ROLE_MAP[input.role]
      setMembers((current) => [...current, {
        id: `member-${Date.now()}`,
        name: input.username,
        email: '활성 계정',
        role,
        permissions: TEAM_ROLE_PERMISSIONS[role],
      }])
      setIsInviteOpen(false)
      return
    }

    setIsCreating(true)
    try {
      const response = await adminApi.createTeamMember(input)
      setMembers((current) => [...current, mapApiTeamMember(response.data)])
      setIsInviteOpen(false)
      showToast('관리자 계정을 추가했습니다.', 'success')
    } catch {
      showToast('관리자 계정 추가에 실패했습니다. 권한과 중복 ID를 확인해주세요.', 'error')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <>
      <section className="team-heading">
        <div><p className="eyebrow">TEAM <span>/ {ADMIN_ROUTES.team.slice(1)}</span></p><h1>팀 · 권한</h1></div>
        <button onClick={() => setIsInviteOpen(true)}>관리자 계정 추가</button>
      </section>
      {isLoading && <LoadingState variant="table" label="팀 계정을 불러오는 중입니다." />}
      {error && <ErrorState description={error} onRetry={() => void loadTeam()} />}
      {!isLoading && !error && members.length === 0 && <EmptyState title="등록된 팀 계정이 없습니다" description="관리자 계정을 추가해주세요." />}
      {!isLoading && !error && members.length > 0 && <TeamTable members={members} />}
      {isInviteOpen && <InviteMemberModal isPending={isCreating} onClose={() => setIsInviteOpen(false)} onInvite={(input) => void inviteMember(input)} />}
    </>
  )
}
