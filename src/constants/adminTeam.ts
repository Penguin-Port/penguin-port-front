import type { TeamMember, TeamRole } from '../types/admin'

export const TEAM_MEMBERS: TeamMember[] = [
  { id: 'member-1', name: '김재현', email: 'jaehyun@penguin.cafe', role: 'owner', permissions: '전체 메뉴 · 승인 · 팀 · 설정' },
  { id: 'member-2', name: '박서연', email: 'seoyeon@penguin.cafe', role: 'manager', permissions: '타임세일 승인 · 재고 · 알림' },
  { id: 'member-3', name: '최도훈', email: 'dohoon@penguin.cafe', role: 'staff', permissions: '주문 열람 · 이용권 열람' },
  { id: 'member-4', name: '이하은', email: 'haeun@penguin.cafe', role: 'viewer', permissions: '대시보드 읽기 전용' },
]

export const TEAM_ROLE_LABELS: Record<TeamRole, string> = {
  owner: 'OWNER',
  manager: 'MANAGER',
  staff: 'STAFF',
  viewer: 'VIEWER',
}

export const TEAM_ROLE_PERMISSIONS: Record<TeamRole, string> = {
  owner: '전체 메뉴 · 승인 · 팀 · 설정',
  manager: '타임세일 승인 · 재고 · 알림',
  staff: '주문 열람 · 이용권 열람',
  viewer: '대시보드 읽기 전용',
}
