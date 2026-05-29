import { useEffect, useRef } from 'react'
import { CatDecoration } from './Icons'
import { useI18n } from '@/I18nProvider'

interface ConfirmDialogProps {
  open: boolean
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const { t } = useI18n()

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="dialog-overlay"
      onClick={(e) => { if (e.target === overlayRef.current) onCancel() }}
    >
      <div className="dialog-card animate-fade-up">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <CatDecoration size={64} />
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text)', textAlign: 'center', marginBottom: 8 }}>
          {title ?? t('dialog.notice')}
        </h3>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', textAlign: 'center', marginBottom: 20, lineHeight: 1.5 }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="cta-outline" style={{ flex: 1, fontSize: 14, padding: '10px 0', justifyContent: 'center' }} onClick={onCancel}>
            {cancelLabel ?? t('dialog.cancel')}
          </button>
          <button className="cta-primary" style={{ flex: 1, fontSize: 14, padding: '10px 0', justifyContent: 'center', background: 'var(--color-danger)' }} onClick={onConfirm}>
            {confirmLabel ?? t('dialog.confirmDelete')}
          </button>
        </div>
      </div>
    </div>
  )
}
