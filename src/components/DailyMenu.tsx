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
import { dietData as defaultDietData } from "@/data/dietData";
import IngredientSelector from "./IngredientSelector";
import { SunIcon, UtensilsIcon, MoonIcon, PeanutIcon, EditIcon } from "./Icons";
import Modal from "./Modal";
import type {
  DailyMenu,
  DietData,
  FoodItem,
  FoodItemOrAlternatives,
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
import { trackOnce, trackOncePerDay } from "@/utils/productMetrics";
import "./DailyMenu.css";

const MEAL_SLOT_GROUP_LABEL: Record<ReplicateMealSlot, string> = {
  colazione: "Stato colazione",
  spuntinoMattutino: "Stato spuntino mattutino",
  pranzo: "Stato pranzo",
  merenda: "Stato merenda",
  cena: "Stato cena",
  duranteLaGiornata: "Durante la giornata",
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
      return (
        <p className="meal-edit-modal-fields__empty">
          Modifica note e olio direttamente nella sezione &quot;Durante la
          giornata&quot; sotto i pasti.
        </p>
      );
    default:
      return null;
  }
}

export type DailyMenuHandle = { save: () => void };

interface DailyMenuProps {
  menu: DailyMenu;
  onSave?: (menu: DailyMenu) => void;
  /** Copia un solo pasto nel menu del giorno calendariale successivo (salvato in locale). */
  onReplicateMealToNextDay?: (slot: ReplicateMealSlot) => void;
  onCancel?: () => void;
  /** Il parent riceve sempre `false` (nessuna modifica “globale” in sospeso: si salva dalla modale pasto). */
  onPendingChange?: (pending: boolean) => void;
  dietData?: DietData;
  /** Chiave giorno (`Date.toDateString()`) per stati pasti e report (completamento %) */
  adherenceDateKey?: string;
  /** Chiamato quando l'utente segna un pasto; `first` = primo check-in in assoluto. */
  onMealCheckIn?: (info: { first: boolean }) => void;
}

/** Ordine dei pasti nella giornata e ora (decimale) da cui il pasto è "il prossimo". */
const MEAL_TIME_SLOTS: { slot: ReplicateMealSlot; from: number }[] = [
  { slot: "colazione", from: 0 },
  { slot: "spuntinoMattutino", from: 10 },
  { slot: "pranzo", from: 11.5 },
  { slot: "merenda", from: 15.5 },
  { slot: "cena", from: 18 },
];

/**
 * Il pasto da evidenziare: il primo pasto previsto, a partire da quello dell'ora
 * attuale, che non è ancora stato segnato. `null` se la giornata è chiusa.
 */
function getCurrentMealSlot(
  menu: DailyMenu,
  map: MealCompletionMap,
  now: Date,
): { slot: ReplicateMealSlot; isNow: boolean } | null {
  const hour = now.getHours() + now.getMinutes() / 60;
  const present = MEAL_TIME_SLOTS.filter(({ slot }) =>
    slot === "spuntinoMattutino"
      ? Boolean(menu.spuntinoMattutino)
      : slot === "merenda"
        ? Boolean(menu.merenda)
        : true,
  );
  let startIdx = 0;
  present.forEach((m, i) => {
    if (hour >= m.from) startIdx = i;
  });
  for (let i = startIdx; i < present.length; i++) {
    if (map[present[i].slot] === undefined) {
      return { slot: present[i].slot, isNow: i === startIdx };
    }
  }
  return null;
}

/** Vista lettura: una sola riga (prima alternativa); le altre restano nel menu a tendina in modifica. */
function formatFood(
  food: FoodItemOrAlternatives | null | undefined,
): string | null {
  const item = firstFoodItem(food);
  if (!item) return null;
  if (!item.quantity) return `${item.name} (q.b.)`;
  return `${item.name} (${item.quantity} ${item.unit})`;
}

/** Testo unico note + olio (olio in cima se presente nel menu). */
function buildDuranteCombinedDraft(menu: DailyMenu): string {
  const parts: string[] = [];
  if (menu.olio) {
    const line = formatFood(menu.olio);
    if (line) parts.push(line);
  }
  if (menu.duranteLaGiornata?.trim()) parts.push(menu.duranteLaGiornata.trim());
  return parts.join("\n\n");
}

/**
 * Se la dieta ha opzioni olio, la prima riga o il primo blocco (separato da riga vuota)
 * che coincide con `formatFood(opzione)` diventa `menu.olio`; il resto sono le note.
 */
function parseDuranteCombinedSave(
  raw: string,
  olioOptions: FoodItem[],
): { duranteLaGiornata: string | undefined; olio: FoodItem | undefined } {
  const t = raw.trim();
  if (!t) return { duranteLaGiornata: undefined, olio: undefined };

  const segments = t
    .split(/\n\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const firstSeg = segments[0];
  const matchedSeg = olioOptions.find((o) => formatFood(o) === firstSeg);
  if (matchedSeg) {
    const rest = segments.slice(1).join("\n\n").trim();
    return {
      olio: matchedSeg,
      duranteLaGiornata: rest || undefined,
    };
  }

  const firstLine = t.split("\n")[0]?.trim() ?? "";
  const matchedLine = olioOptions.find((o) => formatFood(o) === firstLine);
  if (matchedLine) {
    const rest = t.slice(t.indexOf("\n") + 1).trim();
    return {
      olio: matchedLine,
      duranteLaGiornata: rest || undefined,
    };
  }

  return { duranteLaGiornata: t, olio: undefined };
}

const ADHERENCE_TITLE_STATIC = "Quanto hai rispettato la dieta oggi?";

function MealCompletionDaySummary({ percent }: { percent: number }) {
  const ariaLabel = `${ADHERENCE_TITLE_STATIC}: ${percent} per cento`;
  const title = `${ADHERENCE_TITLE_STATIC}: ${percent}%`;
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
    <div
      className={`menu-completion-summary menu-completion-summary--${tier}`}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
      title={title}
    >
      <span className="menu-completion-summary__icon" aria-hidden>
        <Icon size={28} stroke={1.75} />
      </span>
      <span className="menu-completion-summary__percent">{percent}%</span>
    </div>
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
      onSave,
      onMealCheckIn,
      onReplicateMealToNextDay,
      onPendingChange,
      dietData: dietDataProp,
      adherenceDateKey,
    },
    ref,
  ) {
    const dietData = dietDataProp ?? defaultDietData;
    const [duranteEditing, setDuranteEditing] = useState(false);
    const [duranteDraftNotes, setDuranteDraftNotes] = useState("");
    const [editModalSlot, setEditModalSlot] =
      useState<ReplicateMealSlot | null>(null);
    const [editModalDraft, setEditModalDraft] = useState<DailyMenu>(() =>
      cloneMenu(menu),
    );
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
        if (next !== null) {
          const first = trackOnce("activated", { slot, status: next });
          trackOncePerDay("meal_checkin_day", { slot, status: next });
          onMealCheckIn?.({ first });
        }
      },
      [mealStatusDateKey, onMealCheckIn],
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

    const isViewingToday =
      Boolean(mealStatusDateKey) &&
      mealStatusDateKey === new Date().toDateString();

    /** Aggiornato ogni minuto: il pasto evidenziato segue l'ora. */
    const [nowTick, setNowTick] = useState(() => Date.now());
    useEffect(() => {
      if (!isViewingToday) return;
      const id = setInterval(() => setNowTick(Date.now()), 60_000);
      return () => clearInterval(id);
    }, [isViewingToday]);

    const currentMeal = useMemo(
      () =>
        isViewingToday
          ? getCurrentMealSlot(menu, mealCompletionMap, new Date(nowTick))
          : null,
      [isViewingToday, menu, mealCompletionMap, nowTick],
    );
    const currentSlot = currentMeal?.slot ?? null;

    /** All'apertura di oggi porta in vista il pasto attuale (una volta per giorno visualizzato). */
    const scrolledForDateRef = useRef<string | null>(null);
    useEffect(() => {
      if (!isViewingToday || !currentSlot) return;
      if (scrolledForDateRef.current === mealStatusDateKey) return;
      scrolledForDateRef.current = mealStatusDateKey;
      if (currentSlot === "colazione") return;
      const el = document.querySelector<HTMLElement>(
        `[data-meal-slot="${currentSlot}"]`,
      );
      el?.scrollIntoView({ block: "start", behavior: "smooth" });
    }, [isViewingToday, currentSlot, mealStatusDateKey]);

    const sectionProps = (slot: ReplicateMealSlot) => ({
      className: `menu-section${currentSlot === slot ? " menu-section--current" : ""}`,
      "data-meal-slot": slot,
      "aria-current": currentSlot === slot ? ("time" as const) : undefined,
    });

    const nowBadge = (slot: ReplicateMealSlot) =>
      currentSlot === slot ? (
        <span className="menu-section__now-badge">
          {currentMeal?.isNow ? "Adesso" : "Prossimo"}
        </span>
      ) : null;

    useEffect(() => {
      if (!mealStatusDateKey) return;
      if (!shouldPersistAdherence) {
        removeAdherenceScore(mealStatusDateKey);
        return;
      }
      setAdherenceScore(mealStatusDateKey, mealCompletionPercent);
    }, [mealStatusDateKey, shouldPersistAdherence, mealCompletionPercent]);

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

    const openMealEditModal = useCallback(
      (slot: ReplicateMealSlot) => {
        setEditModalDraft(cloneMenu(menu));
        setEditModalSlot(slot);
      },
      [menu],
    );

    useEffect(() => {
      setDuranteEditing(false);
    }, [menu.id, menu.date]);

    const openDuranteEdit = useCallback(() => {
      setDuranteDraftNotes(buildDuranteCombinedDraft(menu));
      setDuranteEditing(true);
    }, [menu]);

    const cancelDuranteEdit = useCallback(() => {
      setDuranteEditing(false);
    }, []);

    const saveDuranteEdit = useCallback(() => {
      if (!onSave) return;
      const trimmed = duranteDraftNotes.trim();
      if (trimmed === "") {
        onSave({ ...menu, duranteLaGiornata: undefined, olio: undefined });
        setDuranteEditing(false);
        return;
      }
      const olioOpts = dietData.olio ?? [];
      if (olioOpts.length === 0) {
        onSave({ ...menu, duranteLaGiornata: trimmed });
        setDuranteEditing(false);
        return;
      }
      const parsed = parseDuranteCombinedSave(duranteDraftNotes, olioOpts);
      onSave({ ...menu, ...parsed });
      setDuranteEditing(false);
    }, [onSave, menu, dietData.olio, duranteDraftNotes]);

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

    const duranteReadText = buildDuranteCombinedDraft(menu);

    return (
      <div className="daily-menu-card">
        {mealStatusDateKey ? (
          <div className="menu-header">
            <div className="menu-header__completion-stack">
              {shouldPersistAdherence ? (
                <>
                  <span className="menu-header__completion-label">
                    {ADHERENCE_TITLE_STATIC}
                  </span>
                  <MealCompletionDaySummary percent={mealCompletionPercent} />
                </>
              ) : (
                <div className="menu-checkin-hint" role="status">
                  <span className="menu-checkin-hint__title">
                    {isViewingToday
                      ? "Com'è andata oggi?"
                      : "Nessun pasto segnato in questo giorno"}
                  </span>
                  <span className="menu-checkin-hint__text">
                    Tocca{" "}
                    <IconCheckbox
                      size={16}
                      stroke={2}
                      aria-label="l'icona di spunta"
                      className="menu-checkin-hint__icon"
                    />{" "}
                    sotto un pasto per segnarlo: vedrai qui quanto stai
                    seguendo il piano.
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : null}

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
          <div {...sectionProps("colazione")}>
            <div className="menu-section__head">
              <h4>
                <SunIcon size={MEAL_CARD_HEADING_ICON_PX} />
                Colazione
                {nowBadge("colazione")}
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
            <div {...sectionProps("spuntinoMattutino")}>
              <div className="menu-section__head">
                <h4>
                  <PeanutIcon size={MEAL_CARD_HEADING_ICON_PX} />
                  Spuntino Mattutino
                  {nowBadge("spuntinoMattutino")}
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

          <div {...sectionProps("pranzo")}>
            <div className="menu-section__head">
              <h4>
                <UtensilsIcon size={MEAL_CARD_HEADING_ICON_PX} />
                Pranzo
                {nowBadge("pranzo")}
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
            <div {...sectionProps("merenda")}>
              <div className="menu-section__head">
                <h4>
                  <PeanutIcon size={MEAL_CARD_HEADING_ICON_PX} />
                  Merenda
                  {nowBadge("merenda")}
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

          <div {...sectionProps("cena")}>
            <div className="menu-section__head">
              <h4>
                <MoonIcon size={MEAL_CARD_HEADING_ICON_PX} />
                Cena
                {nowBadge("cena")}
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

          {(Boolean(dietData.olio?.length) ||
            menu.duranteLaGiornata ||
            menu.olio) && (
            <div className="menu-durante-giornata">
              <div className="menu-durante-giornata__head">
                <span className="menu-durante-giornata__label">
                  Durante la giornata
                </span>
                {!duranteEditing && onSave ? (
                  <button
                    type="button"
                    className="menu-section__edit menu-durante-giornata__edit"
                    onClick={openDuranteEdit}
                    aria-label={MEAL_EDIT_MODAL_TITLE.duranteLaGiornata}
                  >
                    <EditIcon size={MEAL_CARD_ACTION_ICON_PX} />
                  </button>
                ) : null}
              </div>
              {duranteEditing ? (
                <>
                  <textarea
                    className="menu-durante-giornata__textarea"
                    rows={4}
                    value={duranteDraftNotes}
                    onChange={(e) => setDuranteDraftNotes(e.target.value)}
                    placeholder={
                      dietData.olio?.length
                        ? "Prima riga: olio dalla dieta (es. come suggerito), poi note sulla giornata…"
                        : "Note, integrazioni o indicazioni per la giornata…"
                    }
                    aria-label="Note durante la giornata"
                  />
                  <div className="menu-durante-giornata__actions">
                    <button
                      type="button"
                      className="menu-action-btn save"
                      onClick={saveDuranteEdit}
                    >
                      Salva
                    </button>
                    <button
                      type="button"
                      className="menu-action-btn cancel"
                      onClick={cancelDuranteEdit}
                    >
                      Annulla
                    </button>
                  </div>
                </>
              ) : (
                <div className="menu-durante-giornata__content">
                  {duranteReadText ? (
                    <p className="menu-durante-giornata__text">
                      {duranteReadText}
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  },
);

export default DailyMenuComponent;
