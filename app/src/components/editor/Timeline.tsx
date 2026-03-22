import { MaterialIcon } from '../shared/MaterialIcon'
import type { ArcadeStep } from '../../types/arcade'

interface TimelineProps {
  steps: ArcadeStep[]
  currentIndex: number
  playing: boolean
  onSelectStep: (index: number) => void
  onDeleteStep: () => void
}

export function Timeline({ steps, currentIndex, playing, onSelectStep, onDeleteStep }: TimelineProps) {
  return (
    <div className="mt-6 bg-surface-container-low rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Timeline — {steps.length} steps
        </h3>
        {steps[currentIndex] && (
          <button
            className="text-xs font-semibold text-error hover:text-error/80 transition-colors flex items-center gap-1"
            onClick={onDeleteStep}
            title="Delete current step (Del)"
          >
            <MaterialIcon icon="delete" size="14px" />
            Delete Step
          </button>
        )}
      </div>
      <div className="h-16 bg-surface-container-high rounded-lg relative overflow-hidden flex gap-0.5">
        {steps.map((step, i) => {
          const isActive = i === currentIndex
          return (
            <button
              key={step.id}
              className={`h-full flex-1 transition-all rounded-sm relative group ${
                isActive
                  ? 'bg-primary/40 ring-2 ring-primary ring-inset'
                  : 'bg-secondary/15 hover:bg-secondary/25'
              }`}
              onClick={() => onSelectStep(i)}
              title={step.annotation?.title || step.clickTarget?.label || `Step ${i + 1}`}
            >
              <span className={`absolute top-1 left-1/2 -translate-x-1/2 text-[9px] font-bold ${isActive ? 'text-primary' : 'text-slate-400'}`}>
                {i + 1}
              </span>
              <div className="absolute bottom-1 left-1 right-1">
                <div className="text-[8px] font-semibold text-slate-400 text-center">
                  {(step.duration / 1000).toFixed(1)}s
                </div>
              </div>
              {playing && isActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                </div>
              )}
            </button>
          )
        })}
        {steps.length === 0 && (
          <div className="flex items-center justify-center w-full text-xs text-slate-400 font-semibold">
            No steps — use the Chrome extension to record
          </div>
        )}
      </div>
    </div>
  )
}
