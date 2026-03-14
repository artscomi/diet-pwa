'use client'

import { Fragment, type ReactNode } from 'react'
import { IconChevronRight, IconPointer, IconDeviceDesktop, IconDeviceMobile } from '@tabler/icons-react'
import Modal from './Modal'
import './UninstallInstructionsModal.css'

const STEP_SIZE = 22

function isAndroid(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android/.test(navigator.userAgent)
}

function isEdge(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Edg/.test(navigator.userAgent)
}

type InstallVariant = 'chrome-desktop' | 'chrome-android' | 'edge-desktop' | 'edge-android'

function getInstallVariant(): InstallVariant {
  if (typeof navigator === 'undefined') return 'chrome-desktop'
  const android = isAndroid()
  const edge = isEdge()
  if (edge && android) return 'edge-android'
  if (edge) return 'edge-desktop'
  if (android) return 'chrome-android'
  return 'chrome-desktop'
}

interface Step {
  icon: ReactNode
  text: string
}

function getInstallSteps(variant: InstallVariant): Step[] {
  const step1 = { icon: <IconPointer size={STEP_SIZE} />, text: 'Clicca il pulsante «Installa» qui sotto per avviare l’installazione' }
  switch (variant) {
    case 'chrome-desktop':
      return [
        step1,
        { icon: <IconDeviceDesktop size={STEP_SIZE} />, text: 'Troverai l’app nel menu Applicazioni di Chrome o nel Dock' },
      ]
    case 'chrome-android':
      return [
        step1,
        { icon: <IconDeviceMobile size={STEP_SIZE} />, text: 'Troverai l’app nella schermata Home o nel drawer delle app. Si apre come un’app a parte, senza barra del browser' },
      ]
    case 'edge-desktop':
      return [
        step1,
        { icon: <IconDeviceDesktop size={STEP_SIZE} />, text: 'Troverai l’app nel menu App di Edge o nel Dock' },
      ]
    case 'edge-android':
      return [
        step1,
        { icon: <IconDeviceMobile size={STEP_SIZE} />, text: 'Troverai l’app nella schermata Home o nel drawer delle app. Si apre come un’app a parte, senza barra del browser' },
      ]
    default:
      return [step1, { icon: <IconDeviceDesktop size={STEP_SIZE} />, text: 'Troverai l’app nel menu Applicazioni o nel Dock' }]
  }
}

interface InstallAppModalProps {
  onClose: () => void
  onInstall: () => void
}

export default function InstallAppModal({ onClose, onInstall }: InstallAppModalProps) {
  const variant = getInstallVariant()
  const steps = getInstallSteps(variant)

  return (
    <Modal
      title="Installa l’app"
      buttonLabel="Annulla"
      primaryLabel="Installa"
      onPrimaryClick={onInstall}
      onClose={onClose}
      wide
    >
      <div className="uninstall-modal-steps" role="list">
        {steps.map((step, i) => (
          <Fragment key={i}>
            <div className="uninstall-modal-step" role="listitem">
              <span className="uninstall-modal-step-icon" aria-hidden>
                {step.icon}
              </span>
              <span className="uninstall-modal-step-text">{step.text}</span>
            </div>
            {i < steps.length - 1 && (
              <span className="uninstall-modal-arrow" aria-hidden>
                <IconChevronRight size={20} />
              </span>
            )}
          </Fragment>
        ))}
      </div>
    </Modal>
  )
}
