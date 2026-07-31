import { TEAM_ROLE_LABELS } from '../../../constants/adminTeam'
import type { TeamMember } from '../../../types/admin'

interface TeamTableProps {
  members: TeamMember[]
}

export function TeamTable({ members }: TeamTableProps) {
  return (
    <div className="team-table-wrap">
      <table className="team-table">
        <thead><tr><th>이름</th><th>이메일</th><th>역할</th><th>권한 범위</th></tr></thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id}>
              <td>{member.name}</td>
              <td>{member.email}</td>
              <td><span className={`team-role ${member.role}`}>{TEAM_ROLE_LABELS[member.role]}</span></td>
              <td>{member.permissions}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
