"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { dailyMenus } from "@/data/dailyMenus";
import { dietData as defaultDietData } from "@/data/dietData";
import { buildDietDataFromMenus } from "@/utils/buildDietDataFromMenus";
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
import { IconDeviceFloppy, IconRefresh } from "@tabler/icons-react";
import type { DailyMenu as DailyMenuType, UserDiet } from "@/types/diet";
import { clearAdherenceScores } from "@/utils/dietAdherenceScores";

type AppView = AppContentView;

export default function App() {
  const [userDiet, setUserDiet] = useState<UserDiet | null>(loadUserDiet);
  const [currentMenu, setCurrentMenu] = useState<DailyMenuType | null>(null);
  const [todayDate, setTodayDate] = useState(new Date().toDateString());
  const [view, setView] = useState<AppView>("menu");
  const [menuPendingSave, setMenuPendingSave] = useState(false);
  const menuRef = useRef<DailyMenuHandle>(null);
  const [appStandalone, setAppStandalone] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const dailyMenusSource = userDiet?.dailyMenus ?? dailyMenus;

  useEffect(() => {
    setAppStandalone(isStandalone());
  }, []);

  useEffect(() => {
    if (view !== "menu") {
      setMenuPendingSave(false);
    }
  }, [view]);

  const getTodayMenu = useCallback((): DailyMenuType => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const dayOfYear = Math.floor(
      (today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24),
    );
    const menuIndex = dayOfYear % dailyMenusSource.length;
    const menu = { ...dailyMenusSource[menuIndex], date: today.toDateString() };
    return menu;
  }, [dailyMenusSource]);

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
    const today = new Date();
    const todayKey = today.toDateString();

    if (todayKey !== todayDate) {
      setTodayDate(todayKey);
    }

    const todayMenu = getTodayMenu();
    const savedMenu = localStorage.getItem(`dietMenu_${todayKey}`);
    if (savedMenu) {
      try {
        const parsed = JSON.parse(savedMenu) as DailyMenuType & {
          date?: string;
        };
        if (parsed.date === todayKey) {
          setCurrentMenu(parsed);
        } else {
          setCurrentMenu(todayMenu);
        }
      } catch {
        setCurrentMenu(todayMenu);
      }
    } else {
      setCurrentMenu(todayMenu);
    }

    const checkDayChange = setInterval(() => {
      const now = new Date();
      const currentDate = now.toDateString();

      if (currentDate !== todayDate) {
        const newTodayMenu = getTodayMenu();
        const saved = localStorage.getItem(`dietMenu_${currentDate}`);
        if (saved) {
          try {
            const parsed = JSON.parse(saved) as DailyMenuType & {
              date?: string;
            };
            setCurrentMenu(parsed.date === currentDate ? parsed : newTodayMenu);
          } catch {
            setCurrentMenu(newTodayMenu);
          }
        } else {
          setCurrentMenu(newTodayMenu);
        }
        setTodayDate(currentDate);
      }
    }, 60000);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const now = new Date();
        const currentDate = now.toDateString();
        if (currentDate !== todayDate) {
          const newTodayMenu = getTodayMenu();
          const saved = localStorage.getItem(`dietMenu_${currentDate}`);
          if (saved) {
            try {
              const parsed = JSON.parse(saved) as DailyMenuType & {
                date?: string;
              };
              setCurrentMenu(
                parsed.date === currentDate ? parsed : newTodayMenu,
              );
            } catch {
              setCurrentMenu(newTodayMenu);
            }
          } else {
            setCurrentMenu(newTodayMenu);
          }
          setTodayDate(currentDate);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      clearInterval(checkDayChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [todayDate, userDiet, getTodayMenu]);

  const handleSaveMenu = (updatedMenu: DailyMenuType) => {
    const today = new Date();
    const todayKey = today.toDateString();
    const menuToSave = { ...updatedMenu, date: todayKey };
    localStorage.setItem(`dietMenu_${todayKey}`, JSON.stringify(menuToSave));
    setCurrentMenu(menuToSave);
  };

  const today = new Date();

  if (!userDiet) {
    return <Landing onDietLoaded={setUserDiet} />;
  }

  const appClassName = [
    "app",
    appStandalone ? "app--standalone" : "",
    menuPendingSave && view === "menu" ? "app--pending-menu-save" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={appClassName}>
      <header className="app-header">
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

      <main className="app-main">
        {view === "menu" &&
          currentMenu && (
            <DailyMenu
              ref={menuRef}
              menu={currentMenu}
              displayDate={formatDate(today)}
              onSave={handleSaveMenu}
              onPendingChange={setMenuPendingSave}
              dietData={
                userDiet.dietData ??
                buildDietDataFromMenus(userDiet.dailyMenus) ??
                defaultDietData
              }
              uploadedFile={userDiet.uploadedFile}
              adherenceDateKey={currentMenu?.date ?? todayDate}
            />
          )}
        {view === "shopping" && (
          <ShoppingList
            dailyMenus={dailyMenusSource}
            todayMenu={currentMenu}
            todayKey={todayDate}
          />
        )}
      </main>

      <div className="app-bottom-dock">
        {menuPendingSave && view === "menu" && (
          <div className="app-save-bar">
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
        )}
        <div className="app-bottom-panel">
          <AppBottomNav
            active={view}
            onSelectView={trySetView}
            onOpenReport={() => setReportModalOpen(true)}
          />
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
