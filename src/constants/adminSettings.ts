export const ADMIN_SETTINGS_SECTIONS = [
  {
    id: 'store',
    title: '매장 정보',
    items: [
      { label: '매장명', value: '펭귄포트 대학가 1호점' },
      { label: '사업자번호', value: '123-45-67890' },
      { label: '연락처', value: '02-1234-5678' },
      { label: '영업 시간', value: '월~일 08:00~22:00' },
    ],
  },
  {
    id: 'wifi',
    title: 'Wi-Fi 설정',
    items: [
      { label: 'SSID', value: 'PenguinPort_Free' },
      { label: 'VLAN', value: 'GUEST (102)' },
      { label: '대역폭 제한', value: '10 Mbps / 이용권' },
      { label: '게이트웨이', value: '192.168.100.1' },
    ],
  },
  {
    id: 'api',
    title: 'API 연동',
    items: [
      { label: 'POS 시스템', value: '펭귄POS v3.2' },
      { label: '결제 게이트웨이', value: '토스페이먼츠' },
      { label: '활성 이용권 API', value: '/admin/passes/active' },
      { label: '갱신 주기', value: '10초 폴링' },
    ],
  },
  {
    id: 'retention',
    title: '데이터 보관',
    items: [
      { label: '전화번호 보관', value: '30일 후 자동 폐기' },
      { label: '주문 이력', value: '3년 보관' },
      { label: '감사 로그', value: '5년 보관' },
      { label: '이상 징후', value: '1년 보관' },
    ],
  },
] as const
