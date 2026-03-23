import { useMemo, useEffect, useState, useRef, useCallback } from 'react'
import { MaterialIcon } from '../shared/MaterialIcon'
import type { SceneStep } from '../../types/scene'

interface EditorCanvasProps {
  step: SceneStep | undefined
  stepIndex: number
  editMode: boolean
  playing: boolean
  onMoveHotspot: (x: number, y: number) => void
  emptyMessage: string
}

export function EditorCanvas({ step, stepIndex, editMode, playing, onMoveHotspot, emptyMessage }: EditorCanvasProps) {
  const screenshotUrl = useMemo(() => {
    if (!step?.screenshot) return null
    return URL.createObjectURL(step.screenshot)
  }, [step?.id, step?.screenshot])

  useEffect(() => {
    return () => { if (screenshotUrl) URL.revokeObjectURL(screenshotUrl) }
  }, [screenshotUrl])

  // Detect the image's natural aspect ratio so we can match the container
  const [aspectRatio, setAspectRatio] = useState<number | null>(null)

  function handleImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget
    if (img.naturalWidth && img.naturalHeight) {
      setAspectRatio(img.naturalWidth / img.naturalHeight)
    }
  }

  return (
    <div
      className={`relative w-full max-w-5xl bg-inverse-surface rounded-2xl shadow-[0_48px_80px_-4px_rgba(20,27,43,0.12)] overflow-hidden ${editMode ? 'cursor-crosshair' : 'cursor-default'}`}
      style={aspectRatio ? { aspectRatio: `${aspectRatio}` } : { aspectRatio: '16/9' }}
    >
      {screenshotUrl ? (
        <>
          <img
            src={screenshotUrl}
            alt={`Step ${stepIndex + 1}`}
            className="w-full h-full object-fill pointer-events-none select-none"
            draggable={false}
            onLoad={handleImageLoad}
          />
          {step?.clickTarget && (
            <DraggableHotspot
              step={step}
              playing={playing}
              editMode={editMode}
              onDrop={onMoveHotspot}
            />
          )}
          <div className="absolute top-4 left-4 bg-primary text-on-primary text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-lg">
            {stepIndex + 1}
          </div>
          {editMode && (
            <div className="absolute top-4 right-4 bg-primary/90 text-on-primary text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Edit Mode
            </div>
          )}
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

function DraggableHotspot({ step, playing, editMode, onDrop }: {
  step: SceneStep
  playing: boolean
  editMode: boolean
  onDrop: (x: number, y: number) => void
}) {
  const [dragging, setDragging] = useState(false)
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const pos = dragPos ?? step.clickTarget!
  const { x, y } = pos

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!editMode) return
    e.preventDefault()
    e.stopPropagation()
    setDragging(true)
  }, [editMode])

  useEffect(() => {
    if (!dragging) return

    function getCanvasEl() {
      return containerRef.current?.closest('[class*="rounded-2xl"]') as HTMLElement | null
    }

    function handleMouseMove(e: MouseEvent) {
      const canvas = getCanvasEl()
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      setDragPos({
        x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
        y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
      })
    }

    function handleMouseUp(e: MouseEvent) {
      const canvas = getCanvasEl()
      if (!canvas) { setDragging(false); setDragPos(null); return }
      const rect = canvas.getBoundingClientRect()
      const finalX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      const finalY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
      onDrop(finalX, finalY)
      setDragging(false)
      setDragPos(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragging, onDrop])

  return (
    <div
      ref={containerRef}
      className={`absolute ${editMode ? 'pointer-events-auto cursor-grab' : 'pointer-events-none'} ${dragging ? 'cursor-grabbing z-50' : ''}`}
      style={{
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        transform: 'translate(-50%, -50%)',
        transition: dragging ? 'none' : 'left 2.5s cubic-bezier(0.25, 0.1, 0.25, 1), top 2.5s cubic-bezier(0.25, 0.1, 0.25, 1)',
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="relative">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
          dragging
            ? 'bg-primary/40 scale-125 ring-4 ring-primary/30'
            : playing
              ? 'bg-primary/20 animate-ping'
              : 'bg-primary/20 animate-pulse'
        }`}>
          <div className={`w-5 h-5 rounded-full bg-primary/80 transition-transform ${dragging ? 'scale-110' : ''}`} />
        </div>
        {!playing && !dragging && (
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
        {dragging && (
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-[10px] font-mono px-2 py-0.5 rounded whitespace-nowrap">
            {(x * 100).toFixed(0)}%, {(y * 100).toFixed(0)}%
          </div>
        )}
      </div>
    </div>
  )
}
