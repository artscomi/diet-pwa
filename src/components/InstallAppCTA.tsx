'use client'

import { useState, useEffect, useRef } from 'react'
import UninstallInstructionsModal, { type UninstallPlatform } from './UninstallInstructionsModal'
import InstallAppModal, { type InstallModalVariant } from './InstallAppModal'
import './InstallAppCTA.css'

/** Evento beforeinstallprompt (Chrome/Edge). Non disponibile su Safari/iOS. */
type InstallPromptEvent = Event & { prompt: () => Promise<{ outcome: string }> }

/**
 * True se la pagina è aperta nella finestra PWA (icona app), false se aperta in un tab del browser.
 * Non indica "l'app è installata" ma "questa finestra è in modalità app (standalone) o browser (tab)".
 * Stessa URL: da icona → standalone; da barra indirizzi/tab → non standalone.
 */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

/** Chrome, Edge e altri browser Chromium: supportano installazione PWA da barra indirizzi/menu. */
function isChromeOrEdge(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  return (/Chrome/.test(ua) && !/Edg/.test(ua)) || /Edg/.test(ua)
}

function isAndroid(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android/.test(navigator.userAgent)
}

/** Telefono (iOS o Android). */
function isMobile(): boolean {
  return isIOS() || isAndroid()
}

function isEdge(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Edg/.test(navigator.userAgent)
}

/** Piattaforma per istruzioni di disinstallazione (solo in standalone). */
export function getUninstallPlatform(): UninstallPlatform {
  if (typeof navigator === 'undefined') return 'other'
  if (isIOS()) return 'ios'
  if (isAndroid()) return 'android'
  if (isEdge()) return 'edge'
  if (isChromeOrEdge()) return 'chrome'
  return 'other'
}

interface InstallAppCTAProps {
  /** "banner" = box con testo (footer/landing), "button" = solo pulsante per header */
  variant?: 'banner' | 'button'
}

export default function InstallAppCTA({ variant = 'banner' }: InstallAppCTAProps) {
  const [showInstall, setShowInstall] = useState(false)
  const [showUninstallModal, setShowUninstallModal] = useState(false)
  const [installModalVariant, setInstallModalVariant] = useState<InstallModalVariant | null>(null)
  const installPromptRef = useRef<InstallPromptEvent | null>(null)
  const isButton = variant === 'button'

  useEffect(() => {
    if (isStandalone()) return

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      installPromptRef.current = e as InstallPromptEvent
      setShowInstall(true)
    }

    const handleInstalled = () => {
      installPromptRef.current = null
      setShowInstall(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  // Nascondi CTA install (Chrome) se siamo già in standalone (es. dopo re-open)
  useEffect(() => {
    if (isStandalone()) setShowInstall(false)
  }, [])

  const handleInstallClick = async () => {
    const e = installPromptRef.current
    if (!e) return
    try {
      await e.prompt()
      installPromptRef.current = null
      setShowInstall(false)
    } catch {
      // Ignora errori (es. utente chiude il dialog del browser)
    }
  }

  const handleOpenInstallModal = (v: InstallModalVariant) => {
    setInstallModalVariant(v)
  }

  const handleCloseInstallModal = () => {
    setInstallModalVariant(null)
  }

  const handleInstallFromModal = async () => {
    await handleInstallClick()
    handleCloseInstallModal()
  }

  // In standalone il CTA «Vuoi disinstallare?» è mostrato in fondo al footer (UninstallFooterLink)
  if (isStandalone()) {
    return null
  }

  // Chrome/Edge: un click avvia il prompt di installazione del browser
  if (showInstall) {
    if (isButton) {
      return (
        <>
          <button
            type="button"
            className="install-cta-btn install-cta-btn--header"
            onClick={() => handleOpenInstallModal('native')}
          >
            Installa app
          </button>
          {installModalVariant === 'native' && (
            <InstallAppModal
              variant="native"
              onClose={handleCloseInstallModal}
              onInstall={handleInstallFromModal}
            />
          )}
        </>
      )
    }
    return (
      <>
        <div className="install-cta install-cta-native">
        <p className="install-cta-text">
          {isMobile() ? (
            <>Aggiungi l’app allo smartphone per averla sempre.<br />A portata di mano.</>
          ) : (
            <>Installa l’app per averla sempre.<br />A portata di mano.</>
          )}
        </p>
        <button type="button" className="install-cta-btn" onClick={() => handleOpenInstallModal('native')}>
          Installa l’app
        </button>
        </div>
        {installModalVariant === 'native' && (
          <InstallAppModal
            variant="native"
            onClose={handleCloseInstallModal}
            onInstall={handleInstallFromModal}
          />
        )}
      </>
    )
  }

  // Chrome/Edge senza prompt install: nulla (disinstallare visibile solo in standalone).
  if (isChromeOrEdge()) {
    return null
  }

  // iOS/Safari: bottone che apre istruzioni
  if (isIOS()) {
    if (isButton) {
      return (
        <>
          <button type="button" className="install-cta-btn install-cta-btn--header" onClick={() => handleOpenInstallModal('ios')}>
            Aggiungi alla Home
          </button>
          {installModalVariant === 'ios' && (
            <InstallAppModal variant="ios" onClose={handleCloseInstallModal} />
          )}
        </>
      )
    }
    return (
      <>
        <div className="install-cta install-cta-ios">
          <p className="install-cta-text">Aggiungi l’app alla Home per aprirla come un’app.</p>
          <button type="button" className="install-cta-btn" onClick={() => handleOpenInstallModal('ios')}>
            Aggiungi alla Home
          </button>
        </div>
        {installModalVariant === 'ios' && (
          <InstallAppModal variant="ios" onClose={handleCloseInstallModal} />
        )}
      </>
    )
  }

  // Altri browser: non mostrare nulla (es. Firefox senza supporto)
  return null
}
