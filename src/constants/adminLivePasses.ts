import type { LivePass } from '../types/admin'

export const LIVE_PASSES: LivePass[] = [
  { id: 'P-2481', phone: '010-****-2913', remaining: '1시간 42분', totalProvided: '2시간 30분', source: '첫주문 + 추가주문', status: 'active' },
  { id: 'P-2480', phone: '010-****-8820', remaining: '48분', totalProvided: '2시간', source: '첫주문', status: 'active' },
  { id: 'P-2478', phone: '010-****-1174', remaining: '영업 종료까지', totalProvided: '종일권', source: '누적 20,000원 티어', status: 'day-pass' },
  { id: 'P-2475', phone: '010-****-4402', remaining: '연장 안내 중', totalProvided: '2시간', source: '첫주문', status: 'renewable' },
  { id: 'P-2469', phone: '010-****-0031', remaining: '종료', totalProvided: '3시간', source: '첫주문 + 추가주문 2회', status: 'ended' },
]

export const LIVE_PASS_STATUS_LABELS = {
  active: 'ACTIVE',
  'day-pass': 'DAY PASS',
  renewable: 'RENEWABLE',
  ended: 'ENDED',
} as const
