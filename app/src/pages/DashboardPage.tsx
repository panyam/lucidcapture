import { useEffect, useMemo, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router'
import { SideNav } from '../components/shared/SideNav'
import { MaterialIcon } from '../components/shared/MaterialIcon'
import { useSceneStore } from '../stores/scene.store'

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}

export function DashboardPage() {
  const { projects, loading, loadProjects, createProject, deleteProject } = useSceneStore()
  const navigate = useNavigate()
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleDuplicate(scene: typeof projects[0]) {
    const newProject = await createProject(`${scene.title} (Copy)`)
    navigate(`/editor/${newProject.id}`)
  }

  async function handleDelete(id: string) {
    if (confirm('Delete this scene? This cannot be undone.')) {
      await deleteProject(id)
      setMenuOpenId(null)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const thumbnails = useMemo(() => {
    const map = new Map<string, string>()
    for (const p of projects) {
      if (p.thumbnail) {
        map.set(p.id, URL.createObjectURL(p.thumbnail))
      }
    }
    return map
  }, [projects])

  async function handleCreateNew() {
    const project = await createProject('Untitled Scene')
    navigate(`/editor/${project.id}`)
  }

  return (
    <div className="flex min-h-screen">
      <SideNav />
      <main className="ml-64 flex-1 p-12 bg-surface">
        <header className="mb-12">
          <div className="flex items-end gap-3 mb-2">
            <h1 className="text-5xl font-black tracking-tighter text-on-background">My Scenes</h1>
            <span className="font-script text-primary text-2xl rotate-[-5deg] mb-2">curated</span>
          </div>
          <p className="text-slate-500 max-w-xl">
            Manage and organize your interactive product demos. Use the grid below to view recent activity and insights.
          </p>
        </header>

        {loading && projects.length === 0 ? (
          <p className="text-slate-400">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((scene) => (
              <Link
                key={scene.id}
                to={`/play/${scene.id}`}
                className="group relative bg-surface-container-lowest rounded-xl p-3 shadow-[0_32px_64px_-4px_rgba(20,27,43,0.04)] hover:shadow-[0_48px_80px_-4px_rgba(20,27,43,0.08)] transition-all duration-300"
              >
                <div className="aspect-video rounded-lg overflow-hidden relative mb-4 bg-surface-container-high">
                  {thumbnails.get(scene.id) ? (
                    <img src={thumbnails.get(scene.id)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <MaterialIcon icon="smart_display" size="48px" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <MaterialIcon icon="play_circle" filled className="text-white" size="48px" />
                  </div>
                  <div className="absolute bottom-3 right-3 glass-panel px-2 py-1 rounded text-[10px] font-bold text-on-background">
                    {formatDuration(scene.totalDuration)}
                  </div>
                </div>
                <div className="px-2 pb-2">
                  <h3 className="text-lg font-bold text-on-background mb-1">{scene.title}</h3>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <MaterialIcon icon="layers" size="14px" />
                        <span className="text-xs font-semibold">{scene.stepCount} steps</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <MaterialIcon icon="edit_calendar" size="14px" />
                        <span className="text-xs font-semibold">{timeAgo(scene.updatedAt)}</span>
                      </div>
                    </div>
                    <div className="relative" ref={menuOpenId === scene.id ? menuRef : undefined}>
                      <button
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-600"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setMenuOpenId(menuOpenId === scene.id ? null : scene.id)
                        }}
                      >
                        <MaterialIcon icon="more_vert" size="20px" />
                      </button>
                      {menuOpenId === scene.id && (
                        <div className="absolute right-0 bottom-8 bg-surface-container-lowest rounded-xl shadow-[0_16px_48px_-4px_rgba(20,27,43,0.15)] py-1 z-50 min-w-[160px]">
                          <button
                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-on-background hover:bg-surface-container-low flex items-center gap-3 transition-colors"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setMenuOpenId(null)
                              navigate(`/editor/${scene.id}`)
                            }}
                          >
                            <MaterialIcon icon="edit" size="18px" />
                            Edit
                          </button>
                          <button
                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-on-background hover:bg-surface-container-low flex items-center gap-3 transition-colors"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setMenuOpenId(null)
                              handleDuplicate(scene)
                            }}
                          >
                            <MaterialIcon icon="content_copy" size="18px" />
                            Duplicate
                          </button>
                          <button
                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-error hover:bg-error-container/30 flex items-center gap-3 transition-colors"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleDelete(scene.id)
                            }}
                          >
                            <MaterialIcon icon="delete" size="18px" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {/* Create New Card */}
            <button
              onClick={handleCreateNew}
              className="rounded-xl p-3 border-2 border-dashed border-slate-200 hover:border-primary/40 transition-all duration-300 flex flex-col items-center justify-center gap-4 min-h-[280px] group cursor-pointer"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary-fixed flex items-center justify-center group-hover:bg-primary-fixed-dim transition-colors">
                <MaterialIcon icon="add" className="text-primary" size="32px" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-on-background mb-1">Create New Scene</h3>
                <p className="text-sm text-slate-500">Record an interactive demo</p>
              </div>
            </button>

            {/* Insight Bento */}
            {projects.length > 0 && (
              <div className="bg-gradient-to-br from-tertiary to-tertiary-container rounded-xl p-8 text-white flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-tertiary-fixed-dim mb-2">Summary</p>
                  <h3 className="text-3xl font-black tracking-tight mb-2">
                    {projects.length} <span className="text-on-tertiary-container">Scenes</span>
                  </h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {projects.reduce((sum, p) => sum + p.stepCount, 0)} total steps captured across all demos.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
