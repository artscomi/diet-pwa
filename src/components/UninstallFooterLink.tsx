'use client'

import { useState, useEffect } from 'react'
import { isStandalone, getUninstallPlatform } from './InstallAppCTA'
import UninstallInstructionsModal from './UninstallInstructionsModal'
import './InstallAppCTA.css'

/** Link «Vuoi disinstallare l’app?» da mostrare in fondo al footer (solo in standalone). */
export default function UninstallFooterLink() {
  const [showModal, setShowModal] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted || !isStandalone()) return null

  return (
    <>
      <div className="install-cta-uninstall-wrap">
        <button
          type="button"
          className="install-cta-uninstall-btn"
          onClick={() => setShowModal(true)}
        >
          Vuoi disinstallare l’app?
        </button>
      </div>
      {showModal && (
        <UninstallInstructionsModal
          platform={getUninstallPlatform()}
          onClose={() => setShowModal(false)}
          isStandalone={true}
        />
      )}
    </>
  )
}
