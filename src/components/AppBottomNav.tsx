"use client";

import {
  IconChartBar,
  IconShoppingCart,
  IconToolsKitchen2,
} from "@tabler/icons-react";
import "./AppBottomNav.css";

export type AppContentView = "menu" | "shopping";

interface AppBottomNavProps {
  active: AppContentView;
  onSelectView: (view: AppContentView) => void;
  onOpenReport: () => void;
}

const STROKE = 1.75;
const ICON = 26;

export default function AppBottomNav({
  active,
  onSelectView,
  onOpenReport,
}: AppBottomNavProps) {
  return (
    <nav className="app-tab-nav" aria-label="Navigazione principale">
      <button
        type="button"
        className={`app-tab-nav__item${active === "menu" ? " app-tab-nav__item--active" : ""}`}
        onClick={() => onSelectView("menu")}
        aria-current={active === "menu" ? "page" : undefined}
      >
        <IconToolsKitchen2
          size={ICON}
          stroke={STROKE}
          aria-hidden
          className="app-tab-nav__icon"
        />
        <span className="app-tab-nav__label">Pasti</span>
      </button>
      <button
        type="button"
        className={`app-tab-nav__item${active === "shopping" ? " app-tab-nav__item--active" : ""}`}
        onClick={() => onSelectView("shopping")}
        aria-current={active === "shopping" ? "page" : undefined}
      >
        <IconShoppingCart
          size={ICON}
          stroke={STROKE}
          aria-hidden
          className="app-tab-nav__icon"
        />
        <span className="app-tab-nav__label">Spesa</span>
      </button>
      <button
        type="button"
        className="app-tab-nav__item app-tab-nav__item--action"
        onClick={onOpenReport}
        aria-label="Apri il report sul rispetto della dieta"
      >
        <IconChartBar size={ICON} stroke={STROKE} aria-hidden className="app-tab-nav__icon" />
        <span className="app-tab-nav__label">Report</span>
      </button>
    </nav>
  );
}
