import type { NotificationTemplate, SentNotification } from '../types/admin'

export const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  { id: 'template-1', title: 'Wi-Fi 이용권 발급', message: '안녕하세요! 주문 감사합니다. Wi-Fi 이용권 {grant_minutes}분이 발급되었습니다.' },
  { id: 'template-2', title: '리워드 달성 알림', message: '축하합니다! 오늘 누적 구매액 {tier_amount}원을 달성했습니다. 혜택을 선택해 주세요.' },
  { id: 'template-3', title: '이용 시간 연장', message: '추가 주문이 확인되었습니다. Wi-Fi 이용 시간이 {extend_minutes}분 연장되었습니다.' },
]

export const SENT_NOTIFICATIONS: SentNotification[] = [
  { id: 'sent-1', title: 'Wi-Fi 이용권 발급', phone: '010-****-2913', time: '14:28' },
  { id: 'sent-2', title: '리워드 달성 알림', phone: '010-****-8820', time: '13:54' },
  { id: 'sent-3', title: '이용 시간 연장', phone: '010-****-2913', time: '13:12' },
  { id: 'sent-4', title: 'Wi-Fi 이용권 발급', phone: '010-****-1174', time: '11:08' },
]
