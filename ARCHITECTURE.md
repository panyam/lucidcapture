# Architecture

## What is Lucid Capture?
An Arcade.software clone — creates interactive product demos from screen recordings. Users capture step-by-step interactions on any website, edit them with hotspots and annotations, and export as a single self-contained HTML file.

## Three Pieces

### 1. React App (`app/`)
- **Stack:** Vite + React + TypeScript + Tailwind v4
- **State:** Zustand stores
- **Storage:** Dexie.js (IndexedDB) — no backend
- **Routing:** React Router v7
- **Pages:** Landing (`/`), Dashboard (`/dashboard`), Editor (`/editor/:id`), Player (`/play/:id`)

### 2. Chrome Extension (`extension/`)
- **Build:** TypeScript + esbuild (sourcemaps, iife format)
- **Manifest V3** with Firefox compatibility (`background.scripts` + `service_worker`)
- **Content script** (`content.ts`): captures clicks with coordinates + CSS selector + element label. Shows visual feedback (ripple, step badge, recording indicator)
- **Background service worker** (`background.ts`): orchestrates recording session, calls `chrome.tabs.captureVisibleTab()` for JPEG screenshots at 70% quality
- **Popup** (`popup/`): start/stop recording UI with step counter
- **Data transfer:** content script on `/editor/import` reads `chrome.storage.local` and forwards via `window.postMessage`

### 3. Static HTML Compiler (`app/src/lib/compiler/`) — planned
- Follows the slyds pattern (see `~/projects/slyds`): inline assets as base64 → single HTML file
- Player engine (JS) embedded in output handles step navigation, hotspot clicks, keyboard shortcuts
- Output works from `file://` with zero external dependencies

## User Flow
```
Landing Page → Dashboard → Player (view demo) → Editor (modify) → Player (preview)
                  ↓                                    ↑
             Create New ──── Extension captures ───────┘
```

## Extension → App Data Flow
```
Content script (on 3P site)
  ↓ click event: {x, y, selector, label}
  ↓ chrome.runtime.sendMessage
Background service worker
  ↓ chrome.tabs.captureVisibleTab() → JPEG screenshot
  ↓ stores step in session.steps[]
  ↓ on STOP: saves to chrome.storage.local, opens /editor/import
Content script (on localhost:5173/editor/import)
  ↓ reads chrome.storage.local.get('pendingSession')
  ↓ window.postMessage({ type: 'LUCID_CAPTURE_IMPORT', session })
React app (EditorPage)
  ↓ waitForPendingSession() listens for postMessage
  ↓ converts base64 screenshots to Blobs
  ↓ stores in IndexedDB via Dexie
  ↓ redirects to /editor/<uuid>
```

## Design System Pipeline
```
Google Stitch (design tool)
    ↓ ./stitch-sync/sync.sh          (pull)
    ↓ mcp edit_screens/generate      (push)
stitch-sync/ (local structured data)
    ├── design-tokens.json    → drives Tailwind @theme colors
    ├── design-system.md      → design rules & component guidelines
    ├── screen-manifest.json  → screen index for change detection
    ├── structure/            → diffable HTML outlines (JSON)
    ├── html/                 → reference HTML per screen
    └── screenshots/          → visual reference PNGs
```

Design changes tracked via `git diff stitch-sync/` + `/design-sync` skill.

## Data Model (IndexedDB)
```
ArcadeProject {id, title, createdAt, updatedAt, thumbnail?, privacy, stepCount, totalDuration}
ArcadeStep {id, projectId, order, type, screenshot: Blob, videoClip?: Blob,
            clickTarget?: {x, y, selector, label}, annotation?, duration, transition,
            url?, viewportWidth?, viewportHeight?}
```

Indexes: `projects` on `updatedAt, title`; `steps` compound index `[projectId+order]`.

## Component Hierarchy
```
<App>
  <TopNav />                          — shared (hidden on Player)
  <LandingPage>                       — marketing: hero, features, CTA
  <DashboardPage>
    <SideNav />                       — workspace sidebar
    <ArcadeGrid>                      — card grid, three-dots menu, links to Player
  <PlayerPage>                        — full-screen playback, hotspot-click-to-advance
  <EditorPage>
    <SideNav />
    <EditorCanvas>                    — screenshot + draggable hotspot, edit/view mode
    <PlaybackControls>                — play/pause/prev/next/first/last
    <Timeline>                        — screenshot thumbnails, step numbers, durations
    <ToolSidebar>                     — step info, annotations, timing, shortcuts
```
