import { Modal } from './Modal'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'default' | 'danger'
  isPending?: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel = '확인',
  cancelLabel = '취소',
  tone = 'default',
  isPending = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} title={title} description={description} onClose={isPending ? () => undefined : onClose}>
      <div className="admin-modal-actions">
        <button type="button" onClick={onClose} disabled={isPending}>{cancelLabel}</button>
        <button
          type="button"
          className={`confirm ${tone === 'danger' ? 'danger' : ''}`}
          onClick={onConfirm}
          disabled={isPending}
        >
          {isPending ? '처리 중…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
