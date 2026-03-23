import { Link, useLocation } from 'react-router'
import { MaterialIcon } from './MaterialIcon'

function toggleDarkMode() {
  const html = document.documentElement
  const isDark = html.classList.toggle('dark')
  localStorage.setItem('theme', isDark ? 'dark' : 'light')
}

export function TopNav() {
  const location = useLocation()
  const isLanding = location.pathname === '/'

  return (
    <header className="bg-white/70 dark:bg-surface-container/80 backdrop-blur-xl sticky top-0 z-50 shadow-[0_32px_64px_-4px_rgba(20,27,43,0.04)] dark:shadow-none dark:border-b dark:border-white/5">
      <div className="flex justify-between items-center w-full px-8 py-4 max-w-[1920px] mx-auto">
        <div className="flex items-center gap-12">
          <Link to="/" className="text-2xl font-black tracking-tighter text-blue-800 dark:text-primary">
            Lucid Capture
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link className="text-slate-500 dark:text-on-surface-variant font-medium hover:text-blue-600 dark:hover:text-primary transition-colors" to="/dashboard">
              Explore
            </Link>
            <a className="text-slate-500 dark:text-on-surface-variant font-medium hover:text-blue-600 dark:hover:text-primary transition-colors" href="#">
              Community
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          {!isLanding && (
            <Link
              to="/editor/new"
              className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-6 py-2.5 rounded-full font-semibold text-sm shadow-lg hover:shadow-primary/20 transition-all active:scale-95 duration-200 flex items-center gap-2"
            >
              <MaterialIcon icon="videocam" filled size="18px" />
              Record New
            </Link>
          )}
          <button
            onClick={toggleDarkMode}
            className="h-9 w-9 rounded-full flex items-center justify-center text-slate-500 dark:text-on-surface-variant hover:bg-surface-container-high dark:hover:bg-surface-container-highest transition-colors"
            title="Toggle dark mode"
          >
            <MaterialIcon icon="dark_mode" size="20px" className="hidden dark:block" />
            <MaterialIcon icon="light_mode" size="20px" className="block dark:hidden" />
          </button>
          <div className="h-10 w-10 rounded-full bg-surface-container-highest dark:bg-surface-container-high overflow-hidden cursor-pointer border-2 border-transparent dark:border-white/10 hover:border-primary transition-all">
            <div className="w-full h-full bg-primary-fixed-dim dark:bg-surface-container-highest flex items-center justify-center text-on-primary-fixed dark:text-on-surface text-sm font-bold">
              U
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
