'use client'

import { useCallback, useState, useEffect, useRef, useId } from 'react'
import IngredientSelector from './IngredientSelector'
import { EditIcon } from './Icons'
import Modal from './Modal'
import type { FoodItem } from '@/types/diet'
import './EditableIngredientSelector.css'

interface EditableIngredientSelectorProps {
  label: string
  options: FoodItem[]
  selected: FoodItem | null | undefined
  onSelect: (option: FoodItem) => void
  placeholder?: string
}

export default function EditableIngredientSelector({
  label,
  options,
  selected,
  onSelect,
  placeholder = 'Seleziona...',
}: EditableIngredientSelectorProps) {
  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!selected) return
      onSelect({ ...selected, name: e.target.value.trim() })
    },
    [selected, onSelect],
  )

  const handleQuantityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!selected) return
      const v = e.target.value === '' ? 0 : Number(e.target.value)
      onSelect({ ...selected, quantity: Number.isFinite(v) && v >= 0 ? v : selected.quantity })
    },
    [selected, onSelect],
  )

  const handleQuantityKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault()
  }, [])

  const [isEditingIngredient, setIsEditingIngredient] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const nameId = useId()
  const quantityId = useId()

  useEffect(() => {
    if (!selected) setIsEditingIngredient(false)
  }, [selected])

  useEffect(() => {
    if (isEditingIngredient) {
      const t = requestAnimationFrame(() => nameInputRef.current?.focus())
      return () => cancelAnimationFrame(t)
    }
  }, [isEditingIngredient])

  const handleEditClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setIsEditingIngredient(true)
  }, [])

  return (
    <div className="editable-ingredient">
      <IngredientSelector
        label={label}
        options={options}
        selected={selected}
        onSelect={onSelect}
        placeholder={placeholder}
        trailingAction={
          selected ? (
            <button
              type="button"
              className="editable-ingredient-edit-btn editable-ingredient-edit-btn--inline"
              onClick={handleEditClick}
              aria-label="Modifica nome e quantità"
              title="Modifica nome e quantità"
            >
              <EditIcon size={16} />
            </button>
          ) : undefined
        }
      />
      {selected && isEditingIngredient && (
        <Modal
          title="Modifica ingrediente"
          onClose={() => setIsEditingIngredient(false)}
          buttonLabel="Chiudi"
        >
          <div className="editable-ingredient-fields editable-ingredient-fields--modal" role="group" aria-label="Modifica nome e quantità">
            <div className="editable-ingredient-field">
              <label className="editable-ingredient-field-label" htmlFor={nameId}>
                Nome
              </label>
              <input
                ref={nameInputRef}
                id={nameId}
                type="text"
                className="editable-ingredient-input editable-ingredient-input--name"
                value={selected.name}
                onChange={handleNameChange}
                placeholder="Es. Pane integrale"
                aria-label="Nome ingrediente"
              />
            </div>
            <div className="editable-ingredient-field">
              <label className="editable-ingredient-field-label" htmlFor={quantityId}>
                Quantità
              </label>
              <div className="editable-ingredient-quantity-wrap">
                <input
                  id={quantityId}
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  className="editable-ingredient-input editable-ingredient-input--quantity"
                  value={selected.quantity}
                  onChange={handleQuantityChange}
                  onKeyDown={handleQuantityKeyDown}
                  placeholder="0"
                  aria-label={`Quantità in ${selected.unit}`}
                />
                <span className="editable-ingredient-suffix" aria-hidden="true">
                  {selected.unit}
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
