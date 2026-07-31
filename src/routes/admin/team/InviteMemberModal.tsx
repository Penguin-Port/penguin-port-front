import { useState, type FormEvent } from 'react'
import { TEAM_ROLE_PERMISSIONS } from '../../../constants/adminTeam'
import type { TeamMember, TeamRole } from '../../../types/admin'

interface InviteMemberModalProps {
  onClose: () => void
  onInvite: (member: TeamMember) => void
}

export function InviteMemberModal({ onClose, onInvite }: InviteMemberModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<TeamRole>('staff')

  const submitInvite = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onInvite({
      id: `member-${Date.now()}`,
      name,
      email,
      role,
      permissions: TEAM_ROLE_PERMISSIONS[role],
    })
  }

  return (
    <div className="team-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="invite-member-modal" role="dialog" aria-modal="true" aria-labelledby="invite-title">
        <header><h2 id="invite-title">직원 초대</h2><button onClick={onClose} aria-label="초대 창 닫기">×</button></header>
        <form onSubmit={submitInvite}>
          <label>이름<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="홍길동" /></label>
          <label>이메일<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="member@penguin.cafe" /></label>
          <label>역할<select value={role} onChange={(event) => setRole(event.target.value as TeamRole)}><option value="manager">MANAGER</option><option value="staff">STAFF</option><option value="viewer">VIEWER</option></select></label>
          <div><button type="button" onClick={onClose}>취소</button><button type="submit">초대 보내기</button></div>
        </form>
      </section>
    </div>
  )
}
