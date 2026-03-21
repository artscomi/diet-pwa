"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { dailyMenus } from "@/data/dailyMenus";
import { dietData as defaultDietData } from "@/data/dietData";
import { buildDietDataFromMenus } from "@/utils/buildDietDataFromMenus";
import DailyMenu, { type DailyMenuHandle } from "@/components/DailyMenu";
import { SaveIcon } from "@/components/Icons";
import ShoppingList from "@/components/ShoppingList";
import Landing, {
  loadUserDiet,
  clearUserDiet,
  clearSavedDailyMenus,
} from "@/components/Landing";
import Footer from "@/components/Footer";
import InstallAppCTA, { isStandalone } from "@/components/InstallAppCTA";
import { IconShoppingCart, IconToolsKitchen2 } from "@tabler/icons-react";
import type { DailyMenu as DailyMenuType, UserDiet } from "@/types/diet";

type AppView = "menu" | "shopping";

export default function App() {
  const [userDiet, setUserDiet] = useState<UserDiet | null>(loadUserDiet);
  const [currentMenu, setCurrentMenu] = useState<DailyMenuType | null>(null);
  const [todayDate, setTodayDate] = useState(new Date().toDateString());
  const [view, setView] = useState<AppView>("menu");
  const [menuPendingSave, setMenuPendingSave] = useState(false);
  const menuRef = useRef<DailyMenuHandle>(null);
  const [appStandalone, setAppStandalone] = useState(false);

  const dailyMenusSource = userDiet?.dailyMenus ?? dailyMenus;

  useEffect(() => {
    setAppStandalone(isStandalone());
  }, []);

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

  return (
    <div className={`app${appStandalone ? " app--standalone" : ""}`}>
      <header className="app-header">
        <div className="app-header__inner">
          <h1 className="app-header__logo">
            <button
              type="button"
              className="app-header__home-link"
              onClick={() => {
                clearSavedDailyMenus();
                clearUserDiet();
                setUserDiet(null);
                setView("menu");
              }}
            >
              PocketDiet
            </button>
          </h1>
          <div className="app-header__meta">
            <button
              type="button"
              className="change-diet-btn"
              onClick={() => {
                clearSavedDailyMenus();
                clearUserDiet();
                setUserDiet(null);
                setView("menu");
              }}
            >
              Cambia dieta
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {view === "menu" ? (
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
            />
          )
        ) : (
          <ShoppingList
            dailyMenus={dailyMenusSource}
            todayMenu={currentMenu}
            todayKey={todayDate}
          />
        )}
      </main>

      <div className="app-bottom-dock">
        <div className="app-view-cta-bar">
          {view === "menu" ? (
            menuPendingSave ? (
              <button
                type="button"
                className="app-view-cta app-view-cta--primary"
                onClick={() => menuRef.current?.save()}
                aria-label="Salva modifiche al menu"
              >
                <SaveIcon size={24} style={{ flexShrink: 0 }} />
                <span>Salva</span>
              </button>
            ) : (
              <button
                type="button"
                className="app-view-cta app-view-cta--primary"
                onClick={() => setView("shopping")}
              >
                <IconShoppingCart size={24} stroke={2} aria-hidden />
                <span>Lista della spesa</span>
              </button>
            )
          ) : (
            <button
              type="button"
              className="app-view-cta app-view-cta--secondary"
              onClick={() => setView("menu")}
            >
              <IconToolsKitchen2 size={24} stroke={2} aria-hidden />
              <span>Menu del giorno</span>
            </button>
          )}
        </div>
        {!appStandalone && <InstallAppCTA variant="stickyBar" />}
      </div>

      <Footer showInstallCTA={false} />
    </div>
  );
}
