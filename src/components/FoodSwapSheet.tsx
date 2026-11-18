"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { IconCheck, IconSearch, IconX } from "@tabler/icons-react";
import type { FoodItem } from "@/types/diet";
import { filterFoods, FOOD_SEARCH_MIN_OPTIONS } from "@/utils/foodSearch";
import "./FoodSwapSheet.css";

interface FoodSwapSheetProps {
  /** Es. "Pranzo · Proteine" */
  title: string;
  options: FoodItem[];
  current?: FoodItem;
  onPick: (item: FoodItem) => void;
  onClose: () => void;
}

function sameFood(a?: FoodItem, b?: FoodItem): boolean {
  return Boolean(a && b && a.name === b.name && a.quantity === b.quantity && a.unit === b.unit);
}

function formatQty(f: FoodItem): string {
  return f.quantity ? `${f.quantity} ${f.unit}` : "q.b.";
}

/**
 * Pannello dal basso con le sostituzioni previste dal nutrizionista per un alimento.
 * Risponde alla domanda "cosa posso mangiare al posto di…?" con un tocco.
 */
export default function FoodSwapSheet({
  title,
  options,
  current,
  onPick,
  onClose,
}: FoodSwapSheetProps) {
  const [query, setQuery] = useState("");
  const showSearch = options.length > FOOD_SEARCH_MIN_OPTIONS;
  const visible = useMemo(() => filterFoods(options, query), [options, query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="swap-sheet__backdrop" onClick={onClose}>
      <div
        className="swap-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="swap-sheet-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="swap-sheet__handle" aria-hidden />
        <div className="swap-sheet__head">
          <div>
            <p className="swap-sheet__eyebrow">Sostituzioni previste</p>
            <h2 id="swap-sheet-title" className="swap-sheet__title">
              {title}
            </h2>
          </div>
          <button
            type="button"
            className="swap-sheet__close"
            onClick={onClose}
            aria-label="Chiudi"
          >
            <IconX size={20} stroke={2} aria-hidden />
          </button>
        </div>
        {showSearch ? (
          <label className="swap-sheet__search">
            <IconSearch size={18} stroke={2} aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Cerca tra ${options.length} alternative`}
              aria-label="Cerca un alimento"
              autoComplete="off"
              enterKeyHint="search"
            />
            {query ? (
              <button
                type="button"
                className="swap-sheet__search-clear"
                onClick={() => setQuery("")}
                aria-label="Cancella ricerca"
              >
                <IconX size={16} stroke={2} aria-hidden />
              </button>
            ) : null}
          </label>
        ) : null}
        {visible.length === 0 ? (
          <p className="swap-sheet__empty">
            Nessun alimento trovato per “{query}”.
          </p>
        ) : null}
        <ul className="swap-sheet__list">
          {visible.map((o) => {
            const selected = sameFood(o, current);
            return (
              <li key={`${o.name}|${o.quantity}|${o.unit}`}>
                <button
                  type="button"
                  className={`swap-sheet__option${selected ? " swap-sheet__option--selected" : ""}`}
                  aria-pressed={selected}
                  onClick={() => (selected ? onClose() : onPick(o))}
                >
                  <span className="swap-sheet__name">{o.name}</span>
                  <span className="swap-sheet__qty">{formatQty(o)}</span>
                  {selected ? (
                    <IconCheck size={18} stroke={2.5} className="swap-sheet__check" aria-hidden />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
        <p className="swap-sheet__hint">
          La scelta vale solo per questo giorno.
        </p>
      </div>
    </div>,
    document.body,
  );
}
