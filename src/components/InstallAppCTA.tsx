'use client'

import { useState, useEffect, useRef } from 'react'
import UninstallInstructionsModal, { type UninstallPlatform } from './UninstallInstructionsModal'
import './InstallAppCTA.css'

/** Evento beforeinstallprompt (Chrome/Edge). Non disponibile su Safari/iOS. */
type InstallPromptEvent = Event & { prompt: () => Promise<{ outcome: string }> }

/**
 * True se la pagina è aperta nella finestra PWA (icona app), false se aperta in un tab del browser.
 * Non indica "l'app è installata" ma "questa finestra è in modalità app (standalone) o browser (tab)".
 * Stessa URL: da icona → standalone; da barra indirizzi/tab → non standalone.
 */
function isStandalone(): boolean {
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
function getUninstallPlatform(): UninstallPlatform {
  if (typeof navigator === 'undefined') return 'other'
  if (isIOS()) return 'ios'
  if (isAndroid()) return 'android'
  if (isEdge()) return 'edge'
  if (isChromeOrEdge()) return 'chrome'
  return 'other'
}

export default function InstallAppCTA() {
  const [showInstall, setShowInstall] = useState(false)
  const [showUninstallModal, setShowUninstallModal] = useState(false)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)
  const installPromptRef = useRef<InstallPromptEvent | null>(null)

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

  const handleIOSClick = () => {
    setShowIOSInstructions(true)
  }

  const handleCloseIOSInstructions = () => {
    setShowIOSInstructions(false)
  }

  // Se l’app è già installata (standalone): CTA «Vuoi disinstallare?» sotto il footer con spacing
  if (isStandalone()) {
    return (
      <>
        <div className="install-cta-uninstall-wrap">
          <button
            type="button"
            className="install-cta-uninstall-btn"
            onClick={() => setShowUninstallModal(true)}
          >
            Vuoi disinstallare l’app?
          </button>
        </div>
        {showUninstallModal && (
          <UninstallInstructionsModal
            platform={getUninstallPlatform()}
            onClose={() => setShowUninstallModal(false)}
            isStandalone={true}
          />
        )}
      </>
    )
  }

  // Chrome/Edge: un click avvia il prompt di installazione del browser
  if (showInstall) {
    return (
      <div className="install-cta install-cta-native">
        <p className="install-cta-text">
          {isMobile() ? (
            <>Aggiungi l’app allo smartphone per averla sempre.<br />A portata di mano.</>
          ) : (
            <>Installa l’app per averla sempre.<br />A portata di mano.</>
          )}
        </p>
        <button type="button" className="install-cta-btn" onClick={handleInstallClick}>
          Installa l’app
        </button>
      </div>
    )
  }

  // Chrome/Edge senza prompt install: nulla (disinstallare visibile solo in standalone).
  if (isChromeOrEdge()) {
    return null
  }

  // iOS/Safari: bottone che apre istruzioni
  if (isIOS()) {
    return (
      <>
        <div className="install-cta install-cta-ios">
          <p className="install-cta-text">Aggiungi l’app alla Home per aprirla come un’app.</p>
          <button type="button" className="install-cta-btn" onClick={handleIOSClick}>
            Aggiungi alla Home
          </button>
        </div>
        {showIOSInstructions && (
          <div className="install-cta-overlay" role="dialog" aria-label="Istruzioni per aggiungere alla Home">
            <div className="install-cta-overlay-content">
              <h3 className="install-cta-overlay-title">Aggiungi alla Home</h3>
              <p className="install-cta-overlay-note">Su iPhone e iPad i passaggi sono gli stessi in Safari e in Chrome.</p>
              <ol className="install-cta-overlay-steps">
                <li>Tap sull’icona <strong>Condivisi</strong> (in basso oppure in alto nella barra).</li>
                <li>Scorri e scegli <strong>«Aggiungi a Home»</strong>.</li>
                <li>Conferma con «Aggiungi».</li>
              </ol>
              <button type="button" className="install-cta-btn" onClick={handleCloseIOSInstructions}>
                Ho capito
              </button>
            </div>
            <button
              type="button"
              className="install-cta-overlay-backdrop"
              onClick={handleCloseIOSInstructions}
              aria-label="Chiudi"
            />
          </div>
        )}
      </>
    )
  }

  // Altri browser: non mostrare nulla (es. Firefox senza supporto)
  return null
}
