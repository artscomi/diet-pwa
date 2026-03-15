"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { dailyMenus } from "@/data/dailyMenus";
import { dietData as defaultDietData } from "@/data/dietData";
import { buildDietDataFromMenus } from "@/utils/buildDietDataFromMenus";
import DailyMenu from "@/components/DailyMenu";
import Landing, {
  loadUserDiet,
  clearUserDiet,
  clearSavedDailyMenus,
} from "@/components/Landing";
import Footer from "@/components/Footer";
import InstallAppCTA from "@/components/InstallAppCTA";
import type { DailyMenu as DailyMenuType, UserDiet } from "@/types/diet";

export default function App() {
  const [userDiet, setUserDiet] = useState<UserDiet | null>(loadUserDiet);
  const [currentMenu, setCurrentMenu] = useState<DailyMenuType | null>(null);
  const [todayDate, setTodayDate] = useState(new Date().toDateString());

  const dailyMenusSource = userDiet?.dailyMenus ?? dailyMenus;

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
    <div className="app">
      <header className="app-header">
        <div className="app-header__inner">
          <h1 className="app-header__logo">
            <span className="site-logo-wrap">
              <Image
                src="/menoo-logo.svg"
                alt="My menoo"
                width={140}
                height={52}
                className="site-logo site-logo--header"
                priority
              />
            </span>
          </h1>
          <div className="app-header__meta">
            <InstallAppCTA variant="button" />
            <button
              type="button"
              className="change-diet-btn"
              onClick={() => {
                clearSavedDailyMenus();
                clearUserDiet();
                setUserDiet(null);
              }}
            >
              Cambia dieta
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {currentMenu && (
          <DailyMenu
            menu={currentMenu}
            displayDate={formatDate(today)}
            onSave={handleSaveMenu}
            dietData={
              userDiet.dietData ??
              buildDietDataFromMenus(userDiet.dailyMenus) ??
              defaultDietData
            }
          />
        )}
      </main>

      <Footer showInstallCTA={false} />
    </div>
  );
}
