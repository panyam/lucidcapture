import { Link } from 'react-router'
import { SideNav } from '../components/shared/SideNav'
import { MaterialIcon } from '../components/shared/MaterialIcon'

const mockArcades = [
  { id: '1', title: 'Onboarding Flow', views: '1.2k', date: '2 days ago', duration: '02:45' },
  { id: '2', title: 'New Feature Demo', views: '834', date: '5 days ago', duration: '01:30' },
  { id: '3', title: 'Enterprise Pitch Deck', views: '2.1k', date: '1 week ago', duration: '04:12' },
  { id: '4', title: 'Bug Report #402', views: '156', date: '3 days ago', duration: '00:55' },
]

export function DashboardPage() {
  return (
    <div className="flex min-h-screen">
      <SideNav />
      <main className="ml-64 flex-1 p-12 bg-surface">
        <header className="mb-12">
          <div className="flex items-end gap-3 mb-2">
            <h1 className="text-5xl font-black tracking-tighter text-on-background">My Arcades</h1>
            <span className="font-script text-primary text-2xl rotate-[-5deg] mb-2">curated</span>
          </div>
          <p className="text-slate-500 max-w-xl">
            Manage and organize your interactive product demos. Use the grid below to view recent activity and insights.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockArcades.map((arcade) => (
            <Link
              key={arcade.id}
              to={`/editor/${arcade.id}`}
              className="group relative bg-surface-container-lowest rounded-xl p-3 shadow-[0_32px_64px_-4px_rgba(20,27,43,0.04)] hover:shadow-[0_48px_80px_-4px_rgba(20,27,43,0.08)] transition-all duration-300"
            >
              <div className="aspect-video rounded-lg overflow-hidden relative mb-4 bg-surface-container-high">
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <MaterialIcon icon="smart_display" size="48px" />
                </div>
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <MaterialIcon icon="play_circle" filled className="text-white text-5xl" size="48px" />
                </div>
                <div className="absolute bottom-3 right-3 glass-panel px-2 py-1 rounded text-[10px] font-bold text-on-background">
                  {arcade.duration}
                </div>
              </div>
              <div className="px-2 pb-2">
                <h3 className="text-lg font-bold text-on-background mb-1">{arcade.title}</h3>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <MaterialIcon icon="visibility" size="14px" />
                      <span className="text-xs font-semibold">{arcade.views}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <MaterialIcon icon="edit_calendar" size="14px" />
                      <span className="text-xs font-semibold">{arcade.date}</span>
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-600">
                    <MaterialIcon icon="more_vert" size="20px" />
                  </button>
                </div>
              </div>
            </Link>
          ))}

          {/* Create New Card */}
          <Link
            to="/editor/new"
            className="rounded-xl p-3 border-2 border-dashed border-slate-200 hover:border-primary/40 transition-all duration-300 flex flex-col items-center justify-center gap-4 min-h-[280px] group"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary-fixed flex items-center justify-center group-hover:bg-primary-fixed-dim transition-colors">
              <MaterialIcon icon="add" className="text-primary" size="32px" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-on-background mb-1">Create New Arcade</h3>
              <p className="text-sm text-slate-500">Record an interactive demo</p>
            </div>
          </Link>

          {/* Insight Bento */}
          <div className="bg-gradient-to-br from-tertiary to-tertiary-container rounded-xl p-8 text-white flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-tertiary-fixed-dim mb-2">Weekly Insight</p>
              <h3 className="text-3xl font-black tracking-tight mb-2">
                Growth is up by <span className="text-on-tertiary-container">24%</span>
              </h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Your "Onboarding" demo is performing 3x better than average.
              </p>
            </div>
            <button className="mt-6 self-start bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-white/30 transition-colors">
              View Analytics
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
