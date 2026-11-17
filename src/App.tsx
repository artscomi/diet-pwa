"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { dailyMenus } from "@/data/dailyMenus";
import { dietData as defaultDietData } from "@/data/dietData";
import { buildDietDataFromMenus } from "@/utils/buildDietDataFromMenus";
import { expandDailyMenusForRotation } from "@/utils/expandDailyMenusForRotation";
import DailyMenu, { type DailyMenuHandle } from "@/components/DailyMenu";
import ShoppingList from "@/components/ShoppingList";
import Landing, {
  loadUserDiet,
  clearUserDiet,
  clearSavedDailyMenus,
} from "@/components/Landing";
import Footer from "@/components/Footer";
import InstallAppCTA, { isStandalone } from "@/components/InstallAppCTA";
import DietReportModal from "@/components/DietReportModal";
import AppSettingsModal from "@/components/AppSettingsModal";
import AppToast from "@/components/AppToast";
import CompletionReminderEffects from "@/components/CompletionReminderEffects";
import AppBottomNav, { type AppContentView } from "@/components/AppBottomNav";
import ProductFeedbackCard from "@/components/ProductFeedbackCard";
import Modal from "@/components/Modal";
import DietReviewModal, { summarizeDiet } from "@/components/DietReviewModal";
import { pickMenuTemplateForDate } from "@/utils/menuForDate";
import {
  markMilestone,
  recordActiveDay,
  trackEvent,
} from "@/utils/productMetrics";
import {
  IconChevronLeft,
  IconChevronRight,
  IconDeviceFloppy,
  IconRefresh,
  IconSettings,
} from "@tabler/icons-react";
import {
  readCompletionReminderPreferences,
  writeCompletionReminderPreferences,
  type CompletionReminderPreferences,
} from "@/utils/completionReminderStorage";
import type { DailyMenu as DailyMenuType, UserDiet } from "@/types/diet";
import { clearAdherenceScores } from "@/utils/dietAdherenceScores";
import {
  applyMealSlotFromSource,
  type ReplicateMealSlot,
} from "@/utils/replicateMeal";

type AppView = AppContentView;

function addDaysToDateKey(dateKey: string, deltaDays: number): string {
  const d = new Date(dateKey);
  d.setDate(d.getDate() + deltaDays);
  return d.toDateString();
}

export default function App() {
  /** `null` finché non abbiamo letto `localStorage` (client): così la Landing non compare se la dieta c’è già. */
  const [userDiet, setUserDiet] = useState<UserDiet | null>(null);
  const [dietReady, setDietReady] = useState(false);
  const [currentMenu, setCurrentMenu] = useState<DailyMenuType | null>(null);
  const [todayDate, setTodayDate] = useState(new Date().toDateString());
  /** 0 = oggi (calendario), −1 = ieri, +1 = domani, … */
  const [menuDayOffset, setMenuDayOffset] = useState(0);
  const [view, setView] = useState<AppView>("menu");
  const [menuPendingSave, setMenuPendingSave] = useState(false);
  const menuRef = useRef<DailyMenuHandle>(null);
  const appMainRef = useRef<HTMLElement>(null);
  const [appStandalone, setAppStandalone] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [completionPrefs, setCompletionPrefs] =
    useState<CompletionReminderPreferences>(readCompletionReminderPreferences);
  /** Incrementato a ogni salvataggio menu: la lista spesa rilegge i `dietMenu_*` in locale. */
  const [shoppingMenuRev, setShoppingMenuRev] = useState(0);
  const [replicateToast, setReplicateToast] = useState<string | null>(null);
  const dismissReplicateToast = useCallback(() => setReplicateToast(null), []);
  /** Incrementato quando il browser concede le notifiche: riattiva la sottoscrizione push. */
  const [notificationPermissionRev, setNotificationPermissionRev] = useState(0);
  const bumpNotificationPermission = useCallback(
    () => setNotificationPermissionRev((r) => r + 1),
    [],
  );
  const [reminderOfferOpen, setReminderOfferOpen] = useState(false);

  const persistCompletionPrefs = useCallback(
    (next: CompletionReminderPreferences) => {
      setCompletionPrefs(next);
      writeCompletionReminderPreferences(next);
    },
    [],
  );
  const todayDateRef = useRef(todayDate);
  todayDateRef.current = todayDate;

  const dailyMenusSource = useMemo(() => {
    const raw = userDiet?.dailyMenus ?? dailyMenus;
    const inferredDietData =
      userDiet?.dietData ??
      (userDiet?.dailyMenus
        ? buildDietDataFromMenus(userDiet.dailyMenus)
        : undefined);
    return expandDailyMenusForRotation(raw, inferredDietData);
  }, [userDiet]);

  const viewedDateKey = useMemo(
    () => addDaysToDateKey(todayDate, menuDayOffset),
    [todayDate, menuDayOffset],
  );

  const viewedDate = useMemo(
    () => new Date(viewedDateKey),
    [viewedDateKey],
  );

  useEffect(() => {
    setAppStandalone(isStandalone());
  }, []);

  useEffect(() => {
    const stored = loadUserDiet();
    // Prima del render del menu: così la survey legge il conteggio aggiornato.
    if (stored) recordActiveDay();
    setUserDiet(stored);
    setDietReady(true);
  }, []);

  /** Dieta appena caricata: mostra il riepilogo da controllare. */
  const [reviewDiet, setReviewDiet] = useState<UserDiet | null>(null);

  const handleDietLoaded = useCallback((diet: UserDiet) => {
    recordActiveDay();
    setUserDiet(diet);
    setReviewDiet(diet);
  }, []);

  useEffect(() => {
    if (view !== "menu") {
      setMenuPendingSave(false);
    }
  }, [view]);

  useEffect(() => {
    if (view !== "shopping") return;
    const el = appMainRef.current;
    if (!el) return;
    el.scrollTop = 0;
  }, [view]);

  const getMenuForDateKey = useCallback(
    (dateKey: string): DailyMenuType => {
      const template =
        pickMenuTemplateForDate(dailyMenusSource, dateKey) ??
        dailyMenusSource[0];
      return {
        ...template,
        date: dateKey,
      };
    },
    [dailyMenusSource],
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("it-IT", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const trySetView = useCallback(
    (next: AppView) => {
      if (menuPendingSave && view === "menu" && next !== "menu") {
        if (
          !window.confirm(
            "Hai modifiche non salvate al menu. Uscire senza salvare?",
          )
        ) {
          return;
        }
      }
      setView(next);
    },
    [menuPendingSave, view],
  );

  const handleNewDiet = useCallback(() => {
    clearSavedDailyMenus();
    clearAdherenceScores();
    clearUserDiet();
    setUserDiet(null);
  }, []);

  const answerDietReview = useCallback(
    (ok: boolean) => {
      if (reviewDiet) {
        const summary = summarizeDiet(reviewDiet);
        trackEvent("diet_review_answered", {
          answer: ok ? "ok" : "reupload",
          menus: summary.menuCount,
          byWeekday: summary.weekdays.length > 0,
          missingMeals: summary.meals.filter((m) => !m.present).length,
        });
      }
      setReviewDiet(null);
      if (!ok) handleNewDiet();
    },
    [reviewDiet, handleNewDiet],
  );

  const handleChangeDietClick = useCallback(() => {
    const warnUnsaved =
      menuPendingSave && view === "menu"
        ? "Hai modifiche non salvate al menu. "
        : "";
    const msg = `${warnUnsaved}Vuoi cambiare dieta? La dieta attuale e i dati collegati verranno rimossi da questo dispositivo.`;
    if (!window.confirm(msg)) return;
    handleNewDiet();
  }, [handleNewDiet, menuPendingSave, view]);

  useEffect(() => {
    if (!userDiet) return;
    setTodayDate(new Date().toDateString());
    setMenuDayOffset(0);
  }, [userDiet]);

  useEffect(() => {
    if (!userDiet) return;

    const syncCalendarDay = () => {
      const currentDate = new Date().toDateString();
      if (currentDate !== todayDateRef.current) {
        setMenuDayOffset(0);
        setTodayDate(currentDate);
      }
    };

    const id = setInterval(syncCalendarDay, 60_000);
    const onVisibility = () => {
      if (!document.hidden) syncCalendarDay();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [userDiet]);

  useEffect(() => {
    if (!userDiet) return;

    const savedMenu = localStorage.getItem(`dietMenu_${viewedDateKey}`);
    if (savedMenu) {
      try {
        const parsed = JSON.parse(savedMenu) as DailyMenuType & {
          date?: string;
        };
        if (parsed.date === viewedDateKey) {
          setCurrentMenu(parsed);
          return;
        }
      } catch {
        /* fall through */
      }
    }
    setCurrentMenu(getMenuForDateKey(viewedDateKey));
  }, [userDiet, viewedDateKey, getMenuForDateKey]);

  const changeMenuDayOffset = useCallback(
    (delta: number) => {
      if (delta === 0) return;
      if (menuPendingSave && view === "menu") {
        if (
          !window.confirm(
            "Hai modifiche non salvate al menu. Cambiare giorno senza salvare?",
          )
        ) {
          return;
        }
      }
      setMenuDayOffset((o) => o + delta);
    },
    [menuPendingSave, view],
  );

  const handleSaveMenu = (updatedMenu: DailyMenuType) => {
    const menuToSave = { ...updatedMenu, date: viewedDateKey };
    localStorage.setItem(
      `dietMenu_${viewedDateKey}`,
      JSON.stringify(menuToSave),
    );
    setCurrentMenu(menuToSave);
    setShoppingMenuRev((r) => r + 1);
  };

  const handleReplicateMealToNextDay = useCallback(
    (slot: ReplicateMealSlot) => {
      if (!currentMenu) return;
      const nextKey = addDaysToDateKey(viewedDateKey, 1);
      let base: DailyMenuType = getMenuForDateKey(nextKey);
      try {
        const raw = localStorage.getItem(`dietMenu_${nextKey}`);
        if (raw) {
          const parsed = JSON.parse(raw) as DailyMenuType & { date?: string };
          if (parsed.date === nextKey) base = parsed;
        }
      } catch {
        /* ignore */
      }
      const merged = applyMealSlotFromSource(base, currentMenu, slot);
      const toSave = { ...merged, date: nextKey };
      localStorage.setItem(`dietMenu_${nextKey}`, JSON.stringify(toSave));
      setShoppingMenuRev((r) => r + 1);
      setReplicateToast("Pasto copiato nel giorno successivo.");
    },
    [currentMenu, viewedDateKey, getMenuForDateKey],
  );

  /**
   * Dopo un check-in: al primo in assoluto un riscontro positivo; e, una sola volta,
   * la proposta del promemoria serale — nel momento in cui l'utente ne capisce il valore.
   */
  const handleMealCheckIn = useCallback(({ first }: { first: boolean }) => {
    const canAsk =
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "default";
    if (canAsk && markMilestone("reminder_offer_shown")) {
      setReminderOfferOpen(true);
      return;
    }
    if (first) setReplicateToast("Primo pasto segnato! 🎉");
  }, []);

  const answerReminderOffer = useCallback(
    async (accept: boolean) => {
      setReminderOfferOpen(false);
      if (!accept) {
        trackEvent("reminder_offer_answered", { answer: "no" });
        return;
      }
      let permission: NotificationPermission = "default";
      try {
        permission = await Notification.requestPermission();
      } catch {
        /* browser senza supporto */
      }
      trackEvent("reminder_offer_answered", { answer: "yes", permission });
      if (permission === "granted") {
        persistCompletionPrefs({ ...completionPrefs, enabled: true });
        bumpNotificationPermission();
        setReplicateToast("Promemoria attivo: ci sentiamo alle 21:00.");
      }
    },
    [completionPrefs, persistCompletionPrefs, bumpNotificationPermission],
  );

  if (!dietReady) {
    return (
      <div className="app" aria-busy="true" aria-label="Caricamento dieta" />
    );
  }

  if (!userDiet) {
    return (
      <Landing
        onDietLoaded={handleDietLoaded}
        uploadOnly={appStandalone}
      />
    );
  }

  const appClassName = ["app", appStandalone ? "app--standalone" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={appClassName}>
      <header
        className={[
          "app-header",
          view === "menu" && currentMenu ? "app-header--with-day-nav" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="app-header__inner">
          <h1 className="app-header__logo">
            <span className="app-header__title">PocketDiet</span>
          </h1>
          <div className="app-header__actions">
            <button
              type="button"
              className="app-header__icon-btn"
              onClick={() => setSettingsModalOpen(true)}
              aria-label="Apri impostazioni"
            >
              <IconSettings size={20} stroke={2} aria-hidden />
            </button>
            <button
              type="button"
              className="app-header__change-diet"
              onClick={handleChangeDietClick}
              aria-label="Cambia dieta e ricomincia da capo"
            >
              <IconRefresh size={18} stroke={2} aria-hidden />
              Cambia dieta
            </button>
          </div>
        </div>
      </header>

      {view === "menu" && currentMenu && (
        <nav className="menu-day-nav" aria-label="Giorno del menu">
          <div className="menu-day-nav__inner">
            <button
              type="button"
              className="menu-day-nav__btn"
              onClick={() => changeMenuDayOffset(-1)}
              aria-label="Giorno precedente"
            >
              <IconChevronLeft size={22} stroke={2} aria-hidden />
            </button>
            <div className="menu-day-nav__center">
              {menuDayOffset === 0 ? (
                <span className="menu-day-nav__badge">Oggi</span>
              ) : null}
              <span className="menu-day-nav__date">
                {formatDate(viewedDate)}
              </span>
            </div>
            <button
              type="button"
              className="menu-day-nav__btn"
              onClick={() => changeMenuDayOffset(1)}
              aria-label="Giorno successivo"
            >
              <IconChevronRight size={22} stroke={2} aria-hidden />
            </button>
          </div>
        </nav>
      )}

      <main ref={appMainRef} className="app-main">
        {view === "menu" && currentMenu && menuDayOffset === 0 && (
          <ProductFeedbackCard />
        )}
        {view === "menu" && currentMenu && (
          <DailyMenu
            ref={menuRef}
            menu={currentMenu}
            onSave={handleSaveMenu}
            onReplicateMealToNextDay={handleReplicateMealToNextDay}
            onPendingChange={setMenuPendingSave}
            dietData={
              userDiet.dietData ??
              buildDietDataFromMenus(userDiet.dailyMenus) ??
              defaultDietData
            }
            adherenceDateKey={currentMenu?.date ?? viewedDateKey}
            onMealCheckIn={handleMealCheckIn}
          />
        )}
        {view === "shopping" && (
          <ShoppingList
            dailyMenus={dailyMenusSource}
            todayKey={todayDate}
            menuSaveRevision={shoppingMenuRev}
          />
        )}
        <Footer showInstallCTA={false} />
      </main>

      <div className="app-bottom-dock">
        <div className="app-bottom-panel">
          {menuPendingSave && view === "menu" ? (
            <div className="app-save-bar">
              <div className="app-save-bar__inner">
                <button
                  type="button"
                  className="app-save-bar__btn"
                  onClick={() => menuRef.current?.save()}
                  aria-label="Salva le modifiche al menu del giorno"
                >
                  <IconDeviceFloppy size={20} stroke={2} aria-hidden />
                  Salva modifiche
                </button>
              </div>
            </div>
          ) : (
            <AppBottomNav
              active={view}
              onSelectView={trySetView}
              onOpenReport={() => setReportModalOpen(true)}
            />
          )}
        </div>
        {!appStandalone ? <InstallAppCTA variant="stickyBar" /> : null}
      </div>

      <CompletionReminderEffects
        prefs={completionPrefs}
        permissionRev={notificationPermissionRev}
      />

      {reviewDiet ? (
        <DietReviewModal
          diet={reviewDiet}
          onConfirm={() => answerDietReview(true)}
          onReupload={() => answerDietReview(false)}
        />
      ) : null}

      {reminderOfferOpen ? (
        <Modal
          title="Pasto segnato! 🎉"
          onClose={() => void answerReminderOffer(false)}
          buttonLabel="No, grazie"
          primaryLabel="Sì, ricordamelo"
          onPrimaryClick={() => void answerReminderOffer(true)}
        >
          <p>
            Vuoi un promemoria alle <strong>21:00</strong> per segnare com&apos;è
            andata la giornata? Puoi disattivarlo quando vuoi dalle
            impostazioni.
          </p>
        </Modal>
      ) : null}

      <DietReportModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />

      <AppSettingsModal
        open={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        completionPrefs={completionPrefs}
        onCompletionPrefsChange={persistCompletionPrefs}
        onPermissionGranted={bumpNotificationPermission}
      />

      <AppToast message={replicateToast} onDismiss={dismissReplicateToast} />
    </div>
  );
}
