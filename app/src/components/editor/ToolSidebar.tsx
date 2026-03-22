import { MaterialIcon } from '../shared/MaterialIcon'
import type { ArcadeStep, StepTransition } from '../../types/arcade'

interface ToolSidebarProps {
  step: ArcadeStep | undefined
  stepIndex: number
  onAnnotationChange: (field: 'title' | 'body', value: string) => void
  onDurationChange: (seconds: number) => void
  onTransitionChange: (transition: StepTransition) => void
}

export function ToolSidebar({ step, stepIndex, onAnnotationChange, onDurationChange, onTransitionChange }: ToolSidebarProps) {
  return (
    <aside className="w-80 bg-surface-container-lowest p-6 flex flex-col gap-6 overflow-y-auto">
      <h2 className="text-lg font-bold text-on-background">Editor Tools</h2>

      {step ? (
        <>
          <StepInfo step={step} stepIndex={stepIndex} />
          <AnnotationEditor step={step} onChange={onAnnotationChange} />
          <TimingEditor step={step} onDurationChange={onDurationChange} onTransitionChange={onTransitionChange} />
          <HotspotInfo step={step} />
        </>
      ) : (
        <p className="text-sm text-slate-400">Select a step to edit its properties.</p>
      )}

      <KeyboardShortcuts />
    </aside>
  )
}

function StepInfo({ step, stepIndex }: { step: ArcadeStep; stepIndex: number }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Step {stepIndex + 1}</p>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-sm">
          <MaterialIcon
            icon={step.type === 'click' ? 'ads_click' : step.type === 'scroll' ? 'swipe_up' : 'keyboard'}
            size="16px"
            className="text-primary"
          />
          <span className="text-on-background font-semibold">
            {step.clickTarget?.label ?? `Step ${stepIndex + 1}`}
          </span>
        </div>
        <p className="text-slate-500 text-xs truncate" title={step.url}>{step.url}</p>
      </div>
    </div>
  )
}

function AnnotationEditor({ step, onChange }: { step: ArcadeStep; onChange: (field: 'title' | 'body', value: string) => void }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Annotations</p>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Step Title</label>
          <input
            type="text"
            value={step.annotation?.title ?? ''}
            onChange={(e) => onChange('title', e.target.value)}
            placeholder="e.g., Click the dashboard"
            className="w-full bg-surface-container-low rounded-lg px-4 py-2.5 text-sm text-on-background placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 border-b-2 border-transparent focus:border-primary transition-all"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Description</label>
          <textarea
            value={step.annotation?.body ?? ''}
            onChange={(e) => onChange('body', e.target.value)}
            placeholder="Add a description..."
            rows={3}
            className="w-full bg-surface-container-low rounded-lg px-4 py-2.5 text-sm text-on-background placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 border-b-2 border-transparent focus:border-primary transition-all resize-none"
          />
        </div>
      </div>
    </div>
  )
}

function TimingEditor({ step, onDurationChange, onTransitionChange }: {
  step: ArcadeStep
  onDurationChange: (seconds: number) => void
  onTransitionChange: (transition: StepTransition) => void
}) {
  const transitions: StepTransition[] = ['fade', 'slide', 'none']

  return (
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Timing</p>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Duration (seconds)</label>
          <input
            type="number"
            value={(step.duration / 1000).toFixed(1)}
            onChange={(e) => onDurationChange(parseFloat(e.target.value) || 3)}
            min={0.5}
            step={0.5}
            className="w-full bg-surface-container-low rounded-lg px-4 py-2.5 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20 border-b-2 border-transparent focus:border-primary transition-all"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Transition</label>
          <div className="flex gap-2">
            {transitions.map((t) => (
              <button
                key={t}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  step.transition === t
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-low text-slate-500 hover:bg-surface-container'
                }`}
                onClick={() => onTransitionChange(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function HotspotInfo({ step }: { step: ArcadeStep }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Hotspot</p>
      <p className="text-xs text-slate-500 leading-relaxed">
        Click anywhere on the canvas to reposition the hotspot.
      </p>
      {step.clickTarget && (
        <p className="text-[10px] text-slate-400 mt-2 font-mono">
          Position: {(step.clickTarget.x * 100).toFixed(0)}%, {(step.clickTarget.y * 100).toFixed(0)}%
        </p>
      )}
    </div>
  )
}

function KeyboardShortcuts() {
  const shortcuts = [
    ['Play / Pause', 'Space'],
    ['Previous step', '←'],
    ['Next step', '→'],
    ['Toggle edit mode', 'E'],
    ['Delete step', 'Del'],
  ]

  return (
    <div className="bg-gradient-to-br from-primary-fixed to-primary-fixed-dim rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <MaterialIcon icon="keyboard" className="text-primary" size="18px" />
        <p className="text-xs font-bold text-primary uppercase tracking-widest">Shortcuts</p>
      </div>
      <div className="space-y-1.5 text-xs text-on-primary-fixed">
        {shortcuts.map(([label, key]) => (
          <div key={key} className="flex justify-between">
            <span>{label}</span>
            <kbd className="font-mono bg-white/30 px-1.5 py-0.5 rounded text-[10px]">{key}</kbd>
          </div>
        ))}
      </div>
    </div>
  )
}
