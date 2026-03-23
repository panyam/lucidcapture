import { Link, useLocation } from 'react-router'
import { MaterialIcon } from './MaterialIcon'

const navItems = [
  { icon: 'video_library', label: 'My Scenes', href: '/dashboard' },
  { icon: 'group', label: 'Shared', href: '#' },
  { icon: 'settings', label: 'Settings', href: '#' },
]

export function SideNav() {
  const location = useLocation()

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 pt-20 bg-slate-50 flex flex-col gap-2 px-4 py-6 z-40">
      <div className="mb-8 px-2 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold">
          W
        </div>
        <div>
          <p className="text-lg font-bold text-slate-900 leading-tight">Workspace</p>
          <p className="text-xs text-slate-500">Pro Plan</p>
        </div>
      </div>
      <div className="space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.label}
              to={item.href}
              className={`rounded-xl flex items-center gap-3 px-4 py-3 transition-all duration-200 hover:translate-x-1 ${
                isActive
                  ? 'bg-white text-blue-700 font-semibold shadow-sm'
                  : 'text-slate-500 font-medium hover:bg-slate-100'
              }`}
            >
              <MaterialIcon icon={item.icon} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
      <div className="mt-auto p-4 bg-surface-container-high rounded-xl">
        <p className="text-xs font-bold text-primary mb-2 uppercase tracking-widest">Growth</p>
        <p className="text-sm font-medium text-slate-700 mb-4">
          Unlock team features and advanced analytics.
        </p>
        <button className="w-full bg-primary text-white text-xs font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Upgrade to Team
        </button>
      </div>
    </aside>
  )
}
