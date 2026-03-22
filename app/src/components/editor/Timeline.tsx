import { useMemo } from 'react'
import { MaterialIcon } from '../shared/MaterialIcon'
import type { ArcadeStep } from '../../types/arcade'

interface TimelineProps {
  steps: ArcadeStep[]
  currentIndex: number
  playing: boolean
  onSelectStep: (index: number) => void
  onDeleteStep?: () => void
  variant?: 'editor' | 'player'
}

export function Timeline({ steps, currentIndex, playing, onSelectStep, onDeleteStep, variant = 'editor' }: TimelineProps) {
  const isPlayer = variant === 'player'

  return (
    <div className={`shrink-0 p-4 ${isPlayer ? 'bg-white/5 rounded-xl' : 'mt-auto bg-surface-container-low rounded-xl'}`}>
      {!isPlayer && (
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Timeline — {steps.length} steps
          </h3>
          {steps[currentIndex] && onDeleteStep && (
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
      )}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {steps.map((step, i) => (
          <TimelineThumb
            key={step.id}
            step={step}
            index={i}
            isActive={i === currentIndex}
            playing={playing}
            onClick={() => onSelectStep(i)}
          />
        ))}
        {steps.length === 0 && (
          <div className="flex items-center justify-center w-full h-20 text-xs text-slate-400 font-semibold">
            No steps — use the Chrome extension to record
          </div>
        )}
      </div>
    </div>
  )
}

function TimelineThumb({ step, index, isActive, playing, onClick }: {
  step: ArcadeStep
  index: number
  isActive: boolean
  playing: boolean
  onClick: () => void
}) {
  const thumbUrl = useMemo(() => {
    if (!step.screenshot) return null
    return URL.createObjectURL(step.screenshot)
  }, [step.id, step.screenshot])

  return (
    <button
      className={`relative flex-shrink-0 w-28 h-20 rounded-lg overflow-hidden transition-all group ${
        isActive
          ? 'ring-2 ring-primary scale-105 shadow-lg'
          : 'ring-1 ring-slate-200 hover:ring-primary/40 hover:scale-[1.02]'
      }`}
      onClick={onClick}
      title={step.annotation?.title || step.clickTarget?.label || `Step ${index + 1}`}
    >
      {thumbUrl ? (
        <img src={thumbUrl} alt="" className="w-full h-full object-cover" draggable={false} />
      ) : (
        <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
          <MaterialIcon icon="image" size="20px" className="text-slate-300" />
        </div>
      )}
      {/* Overlay */}
      <div className={`absolute inset-0 transition-colors ${isActive ? 'bg-primary/10' : 'bg-black/0 group-hover:bg-black/5'}`} />
      {/* Step number */}
      <div className={`absolute top-1 left-1 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center ${
        isActive ? 'bg-primary text-white' : 'bg-black/50 text-white'
      }`}>
        {index + 1}
      </div>
      {/* Duration */}
      <div className="absolute bottom-1 right-1 text-[8px] font-semibold bg-black/50 text-white px-1 rounded">
        {(step.duration / 1000).toFixed(1)}s
      </div>
      {/* Playing indicator */}
      {playing && isActive && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-primary animate-ping" />
        </div>
      )}
    </button>
  )
}
