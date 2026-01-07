import { useState, useEffect } from 'react'
import { dailyMenus } from './data/dailyMenus'
import DailyMenu from './components/DailyMenu'
import { SaladBowlIcon, HeartIcon } from './components/Icons'
import './App.css'

function App() {
  const [currentMenu, setCurrentMenu] = useState(null)
  const [todayDate, setTodayDate] = useState(new Date().toDateString())

  // Funzione per ottenere il menu del giorno corrente
  const getTodayMenu = () => {
    // Calcola il numero del giorno dall'inizio dell'anno (0-365)
    const today = new Date()
    const startOfYear = new Date(today.getFullYear(), 0, 0)
    const dayOfYear = Math.floor((today - startOfYear) / (1000 * 60 * 60 * 24))
    
    // Usa il giorno dell'anno modulo il numero di menu per ciclare tra i menu
    const menuIndex = dayOfYear % dailyMenus.length
    
    // Crea una copia del menu con la data di oggi
    const menu = { ...dailyMenus[menuIndex] }
    menu.date = today.toDateString()
    
    return menu
  }

  // Funzione per formattare la data
  const formatDate = (date) => {
    return date.toLocaleDateString('it-IT', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  useEffect(() => {
    // Carica il menu del giorno corrente
    const today = new Date()
    const todayKey = today.toDateString()
    
    // Controlla se è cambiato il giorno
    if (todayKey !== todayDate) {
      setTodayDate(todayKey)
    }
    
    // Carica il menu predefinito di oggi
    const todayMenu = getTodayMenu()
    
    // Controlla se c'è una versione modificata salvata per oggi
    const savedMenu = localStorage.getItem(`dietMenu_${todayKey}`)
    if (savedMenu) {
      try {
        const parsed = JSON.parse(savedMenu)
        // Verifica che il menu salvato sia per oggi
        if (parsed.date === todayKey) {
          setCurrentMenu(parsed)
        } else {
          setCurrentMenu(todayMenu)
        }
      } catch (e) {
        setCurrentMenu(todayMenu)
      }
    } else {
      setCurrentMenu(todayMenu)
    }

    // Controlla ogni minuto se è cambiato il giorno
    const checkDayChange = setInterval(() => {
      const now = new Date()
      const currentDate = now.toDateString()
      
      if (currentDate !== todayDate) {
        // Il giorno è cambiato, ricarica il menu
        const newTodayMenu = getTodayMenu()
        const savedMenu = localStorage.getItem(`dietMenu_${currentDate}`)
        if (savedMenu) {
          try {
            const parsed = JSON.parse(savedMenu)
            if (parsed.date === currentDate) {
              setCurrentMenu(parsed)
            } else {
              setCurrentMenu(newTodayMenu)
            }
          } catch (e) {
            setCurrentMenu(newTodayMenu)
          }
        } else {
          setCurrentMenu(newTodayMenu)
        }
        setTodayDate(currentDate)
      }
    }, 60000) // Controlla ogni minuto

    // Controlla anche quando la pagina diventa visibile (utente torna all'app)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const now = new Date()
        const currentDate = now.toDateString()
        if (currentDate !== todayDate) {
          const newTodayMenu = getTodayMenu()
          const savedMenu = localStorage.getItem(`dietMenu_${currentDate}`)
          if (savedMenu) {
            try {
              const parsed = JSON.parse(savedMenu)
              if (parsed.date === currentDate) {
                setCurrentMenu(parsed)
              } else {
                setCurrentMenu(newTodayMenu)
              }
            } catch (e) {
              setCurrentMenu(newTodayMenu)
            }
          } else {
            setCurrentMenu(newTodayMenu)
          }
          setTodayDate(currentDate)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(checkDayChange)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [todayDate])

  const handleSaveMenu = (updatedMenu) => {
    // Salva il menu modificato per oggi con la data
    const today = new Date()
    const todayKey = today.toDateString()
    const menuToSave = { ...updatedMenu, date: todayKey }
    localStorage.setItem(`dietMenu_${todayKey}`, JSON.stringify(menuToSave))
    setCurrentMenu(menuToSave)
  }

  const today = new Date()

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          <SaladBowlIcon size={24} style={{ marginRight: '0.5rem', verticalAlign: 'middle', display: 'inline-block' }} />
          Menu di Oggi
        </h1>
        <p className="subtitle">{formatDate(today)}</p>
      </header>

      <main className="app-main">
        {currentMenu && (
          <DailyMenu 
            menu={currentMenu} 
            onSave={handleSaveMenu}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>
          Made with <HeartIcon size={14} style={{ margin: '0 0.25rem', color: '#e74c3c', verticalAlign: 'middle', display: 'inline-block' }} /> - Menu Dietetici PWA
        </p>
      </footer>
    </div>
  )
}

export default App
