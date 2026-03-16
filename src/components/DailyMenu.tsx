'use client'

import { useState } from 'react'
import Image from 'next/image'
import { dietData as defaultDietData } from '@/data/dietData'
import IngredientSelector from './IngredientSelector'
import EditableIngredientSelector from './EditableIngredientSelector'
import { SunIcon, UtensilsIcon, MoonIcon, PeanutIcon, DropletIcon, SaveIcon, TimesIcon, EditIcon, ListIcon } from './Icons'
import Modal from './Modal'
import type { DailyMenu, DietData, FoodItem, UploadedFileInfo } from '@/types/diet'
import './DailyMenu.css'

interface DailyMenuProps {
  menu: DailyMenu
  displayDate?: string
  onSave?: (menu: DailyMenu) => void
  onCancel?: () => void
  dietData?: DietData
  /** Anteprima del file caricato (solo se dieta da upload) */
  uploadedFile?: UploadedFileInfo | null
}

function formatFood(food: FoodItem | FoodItem[] | null | undefined): string | null {
  if (!food) return null
  if (Array.isArray(food)) {
    return food.map((f) => `${f.name} (${f.quantity} ${f.unit})`).join(', ')
  }
  return `${food.name} (${food.quantity} ${food.unit})`
}

export default function DailyMenuComponent({ menu, displayDate, onSave, onCancel, dietData: dietDataProp, uploadedFile }: DailyMenuProps) {
  const dietData = dietDataProp ?? defaultDietData
  const [isEditing, setIsEditing] = useState(false)
  const [editedMenu, setEditedMenu] = useState<DailyMenu>(menu)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)

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
            <EditableIngredientSelector
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
            <EditableIngredientSelector
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
            <EditableIngredientSelector
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
            <EditableIngredientSelector
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
            <EditableIngredientSelector
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
            <EditableIngredientSelector
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
            <EditableIngredientSelector
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
            <EditableIngredientSelector
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
            <EditableIngredientSelector
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
            <EditableIngredientSelector
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
            <EditableIngredientSelector
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

          {dietData.olio && dietData.olio.length > 0 && (
            <div className="menu-section">
              <h4>
                <DropletIcon size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle', display: 'inline-block' }} />
                Durante la giornata
              </h4>
              <EditableIngredientSelector
                label="Olio"
                options={dietData.olio}
                selected={editedMenu.olio}
                onSelect={(selected) => setEditedMenu({ ...editedMenu, olio: selected })}
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderFilePreviewContent = () => {
    if (!uploadedFile) return null
    const { name, mimeType, previewDataUrl } = uploadedFile
    return (
      <div className="menu-file-preview menu-file-preview--modal" role="region" aria-label="File caricato">
        <p className="menu-file-preview-title">{name}</p>
        {previewDataUrl ? (
          <>
            {mimeType.startsWith('image/') && (
              <div className="menu-file-preview-media">
                <Image
                  src={previewDataUrl}
                  alt={`Anteprima ${name}`}
                  className="menu-file-preview-img"
                  width={600}
                  height={400}
                  unoptimized
                  style={{ width: 'auto', height: 'auto', objectFit: 'contain' }}
                />
              </div>
            )}
            {mimeType === 'application/pdf' && (
              <div className="menu-file-preview-media">
                <iframe src={previewDataUrl} title={`Anteprima ${name}`} className="menu-file-preview-iframe" />
              </div>
            )}
            {mimeType === 'text/plain' && (() => {
              try {
                const base64 = previewDataUrl.split(',')[1]
                const text = base64 ? atob(base64) : ''
                return (
                  <pre className="menu-file-preview-text">{text}</pre>
                )
              } catch {
                return <p className="menu-file-preview-fallback">Anteprima testo non disponibile.</p>
              }
            })()}
            {!mimeType.startsWith('image/') && mimeType !== 'application/pdf' && mimeType !== 'text/plain' && previewDataUrl && (
              <div className="menu-file-preview-media">
                <iframe src={previewDataUrl} title={`Anteprima ${name}`} className="menu-file-preview-iframe" />
              </div>
            )}
          </>
        ) : (
          <p className="menu-file-preview-fallback">Anteprima non disponibile per file grandi.</p>
        )}
      </div>
    )
  }

  return (
    <div className="daily-menu-card">
      <div className="menu-header">
        {displayDate && <span className="menu-header__date">{displayDate}</span>}
        <div className="menu-header-actions">
          {uploadedFile && (
            <button
              type="button"
              className="menu-action-btn preview"
              onClick={() => setPreviewModalOpen(true)}
              aria-label="Apri file caricato"
            >
              <ListIcon size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle', display: 'inline-block' }} />
              File caricato
            </button>
          )}
          <button className="menu-action-btn edit" onClick={() => setIsEditing(true)}>
            <EditIcon size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle', display: 'inline-block' }} />
            Modifica
          </button>
        </div>
      </div>

      {previewModalOpen && uploadedFile && (
        <Modal
          title="File caricato"
          onClose={() => setPreviewModalOpen(false)}
          buttonLabel="Chiudi"
          wide
          documentWide={uploadedFile.mimeType === 'application/pdf' || uploadedFile.mimeType === 'text/plain'}
        >
          {renderFilePreviewContent()}
        </Modal>
      )}

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

        {(menu.duranteLaGiornata || menu.olio) && (
          <div className="menu-section">
            <h4>
              <DropletIcon size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle', display: 'inline-block' }} />
              Durante la giornata
            </h4>
            {menu.duranteLaGiornata && <p className="menu-notes">{menu.duranteLaGiornata}</p>}
            {menu.olio && <p>{formatFood(menu.olio)}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
