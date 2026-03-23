// Lucid Capture — tsappkit entry point
// LifecycleController discovers and initializes all components on the page.

import { EventBus } from '@panyam/tsappkit'
import { initExportButtons } from './lib/export'

// Create global event bus
const eventBus = new EventBus()

// Make accessible for debugging
;(globalThis as any).__lucidEventBus = eventBus

// Wire up features
document.addEventListener('DOMContentLoaded', () => {
  initExportButtons()
})

console.log('[LucidCapture] tsappkit initialized')

// TODO: Register BaseComponent subclasses as they are built
// import { DashboardGrid } from './components/DashboardGrid'
// import { EditorCanvas } from './components/EditorCanvas'
// import { Timeline } from './components/Timeline'
// import { PlaybackControls } from './components/PlaybackControls'
// import { ToolSidebar } from './components/ToolSidebar'
// import { PlayerView } from './components/PlayerView'
