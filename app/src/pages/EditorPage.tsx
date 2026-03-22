import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { SideNav } from '../components/shared/SideNav'
import { MaterialIcon } from '../components/shared/MaterialIcon'
import { useArcadeStore } from '../stores/arcade.store'
import { getPendingSession, clearPendingSession, convertExtensionSteps } from '../lib/capture/bridge'

export function EditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentProject, currentSteps, loadProject, createProject, addStep } = useArcadeStore()
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [importing, setImporting] = useState(false)

  // Import from extension if landing on /editor/import
  useEffect(() => {
    if (id !== 'import') return
    let cancelled = false

    async function importFromExtension() {
      setImporting(true)
      const session = await getPendingSession()
      if (!session || session.steps.length === 0) {
        setImporting(false)
        navigate('/dashboard')
        return
      }

      // Create a new project for the imported steps
      const project = await createProject('Imported Arcade')
      const steps = await convertExtensionSteps(project.id, session.steps)

      for (const step of steps) {
        if (cancelled) return
        await addStep(step)
      }

      await clearPendingSession()
      setImporting(false)
      if (!cancelled) navigate(`/editor/${project.id}`, { replace: true })
    }

    importFromExtension()
    return () => { cancelled = true }
  }, [id, navigate, createProject, addStep])

  // Load existing project
  useEffect(() => {
    if (id && id !== 'new' && id !== 'import') {
      loadProject(id)
    }
  }, [id, loadProject])

  const currentStep = currentSteps[currentStepIndex]
  const screenshotUrl = useMemo(() => {
    if (!currentStep?.screenshot) return null
    return URL.createObjectURL(currentStep.screenshot)
  }, [currentStep])

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

  return (
    <div className="flex min-h-screen">
      <SideNav />
      <main className="ml-64 flex-1 flex flex-col bg-surface">
        {/* Editor Canvas */}
        <div className="flex-1 p-8 flex flex-col">
          {/* Video Preview Stage */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-full max-w-4xl aspect-video bg-inverse-surface rounded-2xl shadow-[0_48px_80px_-4px_rgba(20,27,43,0.12)] overflow-hidden">
              {screenshotUrl ? (
                <>
                  <img src={screenshotUrl} alt={`Step ${currentStepIndex + 1}`} className="w-full h-full object-contain" />
                  {/* Hotspot overlay */}
                  {currentStep?.clickTarget && (
                    <div
                      className="absolute"
                      style={{
                        left: `${currentStep.clickTarget.x * 100}%`,
                        top: `${currentStep.clickTarget.y * 100}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <div className="relative group cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-primary/80 animate-pulse" />
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 glass-panel ghost-border rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          <p className="text-xs font-semibold text-on-background">{currentStep.clickTarget.label}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-inverse-on-surface">
                    <MaterialIcon icon="smart_display" size="64px" />
                    <p className="mt-4 text-sm font-medium opacity-70">
                      {id === 'new'
                        ? 'Use the Chrome extension to capture steps'
                        : currentSteps.length === 0
                          ? 'No steps captured yet'
                          : `Editing ${currentProject?.title ?? 'arcade'}`}
                    </p>
                  </div>
                </div>
              )}

              {/* Floating Controls */}
              {currentSteps.length > 0 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass-panel ghost-border rounded-full px-6 py-3 flex items-center gap-6">
                  <button
                    className="text-on-background/60 hover:text-on-background transition-colors disabled:opacity-30"
                    disabled={currentStepIndex === 0}
                    onClick={() => setCurrentStepIndex((i) => Math.max(0, i - 1))}
                  >
                    <MaterialIcon icon="skip_previous" size="20px" />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary-container flex items-center justify-center text-white shadow-lg">
                    <MaterialIcon icon="play_arrow" filled size="24px" />
                  </button>
                  <button
                    className="text-on-background/60 hover:text-on-background transition-colors disabled:opacity-30"
                    disabled={currentStepIndex >= currentSteps.length - 1}
                    onClick={() => setCurrentStepIndex((i) => Math.min(currentSteps.length - 1, i + 1))}
                  >
                    <MaterialIcon icon="skip_next" size="20px" />
                  </button>
                  <span className="text-xs font-semibold text-on-background/60">
                    {currentStepIndex + 1} / {currentSteps.length}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-6 bg-surface-container-low rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Timeline — {currentSteps.length} steps
              </h3>
            </div>
            <div className="h-12 bg-surface-container-high rounded-lg relative overflow-hidden flex">
              {currentSteps.map((step, i) => (
                <button
                  key={step.id}
                  className={`h-full flex-1 transition-colors ${
                    i === currentStepIndex
                      ? 'bg-primary/40'
                      : 'bg-secondary/20 hover:bg-secondary/30'
                  } ${i > 0 ? 'ml-0.5' : ''} rounded-sm`}
                  onClick={() => setCurrentStepIndex(i)}
                  title={step.clickTarget?.label ?? `Step ${i + 1}`}
                />
              ))}
              {currentSteps.length === 0 && (
                <div className="flex items-center justify-center w-full text-xs text-slate-400 font-semibold">
                  No steps yet
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Tool Sidebar */}
      <aside className="w-80 bg-surface-container-lowest p-6 flex flex-col gap-8 overflow-y-auto">
        <h2 className="text-lg font-bold text-on-background">Editor Tools</h2>

        {/* Current Step Info */}
        {currentStep && (
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Current Step</p>
            <div className="space-y-2 text-sm">
              <p className="text-on-background font-semibold">{currentStep.clickTarget?.label ?? `Step ${currentStepIndex + 1}`}</p>
              <p className="text-slate-500 text-xs truncate">{currentStep.url}</p>
              <p className="text-slate-400 text-xs">Type: {currentStep.type}</p>
            </div>
          </div>
        )}

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
          </div>
        </div>

        {/* Pro Tip */}
        <div className="bg-gradient-to-br from-primary-fixed to-primary-fixed-dim rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <MaterialIcon icon="lightbulb" className="text-primary" size="18px" />
            <p className="text-xs font-bold text-primary uppercase tracking-widest">Pro Tip</p>
          </div>
          <p className="text-sm text-on-primary-fixed leading-relaxed">
            Install the Chrome extension, click <strong>Start Recording</strong>, interact with any site, then click <strong>Stop</strong> to import steps here.
          </p>
        </div>
      </aside>
    </div>
  )
}
