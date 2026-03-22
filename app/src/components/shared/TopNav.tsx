import { Link, useLocation } from 'react-router'
import { MaterialIcon } from './MaterialIcon'

export function TopNav() {
  const location = useLocation()
  const isLanding = location.pathname === '/'

  return (
    <header className="bg-white/70 backdrop-blur-xl sticky top-0 z-50 shadow-[0_32px_64px_-4px_rgba(20,27,43,0.04)]">
      <div className="flex justify-between items-center w-full px-8 py-4 max-w-[1920px] mx-auto">
        <div className="flex items-center gap-12">
          <Link to="/" className="text-2xl font-black tracking-tighter text-blue-800">
            Lucid Capture
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link className="text-slate-500 font-medium hover:text-blue-600 transition-colors" to="/dashboard">
              Explore
            </Link>
            <a className="text-slate-500 font-medium hover:text-blue-600 transition-colors" href="#">
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
          <div className="h-10 w-10 rounded-full bg-surface-container-highest overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary transition-all">
            <div className="w-full h-full bg-primary-fixed-dim flex items-center justify-center text-on-primary-fixed text-sm font-bold">
              U
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
