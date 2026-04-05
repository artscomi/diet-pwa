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
import AppBottomNav, { type AppContentView } from "@/components/AppBottomNav";
import {
  IconChevronLeft,
  IconChevronRight,
  IconDeviceFloppy,
  IconRefresh,
} from "@tabler/icons-react";
import type { DailyMenu as DailyMenuType, UserDiet } from "@/types/diet";
import { clearAdherenceScores } from "@/utils/dietAdherenceScores";

type AppView = AppContentView;

function addDaysToDateKey(dateKey: string, deltaDays: number): string {
  const d = new Date(dateKey);
  d.setDate(d.getDate() + deltaDays);
  return d.toDateString();
}

export default function App() {
  const [userDiet, setUserDiet] = useState<UserDiet | null>(loadUserDiet);
  const [currentMenu, setCurrentMenu] = useState<DailyMenuType | null>(null);
  const [todayDate, setTodayDate] = useState(new Date().toDateString());
  /** 0 = oggi (calendario), −1 = ieri, +1 = domani, … */
  const [menuDayOffset, setMenuDayOffset] = useState(0);
  const [view, setView] = useState<AppView>("menu");
  const [menuPendingSave, setMenuPendingSave] = useState(false);
  const menuRef = useRef<DailyMenuHandle>(null);
  const [appStandalone, setAppStandalone] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  /** Invalida il menu “oggi” per la lista spesa dopo un salvataggio su quella data. */
  const [shoppingMenuRev, setShoppingMenuRev] = useState(0);
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
    if (view !== "menu") {
      setMenuPendingSave(false);
    }
  }, [view]);

  const getMenuForDateKey = useCallback(
    (dateKey: string): DailyMenuType => {
      const d = new Date(dateKey);
      const startOfYear = new Date(d.getFullYear(), 0, 0);
      const diff = d.getTime() - startOfYear.getTime();
      const len = dailyMenusSource.length;
      const dayMs = 1000 * 60 * 60 * 24;
      let menuIndex = 0;
      if (Number.isFinite(diff) && len > 0) {
        const dayOfYear = Math.floor(diff / dayMs);
        menuIndex = ((dayOfYear % len) + len) % len;
      }
      const template = dailyMenusSource[menuIndex] ?? dailyMenusSource[0];
      return {
        ...template,
        date: dateKey,
      };
    },
    [dailyMenusSource],
  );

  const shoppingTodayMenu = useMemo((): DailyMenuType => {
    if (typeof window === "undefined") {
      return getMenuForDateKey(todayDate);
    }
    const saved = localStorage.getItem(`dietMenu_${todayDate}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as DailyMenuType & { date?: string };
        if (parsed.date === todayDate) return parsed;
      } catch {
        /* ignore */
      }
    }
    return getMenuForDateKey(todayDate);
  }, [todayDate, getMenuForDateKey, shoppingMenuRev]); // eslint-disable-line react-hooks/exhaustive-deps -- shoppingMenuRev forza rilettura LS dopo salvataggio su oggi

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
    if (viewedDateKey === todayDate) {
      setShoppingMenuRev((r) => r + 1);
    }
  };

  if (!userDiet) {
    return <Landing onDietLoaded={setUserDiet} />;
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

      <main className="app-main">
        {view === "menu" && currentMenu && (
          <DailyMenu
            ref={menuRef}
            menu={currentMenu}
            onSave={handleSaveMenu}
            onPendingChange={setMenuPendingSave}
            dietData={
              userDiet.dietData ??
              buildDietDataFromMenus(userDiet.dailyMenus) ??
              defaultDietData
            }
            uploadedFile={userDiet.uploadedFile}
            adherenceDateKey={currentMenu?.date ?? viewedDateKey}
          />
        )}
        {view === "shopping" && (
          <ShoppingList
            dailyMenus={dailyMenusSource}
            todayMenu={shoppingTodayMenu}
            todayKey={todayDate}
          />
        )}
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
        {!appStandalone && <InstallAppCTA variant="stickyBar" />}
      </div>

      <DietReportModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />

      <Footer showInstallCTA={false} />
    </div>
  );
}
