import { useParams } from 'react-router'
import { SideNav } from '../components/shared/SideNav'
import { MaterialIcon } from '../components/shared/MaterialIcon'

export function EditorPage() {
  const { id } = useParams()

  return (
    <div className="flex min-h-screen">
      <SideNav />
      <main className="ml-64 flex-1 flex flex-col bg-surface">
        {/* Editor Canvas */}
        <div className="flex-1 p-8 flex flex-col">
          {/* Video Preview Stage */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-full max-w-4xl aspect-video bg-inverse-surface rounded-2xl shadow-[0_48px_80px_-4px_rgba(20,27,43,0.12)] overflow-hidden">
              {/* Placeholder for captured content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-inverse-on-surface">
                  <MaterialIcon icon="smart_display" size="64px" />
                  <p className="mt-4 text-sm font-medium opacity-70">
                    {id === 'new' ? 'Start recording to capture steps' : `Editing arcade ${id}`}
                  </p>
                </div>
              </div>

              {/* Interactive Hotspot Example */}
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative group cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-primary/80 animate-pulse" />
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 glass-panel ghost-border rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    <p className="text-xs font-semibold text-on-background">Click here to continue</p>
                  </div>
                </div>
              </div>

              {/* Floating Controls Overlay */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass-panel ghost-border rounded-full px-6 py-3 flex items-center gap-6">
                <button className="text-on-background/60 hover:text-on-background transition-colors">
                  <MaterialIcon icon="skip_previous" size="20px" />
                </button>
                <button className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary-container flex items-center justify-center text-white shadow-lg">
                  <MaterialIcon icon="play_arrow" filled size="24px" />
                </button>
                <button className="text-on-background/60 hover:text-on-background transition-colors">
                  <MaterialIcon icon="skip_next" size="20px" />
                </button>
                <span className="text-xs font-semibold text-on-background/60">0:00 / 0:00</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-6 bg-surface-container-low rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Timeline</h3>
              <div className="flex items-center gap-2">
                <button className="text-slate-400 hover:text-slate-600">
                  <MaterialIcon icon="zoom_out" size="18px" />
                </button>
                <button className="text-slate-400 hover:text-slate-600">
                  <MaterialIcon icon="zoom_in" size="18px" />
                </button>
              </div>
            </div>
            {/* Timeline track */}
            <div className="h-12 bg-surface-container-high rounded-lg relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-secondary/30 rounded-lg" />
              <div className="absolute left-1/3 top-0 bottom-0 w-1/4 bg-primary/30 rounded-lg ml-1" />
              {/* Playhead */}
              <div className="absolute left-1/4 top-0 bottom-0 w-0.5 bg-tertiary-fixed-dim z-10">
                <div className="w-3 h-3 bg-tertiary-fixed-dim rotate-45 -translate-x-[5px] -translate-y-1" />
              </div>
            </div>
            {/* Time markers */}
            <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-semibold">
              <span>0:00</span>
              <span>1:00</span>
              <span>2:00</span>
              <span>3:00</span>
              <span>4:00</span>
            </div>
          </div>
        </div>
      </main>

      {/* Tool Sidebar */}
      <aside className="w-80 bg-surface-container-lowest p-6 flex flex-col gap-8 overflow-y-auto">
        <h2 className="text-lg font-bold text-on-background">Editor Tools</h2>

        {/* Interactivity */}
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Interactivity</p>
          <div className="grid grid-cols-2 gap-2">
            <button className="bg-surface-container-low rounded-xl p-4 text-center hover:bg-surface-container transition-colors">
              <MaterialIcon icon="ads_click" className="text-primary" />
              <p className="text-xs font-semibold text-on-background mt-2">Hotspot</p>
            </button>
            <button className="bg-surface-container-low rounded-xl p-4 text-center hover:bg-surface-container transition-colors">
              <MaterialIcon icon="text_fields" className="text-primary" />
              <p className="text-xs font-semibold text-on-background mt-2">Input Field</p>
            </button>
          </div>
        </div>

        {/* Annotations */}
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Annotations</p>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Step Title</label>
              <input
                type="text"
                placeholder="e.g., Click the dashboard"
                className="w-full bg-surface-container-low rounded-lg px-4 py-2.5 text-sm text-on-background placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 border-b-2 border-transparent focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Text Content</label>
              <textarea
                placeholder="Add a description..."
                rows={3}
                className="w-full bg-surface-container-low rounded-lg px-4 py-2.5 text-sm text-on-background placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 border-b-2 border-transparent focus:border-primary transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Timing */}
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Timing &amp; Transitions</p>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Step Duration (s)</label>
              <input
                type="number"
                defaultValue={3}
                min={0.5}
                step={0.5}
                className="w-full bg-surface-container-low rounded-lg px-4 py-2.5 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20 border-b-2 border-transparent focus:border-primary transition-all"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Ease In/Out</span>
              <button className="w-10 h-6 rounded-full bg-primary relative">
                <div className="w-4 h-4 rounded-full bg-white absolute right-1 top-1 shadow-sm" />
              </button>
            </div>
          </div>
        </div>

        {/* Pro Tip */}
        <div className="bg-gradient-to-br from-primary-fixed to-primary-fixed-dim rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <MaterialIcon icon="lightbulb" className="text-primary" size="18px" />
            <p className="text-xs font-bold text-primary uppercase tracking-widest">Pro Tip</p>
          </div>
          <p className="text-sm text-on-primary-fixed leading-relaxed">
            Use keyboard shortcuts: <strong>H</strong> for hotspot, <strong>Space</strong> to play/pause.
          </p>
        </div>
      </aside>
    </div>
  )
}
