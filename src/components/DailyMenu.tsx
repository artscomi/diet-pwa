'use client'

import { useState } from 'react'
import { dietData as defaultDietData } from '@/data/dietData'
import IngredientSelector from './IngredientSelector'
import { SunIcon, UtensilsIcon, MoonIcon, PeanutIcon, DropletIcon, SaveIcon, TimesIcon, EditIcon } from './Icons'
import type { DailyMenu, DietData, FoodItem } from '@/types/diet'
import './DailyMenu.css'

interface DailyMenuProps {
  menu: DailyMenu
  displayDate?: string
  onSave?: (menu: DailyMenu) => void
  onCancel?: () => void
  dietData?: DietData
}

function formatFood(food: FoodItem | FoodItem[] | null | undefined): string | null {
  if (!food) return null
  if (Array.isArray(food)) {
    return food.map((f) => `${f.name} (${f.quantity} ${f.unit})`).join(', ')
  }
  return `${food.name} (${food.quantity} ${food.unit})`
}

export default function DailyMenuComponent({ menu, displayDate, onSave, onCancel, dietData: dietDataProp }: DailyMenuProps) {
  const dietData = dietDataProp ?? defaultDietData
  const [isEditing, setIsEditing] = useState(false)
  const [editedMenu, setEditedMenu] = useState<DailyMenu>(menu)

  const handleSave = () => {
    if (onSave) {
      onSave(editedMenu)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedMenu(menu)
    setIsEditing(false)
    if (onCancel) {
      onCancel()
    }
  }

  if (isEditing) {
    return (
      <div className="daily-menu-card editing">
        <div className="menu-header">
          <div className="menu-actions">
            <button className="menu-action-btn save" onClick={handleSave}>
              <SaveIcon size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle', display: 'inline-block' }} />
              Salva
            </button>
            <button className="menu-action-btn cancel" onClick={handleCancel}>
              <TimesIcon size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle', display: 'inline-block' }} />
              Annulla
            </button>
          </div>
        </div>

        <div className="menu-content editing">
          <div className="menu-section">
            <h4>
              <SunIcon size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle', display: 'inline-block' }} />
              Colazione
            </h4>
            <IngredientSelector
              label="Carboidrati"
              options={dietData.colazione.carboidrati}
              selected={editedMenu.colazione?.carboidrati}
              onSelect={(selected) =>
                setEditedMenu({
                  ...editedMenu,
                  colazione: { ...editedMenu.colazione, carboidrati: selected },
                })
              }
            />
            <IngredientSelector
              label="Frutta"
              options={dietData.colazione.frutta}
              selected={editedMenu.colazione?.frutta}
              onSelect={(selected) =>
                setEditedMenu({
                  ...editedMenu,
                  colazione: { ...editedMenu.colazione, frutta: selected },
                })
              }
            />
            <IngredientSelector
              label="Proteine"
              options={dietData.colazione.proteine}
              selected={editedMenu.colazione?.proteine}
              onSelect={(selected) =>
                setEditedMenu({
                  ...editedMenu,
                  colazione: { ...editedMenu.colazione, proteine: selected },
                })
              }
            />
          </div>

          <div className="menu-section">
            <h4>
              <PeanutIcon size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle', display: 'inline-block' }} />
              Spuntino Mattutino
            </h4>
            <IngredientSelector
              label="Seleziona"
              options={dietData.spuntinoMattutino}
              selected={editedMenu.spuntinoMattutino}
              onSelect={(selected) => setEditedMenu({ ...editedMenu, spuntinoMattutino: selected })}
            />
          </div>

          <div className="menu-section">
            <h4>
              <UtensilsIcon size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle', display: 'inline-block' }} />
              Pranzo
            </h4>
            <IngredientSelector
              label="Carboidrati"
              options={dietData.pranzo.carboidrati}
              selected={editedMenu.pranzo?.carboidrati}
              onSelect={(selected) =>
                setEditedMenu({
                  ...editedMenu,
                  pranzo: { ...editedMenu.pranzo, carboidrati: selected },
                })
              }
            />
            <IngredientSelector
              label="Proteine"
              options={dietData.pranzo.proteine}
              selected={editedMenu.pranzo?.proteine}
              onSelect={(selected) =>
                setEditedMenu({
                  ...editedMenu,
                  pranzo: { ...editedMenu.pranzo, proteine: selected },
                })
              }
            />
            <IngredientSelector
              label="Verdure"
              options={dietData.pranzo.verdure}
              selected={editedMenu.pranzo?.verdure}
              onSelect={(selected) =>
                setEditedMenu({
                  ...editedMenu,
                  pranzo: { ...editedMenu.pranzo, verdure: selected },
                })
              }
            />
          </div>

          <div className="menu-section">
            <h4>
              <PeanutIcon size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle', display: 'inline-block' }} />
              Merenda
            </h4>
            <IngredientSelector
              label="Seleziona"
              options={dietData.merenda}
              selected={editedMenu.merenda}
              onSelect={(selected) => setEditedMenu({ ...editedMenu, merenda: selected })}
            />
          </div>

          <div className="menu-section">
            <h4>
              <MoonIcon size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle', display: 'inline-block' }} />
              Cena
            </h4>
            <IngredientSelector
              label="Pane"
              options={dietData.cena.pane}
              selected={editedMenu.cena?.pane}
              onSelect={(selected) =>
                setEditedMenu({
                  ...editedMenu,
                  cena: { ...editedMenu.cena, pane: selected },
                })
              }
            />
            <IngredientSelector
              label="Verdure"
              options={dietData.cena.verdure}
              selected={editedMenu.cena?.verdure}
              onSelect={(selected) =>
                setEditedMenu({
                  ...editedMenu,
                  cena: { ...editedMenu.cena, verdure: selected },
                })
              }
            />
            <IngredientSelector
              label="Proteine"
              options={dietData.cena.proteine}
              selected={editedMenu.cena?.proteine}
              onSelect={(selected) =>
                setEditedMenu({
                  ...editedMenu,
                  cena: { ...editedMenu.cena, proteine: selected },
                })
              }
            />
          </div>

          <div className="menu-section">
            <h4>
              <DropletIcon size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle', display: 'inline-block' }} />
              Durante la giornata
            </h4>
            <IngredientSelector
              label="Olio"
              options={dietData.olio}
              selected={editedMenu.olio}
              onSelect={(selected) => setEditedMenu({ ...editedMenu, olio: selected })}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="daily-menu-card">
      <div className="menu-header">
        {displayDate && <span className="menu-header__date">{displayDate}</span>}
        <button className="menu-action-btn edit" onClick={() => setIsEditing(true)}>
          <EditIcon size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle', display: 'inline-block' }} />
          Modifica
        </button>
      </div>

      <div className="menu-content">
        <div className="menu-section">
          <h4>
            <SunIcon size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle', display: 'inline-block' }} />
            Colazione
          </h4>
          {menu.colazione?.carboidrati && (
            <p>
              <strong>Carboidrati:</strong> {formatFood(menu.colazione.carboidrati)}
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
        </div>

        {menu.spuntinoMattutino && (
          <div className="menu-section">
            <h4>
              <PeanutIcon size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle', display: 'inline-block' }} />
              Spuntino Mattutino
            </h4>
            <p>{formatFood(menu.spuntinoMattutino)}</p>
          </div>
        )}

        <div className="menu-section">
          <h4>
            <UtensilsIcon size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle', display: 'inline-block' }} />
            Pranzo
          </h4>
          {menu.pranzo?.carboidrati && (
            <p>
              <strong>Carboidrati:</strong> {formatFood(menu.pranzo.carboidrati)}
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
        </div>

        {menu.merenda && (
          <div className="menu-section">
            <h4>
              <PeanutIcon size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle', display: 'inline-block' }} />
              Merenda
            </h4>
            <p>{formatFood(menu.merenda)}</p>
          </div>
        )}

        <div className="menu-section">
          <h4>
            <MoonIcon size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle', display: 'inline-block' }} />
            Cena
          </h4>
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
        </div>

        {menu.olio && (
          <div className="menu-section">
            <h4>
              <DropletIcon size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle', display: 'inline-block' }} />
              Durante la giornata
            </h4>
            <p>{formatFood(menu.olio)}</p>
          </div>
        )}
      </div>
    </div>
  )
}
