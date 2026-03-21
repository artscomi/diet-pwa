'use client'

import { useState, useEffect, useRef } from 'react'
import type { UninstallPlatform } from './UninstallInstructionsModal'
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

/** Fascia install su mobile (Chrome + iOS). */
const INSTALL_STICKY_HINT_MOBILE = 'La tua dieta, sempre in tasca'

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
  /** "banner" = box evidenziato, "button" = header, "minimal" = link footer, "stickyBar" = fascia sticky in basso */
  variant?: 'banner' | 'button' | 'minimal' | 'stickyBar'
}

export default function InstallAppCTA({ variant = 'banner' }: InstallAppCTAProps) {
  const [showInstall, setShowInstall] = useState(false)
  const [installModalVariant, setInstallModalVariant] = useState<InstallModalVariant | null>(null)
  const installPromptRef = useRef<InstallPromptEvent | null>(null)
  const isButton = variant === 'button'
  const isMinimal = variant === 'minimal'
  const isStickyBar = variant === 'stickyBar'

  useEffect(() => {
    try {
      localStorage.removeItem('installCtaDismissed')
    } catch {
      // ignore
    }
  }, [])

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

  // Solo nella finestra browser: in standalone (icona Home) la CTA install non serve
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
    if (isMinimal) {
      return (
        <>
          <div className="install-cta install-cta--minimal">
            <button
              type="button"
              className="install-cta-link"
              onClick={() => handleOpenInstallModal('native')}
            >
              Installa app
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
    if (isStickyBar) {
      return (
        <>
          <div className="install-sticky-bar" role="region" aria-label="Installazione app">
            <div className="install-sticky-bar__inner">
              <span className="install-sticky-bar__hint">
                {isMobile() ? INSTALL_STICKY_HINT_MOBILE : 'Usa PocketDiet come app'}
              </span>
              <button
                type="button"
                className="install-sticky-bar__btn"
                onClick={() => handleOpenInstallModal('native')}
              >
                Installa app
              </button>
            </div>
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

  /* Chrome/Edge senza beforeinstallprompt: la fascia sticky resta (menu, lista spesa, ecc.) con istruzioni dal menu ⋮ */
  if (isChromeOrEdge() && isStickyBar && !showInstall) {
    return (
      <>
        <div className="install-sticky-bar" role="region" aria-label="Installazione app">
          <div className="install-sticky-bar__inner">
            <span className="install-sticky-bar__hint">
              {isMobile() ? INSTALL_STICKY_HINT_MOBILE : 'Usa PocketDiet come app'}
            </span>
            <button
              type="button"
              className="install-sticky-bar__btn"
              onClick={() => handleOpenInstallModal('native')}
            >
              Installa app
            </button>
          </div>
        </div>
        {installModalVariant === 'native' && (
          <InstallAppModal
            variant="native"
            onClose={handleCloseInstallModal}
            nativePromptAvailable={false}
          />
        )}
      </>
    )
  }

  // Chrome/Edge senza prompt e senza sticky: nessuna CTA install.
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
    if (isMinimal) {
      return (
        <>
          <div className="install-cta install-cta--minimal">
            <button
              type="button"
              className="install-cta-link"
              onClick={() => handleOpenInstallModal('ios')}
            >
              Aggiungi alla Home
            </button>
          </div>
          {installModalVariant === 'ios' && (
            <InstallAppModal variant="ios" onClose={handleCloseInstallModal} />
          )}
        </>
      )
    }
    if (isStickyBar) {
      return (
        <>
          <div className="install-sticky-bar" role="region" aria-label="Aggiungi alla Home">
            <div className="install-sticky-bar__inner">
              <span className="install-sticky-bar__hint">
                {isMobile() ? INSTALL_STICKY_HINT_MOBILE : 'Usa PocketDiet come app'}
              </span>
              <button
                type="button"
                className="install-sticky-bar__btn"
                onClick={() => handleOpenInstallModal('ios')}
              >
                Aggiungi alla Home
              </button>
            </div>
          </div>
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
