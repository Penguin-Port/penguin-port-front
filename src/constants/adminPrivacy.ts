export const PRIVACY_METRICS = [
  { id: 'encrypted', label: '암호화 보관 중인 전화번호', value: '28건', description: '모두 30일 이내 자동 폐기 예정입니다.' },
  { id: 'scheduled', label: '30일 경과 자동 폐기 예정', value: '3건', description: '내일 00:00 자동 폐기됩니다.' },
  { id: 'disposed', label: '이달 누적 폐기 완료', value: '142건', description: '폐기 결과 로그는 감사 로그에서 확인할 수 있습니다.' },
  { id: 'anomaly', label: '이상 접속 대응 기록', value: '7건', description: '점주 보호 목적으로만 보관하며 목적 달성 후 폐기합니다.' },
] as const
