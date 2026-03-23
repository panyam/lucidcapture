import { useEffect, useCallback, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { SideNav } from '../components/shared/SideNav'
import { EditorCanvas } from '../components/editor/EditorCanvas'
import { PlaybackControls } from '../components/editor/PlaybackControls'
import { Timeline } from '../components/editor/Timeline'
import { ToolSidebar } from '../components/editor/ToolSidebar'
import { MaterialIcon } from '../components/shared/MaterialIcon'
import { useSceneStore } from '../stores/scene.store'
import { waitForPendingSession, convertExtensionSteps } from '../lib/capture/bridge'
import { serializeSteps, compileToHTML, downloadHTML, safeFilename } from '../lib/compiler'
import type { StepTransition } from '../types/scene'

export function EditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    currentProject, currentSteps, loadProject, createProject,
    addStep, updateStep, deleteStep, updateProject,
  } = useSceneStore()
  const [stepIndex, setStepIndex] = useState(0)
  const [importing, setImporting] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [exporting, setExporting] = useState(false)
  const playTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentStep = currentSteps[stepIndex]

  // ── Import from extension ──
  useEffect(() => {
    if (id !== 'import') return
    let cancelled = false
    async function run() {
      setImporting(true)
      const session = await waitForPendingSession(10000)
      if (!session || session.steps.length === 0) {
        setImporting(false)
        navigate('/dashboard')
        return
      }
      const project = await createProject('Imported Scene')
      const steps = await convertExtensionSteps(project.id, session.steps)
      for (const step of steps) {
        if (cancelled) return
        await addStep(step)
      }
      setImporting(false)
      if (!cancelled) navigate(`/editor/${project.id}`, { replace: true })
    }
    run()
    return () => { cancelled = true }
  }, [id, navigate, createProject, addStep])

  // ── Load project ──
  useEffect(() => {
    if (id && id !== 'new' && id !== 'import') {
      loadProject(id)
      setStepIndex(0)
      setPlaying(false)
    }
  }, [id, loadProject])

  // ── Clamp index ──
  useEffect(() => {
    if (stepIndex >= currentSteps.length && currentSteps.length > 0) {
      setStepIndex(currentSteps.length - 1)
    }
  }, [currentSteps.length, stepIndex])

  // ── Playback ──
  const stopPlaying = useCallback(() => {
    setPlaying(false)
    if (playTimerRef.current) clearTimeout(playTimerRef.current)
    playTimerRef.current = null
  }, [])

  useEffect(() => {
    if (!playing) return
    if (stepIndex >= currentSteps.length - 1) { stopPlaying(); return }
    playTimerRef.current = setTimeout(
      () => setStepIndex((i) => i + 1),
      currentStep?.duration ?? 3000,
    )
    return () => { if (playTimerRef.current) clearTimeout(playTimerRef.current) }
  }, [playing, stepIndex, currentStep?.duration, currentSteps.length, stopPlaying])

  const togglePlay = useCallback(() => {
    if (playing) { stopPlaying(); return }
    if (stepIndex >= currentSteps.length - 1) setStepIndex(0)
    setPlaying(true)
  }, [playing, stepIndex, currentSteps.length, stopPlaying])

  // ── Keyboard shortcuts ──
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault(); setStepIndex((i) => Math.min(currentSteps.length - 1, i + 1))
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault(); setStepIndex((i) => Math.max(0, i - 1))
      } else if (e.key === ' ') {
        e.preventDefault(); togglePlay()
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault(); setEditMode((m) => !m)
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && !e.metaKey && currentStep) {
        e.preventDefault(); handleDeleteStep()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [currentSteps.length, currentStep, togglePlay])

  // ── Step actions ──
  function handleDeleteStep() {
    if (!currentStep || !confirm(`Delete step ${stepIndex + 1}?`)) return
    stopPlaying()
    deleteStep(currentStep.id)
  }

  function handleMoveHotspot(x: number, y: number) {
    if (!currentStep || !editMode) return
    updateStep(currentStep.id, {
      clickTarget: {
        x, y,
        selector: currentStep.clickTarget?.selector ?? '',
        label: currentStep.clickTarget?.label ?? `Step ${stepIndex + 1}`,
      },
    })
  }

  function handleAnnotationChange(field: 'title' | 'body', value: string) {
    if (!currentStep) return
    const annotation = currentStep.annotation ?? { title: '', body: '', position: { x: 0.5, y: 0.3 } }
    updateStep(currentStep.id, { annotation: { ...annotation, [field]: value } })
  }

  function handleDurationChange(seconds: number) {
    if (!currentStep) return
    updateStep(currentStep.id, { duration: Math.max(500, seconds * 1000) })
  }

  function handleTransitionChange(transition: StepTransition) {
    if (!currentStep) return
    updateStep(currentStep.id, { transition })
  }

  async function handleExport() {
    if (!currentProject || currentSteps.length === 0) return
    setExporting(true)
    try {
      const serialized = await serializeSteps(currentSteps)
      const html = compileToHTML({
        title: currentProject.title,
        steps: serialized,
        compiledAt: new Date().toISOString(),
      })
      downloadHTML(html, safeFilename(currentProject.title))
    } finally {
      setExporting(false)
    }
  }

  // ── Rendering ──

  if (importing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="text-center">
          <MaterialIcon icon="sync" size="48px" className="text-primary animate-spin" />
          <p className="mt-4 text-lg font-semibold text-on-background">Importing captured steps...</p>
        </div>
      </div>
    )
  }

  const emptyMessage = id === 'new'
    ? 'Use the Chrome extension to capture steps'
    : currentSteps.length === 0
      ? 'No steps captured yet'
      : `Editing ${currentProject?.title ?? 'scene'}`

  return (
    <div className="flex min-h-screen">
      <SideNav />
      <main className="ml-64 flex-1 flex flex-col bg-surface min-w-0 overflow-hidden h-screen">
        {/* Title bar */}
        {currentProject && (
          <div className="px-8 pt-6 pb-2 flex items-center gap-4">
            <input
              type="text"
              value={currentProject.title}
              onChange={(e) => updateProject(currentProject.id, { title: e.target.value })}
              className="text-2xl font-black tracking-tight text-on-background bg-transparent focus:outline-none focus:bg-surface-container-low rounded-lg px-2 py-1 -ml-2 transition-colors"
            />
            <span className="text-xs font-semibold text-slate-400 bg-surface-container-high px-3 py-1 rounded-full">
              {currentSteps.length} steps
            </span>
            <div className="ml-auto flex items-center gap-2">
              <button
                className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-colors flex items-center gap-1.5 ${
                  editMode
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-high text-slate-500 hover:bg-surface-container-highest'
                }`}
                onClick={() => setEditMode((m) => !m)}
                title="Toggle edit mode (E)"
              >
                <MaterialIcon icon={editMode ? 'edit' : 'visibility'} size="14px" />
                {editMode ? 'Editing' : 'Viewing'}
              </button>
              {currentSteps.length > 0 && (
                <>
                  <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="text-xs font-semibold px-4 py-1.5 rounded-full bg-surface-container-high text-slate-500 hover:bg-surface-container-highest transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <MaterialIcon icon={exporting ? 'sync' : 'download'} size="14px" className={exporting ? 'animate-spin' : ''} />
                    {exporting ? 'Exporting...' : 'Export HTML'}
                  </button>
                  <Link
                    to={`/play/${id}`}
                    className="text-xs font-semibold px-4 py-1.5 rounded-full bg-gradient-to-r from-primary to-primary-container text-on-primary flex items-center gap-1.5 hover:shadow-lg transition-shadow"
                  >
                    <MaterialIcon icon="play_arrow" filled size="14px" />
                    Preview
                  </Link>
                </>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 p-8 pt-2 pb-0 flex flex-col min-w-0 overflow-hidden">
          {/* Canvas + controls wrapper */}
          <div className="flex-1 flex items-start justify-start min-h-0">
            <div className="relative w-full max-w-4xl">
              <EditorCanvas
                step={currentStep}
                stepIndex={stepIndex}
                editMode={editMode}
                playing={playing}
                onMoveHotspot={handleMoveHotspot}
                emptyMessage={emptyMessage}
              />
              <PlaybackControls
                stepIndex={stepIndex}
                totalSteps={currentSteps.length}
                playing={playing}
                onFirst={() => { setStepIndex(0); stopPlaying() }}
                onPrev={() => { setStepIndex((i) => Math.max(0, i - 1)); stopPlaying() }}
                onNext={() => { setStepIndex((i) => Math.min(currentSteps.length - 1, i + 1)); stopPlaying() }}
                onLast={() => { setStepIndex(currentSteps.length - 1); stopPlaying() }}
                onTogglePlay={togglePlay}
              />
            </div>
          </div>

          <Timeline
            steps={currentSteps}
            currentIndex={stepIndex}
            playing={playing}
            onSelectStep={(i) => { setStepIndex(i); stopPlaying() }}
            onDeleteStep={handleDeleteStep}
          />
        </div>
      </main>

      <ToolSidebar
        step={currentStep}
        stepIndex={stepIndex}
        onAnnotationChange={handleAnnotationChange}
        onDurationChange={handleDurationChange}
        onTransitionChange={handleTransitionChange}
      />
    </div>
  )
}
