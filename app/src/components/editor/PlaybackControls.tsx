import { MaterialIcon } from '../shared/MaterialIcon'

interface PlaybackControlsProps {
  stepIndex: number
  totalSteps: number
  playing: boolean
  onFirst: () => void
  onPrev: () => void
  onNext: () => void
  onLast: () => void
  onTogglePlay: () => void
}

export function PlaybackControls({ stepIndex, totalSteps, playing, onFirst, onPrev, onNext, onLast, onTogglePlay }: PlaybackControlsProps) {
  if (totalSteps === 0) return null

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass-panel ghost-border rounded-full px-6 py-3 flex items-center gap-5">
      <NavButton icon="first_page" onClick={onFirst} disabled={stepIndex === 0} title="First step" />
      <NavButton icon="skip_previous" onClick={onPrev} disabled={stepIndex === 0} title="Previous (←)" />
      <button
        className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary-container flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow active:scale-95"
        onClick={onTogglePlay}
        title="Play/Pause (Space)"
      >
        <MaterialIcon icon={playing ? 'pause' : 'play_arrow'} filled size="24px" />
      </button>
      <NavButton icon="skip_next" onClick={onNext} disabled={stepIndex >= totalSteps - 1} title="Next (→)" />
      <NavButton icon="last_page" onClick={onLast} disabled={stepIndex >= totalSteps - 1} title="Last step" />
      <div className="w-px h-5 bg-on-background/10" />
      <span className="text-xs font-semibold text-on-background/60 tabular-nums min-w-[3rem] text-center">
        {stepIndex + 1} / {totalSteps}
      </span>
    </div>
  )
}

function NavButton({ icon, onClick, disabled, title }: { icon: string; onClick: () => void; disabled: boolean; title: string }) {
  return (
    <button
      className="text-on-background/60 hover:text-on-background transition-colors disabled:opacity-30"
      disabled={disabled}
      onClick={(e) => { e.stopPropagation(); onClick() }}
      title={title}
    >
      <MaterialIcon icon={icon} size="20px" />
    </button>
  )
}
