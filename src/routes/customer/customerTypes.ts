export type Screen =
  | 'home'
  | 'menu'
  | 'complete'
  | 'active'
  | 'lookup'
  | 'extend'
  | 'claimMissing'

export type CustomerType = 'guest' | 'member'

export type MenuItem = {
  id: string
  name: string
  description: string
  price: number
}

export type LookupPass = {
  id: string
  label: string
  orderNo: string
  purchasedAt: string
  status: 'ACTIVE' | 'EXPIRED'
  title: string
  description: string
}

export type PortalOrder = {
  orderClaim: string
  storeName: string
  orderNo: string
  items: string
  paidAmount: number
  providedMinutes: number
}

export type HomeScreenProps = {
  customerType: CustomerType
  guestPhone: string
  memberName: string
  portalSession: string
  isConnectFlow: boolean
  portalOrder: PortalOrder
  onCustomerTypeChange: (type: CustomerType) => void
  onGuestPhoneChange: (phone: string) => void
  onMemberLogin: (name: string) => void
  onOtpReset: () => void
  onVerified: () => void
  onPrimaryAction: () => void
  onLookup: () => void
}

export type GuestOtpPanelProps = {
  phone: string
  otpCode: string
  otpSent: boolean
  otpVerified: boolean
  errorMessage: string
  cooldownSeconds: number
  canSendOtp: boolean
  canConfirmOtp: boolean
  onPhoneChange: (phone: string) => void
  onSendOtp: () => void
  onOtpCodeChange: (code: string) => void
  onConfirmOtp: () => void
}
