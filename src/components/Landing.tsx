'use client'

import { useState, useRef, useCallback } from 'react'
import { IconFileUpload } from '@tabler/icons-react'
import { dailyMenus } from '@/data/dailyMenus'
import { SaladBowlIcon, HeartIcon } from './Icons'
import InstallAppCTA from './InstallAppCTA'
import { validateDietJson } from '@/utils/validateDietJson'
import type { UserDiet } from '@/types/diet'
import './Landing.css'

const USER_DIET_KEY = 'userDiet'
const DIET_MENU_PREFIX = 'dietMenu_'

function saveUserDiet(data: UserDiet): void {
  localStorage.setItem(USER_DIET_KEY, JSON.stringify(data))
}

/** Rimuove i menu salvati per giorno (dietMenu_*), così dopo un cambio dieta si usa il menu del giorno dalla nuova dieta */
export function clearSavedDailyMenus(): void {
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(DIET_MENU_PREFIX)) keysToRemove.push(key)
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k))
}

export function getDefaultUserDiet(): UserDiet {
  return {
    dailyMenus: JSON.parse(JSON.stringify(dailyMenus)) as UserDiet['dailyMenus'],
  }
}

export function loadUserDiet(): UserDiet | null {
  try {
    const raw = localStorage.getItem(USER_DIET_KEY)
    if (!raw) return null
    return JSON.parse(raw) as UserDiet
  } catch {
    return null
  }
}

export function clearUserDiet(): void {
  localStorage.removeItem(USER_DIET_KEY)
}

interface LandingProps {
  onDietLoaded: (diet: UserDiet) => void
}

export default function Landing({ onDietLoaded }: LandingProps) {
  const [uploadStatus, setUploadStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUseDefault = () => {
    clearSavedDailyMenus()
    const defaultDiet = getDefaultUserDiet()
    saveUserDiet(defaultDiet)
    onDietLoaded(defaultDiet)
  }

  const processFile = useCallback(
    async (file: File) => {
      setError(null)
      setUploadStatus('loading')

      const formData = new FormData()
      formData.append('file', file)

      try {
        const res = await fetch('/api/parse-diet', {
          method: 'POST',
          body: formData,
        })
        const text = await res.text()
        let json: { success?: boolean; data?: UserDiet; error?: string }
        try {
          json = text ? (JSON.parse(text) as typeof json) : {}
        } catch {
          setUploadStatus(null)
          setError('Il server non ha risposto correttamente. Verifica che l’app sia avviata con npm run dev.')
          if (fileInputRef.current) fileInputRef.current.value = ''
          return
        }

        if (!res.ok) {
          setUploadStatus(null)
          setError(json.error || "Errore durante l'analisi del file")
          if (fileInputRef.current) fileInputRef.current.value = ''
          return
        }

        if (!json.success || !json.data) {
          setUploadStatus(null)
          setError('Risposta non valida dal server')
          if (fileInputRef.current) fileInputRef.current.value = ''
          return
        }

        const validation = validateDietJson(json.data)
        if (!validation.valid) {
          setUploadStatus(null)
          setError(validation.error || 'Il file non contiene una dieta valida')
          if (fileInputRef.current) fileInputRef.current.value = ''
          return
        }

        const toSave: UserDiet = {
          dailyMenus: json.data.dailyMenus,
          ...(json.data.dietData && { dietData: json.data.dietData }),
        }
        clearSavedDailyMenus()
        saveUserDiet(toSave)
        onDietLoaded(toSave)
      } catch (err) {
        setUploadStatus(null)
        setError(err instanceof Error ? err.message : 'Errore di connessione. Verifica che il server sia avviato.')
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    },
    [onDietLoaded]
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0]
    if (file) processFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (uploadStatus === 'loading') return
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (uploadStatus === 'loading') return
    const file = e.dataTransfer?.files?.[0]
    if (file) {
      if (fileInputRef.current) fileInputRef.current.value = ''
      processFile(file)
    }
  }

  return (
    <div className="landing">
      <header className="landing-header">
        <h1>
          <SaladBowlIcon size={28} style={{ marginRight: '0.5rem', verticalAlign: 'middle', display: 'inline-block' }} />
          Il tuo menu del giorno
        </h1>
        <p className="landing-subtitle">
          Un menu che rispetta la tua dieta, ogni giorno. Carica il file, personalizza gli ingredienti e hai tutto a portata di mano.
        </p>
      </header>

      <main className="landing-main">
        {process.env.NODE_ENV === 'development' && (
          <button
            type="button"
            className="landing-btn landing-btn-primary"
            onClick={handleUseDefault}
            disabled={uploadStatus === 'loading'}
          >
            Usa dieta predefinita
          </button>
        )}

        <div
          className={`landing-dropzone ${isDragging ? 'landing-dropzone--active' : ''} ${uploadStatus === 'loading' ? 'landing-dropzone--loading' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => uploadStatus !== 'loading' && fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && uploadStatus !== 'loading') {
              e.preventDefault()
              fileInputRef.current?.click()
            }
          }}
          aria-label="Carica un file con la tua dieta"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="*/*"
            onChange={handleFileChange}
            disabled={uploadStatus === 'loading'}
            className="landing-file-input"
            id="diet-file"
            aria-hidden
          />
          {uploadStatus === 'loading' ? (
            <p className="landing-dropzone-text">Analisi in corso con OpenAI...</p>
          ) : (
            <>
              <IconFileUpload size={40} className="landing-dropzone-icon" stroke={1.5} />
              <p className="landing-dropzone-title">Trascina qui il file della tua dieta</p>
              <p className="landing-dropzone-hint">oppure tocca per scegliere dal telefono o dal computer</p>
            </>
          )}
        </div>

        {error && (
          <p className="landing-error" role="alert">
            {error}
          </p>
        )}
      </main>

      <footer className="landing-footer">
        <p>
          Made with{' '}
          <HeartIcon
            size={14}
            style={{
              margin: '0 0.25rem',
              color: '#e74c3c',
              verticalAlign: 'middle',
              display: 'inline-block',
            }}
          />{' '}
          by{' '}
          <a
            href="https://instagram.com/artscomi"
            target="_blank"
            rel="noopener noreferrer"
          >
            Artscomi
          </a>{' '}
          - Menu Dietetici PWA
        </p>
        <InstallAppCTA />
      </footer>
    </div>
  )
}
