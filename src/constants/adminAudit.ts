import type { AuditLogItem } from '../types/admin'

export const AUDIT_LOGS: AuditLogItem[] = [
  { id: 'audit-1', time: '14:28', actor: '김재현', action: '타임세일 승인', change: 'ts1 · 오후 2~4시 아메리카노 15%' },
  { id: 'audit-2', time: '14:15', actor: '김재현', action: '이상 징후 확인', change: '동일 IP 3회 요청 · 확인 처리' },
  { id: 'audit-3', time: '13:54', actor: '박서연', action: 'Wi-Fi 정책 수정', change: '기본 제공 시간 120분 → 150분' },
  { id: 'audit-4', time: '12:31', actor: '김재현', action: '리워드 티어 수정', change: '10,000원 티어 · 무료 사이즈업 w 1.0 → 1.2' },
  { id: 'audit-5', time: '11:02', actor: '박서연', action: '타임세일 거절', change: 'ts_old · 재고 부족으로 거절' },
]
