'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import './Modal.css'

interface ModalProps {
  /** Titolo della modale (es. "Attenzione") */
  title: string
  /** Contenuto (messaggio o nodi React) */
  children: React.ReactNode
  /** Testo del pulsante di chiusura (o secondario) */
  buttonLabel?: string
  /** Chiamato al click su Chiudi o sullo sfondo */
  onClose: () => void
  /** Ruolo per accessibilità (alertdialog per errori) */
  role?: 'dialog' | 'alertdialog'
  /** Se forniti, mostra due pulsanti: primary (questo) e secondario (buttonLabel) */
  primaryLabel?: string
  onPrimaryClick?: () => void
  /** Variante larga (es. per step affiancati in modale disinstallazione) */
  wide?: boolean
  /** Se true, mostra solo il pulsante primary (allineato a destra), nessun secondario */
  singlePrimaryButton?: boolean
}

export default function Modal({
  title,
  children,
  buttonLabel = 'Chiudi',
  onClose,
  role = 'dialog',
  primaryLabel,
  onPrimaryClick,
  wide = false,
  singlePrimaryButton = false,
}: ModalProps) {
  const hasPrimary = primaryLabel != null && onPrimaryClick != null
  const onlyPrimary = singlePrimaryButton && hasPrimary

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const modalContent = (
    <div className="modal-overlay" role="presentation">
      <div
        className="modal-backdrop"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Enter' && onClose()}
        tabIndex={0}
        aria-hidden
      />
      <div
        className={`modal-card${wide ? ' modal-card--wide' : ''}`}
        role={role}
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
      >
        <h2 id="modal-title" className="modal-title">
          {title}
        </h2>
        <div id="modal-desc" className="modal-body">
          {children}
        </div>
        <div className={`modal-actions${onlyPrimary ? ' modal-actions--single' : ''}`}>
          {!onlyPrimary && (
            <button
              type="button"
              className={hasPrimary ? 'modal-btn modal-btn-secondary' : 'modal-btn'}
              onClick={onClose}
              autoFocus={!hasPrimary}
            >
              {buttonLabel}
            </button>
          )}
          {hasPrimary && (
            <button type="button" className="modal-btn modal-btn-primary" onClick={onPrimaryClick} autoFocus={onlyPrimary || hasPrimary}>
              {primaryLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  )

  if (typeof document === 'undefined') return modalContent
  return createPortal(modalContent, document.body)
}
