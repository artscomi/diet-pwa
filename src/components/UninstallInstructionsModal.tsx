"use client";

import { Fragment } from "react";
import {
  IconChevronRight,
  IconHandFinger,
  IconTrash,
  IconApps,
  IconPointer,
  IconDots,
  IconCircleCheck,
  IconSettings,
} from "@tabler/icons-react";
import Modal from "./Modal";
import "./UninstallInstructionsModal.css";

export type UninstallPlatform = "ios" | "android" | "chrome" | "edge" | "other";

interface Step {
  icon: React.ReactNode;
  text: string;
}

const STEP_SIZE = 22;

function getSteps(platform: UninstallPlatform, isStandalone: boolean): Step[] {
  switch (platform) {
    case "ios":
      return [
        {
          icon: <IconHandFinger size={STEP_SIZE} />,
          text: "Tieni premuta l’icona dell’app sulla schermata Home",
        },
        { icon: <IconTrash size={STEP_SIZE} />, text: "Tocca «Rimuovi App»" },
        {
          icon: <IconCircleCheck size={STEP_SIZE} />,
          text: "Conferma con «Rimuovi»",
        },
      ];
    case "android":
      return [
        {
          icon: <IconHandFinger size={STEP_SIZE} />,
          text: "Tieni premuta l’icona dell’app",
        },
        { icon: <IconTrash size={STEP_SIZE} />, text: "Tocca «Disinstalla»" },
        {
          icon: <IconSettings size={STEP_SIZE} />,
          text: "Oppure: Impostazioni → App → cerca l’app → Disinstalla",
        },
      ];
    case "chrome":
      return [
        {
          icon: <IconApps size={STEP_SIZE} />,
          text: isStandalone
            ? "Apri Chrome, digita chrome://apps nella barra degli indirizzi e premi Invio"
            : "Clicca sulla CTA «Vai alle app» qui sotto",
        },
        {
          icon: <IconPointer size={STEP_SIZE} />,
          text: "Tasto destro sull’app",
        },
        {
          icon: <IconTrash size={STEP_SIZE} />,
          text: "Clicca «Rimuovi da Chrome»",
        },
      ];
    case "edge":
      return [
        {
          icon: <IconApps size={STEP_SIZE} />,
          text: isStandalone
            ? "Apri Edge, digita edge://apps nella barra degli indirizzi e premi Invio"
            : "Clicca sulla CTA «Vai alle app» qui sotto",
        },
        {
          icon: <IconDots size={STEP_SIZE} />,
          text: "Clicca ⋮ sull’icona dell’app",
        },
        { icon: <IconTrash size={STEP_SIZE} />, text: "Scegli «Disinstalla»" },
      ];
    default:
      return [];
  }
}

interface UninstallInstructionsModalProps {
  platform: UninstallPlatform;
  onClose: () => void;
  /** True = finestra aperta dall’icona app (standalone); false = aperta in un tab del browser. Determina step 1 e pulsanti. */
  isStandalone?: boolean;
}

export default function UninstallInstructionsModal({
  platform,
  onClose,
  isStandalone = false,
}: UninstallInstructionsModalProps) {
  const steps = getSteps(platform, isStandalone);
  const title =
    platform === "other"
      ? "Come disinstallare l’app"
      : "Come disinstallare l’app";
  const isChromeOrEdge = platform === "chrome" || platform === "edge";
  const showVaiAlleAppButton = isChromeOrEdge && !isStandalone;
  const openAppsUrl =
    platform === "chrome"
      ? "chrome://apps"
      : platform === "edge"
        ? "edge://apps"
        : null;

  return (
    <Modal
      title={title}
      buttonLabel="Annulla"
      onClose={onClose}
      wide={platform !== "other"}
      singlePrimaryButton={isStandalone}
      primaryLabel={
        isStandalone
          ? "Ho capito"
          : showVaiAlleAppButton
            ? "Vai alle app"
            : undefined
      }
      onPrimaryClick={
        isStandalone
          ? onClose
          : showVaiAlleAppButton && openAppsUrl
            ? () => window.open(openAppsUrl, "_blank", "noopener,noreferrer")
            : undefined
      }
    >
      {platform === "other" ? (
        <p className="uninstall-modal-fallback">
          Se l’hai aggiunta da Chrome o Edge: menu del browser → Estensioni e
          app installate / Gestisci app → rimuovi l’app. Su Mac dalla Home:
          trascina l’icona fuori dal Dock o da Launchpad.
        </p>
      ) : (
        <>
          <p className="uninstall-modal-subtitle">
            Vuoi usare solo il link dal browser invece dell’icona in Home?
            Nessun problema: puoi disinstallare l’app in questo modo. L’icona in
            Home è comoda per aprirla in un tap, ma la scelta è tua.
          </p>
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
          {!isStandalone && platform === "chrome" && (
            <p className="uninstall-modal-fallback-note">
              Se il pulsante non apre la pagina: apri Chrome, digita{" "}
              <strong>chrome://apps</strong> nella barra degli indirizzi e premi
              Invio.
            </p>
          )}
          {!isStandalone && platform === "edge" && (
            <p className="uninstall-modal-fallback-note">
              Se il pulsante non apre la pagina: apri Edge, digita{" "}
              <strong>edge://apps</strong> nella barra degli indirizzi e premi
              Invio.
            </p>
          )}
        </>
      )}
    </Modal>
  );
}
