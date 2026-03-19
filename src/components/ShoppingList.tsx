"use client";

import { useState, useCallback, useMemo } from "react";
import {
  buildShoppingList,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
} from "@/utils/buildShoppingList";
import { ChevronDownIcon, TrashIcon, ShareIcon, ClipboardCheckIcon } from "./Icons";
import type { DailyMenu as DailyMenuType } from "@/types/diet";
import type { ShoppingCategory, ShoppingItem } from "@/types/diet";
import "./ShoppingList.css";

const LS_CHECKED = "shoppingList_checked";
const LS_DAYS = "shoppingList_days";
const DAY_OPTIONS = [1, 3, 7] as const;

function loadChecked(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_CHECKED);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch { /* ignore */ }
  return new Set();
}

function saveChecked(ids: Set<string>) {
  localStorage.setItem(LS_CHECKED, JSON.stringify(Array.from(ids)));
}

function loadDays(): number {
  try {
    const raw = localStorage.getItem(LS_DAYS);
    if (raw) {
      const n = Number(raw);
      if (DAY_OPTIONS.includes(n as 1 | 3 | 7)) return n;
    }
  } catch { /* ignore */ }
  return 7;
}

function saveDays(d: number) {
  localStorage.setItem(LS_DAYS, String(d));
}

interface ShoppingListProps {
  dailyMenus: DailyMenuType[];
}

export default function ShoppingList({ dailyMenus }: ShoppingListProps) {
  const [days, setDays] = useState(loadDays);
  const [checkedIds, setCheckedIds] = useState(loadChecked);
  const [collapsedCats, setCollapsedCats] = useState<Set<ShoppingCategory>>(new Set());

  const items = useMemo(
    () => buildShoppingList(dailyMenus, days, checkedIds),
    [dailyMenus, days, checkedIds],
  );

  const grouped = useMemo(() => {
    const map = new Map<ShoppingCategory, typeof items>();
    CATEGORY_ORDER.forEach((cat) => map.set(cat, []));
    items.forEach((item) => {
      const arr = map.get(item.category);
      if (arr) arr.push(item);
      else map.set(item.category, [item]);
    });
    CATEGORY_ORDER.forEach((cat) => {
      const arr = map.get(cat);
      if (!arr || arr.length === 0) {
        map.delete(cat);
      } else {
        arr.sort((a: (typeof items)[number], b: (typeof items)[number]) =>
          a.name.localeCompare(b.name, "it"),
        );
      }
    });
    return map;
  }, [items]);

  const totalItems = items.length;
  const checkedCount = items.filter((i) => i.checked).length;

  const handleToggle = useCallback((id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveChecked(next);
      return next;
    });
  }, []);

  const handleClearAll = useCallback(() => {
    setCheckedIds(new Set());
    saveChecked(new Set());
  }, []);

  const handleDaysChange = useCallback((d: number) => {
    setDays(d);
    saveDays(d);
  }, []);

  const toggleCategory = useCallback((cat: ShoppingCategory) => {
    setCollapsedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }, []);

  const [shared, setShared] = useState(false);

  const buildShareText = useCallback(() => {
    const lines: string[] = [`Lista della spesa (${days} ${days === 1 ? "giorno" : "giorni"})\n`];

    CATEGORY_ORDER.forEach((cat) => {
      const catItems = grouped.get(cat);
      if (!catItems || catItems.length === 0) return;
      lines.push(`\n${CATEGORY_LABELS[cat]}:`);
      catItems.forEach((item: ShoppingItem) => {
        const mark = item.checked ? "\u2611" : "\u2610";
        lines.push(`  ${mark} ${item.name} — ${item.totalQuantity} ${item.unit}`);
      });
    });

    return lines.join("\n");
  }, [days, grouped]);

  const handleShare = useCallback(async () => {
    const text = buildShareText();

    if (navigator.share) {
      try {
        await navigator.share({ title: "Lista della spesa", text });
        return;
      } catch {
        /* user cancelled or share failed — fall through to clipboard */
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch { /* ignore */ }
  }, [buildShareText]);

  return (
    <div className="shopping-list-card">
      <div className="sl-header">
        <h2 className="sl-title">Lista della spesa</h2>
        <div className="sl-header-actions">
          <span className="sl-counter">{checkedCount}/{totalItems}</span>
          {totalItems > 0 && (
            <button
              type="button"
              className={`sl-share-btn ${shared ? "sl-share-btn--done" : ""}`}
              onClick={handleShare}
              title={shared ? "Copiato!" : "Condividi lista"}
            >
              {shared ? <ClipboardCheckIcon size={16} /> : <ShareIcon size={16} />}
            </button>
          )}
        </div>
      </div>

      <div className="sl-days-selector">
        <span className="sl-days-label">Giorni:</span>
        <div className="sl-days-buttons">
          {DAY_OPTIONS.map((d) => (
            <button
              key={d}
              type="button"
              className={`sl-day-btn ${days === d ? "sl-day-btn--active" : ""}`}
              onClick={() => handleDaysChange(d)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {totalItems === 0 ? (
        <p className="sl-empty">Nessun ingrediente trovato per i giorni selezionati.</p>
      ) : (
        <>
          <div className="sl-categories">
            {CATEGORY_ORDER.filter((cat) => grouped.has(cat)).map((cat) => {
              const catItems = grouped.get(cat)!;
              const isCollapsed = collapsedCats.has(cat);
              const catChecked = catItems.filter((i) => i.checked).length;

              return (
                <div key={cat} className="sl-category">
                  <button
                    type="button"
                    className="sl-category-header"
                    onClick={() => toggleCategory(cat)}
                  >
                    <span className="sl-category-name">
                      {CATEGORY_LABELS[cat]}
                      <span className="sl-category-count">
                        {catChecked}/{catItems.length}
                      </span>
                    </span>
                    <ChevronDownIcon
                      size={18}
                      style={{
                        transform: isCollapsed ? "rotate(-90deg)" : "rotate(0)",
                        transition: "transform 0.2s ease",
                      }}
                    />
                  </button>

                  {!isCollapsed && (
                    <ul className="sl-items">
                      {catItems.map((item) => (
                        <li
                          key={item.id}
                          className={`sl-item ${item.checked ? "sl-item--checked" : ""}`}
                        >
                          <label className="sl-item-label">
                            <span className="sl-checkbox-wrap">
                              <input
                                type="checkbox"
                                checked={item.checked}
                                onChange={() => handleToggle(item.id)}
                                className="sl-checkbox"
                              />
                              <span className="sl-checkbox-custom" />
                            </span>
                            <span className="sl-item-name">{item.name}</span>
                            <span className="sl-item-qty">
                              {item.totalQuantity} {item.unit}
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>

          {checkedCount > 0 && (
            <button type="button" className="sl-clear-btn" onClick={handleClearAll}>
              <TrashIcon size={15} />
              Svuota tutto
            </button>
          )}
        </>
      )}
    </div>
  );
}
