'use client'

import { useState, useRef, useEffect } from 'react'
import type { FoodItem } from '@/types/diet'
import './IngredientSelector.css'

interface IngredientSelectorProps {
  label: string
  options: FoodItem[]
  selected: FoodItem | null | undefined
  onSelect: (option: FoodItem) => void
  placeholder?: string
}

export default function IngredientSelector({
  label,
  options,
  selected,
  onSelect,
  placeholder = 'Seleziona...',
}: IngredientSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSelect = (option: FoodItem) => {
    onSelect(option)
    setIsOpen(false)
  }

  const getDisplayText = () => {
    if (!selected) return placeholder
    return `${selected.name} (${selected.quantity} ${selected.unit})`
  }

  return (
    <div className="ingredient-selector" ref={dropdownRef}>
      <label className="ingredient-label">{label}</label>
      <button
        className={`ingredient-selector-button ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span className="ingredient-selector-text">{getDisplayText()}</span>
        <span className="ingredient-selector-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="ingredient-dropdown">
          {options.length === 0 ? (
            <div className="ingredient-option empty">Nessuna opzione disponibile</div>
          ) : (
            options.map((option, index) => {
              const isSelected = selected?.name === option.name

              return (
                <button
                  key={index}
                  className={`ingredient-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(option)}
                  type="button"
                >
                  <span className="option-name">{option.name}</span>
                  <span className="option-quantity">
                    {option.quantity} {option.unit}
                  </span>
                  {isSelected && <span className="check-mark">✓</span>}
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
