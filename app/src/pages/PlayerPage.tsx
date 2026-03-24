import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { useParams, Link } from 'react-router'
import { MaterialIcon } from '../components/shared/MaterialIcon'
import { Timeline } from '../components/editor/Timeline'
import { useSceneStore } from '../stores/scene.store'

export function PlayerPage() {
  const { id } = useParams()
  const { currentProject, currentSteps, loadProject } = useSceneStore()
  const [stepIndex, setStepIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [finished, setFinished] = useState(false)
  const [aspectRatio, setAspectRatio] = useState<number | null>(null)
  const playTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentStep = currentSteps[stepIndex]

  // Load project
  useEffect(() => {
    if (id) loadProject(id)
  }, [id, loadProject])

  // Auto-start playback when steps load
  useEffect(() => {
    if (currentSteps.length > 0 && !playing && !finished) {
      setPlaying(true)
    }
  }, [currentSteps.length])

  // Screenshot URL
  const screenshotUrl = useMemo(() => {
    if (!currentStep?.screenshot) return null
    return URL.createObjectURL(currentStep.screenshot)
  }, [currentStep?.id, currentStep?.screenshot])

  useEffect(() => {
    return () => { if (screenshotUrl) URL.revokeObjectURL(screenshotUrl) }
  }, [screenshotUrl])

  // Auto-advance
  const stopPlaying = useCallback(() => {
    setPlaying(false)
    if (playTimerRef.current) clearTimeout(playTimerRef.current)
    playTimerRef.current = null
  }, [])

  useEffect(() => {
    if (!playing) return
    if (stepIndex >= currentSteps.length - 1) {
      stopPlaying()
      setFinished(true)
      return
    }
    playTimerRef.current = setTimeout(
      () => setStepIndex((i) => i + 1),
      currentStep?.duration ?? 3000,
    )
    return () => { if (playTimerRef.current) clearTimeout(playTimerRef.current) }
  }, [playing, stepIndex, currentStep?.duration, currentSteps.length, stopPlaying])

  // Auto-hide controls
  function handleMouseMove() {
    setShowControls(true)
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current)
    controlsTimerRef.current = setTimeout(() => {
      if (playing) setShowControls(false)
    }, 3000)
  }

  // Hotspot click advances
  function handleHotspotClick() {
    if (stepIndex < currentSteps.length - 1) {
      setStepIndex((i) => i + 1)
      setPlaying(true)
      setFinished(false)
    } else {
      setFinished(true)
      setPlaying(false)
    }
  }

  // Keyboard
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === ' ') {
        e.preventDefault()
        if (finished) { restart(); return }
        setPlaying((p) => !p)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setStepIndex((i) => Math.min(currentSteps.length - 1, i + 1))
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setStepIndex((i) => Math.max(0, i - 1))
      } else if (e.key === 'Escape') {
        stopPlaying()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [currentSteps.length, finished, stopPlaying])

  function restart() {
    setStepIndex(0)
    setFinished(false)
    setPlaying(true)
  }

  // Progress
  const progress = currentSteps.length > 0 ? ((stepIndex + 1) / currentSteps.length) * 100 : 0

  return (
    <div
      className="min-h-screen bg-inverse-surface flex flex-col"
      onMouseMove={handleMouseMove}
      style={{ cursor: showControls || currentSteps.length === 0 ? 'default' : 'none' }}
    >
      {/* Top bar — fades in/out */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-opacity duration-500 ${showControls || currentSteps.length === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-white/90 text-lg font-black tracking-tight">
              {currentProject?.title ?? 'Loading...'}
            </span>
            {currentSteps.length > 0 && (
              <span className="text-white/40 text-xs font-semibold">
                Step {stepIndex + 1} of {currentSteps.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link
              to={`/editor/${id}`}
              className="text-white/60 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1.5"
            >
              <MaterialIcon icon="edit" size="14px" />
              Edit
            </Link>
            <Link
              to="/dashboard"
              className="text-white/60 hover:text-white transition-colors"
            >
              <MaterialIcon icon="close" size="24px" />
            </Link>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-0.5 bg-white/10">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main canvas — padded to clear fixed header and footer */}
      <div className="flex-1 flex items-center justify-center px-8 pt-16 pb-36">
        <div
          className="relative w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl"
          style={aspectRatio ? { aspectRatio: `${aspectRatio}` } : { aspectRatio: '16/9' }}
        >
          {screenshotUrl ? (
            <img
              src={screenshotUrl}
              alt={`Step ${stepIndex + 1}`}
              className="w-full h-full object-fill"
              draggable={false}
              onLoad={(e) => {
                const img = e.currentTarget
                if (img.naturalWidth && img.naturalHeight) {
                  setAspectRatio(img.naturalWidth / img.naturalHeight)
                }
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-inverse-on-surface">
                <MaterialIcon icon="smart_display" size="64px" />
                <p className="mt-4 text-lg font-semibold">Loading demo...</p>
              </div>
            </div>
          )}

          {/* Hotspot — click to advance */}
          {currentStep?.clickTarget && !finished && (
            <button
              className="absolute group"
              style={{
                left: `${currentStep.clickTarget.x * 100}%`,
                top: `${currentStep.clickTarget.y * 100}%`,
                transition: 'left 2.5s cubic-bezier(0.25, 0.1, 0.25, 1), top 2.5s cubic-bezier(0.25, 0.1, 0.25, 1)',
                transform: 'translate(-50%, -50%)',
              }}
              onClick={handleHotspotClick}
            >
              <div className="relative">
                {/* Ripple rings */}
                <div className="absolute inset-0 w-14 h-14 -m-2 rounded-full bg-primary/10 animate-ping" />
                <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center group-hover:bg-primary/50 transition-colors cursor-pointer">
                  <div className="w-5 h-5 rounded-full bg-primary shadow-lg group-hover:scale-110 transition-transform" />
                </div>
                {/* Tooltip */}
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-white rounded-lg px-4 py-2 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  <p className="text-xs font-semibold text-on-background">
                    {currentStep.annotation?.title || currentStep.clickTarget.label}
                  </p>
                  {currentStep.annotation?.body && (
                    <p className="text-[10px] text-slate-500 mt-0.5">{currentStep.annotation.body}</p>
                  )}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45 -mt-1" />
                </div>
              </div>
            </button>
          )}

          {/* Finished overlay */}
          {finished && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
              <div className="text-center">
                <MaterialIcon icon="replay" size="48px" className="text-white/80" />
                <p className="text-white text-lg font-semibold mt-4">Demo complete</p>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={restart}
                    className="bg-white text-on-background px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-white/90 transition-colors flex items-center gap-2"
                  >
                    <MaterialIcon icon="replay" size="16px" />
                    Replay
                  </button>
                  <Link
                    to="/dashboard"
                    className="bg-white/20 text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-white/30 transition-colors"
                  >
                    Back to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom controls + timeline — fades in/out */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 transition-opacity duration-500 ${showControls || currentSteps.length === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {currentSteps.length > 1 && (
          <div className="px-8 mb-2">
            <Timeline
              steps={currentSteps}
              currentIndex={stepIndex}
              playing={playing}
              onSelectStep={(i) => { setStepIndex(i); setFinished(false) }}
              variant="player"
            />
          </div>
        )}
        <div className="flex items-center justify-center gap-4 pb-6">
          <button
            className="text-white/60 hover:text-white transition-colors disabled:opacity-30"
            disabled={stepIndex === 0}
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
          >
            <MaterialIcon icon="skip_previous" size="24px" />
          </button>
          <button
            className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
            onClick={() => {
              if (finished) { restart(); return }
              setPlaying((p) => !p)
            }}
          >
            <MaterialIcon icon={finished ? 'replay' : playing ? 'pause' : 'play_arrow'} filled size="28px" />
          </button>
          <button
            className="text-white/60 hover:text-white transition-colors disabled:opacity-30"
            disabled={stepIndex >= currentSteps.length - 1}
            onClick={() => setStepIndex((i) => Math.min(currentSteps.length - 1, i + 1))}
          >
            <MaterialIcon icon="skip_next" size="24px" />
          </button>
        </div>
      </div>
    </div>
  )
}
