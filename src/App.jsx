import { useState, useEffect } from 'react'
import { dailyMenus as initialMenus } from './data/dailyMenus'
import DailyMenu from './components/DailyMenu'
import { DownloadIcon, ArrowLeftIcon, ArrowRightIcon, ListIcon, SunIcon, UtensilsIcon, MoonIcon, SaladBowlIcon, HeartIcon } from './components/Icons'
import './App.css'

function App() {
  const [menus, setMenus] = useState([])
  const [selectedMenu, setSelectedMenu] = useState(null)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Load menus from localStorage or use initial menus
    const savedMenus = localStorage.getItem('dietMenus')
    if (savedMenus) {
      try {
        const parsed = JSON.parse(savedMenus)
        setMenus(parsed)
      } catch (e) {
        setMenus(initialMenus)
      }
    } else {
      setMenus(initialMenus)
    }

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setIsInstalled(true)
    }
    setInstallPrompt(null)
  }

  const handleSaveMenu = (updatedMenu) => {
    const updatedMenus = menus.map(menu => 
      menu.id === updatedMenu.id ? updatedMenu : menu
    )
    setMenus(updatedMenus)
    localStorage.setItem('dietMenus', JSON.stringify(updatedMenus))
    
    // Update selected menu if it's the one being edited
    if (selectedMenu && selectedMenu.id === updatedMenu.id) {
      setSelectedMenu(updatedMenu)
    }
  }

  const handleMenuClick = (menu) => {
    setSelectedMenu(menu)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          <SaladBowlIcon size={24} style={{ marginRight: '0.5rem', verticalAlign: 'middle', display: 'inline-block' }} />
          Menu Dietetici
        </h1>
        <p className="subtitle">Menu giornalieri predefiniti che rispettano la dieta</p>
      </header>

      <main className="app-main">
        {installPrompt && !isInstalled && (
          <button className="install-button" onClick={handleInstallClick}>
            <DownloadIcon size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle', display: 'inline-block' }} />
            Installa App
          </button>
        )}

        {selectedMenu ? (
          <div className="menu-detail-view">
            <button 
              className="back-button"
              onClick={() => setSelectedMenu(null)}
            >
              <ArrowLeftIcon size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle', display: 'inline-block' }} />
              Torna all'elenco
            </button>
            <DailyMenu 
              menu={selectedMenu} 
              onSave={handleSaveMenu}
            />
          </div>
        ) : (
          <div className="menus-list">
            <div className="info-banner">
              <p>
                <ListIcon size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle', display: 'inline-block' }} />
                Seleziona un menu per visualizzare i dettagli completi
              </p>
            </div>
            
            <div className="menus-grid">
              {menus.map((menu, index) => (
                <button
                  key={menu.id}
                  className="menu-card"
                  onClick={() => handleMenuClick(menu)}
                >
                  <div className="menu-card-number">{index + 1}</div>
                  <div className="menu-card-content">
                    <h3>{menu.name}</h3>
                    <div className="menu-card-preview">
                      <div className="preview-item">
                        <span className="preview-icon"><SunIcon size={16} /></span>
                        <span className="preview-text">
                          {menu.colazione.carboidrati?.name || 'N/A'}
                        </span>
                      </div>
                      <div className="preview-item">
                        <span className="preview-icon"><UtensilsIcon size={16} /></span>
                        <span className="preview-text">
                          {menu.pranzo.proteine?.name || 'N/A'}
                        </span>
                      </div>
                      <div className="preview-item">
                        <span className="preview-icon"><MoonIcon size={16} /></span>
                        <span className="preview-text">
                          {menu.cena.proteine?.name || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="menu-card-arrow"><ArrowRightIcon size={18} /></div>
                </button>
              ))}
            </div>
          </div>
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
