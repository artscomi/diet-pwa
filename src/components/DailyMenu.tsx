"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useImperativeHandle,
  forwardRef,
  useRef,
  type Dispatch,
  type SetStateAction,
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

/** Titoli pasto (icone custom in `h4`): stessa dimensione in lettura e modifica. */
const MEAL_CARD_HEADING_ICON_PX = 20;
/** Barra azioni (copia / checkbox / modifica) e voci pannello stato: stessa dimensione. */
const MEAL_CARD_ACTION_ICON_PX = 22;

const MEAL_EDIT_MODAL_TITLE: Record<ReplicateMealSlot, string> = {
  colazione: "Modifica colazione",
  spuntinoMattutino: "Modifica spuntino mattutino",
  pranzo: "Modifica pranzo",
  merenda: "Modifica merenda",
  cena: "Modifica cena",
  duranteLaGiornata: "Modifica durante la giornata",
};

function cloneMenu(m: DailyMenu): DailyMenu {
  return typeof structuredClone === "function"
    ? structuredClone(m)
    : (JSON.parse(JSON.stringify(m)) as DailyMenu);
}

function MealEditModalFields({
  slot,
  draft,
  setDraft,
  dietData,
}: {
  slot: ReplicateMealSlot;
  draft: DailyMenu;
  setDraft: Dispatch<SetStateAction<DailyMenu>>;
  dietData: DietData;
}) {
  switch (slot) {
    case "colazione":
      return (
        <div className="meal-edit-modal-fields">
          <IngredientSelector
            label="Carboidrati"
            options={dietData.colazione.carboidrati}
            selected={draft.colazione?.carboidrati}
            onSelect={(selected) =>
              setDraft((prev) => ({
                ...prev,
                colazione: {
                  ...prev.colazione,
                  carboidrati: selected,
                },
              }))
            }
          />
          <IngredientSelector
            label="Frutta"
            options={dietData.colazione.frutta}
            selected={firstFoodItem(draft.colazione?.frutta)}
            onSelect={(selected) =>
              setDraft((prev) => ({
                ...prev,
                colazione: {
                  ...prev.colazione,
                  frutta: updateFoodAlternativesSlot(
                    prev.colazione?.frutta,
                    selected,
                  ),
                },
              }))
            }
          />
          <IngredientSelector
            label="Proteine"
            options={dietData.colazione.proteine}
            selected={draft.colazione?.proteine}
            onSelect={(selected) =>
              setDraft((prev) => ({
                ...prev,
                colazione: { ...prev.colazione, proteine: selected },
              }))
            }
          />
        </div>
      );
    case "spuntinoMattutino":
      return (
        <div className="meal-edit-modal-fields">
          <IngredientSelector
            label="Seleziona"
            options={dietData.spuntinoMattutino}
            selected={draft.spuntinoMattutino}
            onSelect={(selected) =>
              setDraft((prev) => ({ ...prev, spuntinoMattutino: selected }))
            }
          />
        </div>
      );
    case "pranzo":
      return (
        <div className="meal-edit-modal-fields">
          <IngredientSelector
            label="Carboidrati"
            options={dietData.pranzo.carboidrati}
            selected={draft.pranzo?.carboidrati}
            onSelect={(selected) =>
              setDraft((prev) => ({
                ...prev,
                pranzo: { ...prev.pranzo, carboidrati: selected },
              }))
            }
          />
          <IngredientSelector
            label="Proteine"
            options={dietData.pranzo.proteine}
            selected={draft.pranzo?.proteine}
            onSelect={(selected) =>
              setDraft((prev) => ({
                ...prev,
                pranzo: { ...prev.pranzo, proteine: selected },
              }))
            }
          />
          <IngredientSelector
            label="Verdure"
            options={dietData.pranzo.verdure}
            selected={firstFoodItem(draft.pranzo?.verdure)}
            onSelect={(selected) =>
              setDraft((prev) => ({
                ...prev,
                pranzo: {
                  ...prev.pranzo,
                  verdure: updateFoodAlternativesSlot(
                    prev.pranzo?.verdure,
                    selected,
                  ),
                },
              }))
            }
          />
        </div>
      );
    case "merenda":
      return (
        <div className="meal-edit-modal-fields">
          <IngredientSelector
            label="Seleziona"
            options={dietData.merenda}
            selected={draft.merenda}
            onSelect={(selected) =>
              setDraft((prev) => ({ ...prev, merenda: selected }))
            }
          />
        </div>
      );
    case "cena":
      return (
        <div className="meal-edit-modal-fields">
          <IngredientSelector
            label="Pane"
            options={dietData.cena.pane}
            selected={draft.cena?.pane}
            onSelect={(selected) =>
              setDraft((prev) => ({
                ...prev,
                cena: { ...prev.cena, pane: selected },
              }))
            }
          />
          <IngredientSelector
            label="Verdure"
            options={dietData.cena.verdure}
            selected={firstFoodItem(draft.cena?.verdure)}
            onSelect={(selected) =>
              setDraft((prev) => ({
                ...prev,
                cena: {
                  ...prev.cena,
                  verdure: updateFoodAlternativesSlot(
                    prev.cena?.verdure,
                    selected,
                  ),
                },
              }))
            }
          />
          <IngredientSelector
            label="Proteine"
            options={dietData.cena.proteine}
            selected={draft.cena?.proteine}
            onSelect={(selected) =>
              setDraft((prev) => ({
                ...prev,
                cena: { ...prev.cena, proteine: selected },
              }))
            }
          />
        </div>
      );
    case "duranteLaGiornata":
      if (!dietData.olio?.length) {
        return (
          <p className="meal-edit-modal-fields__empty">
            Nessuna opzione olio configurata per questa dieta.
          </p>
        );
      }
      return (
        <div className="meal-edit-modal-fields">
          <IngredientSelector
            label="Olio"
            options={dietData.olio}
            selected={draft.olio}
            onSelect={(selected) =>
              setDraft((prev) => ({ ...prev, olio: selected }))
            }
          />
        </div>
      );
    default:
      return null;
  }
}

export type DailyMenuHandle = { save: () => void };

interface DailyMenuProps {
  menu: DailyMenu;
  displayDate?: string;
  onSave?: (menu: DailyMenu) => void;
  /** Copia un solo pasto nel menu del giorno calendariale successivo (salvato in locale). */
  onReplicateMealToNextDay?: (slot: ReplicateMealSlot) => void;
  onCancel?: () => void;
  /** Il parent riceve sempre `false` (nessuna modifica “globale” in sospeso: si salva dalla modale pasto). */
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
  editAriaLabel = "Modifica questo pasto",
}: {
  onReplicate?: () => void;
  onEdit: () => void;
  editAriaLabel?: string;
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
            <IconCopyPlus
              size={MEAL_CARD_ACTION_ICON_PX}
              stroke={2}
              aria-hidden
            />
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
            <IconCheckbox
              size={MEAL_CARD_ACTION_ICON_PX}
              stroke={2}
              aria-hidden
            />
          </button>
        ) : null}
        <button
          type="button"
          className="menu-section__edit"
          onClick={onEdit}
          aria-label={editAriaLabel}
        >
          <EditIcon size={MEAL_CARD_ACTION_ICON_PX} />
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
            <IconCheckbox
              size={MEAL_CARD_ACTION_ICON_PX}
              stroke={2}
              aria-hidden
            />
            <span>Completato</span>
          </button>
          <button
            type="button"
            role="radio"
            className={`menu-section__completion-option menu-section__completion-option--skipped${mealCompletion.value === "skipped" ? " menu-section__completion-option--active" : ""}`}
            onClick={() => pick("skipped")}
            aria-checked={mealCompletion.value === "skipped"}
          >
            <IconCheckbox
              size={MEAL_CARD_ACTION_ICON_PX}
              stroke={2}
              aria-hidden
            />
            <span>Saltato</span>
          </button>
          <button
            type="button"
            role="radio"
            className={`menu-section__completion-option menu-section__completion-option--partial${mealCompletion.value === "partial" ? " menu-section__completion-option--active" : ""}`}
            onClick={() => pick("partial")}
            aria-checked={mealCompletion.value === "partial"}
          >
            <IconCheckbox
              size={MEAL_CARD_ACTION_ICON_PX}
              stroke={2}
              aria-hidden
            />
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
      onPendingChange,
      dietData: dietDataProp,
      uploadedFile,
      adherenceDateKey,
    },
    ref,
  ) {
    const dietData = dietDataProp ?? defaultDietData;
    const [editModalSlot, setEditModalSlot] = useState<ReplicateMealSlot | null>(
      null,
    );
    const [editModalDraft, setEditModalDraft] = useState<DailyMenu>(() =>
      cloneMenu(menu),
    );
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

    const openMealEditModal = useCallback((slot: ReplicateMealSlot) => {
      setEditModalDraft(cloneMenu(menu));
      setEditModalSlot(slot);
    }, [menu]);

    const closeMealEditModal = useCallback(() => {
      setEditModalSlot(null);
    }, []);

    const saveMealEditModal = useCallback(() => {
      if (onSave) onSave(editModalDraft);
      setEditModalSlot(null);
    }, [onSave, editModalDraft]);

    useImperativeHandle(
      ref,
      () => ({
        save: () => {
          /* Salvataggio da modale pasto (Salva in modale); nessun flush globale. */
        },
      }),
      [],
    );

    useEffect(() => {
      onPendingChange?.(false);
    }, [onPendingChange]);

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
              {mealStatusDateKey ? (
                <MealCompletionSmile percent={mealCompletionPercent} />
              ) : null}
              {uploadedFile ? (
                <button
                  type="button"
                  className="menu-action-btn preview"
                  onClick={() => setPreviewModalOpen(true)}
                  aria-label="Apri file caricato"
                >
                  <ListIcon size={16} />
                  File caricato
                </button>
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

        {editModalSlot ? (
          <Modal
            title={MEAL_EDIT_MODAL_TITLE[editModalSlot]}
            onClose={closeMealEditModal}
            buttonLabel="Annulla"
            primaryLabel="Salva"
            onPrimaryClick={saveMealEditModal}
            wide
          >
            <MealEditModalFields
              slot={editModalSlot}
              draft={editModalDraft}
              setDraft={setEditModalDraft}
              dietData={dietData}
            />
          </Modal>
        ) : null}

        <div className="menu-content">
          <div className="menu-section">
            <div className="menu-section__head">
              <h4>
                <SunIcon
                  size={MEAL_CARD_HEADING_ICON_PX}
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
              onEdit={() => openMealEditModal("colazione")}
              editAriaLabel={MEAL_EDIT_MODAL_TITLE.colazione}
              mealCompletion={mealCompletionFor("colazione")}
            />
          </div>

          {menu.spuntinoMattutino && (
            <div className="menu-section">
              <div className="menu-section__head">
                <h4>
                  <PeanutIcon
                    size={MEAL_CARD_HEADING_ICON_PX}
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
                onEdit={() => openMealEditModal("spuntinoMattutino")}
                editAriaLabel={MEAL_EDIT_MODAL_TITLE.spuntinoMattutino}
                mealCompletion={mealCompletionFor("spuntinoMattutino")}
              />
            </div>
          )}

          <div className="menu-section">
            <div className="menu-section__head">
              <h4>
                <UtensilsIcon
                  size={MEAL_CARD_HEADING_ICON_PX}
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
              onEdit={() => openMealEditModal("pranzo")}
              editAriaLabel={MEAL_EDIT_MODAL_TITLE.pranzo}
              mealCompletion={mealCompletionFor("pranzo")}
            />
          </div>

          {menu.merenda && (
            <div className="menu-section">
              <div className="menu-section__head">
                <h4>
                  <PeanutIcon
                    size={MEAL_CARD_HEADING_ICON_PX}
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
                onEdit={() => openMealEditModal("merenda")}
                editAriaLabel={MEAL_EDIT_MODAL_TITLE.merenda}
                mealCompletion={mealCompletionFor("merenda")}
              />
            </div>
          )}

          <div className="menu-section">
            <div className="menu-section__head">
              <h4>
                <MoonIcon
                  size={MEAL_CARD_HEADING_ICON_PX}
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
              onEdit={() => openMealEditModal("cena")}
              editAriaLabel={MEAL_EDIT_MODAL_TITLE.cena}
              mealCompletion={mealCompletionFor("cena")}
            />
          </div>

          {(menu.duranteLaGiornata || menu.olio) && (
            <div className="menu-section">
              <div className="menu-section__head">
                <h4>
                  <DropletIcon
                    size={MEAL_CARD_HEADING_ICON_PX}
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
                onEdit={() => openMealEditModal("duranteLaGiornata")}
                editAriaLabel={MEAL_EDIT_MODAL_TITLE.duranteLaGiornata}
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
