"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useImperativeHandle,
  forwardRef,
  useRef,
} from "react";
import Image from "next/image";
import { dietData as defaultDietData } from "@/data/dietData";
import IngredientSelector from "./IngredientSelector";
import {
  SunIcon,
  UtensilsIcon,
  MoonIcon,
  PeanutIcon,
  DropletIcon,
  TimesIcon,
  EditIcon,
  ListIcon,
} from "./Icons";
import Modal from "./Modal";
import type {
  DailyMenu,
  DietData,
  FoodItemOrAlternatives,
  UploadedFileInfo,
} from "@/types/diet";
import {
  firstFoodItem,
  updateFoodAlternativesSlot,
} from "@/utils/foodAlternatives";
import type { ReplicateMealSlot } from "@/utils/replicateMeal";
import type {
  MealCompletionMap,
  MealCompletionStatus,
} from "@/utils/mealCompletionStatus";
import {
  loadMealCompletionMap,
  saveMealCompletionMap,
} from "@/utils/mealCompletionStatus";
import {
  computeDailyMealCompletionPercent,
  hasAnyMealCompletionForDay,
} from "@/utils/mealCompletionScore";
import {
  ADHERENCE_SCORES_CLEARED_EVENT,
  removeAdherenceScore,
  setAdherenceScore,
} from "@/utils/dietAdherenceScores";
import {
  IconCheckbox,
  IconCopyPlus,
  IconMoodCry,
  IconMoodHappy,
  IconMoodNeutral,
  IconMoodSad2,
  IconMoodSmile,
} from "@tabler/icons-react";
import "./DailyMenu.css";

const MEAL_SLOT_GROUP_LABEL: Record<ReplicateMealSlot, string> = {
  colazione: "Stato colazione",
  spuntinoMattutino: "Stato spuntino mattutino",
  pranzo: "Stato pranzo",
  merenda: "Stato merenda",
  cena: "Stato cena",
  duranteLaGiornata: "Stato durante la giornata",
};

export type DailyMenuHandle = { save: () => void };

interface DailyMenuProps {
  menu: DailyMenu;
  displayDate?: string;
  onSave?: (menu: DailyMenu) => void;
  /** Copia un solo pasto nel menu del giorno calendariale successivo (salvato in locale). */
  onReplicateMealToNextDay?: (slot: ReplicateMealSlot) => void;
  onCancel?: () => void;
  /** True mentre il menu è in modalità modifica (CTA sticky → Salva). */
  onPendingChange?: (pending: boolean) => void;
  dietData?: DietData;
  /** Anteprima del file caricato (solo se dieta da upload) */
  uploadedFile?: UploadedFileInfo | null;
  /** Chiave giorno (`Date.toDateString()`) per stati pasti e report (completamento %) */
  adherenceDateKey?: string;
}

/** Vista lettura: una sola riga (prima alternativa); le altre restano nel menu a tendina in modifica. */
function formatFood(
  food: FoodItemOrAlternatives | null | undefined,
): string | null {
  const item = firstFoodItem(food);
  if (!item) return null;
  return `${item.name} (${item.quantity} ${item.unit})`;
}

function MealCompletionSmile({ percent }: { percent: number }) {
  const tier =
    percent >= 80
      ? "high"
      : percent >= 60
        ? "good"
        : percent >= 40
          ? "mid"
          : percent >= 20
            ? "low"
            : "verylow";
  const Icon =
    percent >= 80
      ? IconMoodHappy
      : percent >= 60
        ? IconMoodSmile
        : percent >= 40
          ? IconMoodNeutral
          : percent >= 20
            ? IconMoodSad2
            : IconMoodCry;
  return (
    <span
      className={`menu-completion-smile menu-completion-smile--${tier}`}
      title={`Completamento pasti: ${percent}%`}
      aria-label={`Completamento pasti: ${percent} per cento`}
    >
      <Icon size={26} stroke={1.75} aria-hidden />
    </span>
  );
}

function MenuSectionHeadActions({
  onReplicate,
  onEdit,
  mealCompletion,
}: {
  onReplicate?: () => void;
  onEdit: () => void;
  mealCompletion?: {
    slot: ReplicateMealSlot;
    value: MealCompletionStatus | undefined;
    onChange: (next: MealCompletionStatus | null) => void;
  };
}) {
  const [panelOpen, setPanelOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!panelOpen) return;
    const close = (e: MouseEvent | TouchEvent) => {
      const node = e.target as Node;
      if (wrapRef.current && !wrapRef.current.contains(node)) {
        setPanelOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanelOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("touchstart", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("touchstart", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [panelOpen]);

  const pick = (s: MealCompletionStatus) => {
    if (!mealCompletion) return;
    mealCompletion.onChange(mealCompletion.value === s ? null : s);
    setPanelOpen(false);
  };

  const triggerStatusClass =
    mealCompletion?.value === "completed"
      ? " menu-section__completion-trigger--completed"
      : mealCompletion?.value === "skipped"
        ? " menu-section__completion-trigger--skipped"
        : mealCompletion?.value === "partial"
          ? " menu-section__completion-trigger--partial"
          : "";

  return (
    <div className="menu-section__actions-wrap" ref={wrapRef}>
      <div className="menu-section__actions">
        {onReplicate ? (
          <button
            type="button"
            className="menu-section__replicate"
            onClick={onReplicate}
            title="Copia nel giorno successivo"
            aria-label="Copia questo pasto nel giorno successivo"
          >
            <IconCopyPlus size={24} stroke={2} aria-hidden />
          </button>
        ) : null}
        {mealCompletion ? (
          <button
            type="button"
            className={`menu-section__completion-trigger${triggerStatusClass}${panelOpen ? " menu-section__completion-trigger--open" : ""}`}
            onClick={() => setPanelOpen((o) => !o)}
            aria-expanded={panelOpen}
            aria-haspopup="true"
            aria-label={MEAL_SLOT_GROUP_LABEL[mealCompletion.slot]}
            title="Stato pasto"
          >
            <IconCheckbox size={24} stroke={2} aria-hidden />
          </button>
        ) : null}
        <button
          type="button"
          className="menu-section__edit"
          onClick={onEdit}
          aria-label="Modifica il menu del giorno"
        >
          <EditIcon size={24} />
        </button>
      </div>
      {panelOpen && mealCompletion ? (
        <div
          className="menu-section__completion-panel"
          role="radiogroup"
          aria-label={MEAL_SLOT_GROUP_LABEL[mealCompletion.slot]}
        >
          <button
            type="button"
            role="radio"
            className={`menu-section__completion-option menu-section__completion-option--completed${mealCompletion.value === "completed" ? " menu-section__completion-option--active" : ""}`}
            onClick={() => pick("completed")}
            aria-checked={mealCompletion.value === "completed"}
          >
            <IconCheckbox size={20} stroke={2} aria-hidden />
            <span>Completato</span>
          </button>
          <button
            type="button"
            role="radio"
            className={`menu-section__completion-option menu-section__completion-option--skipped${mealCompletion.value === "skipped" ? " menu-section__completion-option--active" : ""}`}
            onClick={() => pick("skipped")}
            aria-checked={mealCompletion.value === "skipped"}
          >
            <IconCheckbox size={20} stroke={2} aria-hidden />
            <span>Saltato</span>
          </button>
          <button
            type="button"
            role="radio"
            className={`menu-section__completion-option menu-section__completion-option--partial${mealCompletion.value === "partial" ? " menu-section__completion-option--active" : ""}`}
            onClick={() => pick("partial")}
            aria-checked={mealCompletion.value === "partial"}
          >
            <IconCheckbox size={20} stroke={2} aria-hidden />
            <span>In parte</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

const DailyMenuComponent = forwardRef<DailyMenuHandle, DailyMenuProps>(
  function DailyMenuComponent(
    {
      menu,
      displayDate,
      onSave,
      onReplicateMealToNextDay,
      onCancel,
      onPendingChange,
      dietData: dietDataProp,
      uploadedFile,
      adherenceDateKey,
    },
    ref,
  ) {
    const dietData = dietDataProp ?? defaultDietData;
    const [isEditing, setIsEditing] = useState(false);
    const [editedMenu, setEditedMenu] = useState<DailyMenu>(menu);
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const mealStatusDateKey = adherenceDateKey ?? "";
    const [mealCompletionMap, setMealCompletionMap] =
      useState<MealCompletionMap>({});

    useEffect(() => {
      if (!mealStatusDateKey) {
        setMealCompletionMap({});
        return;
      }
      setMealCompletionMap(loadMealCompletionMap(mealStatusDateKey));
    }, [mealStatusDateKey]);

    const updateMealStatus = useCallback(
      (slot: ReplicateMealSlot, next: MealCompletionStatus | null) => {
        if (!mealStatusDateKey) return;
        setMealCompletionMap((prev) => {
          const draft: MealCompletionMap = { ...prev };
          if (next === null) {
            delete draft[slot];
          } else {
            draft[slot] = next;
          }
          saveMealCompletionMap(mealStatusDateKey, draft);
          return draft;
        });
      },
      [mealStatusDateKey],
    );

    const mealCompletionFor = useCallback(
      (slot: ReplicateMealSlot) =>
        mealStatusDateKey
          ? {
              slot,
              value: mealCompletionMap[slot],
              onChange: (n: MealCompletionStatus | null) =>
                updateMealStatus(slot, n),
            }
          : undefined,
      [mealStatusDateKey, mealCompletionMap, updateMealStatus],
    );

    const mealCompletionPercent = useMemo(
      () =>
        mealStatusDateKey
          ? computeDailyMealCompletionPercent(menu, mealCompletionMap)
          : 0,
      [mealStatusDateKey, menu, mealCompletionMap],
    );

    const shouldPersistAdherence = useMemo(
      () =>
        Boolean(mealStatusDateKey) &&
        hasAnyMealCompletionForDay(menu, mealCompletionMap),
      [mealStatusDateKey, menu, mealCompletionMap],
    );

    useEffect(() => {
      if (!mealStatusDateKey) return;
      if (!shouldPersistAdherence) {
        removeAdherenceScore(mealStatusDateKey);
        return;
      }
      setAdherenceScore(mealStatusDateKey, mealCompletionPercent);
    }, [
      mealStatusDateKey,
      shouldPersistAdherence,
      mealCompletionPercent,
    ]);

    useEffect(() => {
      if (!mealStatusDateKey) return;
      const onScoresCleared = () => {
        if (!hasAnyMealCompletionForDay(menu, mealCompletionMap)) {
          removeAdherenceScore(mealStatusDateKey);
          return;
        }
        setAdherenceScore(
          mealStatusDateKey,
          computeDailyMealCompletionPercent(menu, mealCompletionMap),
        );
      };
      window.addEventListener(ADHERENCE_SCORES_CLEARED_EVENT, onScoresCleared);
      return () =>
        window.removeEventListener(
          ADHERENCE_SCORES_CLEARED_EVENT,
          onScoresCleared,
        );
    }, [mealStatusDateKey, menu, mealCompletionMap]);

    useEffect(() => {
      if (!isEditing) setEditedMenu(menu);
    }, [menu, isEditing]);

    const commitSave = useCallback(() => {
      if (onSave) {
        onSave(editedMenu);
      }
      setIsEditing(false);
    }, [editedMenu, onSave]);

    useImperativeHandle(ref, () => ({ save: commitSave }), [commitSave]);

    useEffect(() => {
      onPendingChange?.(isEditing);
    }, [isEditing, onPendingChange]);

    const handleCancel = () => {
      setEditedMenu(menu);
      setIsEditing(false);
      if (onCancel) {
        onCancel();
      }
    };

    if (isEditing) {
      return (
        <div className="daily-menu-card editing">
          <div className="menu-header">
            <div className="menu-actions">
              <button className="menu-action-btn cancel" onClick={handleCancel}>
                <TimesIcon
                  size={16}
                  style={{
                    marginRight: "0.5rem",
                    verticalAlign: "middle",
                    display: "inline-block",
                  }}
                />
                Annulla
              </button>
            </div>
          </div>

          <div className="menu-content editing">
            <div className="menu-section">
              <h4>
                <SunIcon
                  size={18}
                  style={{
                    marginRight: "0.5rem",
                    verticalAlign: "middle",
                    display: "inline-block",
                  }}
                />
                Colazione
              </h4>
              <IngredientSelector
                label="Carboidrati"
                options={dietData.colazione.carboidrati}
                selected={editedMenu.colazione?.carboidrati}
                onSelect={(selected) =>
                  setEditedMenu({
                    ...editedMenu,
                    colazione: {
                      ...editedMenu.colazione,
                      carboidrati: selected,
                    },
                  })
                }
              />
              <IngredientSelector
                label="Frutta"
                options={dietData.colazione.frutta}
                selected={firstFoodItem(editedMenu.colazione?.frutta)}
                onSelect={(selected) =>
                  setEditedMenu({
                    ...editedMenu,
                    colazione: {
                      ...editedMenu.colazione,
                      frutta: updateFoodAlternativesSlot(
                        editedMenu.colazione?.frutta,
                        selected,
                      ),
                    },
                  })
                }
              />
              <IngredientSelector
                label="Proteine"
                options={dietData.colazione.proteine}
                selected={editedMenu.colazione?.proteine}
                onSelect={(selected) =>
                  setEditedMenu({
                    ...editedMenu,
                    colazione: { ...editedMenu.colazione, proteine: selected },
                  })
                }
              />
            </div>

            <div className="menu-section">
              <h4>
                <PeanutIcon
                  size={18}
                  style={{
                    marginRight: "0.5rem",
                    verticalAlign: "middle",
                    display: "inline-block",
                  }}
                />
                Spuntino Mattutino
              </h4>
              <IngredientSelector
                label="Seleziona"
                options={dietData.spuntinoMattutino}
                selected={editedMenu.spuntinoMattutino}
                onSelect={(selected) =>
                  setEditedMenu({ ...editedMenu, spuntinoMattutino: selected })
                }
              />
            </div>

            <div className="menu-section">
              <h4>
                <UtensilsIcon
                  size={18}
                  style={{
                    marginRight: "0.5rem",
                    verticalAlign: "middle",
                    display: "inline-block",
                  }}
                />
                Pranzo
              </h4>
              <IngredientSelector
                label="Carboidrati"
                options={dietData.pranzo.carboidrati}
                selected={editedMenu.pranzo?.carboidrati}
                onSelect={(selected) =>
                  setEditedMenu({
                    ...editedMenu,
                    pranzo: { ...editedMenu.pranzo, carboidrati: selected },
                  })
                }
              />
              <IngredientSelector
                label="Proteine"
                options={dietData.pranzo.proteine}
                selected={editedMenu.pranzo?.proteine}
                onSelect={(selected) =>
                  setEditedMenu({
                    ...editedMenu,
                    pranzo: { ...editedMenu.pranzo, proteine: selected },
                  })
                }
              />
              <IngredientSelector
                label="Verdure"
                options={dietData.pranzo.verdure}
                selected={firstFoodItem(editedMenu.pranzo?.verdure)}
                onSelect={(selected) =>
                  setEditedMenu({
                    ...editedMenu,
                    pranzo: {
                      ...editedMenu.pranzo,
                      verdure: updateFoodAlternativesSlot(
                        editedMenu.pranzo?.verdure,
                        selected,
                      ),
                    },
                  })
                }
              />
            </div>

            <div className="menu-section">
              <h4>
                <PeanutIcon
                  size={18}
                  style={{
                    marginRight: "0.5rem",
                    verticalAlign: "middle",
                    display: "inline-block",
                  }}
                />
                Merenda
              </h4>
              <IngredientSelector
                label="Seleziona"
                options={dietData.merenda}
                selected={editedMenu.merenda}
                onSelect={(selected) =>
                  setEditedMenu({ ...editedMenu, merenda: selected })
                }
              />
            </div>

            <div className="menu-section">
              <h4>
                <MoonIcon
                  size={18}
                  style={{
                    marginRight: "0.5rem",
                    verticalAlign: "middle",
                    display: "inline-block",
                  }}
                />
                Cena
              </h4>
              <IngredientSelector
                label="Pane"
                options={dietData.cena.pane}
                selected={editedMenu.cena?.pane}
                onSelect={(selected) =>
                  setEditedMenu({
                    ...editedMenu,
                    cena: { ...editedMenu.cena, pane: selected },
                  })
                }
              />
              <IngredientSelector
                label="Verdure"
                options={dietData.cena.verdure}
                selected={firstFoodItem(editedMenu.cena?.verdure)}
                onSelect={(selected) =>
                  setEditedMenu({
                    ...editedMenu,
                    cena: {
                      ...editedMenu.cena,
                      verdure: updateFoodAlternativesSlot(
                        editedMenu.cena?.verdure,
                        selected,
                      ),
                    },
                  })
                }
              />
              <IngredientSelector
                label="Proteine"
                options={dietData.cena.proteine}
                selected={editedMenu.cena?.proteine}
                onSelect={(selected) =>
                  setEditedMenu({
                    ...editedMenu,
                    cena: { ...editedMenu.cena, proteine: selected },
                  })
                }
              />
            </div>

            {dietData.olio && dietData.olio.length > 0 && (
              <div className="menu-section">
                <h4>
                  <DropletIcon
                    size={18}
                    style={{
                      marginRight: "0.5rem",
                      verticalAlign: "middle",
                      display: "inline-block",
                    }}
                  />
                  Durante la giornata
                </h4>
                <IngredientSelector
                  label="Olio"
                  options={dietData.olio}
                  selected={editedMenu.olio}
                  onSelect={(selected) =>
                    setEditedMenu({ ...editedMenu, olio: selected })
                  }
                />
              </div>
            )}
          </div>
        </div>
      );
    }

    const renderFilePreviewContent = () => {
      if (!uploadedFile) return null;
      const { name, mimeType, previewDataUrl } = uploadedFile;
      return (
        <div
          className="menu-file-preview menu-file-preview--modal"
          role="region"
          aria-label="File caricato"
        >
          <p className="menu-file-preview-title">{name}</p>
          {previewDataUrl ? (
            <>
              {mimeType.startsWith("image/") && (
                <div className="menu-file-preview-media">
                  <Image
                    src={previewDataUrl}
                    alt={`Anteprima ${name}`}
                    className="menu-file-preview-img"
                    width={600}
                    height={400}
                    unoptimized
                    style={{
                      width: "auto",
                      height: "auto",
                      objectFit: "contain",
                    }}
                  />
                </div>
              )}
              {mimeType === "application/pdf" && (
                <div className="menu-file-preview-media">
                  <iframe
                    src={previewDataUrl}
                    title={`Anteprima ${name}`}
                    className="menu-file-preview-iframe"
                  />
                </div>
              )}
              {mimeType === "text/plain" &&
                (() => {
                  try {
                    const base64 = previewDataUrl.split(",")[1];
                    const text = base64 ? atob(base64) : "";
                    return <pre className="menu-file-preview-text">{text}</pre>;
                  } catch {
                    return (
                      <p className="menu-file-preview-fallback">
                        Anteprima testo non disponibile.
                      </p>
                    );
                  }
                })()}
              {!mimeType.startsWith("image/") &&
                mimeType !== "application/pdf" &&
                mimeType !== "text/plain" &&
                previewDataUrl && (
                  <div className="menu-file-preview-media">
                    <iframe
                      src={previewDataUrl}
                      title={`Anteprima ${name}`}
                      className="menu-file-preview-iframe"
                    />
                  </div>
                )}
            </>
          ) : (
            <p className="menu-file-preview-fallback">
              Anteprima non disponibile per file grandi.
            </p>
          )}
        </div>
      );
    };

    return (
      <div className="daily-menu-card">
        <div className="menu-header">
          {displayDate && (
            <span className="menu-header__date">{displayDate}</span>
          )}
          {uploadedFile || mealStatusDateKey ? (
            <div className="menu-header-actions">
              {uploadedFile ? (
                <button
                  type="button"
                  className="menu-action-btn preview"
                  onClick={() => setPreviewModalOpen(true)}
                  aria-label="Apri file caricato"
                >
                  <ListIcon
                    size={16}
                    style={{
                      marginRight: "0.5rem",
                      verticalAlign: "middle",
                      display: "inline-block",
                    }}
                  />
                  File caricato
                </button>
              ) : null}
              {mealStatusDateKey ? (
                <MealCompletionSmile percent={mealCompletionPercent} />
              ) : null}
            </div>
          ) : null}
        </div>

        {previewModalOpen && uploadedFile && (
          <Modal
            title="File caricato"
            onClose={() => setPreviewModalOpen(false)}
            buttonLabel="Chiudi"
            wide
            documentWide={
              uploadedFile.mimeType === "application/pdf" ||
              uploadedFile.mimeType === "text/plain"
            }
          >
            {renderFilePreviewContent()}
          </Modal>
        )}

        <div className="menu-content">
          <div className="menu-section">
            <div className="menu-section__head">
              <h4>
                <SunIcon
                  size={18}
                  style={{
                    marginRight: "0.5rem",
                    verticalAlign: "middle",
                    display: "inline-block",
                  }}
                />
                Colazione
              </h4>
            </div>
            {menu.colazione?.carboidrati && (
              <p>
                <strong>Carboidrati:</strong>{" "}
                {formatFood(menu.colazione.carboidrati)}
              </p>
            )}
            {menu.colazione?.frutta && (
              <p>
                <strong>Frutta:</strong> {formatFood(menu.colazione.frutta)}
              </p>
            )}
            {menu.colazione?.proteine && (
              <p>
                <strong>Proteine:</strong> {formatFood(menu.colazione.proteine)}
              </p>
            )}
            <MenuSectionHeadActions
              onReplicate={
                onReplicateMealToNextDay
                  ? () => onReplicateMealToNextDay("colazione")
                  : undefined
              }
              onEdit={() => setIsEditing(true)}
              mealCompletion={mealCompletionFor("colazione")}
            />
          </div>

          {menu.spuntinoMattutino && (
            <div className="menu-section">
              <div className="menu-section__head">
                <h4>
                  <PeanutIcon
                    size={18}
                    style={{
                      marginRight: "0.5rem",
                      verticalAlign: "middle",
                      display: "inline-block",
                    }}
                  />
                  Spuntino Mattutino
                </h4>
              </div>
              <p>{formatFood(menu.spuntinoMattutino)}</p>
              <MenuSectionHeadActions
                onReplicate={
                  onReplicateMealToNextDay
                    ? () => onReplicateMealToNextDay("spuntinoMattutino")
                    : undefined
                }
                onEdit={() => setIsEditing(true)}
                mealCompletion={mealCompletionFor("spuntinoMattutino")}
              />
            </div>
          )}

          <div className="menu-section">
            <div className="menu-section__head">
              <h4>
                <UtensilsIcon
                  size={18}
                  style={{
                    marginRight: "0.5rem",
                    verticalAlign: "middle",
                    display: "inline-block",
                  }}
                />
                Pranzo
              </h4>
            </div>
            {menu.pranzo?.carboidrati && (
              <p>
                <strong>Carboidrati:</strong>{" "}
                {formatFood(menu.pranzo.carboidrati)}
              </p>
            )}
            {menu.pranzo?.proteine && (
              <p>
                <strong>Proteine:</strong> {formatFood(menu.pranzo.proteine)}
              </p>
            )}
            {menu.pranzo?.verdure && (
              <p>
                <strong>Verdure:</strong> {formatFood(menu.pranzo.verdure)}
              </p>
            )}
            <MenuSectionHeadActions
              onReplicate={
                onReplicateMealToNextDay
                  ? () => onReplicateMealToNextDay("pranzo")
                  : undefined
              }
              onEdit={() => setIsEditing(true)}
              mealCompletion={mealCompletionFor("pranzo")}
            />
          </div>

          {menu.merenda && (
            <div className="menu-section">
              <div className="menu-section__head">
                <h4>
                  <PeanutIcon
                    size={18}
                    style={{
                      marginRight: "0.5rem",
                      verticalAlign: "middle",
                      display: "inline-block",
                    }}
                  />
                  Merenda
                </h4>
              </div>
              <p>{formatFood(menu.merenda)}</p>
              <MenuSectionHeadActions
                onReplicate={
                  onReplicateMealToNextDay
                    ? () => onReplicateMealToNextDay("merenda")
                    : undefined
                }
                onEdit={() => setIsEditing(true)}
                mealCompletion={mealCompletionFor("merenda")}
              />
            </div>
          )}

          <div className="menu-section">
            <div className="menu-section__head">
              <h4>
                <MoonIcon
                  size={18}
                  style={{
                    marginRight: "0.5rem",
                    verticalAlign: "middle",
                    display: "inline-block",
                  }}
                />
                Cena
              </h4>
            </div>
            {menu.cena?.pane && (
              <p>
                <strong>Pane:</strong> {formatFood(menu.cena.pane)}
              </p>
            )}
            {menu.cena?.verdure && (
              <p>
                <strong>Verdure:</strong> {formatFood(menu.cena.verdure)}
              </p>
            )}
            {menu.cena?.proteine && (
              <p>
                <strong>Proteine:</strong> {formatFood(menu.cena.proteine)}
              </p>
            )}
            <MenuSectionHeadActions
              onReplicate={
                onReplicateMealToNextDay
                  ? () => onReplicateMealToNextDay("cena")
                  : undefined
              }
              onEdit={() => setIsEditing(true)}
              mealCompletion={mealCompletionFor("cena")}
            />
          </div>

          {(menu.duranteLaGiornata || menu.olio) && (
            <div className="menu-section">
              <div className="menu-section__head">
                <h4>
                  <DropletIcon
                    size={18}
                    style={{
                      marginRight: "0.5rem",
                      verticalAlign: "middle",
                      display: "inline-block",
                    }}
                  />
                  Durante la giornata
                </h4>
              </div>
              {menu.duranteLaGiornata && (
                <p className="menu-notes">{menu.duranteLaGiornata}</p>
              )}
              {menu.olio && <p>{formatFood(menu.olio)}</p>}
              <MenuSectionHeadActions
                onReplicate={
                  onReplicateMealToNextDay
                    ? () => onReplicateMealToNextDay("duranteLaGiornata")
                    : undefined
                }
                onEdit={() => setIsEditing(true)}
                mealCompletion={mealCompletionFor("duranteLaGiornata")}
              />
            </div>
          )}
        </div>
      </div>
    );
  },
);

export default DailyMenuComponent;
