import type { AnomalyItem } from '../types/admin'

export const ANOMALIES: AnomalyItem[] = [
  {
    id: 'anomaly-1',
    severity: 'high',
    title: '동일 IP에서 3회 이상 이용권 요청',
    description: '14:15~14:28 사이에 동일 공유기 IP에서 3개의 서로 다른 번호로 이용권을 요청했습니다.',
    time: '14:28',
    isResolved: false,
  },
  {
    id: 'anomaly-2',
    severity: 'medium',
    title: '비정상적으로 짧은 체류 시간',
    description: '이용권 활성화 후 8분 만에 기기가 네트워크를 이탈했습니다. Wi-Fi를 재연결하지 않았습니다.',
    time: '13:41',
    isResolved: false,
  },
  {
    id: 'anomaly-3',
    severity: 'low',
    title: '동일 전화번호 당일 2회 인증 시도',
    description: '010-****-2913 번호로 오전과 오후에 각각 인증을 시도했습니다. 두 번 모두 성공했습니다.',
    time: '11:05',
    isResolved: false,
  },
]

export const ANOMALY_SEVERITY_LABELS = {
  high: '높음',
  medium: '보통',
  low: '낮음',
} as const
