import { useState, type FormEvent } from 'react'
import type { TeamMemberCreateInput } from '../../../types/api'
import type { TeamRole } from '../../../types/admin'

interface InviteMemberModalProps {
  onClose: () => void
  onInvite: (input: TeamMemberCreateInput) => void
  isPending?: boolean
}

const ROLE_MAP: Record<TeamRole, TeamMemberCreateInput['role']> = {
  owner: 'OWNER',
  manager: 'MANAGER',
  staff: 'STAFF',
  viewer: 'VIEWER',
}

export function InviteMemberModal({ onClose, onInvite, isPending = false }: InviteMemberModalProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<TeamRole>('staff')

  const submitInvite = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onInvite({ username, password, role: ROLE_MAP[role] })
  }

  return (
    <div className="team-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !isPending && onClose()}>
      <section className="invite-member-modal" role="dialog" aria-modal="true" aria-labelledby="invite-title">
        <header><h2 id="invite-title">관리자 계정 추가</h2><button disabled={isPending} onClick={onClose} aria-label="초대 창 닫기">×</button></header>
        <form onSubmit={submitInvite}>
          <label>관리자 ID<input required minLength={3} value={username} onChange={(event) => setUsername(event.target.value)} placeholder="penguin-staff" /></label>
          <label>임시 비밀번호<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="8자 이상 입력" /></label>
          <label>역할<select value={role} onChange={(event) => setRole(event.target.value as TeamRole)}><option value="manager">MANAGER</option><option value="staff">STAFF</option><option value="viewer">VIEWER</option></select></label>
          <div><button type="button" disabled={isPending} onClick={onClose}>취소</button><button type="submit" disabled={isPending}>{isPending ? '추가 중…' : '계정 추가'}</button></div>
        </form>
      </section>
    </div>
  )
}
