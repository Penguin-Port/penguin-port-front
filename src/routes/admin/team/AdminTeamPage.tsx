import { useState } from 'react'
import { ADMIN_ROUTES } from '../../../constants/adminRoutes'
import { TEAM_MEMBERS } from '../../../constants/adminTeam'
import type { TeamMember } from '../../../types/admin'
import { InviteMemberModal } from './InviteMemberModal'
import { TeamTable } from './TeamTable'

export function AdminTeamPage() {
  const [members, setMembers] = useState(TEAM_MEMBERS)
  const [isInviteOpen, setIsInviteOpen] = useState(false)

  const inviteMember = (member: TeamMember) => {
    setMembers((current) => [...current, member])
    setIsInviteOpen(false)
  }

  return (
    <>
      <section className="team-heading">
        <div><p className="eyebrow">TEAM <span>/ {ADMIN_ROUTES.team.slice(1)}</span></p><h1>팀 · 권한</h1></div>
        <button onClick={() => setIsInviteOpen(true)}>직원 초대</button>
      </section>
      <TeamTable members={members} />
      {isInviteOpen && <InviteMemberModal onClose={() => setIsInviteOpen(false)} onInvite={inviteMember} />}
    </>
  )
}
