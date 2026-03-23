# Architecture

## What is Lucid Capture?
Creates interactive product demos ("Scenes") from screen recordings. Users capture step-by-step interactions on any website, edit them with hotspots and annotations, and export as a single self-contained HTML file.

## Four Pieces

### 1. React App (`app/`) — original frontend
- **Stack:** Vite + React + TypeScript + Tailwind v4
- **State:** Zustand stores (`useSceneStore`)
- **Storage:** Dexie.js (IndexedDB) — no backend
- **Routing:** React Router v7
- **Pages:** Landing (`/`), Dashboard (`/dashboard`), Editor (`/editor/:id`), Player (`/play/:id`)

### 2. Go Stack App (root) — migration target
- **Backend:** GoAppLib (HTTP routing, ViewContext, page mixins)
- **Templates:** Templar (template inheritance from @goapplib/BasePage.html)
- **Frontend:** tsappkit BaseComponent + jsx-dom (JSX → real DOM, no React)
- **Protos:** Source of truth for data models (protoc-gen-dal for GORM + Datastore)
- **Storage:** IndexedDB (client-side, same as React — server-side persistence planned)
- **Pages:** Same 4 routes, served by Go handlers rendering Templar templates

Both versions run side-by-side on different ports for comparison during migration.

### 3. Chrome Extension (`extension/`)
- **Build:** TypeScript + esbuild (sourcemaps, iife format, `--prod` flag for store builds)
- **Manifest V3** with Firefox compatibility (`background.scripts` + `service_worker`)
- **Content script** (`content.ts`): captures clicks with coordinates + CSS selector + element label. Shows visual feedback (ripple, step badge, recording indicator)
- **Background service worker** (`background.ts`): orchestrates recording session, calls `chrome.tabs.captureVisibleTab()` for JPEG screenshots at 70% quality
- **Popup** (`popup/`): start/stop recording UI with step counter + configurable "App Host" text field
- **Host config:** `chrome.storage.sync` stores the target app URL per Chrome profile. Build-time default via esbuild `define` (`--prod` → prod URL)
- **Data transfer:** content script on `/editor/import` reads `chrome.storage.local` and forwards via `window.postMessage`

### 4. Static HTML Compiler (`app/src/lib/compiler/`) — planned
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
  ↓ on STOP: saves to chrome.storage.local, opens <appHost>/editor/import
Content script (on app host /editor/import)
  ↓ reads chrome.storage.local.get('pendingSession')
  ↓ window.postMessage({ type: 'LUCID_CAPTURE_IMPORT', session })
App (EditorPage)
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
SceneProject {id, title, createdAt, updatedAt, thumbnail?, privacy, stepCount, totalDuration}
SceneStep {id, projectId, order, type, screenshot: Blob, videoClip?: Blob,
           clickTarget?: {x, y, selector, label}, annotation?, duration, transition,
           url?, viewportWidth?, viewportHeight?}
```

Indexes: `projects` on `updatedAt, title`; `steps` compound index `[projectId+order]`.

## Protobuf Models (source of truth)
```
protos/lucidcapture/v1/
├── models/models.proto       → Project, Step, ClickTarget, Annotation, ImportSession
├── gorm/models.proto         → GORM sidecar (SQLite/Postgres)
├── datastore/models.proto    → App Engine Datastore sidecar
└── services/projects.proto   → ProjectsService RPC definitions
```

## Component Hierarchy (React)
```
<App>
  <TopNav />                          — shared (hidden on Player)
  <LandingPage>                       — marketing: hero, features, CTA
  <DashboardPage>
    <SideNav />                       — workspace sidebar
    <SceneGrid>                       — card grid, three-dots menu, links to Player
  <PlayerPage>                        — full-screen playback, hotspot-click-to-advance
  <EditorPage>
    <SideNav />
    <EditorCanvas>                    — screenshot + draggable hotspot, edit/view mode
    <PlaybackControls>                — play/pause/prev/next/first/last
    <Timeline>                        — screenshot thumbnails, step numbers, durations
    <ToolSidebar>                     — step info, annotations, timing, shortcuts
```

## Go Stack Template Hierarchy
```
@goapplib/BasePage.html               — base HTML structure
  └── templates/BasePage.html          — extends with LC design tokens, nav, fonts
        ├── LandingPage.html           — static marketing page
        ├── DashboardPage.html         — project grid (tsappkit DashboardGrid component)
        ├── EditorPage.html            — editor layout (tsappkit component mount points)
        └── PlayerPage.html            — fullscreen player (tsappkit PlayerView component)
```
