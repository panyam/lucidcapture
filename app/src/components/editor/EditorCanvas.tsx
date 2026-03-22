import { useMemo, useEffect } from 'react'
import { MaterialIcon } from '../shared/MaterialIcon'
import type { ArcadeStep } from '../../types/arcade'

interface EditorCanvasProps {
  step: ArcadeStep | undefined
  stepIndex: number
  totalSteps: number
  playing: boolean
  onClickCanvas: (x: number, y: number) => void
  emptyMessage: string
}

export function EditorCanvas({ step, stepIndex, playing, onClickCanvas, emptyMessage }: EditorCanvasProps) {
  const screenshotUrl = useMemo(() => {
    if (!step?.screenshot) return null
    return URL.createObjectURL(step.screenshot)
  }, [step?.id, step?.screenshot])

  useEffect(() => {
    return () => { if (screenshotUrl) URL.revokeObjectURL(screenshotUrl) }
  }, [screenshotUrl])

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    onClickCanvas(
      (e.clientX - rect.left) / rect.width,
      (e.clientY - rect.top) / rect.height,
    )
  }

  return (
    <div
      className="relative w-full max-w-4xl aspect-video bg-inverse-surface rounded-2xl shadow-[0_48px_80px_-4px_rgba(20,27,43,0.12)] overflow-hidden cursor-crosshair"
      onClick={handleClick}
    >
      {screenshotUrl ? (
        <>
          <img
            src={screenshotUrl}
            alt={`Step ${stepIndex + 1}`}
            className="w-full h-full object-contain pointer-events-none select-none"
            draggable={false}
          />
          {/* Hotspot */}
          {step?.clickTarget && (
            <Hotspot step={step} playing={playing} />
          )}
          {/* Step number badge */}
          <div className="absolute top-4 left-4 bg-primary text-on-primary text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-lg">
            {stepIndex + 1}
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-inverse-on-surface">
            <MaterialIcon icon="smart_display" size="64px" />
            <p className="mt-4 text-sm font-medium opacity-70">{emptyMessage}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function Hotspot({ step, playing }: { step: ArcadeStep; playing: boolean }) {
  if (!step.clickTarget) return null
  const { x, y } = step.clickTarget

  return (
    <div
      className="absolute pointer-events-none"
      style={{ left: `${x * 100}%`, top: `${y * 100}%`, transform: 'translate(-50%, -50%)' }}
    >
      <div className="relative">
        <div className={`w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center ${playing ? 'animate-ping' : 'animate-pulse'}`}>
          <div className="w-5 h-5 rounded-full bg-primary/80" />
        </div>
        {!playing && (
          <div className="absolute -top-14 left-1/2 -translate-x-1/2 glass-panel ghost-border rounded-lg px-3 py-2 whitespace-nowrap">
            {step.annotation?.title ? (
              <>
                <p className="text-xs font-semibold text-on-background">{step.annotation.title}</p>
                {step.annotation.body && (
                  <p className="text-[10px] text-slate-500 mt-0.5">{step.annotation.body}</p>
                )}
              </>
            ) : (
              <p className="text-[10px] font-semibold text-on-background">{step.clickTarget!.label}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
