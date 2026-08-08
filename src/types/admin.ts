export type AdminIconName =
  | 'dashboard'
  | 'chart'
  | 'clock'
  | 'box'
  | 'sparkles'
  | 'ticket'
  | 'wifi'
  | 'gift'
  | 'receipt'
  | 'bell'
  | 'shield'
  | 'users'
  | 'settings'

export interface AdminNavigationItem {
  label: string
  path: string
  icon: AdminIconName
}

export interface DashboardMetric {
  id: 'active-passes' | 'sales' | 'rewards' | 'approvals'
  label: string
  value: string
  detail: string
  tone: 'blue' | 'green' | 'purple' | 'orange'
  path: string
}

export interface DashboardActivity {
  id: string
  title: string
  description: string
  time: string
  color: 'green' | 'purple' | 'orange' | 'gray'
}

export interface DashboardApproval {
  id: string
  type: string
  description: string
  count: number
  path: string
}

export type TimeSaleStatus = 'review' | 'edited' | 'scheduled' | 'active' | 'ended' | 'rejected'

export interface TimeSaleRecommendation {
  id: string
  title?: string
  menu: string
  menuIds?: string[]
  discountRate: number
  timeRange: string
  startsAt?: string
  endsAt?: string
  status: TimeSaleStatus
  reasons: string[]
  evidence?: Record<string, unknown>
  apiVersion?: number
  expectedEffect?: string
  confidence?: number
  createdAt?: string
  recommendationType?: string
  source?: string
  model?: string
}

export type InventoryRisk = 'high' | 'overstock' | 'low'

export interface InventoryItem {
  id: string
  name: string
  quantity: string
  expiry: string
  risk: InventoryRisk
}

export type MenuTrendStatus = 'interested' | 'reviewing' | 'new'

export interface MenuTrend {
  id: string
  name: string
  description: string
  expectedMargin?: number
  status: MenuTrendStatus
}

export type LivePassStatus = 'active' | 'day-pass' | 'renewable' | 'ended'

export interface LivePass {
  id: string
  phone: string
  remaining: string
  totalProvided: string
  source: string
  status: LivePassStatus
}

export interface RewardBenefit {
  id: string
  name: string
  weight: number
  benefitType?: string
  payload?: Record<string, unknown>
}

export interface RewardTier {
  id: string
  name?: string
  threshold: number
  reachRate?: number
  sortOrder?: number
  benefits: RewardBenefit[]
}

export type RewardHistoryStatus = 'used' | 'saved' | 'expired'

export interface RewardHistoryItem {
  id: string
  time: string
  tier: number
  benefit: string
  usageType: string
  status: RewardHistoryStatus
}

export interface AdminOrder {
  id: string
  time: string
  orderNumber: string
  amount: number
  wifiPass: string
  reward: string
  hasWifiPass: boolean
  hasReward: boolean
}

export interface NotificationTemplate {
  id: string
  title: string
  message: string
}

export interface SentNotification {
  id: string
  title: string
  phone: string
  time: string
}

export type AnomalySeverity = 'high' | 'medium' | 'low'

export interface AnomalyItem {
  id: string
  severity: AnomalySeverity
  title: string
  description: string
  time: string
  isResolved: boolean
}

export type TeamRole = 'owner' | 'manager' | 'staff' | 'viewer'

export interface TeamMember {
  id: string
  name: string
  email: string
  role: TeamRole
  permissions: string
  isActive?: boolean
}

export interface AuditLogItem {
  id: string
  time: string
  actor: string
  action: string
  change: string
}
