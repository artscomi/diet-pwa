"use client";

import { Fragment, type ReactNode } from "react";
import {
  IconChevronRight,
  IconPointer,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconUpload,
  IconDots,
  IconSquarePlus,
} from "@tabler/icons-react";
import Modal from "./Modal";
import "./UninstallInstructionsModal.css";

const STEP_SIZE = 22;

function isAndroid(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/.test(navigator.userAgent);
}

function isEdge(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Edg/.test(navigator.userAgent);
}

/** Su iOS: rileva se il browser è Chrome (CriOS) o Safari. */
function getIOSBrowser(): "safari" | "chrome" | "other" {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) {
    if (/CriOS/.test(ua)) return "chrome";
    if (/Safari/.test(ua) && !/Chrome/.test(ua)) return "safari";
    return "safari"; // default su iOS
  }
  return "other";
}

type NativeVariant =
  | "chrome-desktop"
  | "chrome-android"
  | "edge-desktop"
  | "edge-android";

function getNativeVariant(): NativeVariant {
  if (typeof navigator === "undefined") return "chrome-desktop";
  const android = isAndroid();
  const edge = isEdge();
  if (edge && android) return "edge-android";
  if (edge) return "edge-desktop";
  if (android) return "chrome-android";
  return "chrome-desktop";
}

interface Step {
  icon: ReactNode;
  text: ReactNode;
}

function getNativeSteps(variant: NativeVariant): Step[] {
  const step1 = {
    icon: <IconPointer size={STEP_SIZE} />,
    text: "Clicca il pulsante «Installa» qui sotto per avviare l’installazione",
  };
  switch (variant) {
    case "chrome-desktop":
      return [
        step1,
        {
          icon: <IconDeviceDesktop size={STEP_SIZE} />,
          text: "Troverai l’app nel menu Applicazioni di Chrome o nel Dock",
        },
      ];
    case "chrome-android":
      return [
        step1,
        {
          icon: <IconDeviceMobile size={STEP_SIZE} />,
          text: "Troverai l’app nella schermata Home o nel drawer delle app. Si apre come un’app a parte, senza barra del browser",
        },
      ];
    case "edge-desktop":
      return [
        step1,
        {
          icon: <IconDeviceDesktop size={STEP_SIZE} />,
          text: "Troverai l’app nel menu App di Edge o nel Dock",
        },
      ];
    case "edge-android":
      return [
        step1,
        {
          icon: <IconDeviceMobile size={STEP_SIZE} />,
          text: "Troverai l’app nella schermata Home o nel drawer delle app. Si apre come un’app a parte, senza barra del browser",
        },
      ];
    default:
      return [
        step1,
        {
          icon: <IconDeviceDesktop size={STEP_SIZE} />,
          text: "Troverai l’app nel menu Applicazioni o nel Dock",
        },
      ];
  }
}

/** Sottotitolo modale install: copy adattato a dispositivo e browser. */
function getNativeSubtitle(variant: NativeVariant): string {
  switch (variant) {
    case "chrome-desktop":
      return "Un click sul pulsante «Installa» aprirà una finestra di dialogo di Chrome. Conferma l'installazione, troverai l'app nel menu Applicazioni o nel Dock.";
    case "chrome-android":
      return "Un tap sul pulsante «Installa» aprirà una finestra di dialogo di Chrome. Conferma l'installazione, troverai l’app nella Home o nel drawer delle app; si aprirà come un’app a parte.";
    case "edge-desktop":
      return "Un click sul pulsante «Installa» aprirà il dialogo di Edge. Troverai l’app nel menu App di Edge o nel Dock.";
    case "edge-android":
      return "Un tap sul pulsante «Installa» aprirà il dialogo di Edge. Troverai l’app nella Home o nel drawer delle app; si aprirà come un’app a parte.";
    default:
      return "Un click sul pulsante «Installa» aprirà il dialogo del browser. Troverai l’app nel menu del browser o nel Dock.";
  }
}

/** Installazione da menu browser quando non c’è `beforeinstallprompt` (es. alcune pagine interne). */
function getNativeManualSteps(variant: NativeVariant): Step[] {
  switch (variant) {
    case "chrome-android":
      return [
        {
          icon: <IconDots size={STEP_SIZE} />,
          text: "Apri il menu di Chrome (⋮) in alto a destra",
        },
        {
          icon: <IconSquarePlus size={STEP_SIZE} />,
          text: "Tocca «Installa app» o «Aggiungi a schermata Home» e conferma",
        },
      ];
    case "edge-android":
      return [
        {
          icon: <IconDots size={STEP_SIZE} />,
          text: "Apri il menu di Edge (⋯) in basso o in alto",
        },
        {
          icon: <IconSquarePlus size={STEP_SIZE} />,
          text: "Tocca «Aggiungi a telefono» o «Installa app» e conferma",
        },
      ];
    case "edge-desktop":
      return [
        {
          icon: <IconDots size={STEP_SIZE} />,
          text: "Apri il menu di Edge (⋯) in alto a destra",
        },
        {
          icon: <IconSquarePlus size={STEP_SIZE} />,
          text: "Scegli «App» → «Installa questa pagina come app» (o voce simile)",
        },
      ];
    case "chrome-desktop":
    default:
      return [
        {
          icon: <IconDots size={STEP_SIZE} />,
          text: "Apri il menu di Chrome (⋮) in alto a destra",
        },
        {
          icon: <IconSquarePlus size={STEP_SIZE} />,
          text: "Cerca «Installa PocketDiet…» / «Installa app…». Se non compare: Altri strumenti → Salva e condividi → Installa pagina come app…",
        },
      ];
  }
}

function getNativeManualSubtitle(variant: NativeVariant): string {
  switch (variant) {
    case "chrome-android":
      return "Da questa pagina il browser a volte non mostra il pulsante rapido: puoi installare PocketDiet dal menu di Chrome.";
    case "edge-android":
      return "Da questa pagina Edge a volte non offre il dialogo rapido: installa dal menu del browser.";
    case "edge-desktop":
      return "Da questa pagina Edge può non mostrare il dialogo automatico: usa il menu del browser per installare l’app.";
    case "chrome-desktop":
    default:
      return "Da questa pagina Chrome a volte non mostra il dialogo automatico: installa PocketDiet dal menu ⋮ del browser.";
  }
}

/** Passi per iOS: su iPhone/iPad (Safari e Chrome) non c’è installazione automatica, solo “Aggiungi alla Home”. */
function getIOSSteps(): Step[] {
  const browser = getIOSBrowser();
  const barraLabel =
    browser === "chrome"
      ? "nella barra degli indirizzi di Chrome"
      : browser === "safari"
        ? "in basso nella barra degli strumenti"
        : "in alto nella barra degli indirizzi";
  return [
    {
      icon: <IconUpload size={STEP_SIZE} />,
      text: (
        <>
          Tap sull&apos;icona <IconUpload size={18} style={{ verticalAlign: "middle", marginRight: 2 }} /> Condividi {barraLabel}
        </>
      ),
    },
    {
      icon: <IconDots size={STEP_SIZE} />,
      text: (
        <>
          Clicca sull&apos;icona Altro con i tre puntini <IconDots size={18} style={{ verticalAlign: "middle", marginRight: 2 }} />
        </>
      ),
    },
    {
      icon: <IconSquarePlus size={STEP_SIZE} />,
      text: "Scegli «Aggiungi alla schermata Home»",
    },
  ];
}

export type InstallModalVariant = "native" | "ios";

interface InstallAppModalProps {
  variant: InstallModalVariant;
  onClose: () => void;
  /** Solo per variant="native": chiamato al click su «Installa» */
  onInstall?: () => void | Promise<void>;
  /** false = solo istruzioni dal menu (nessun prompt integrato) */
  nativePromptAvailable?: boolean;
}

export default function InstallAppModal({
  variant,
  onClose,
  onInstall,
  nativePromptAvailable = true,
}: InstallAppModalProps) {
  const isIOSVariant = variant === "ios";
  const nativeVariant = getNativeVariant();
  const nativeManualOnly = variant === "native" && !nativePromptAvailable;
  const steps = isIOSVariant
    ? getIOSSteps()
    : nativeManualOnly
      ? getNativeManualSteps(nativeVariant)
      : getNativeSteps(nativeVariant);

  const iosBrowser = getIOSBrowser();
  const iosSubtitle =
    iosBrowser === "chrome"
      ? "Usa il menu Condividi di Chrome per aggiungere l'app alla Home e aprirla come un'app."
      : iosBrowser === "safari"
        ? "Usa il menu Condividi di Safari per aggiungere l'app alla Home e aprirla come un'app."
        : "Usa il menu Condividi per aggiungere l'app alla Home e aprirla come un'app.";
  const subtitle = isIOSVariant ? (
    <p className="uninstall-modal-subtitle">{iosSubtitle}</p>
  ) : nativeManualOnly ? (
    <p className="uninstall-modal-subtitle">
      {getNativeManualSubtitle(nativeVariant)}
    </p>
  ) : (
    <p className="uninstall-modal-subtitle">
      {getNativeSubtitle(nativeVariant)}
    </p>
  );

  const singlePrimary = isIOSVariant || nativeManualOnly;

  return (
    <Modal
      title={isIOSVariant ? "Aggiungi alla Home" : "Installa l’app"}
      buttonLabel="Annulla"
      onClose={onClose}
      wide
      singlePrimaryButton={singlePrimary}
      primaryLabel={singlePrimary ? "Ho capito" : "Installa"}
      onPrimaryClick={singlePrimary ? onClose : onInstall}
    >
      {subtitle}
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
  );
}
