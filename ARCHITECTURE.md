# Architecture

## What is Lucid Capture?
An Arcade.software clone — creates interactive product demos from screen recordings. Users capture step-by-step interactions on any website, edit them with hotspots and annotations, and export as a single self-contained HTML file.

## Three Pieces

### 1. React App (`app/`)
- **Stack:** Vite + React + TypeScript + Tailwind v4
- **State:** Zustand stores
- **Storage:** Dexie.js (IndexedDB) — no backend
- **Routing:** React Router v7
- **Pages:** Landing (`/`), Dashboard (`/dashboard`), Editor (`/editor/:id`)

### 2. Chrome Extension (`extension/`) — planned
- Manifest V3
- Content script captures clicks/scrolls/inputs on target pages
- Background service worker takes screenshots via `chrome.tabs.captureVisibleTab()`
- Transfers captured steps to React app via `chrome.storage.local`

### 3. Static HTML Compiler (`app/src/lib/compiler/`) — planned
- Follows the slyds pattern (see `~/projects/slyds`): flatten includes → inline assets as base64 → single HTML file
- Player engine (JS) embedded in output handles step navigation, hotspot clicks, keyboard shortcuts
- Output works from `file://` with zero external dependencies

## Design System Pipeline
```
Google Stitch (design tool)
    ↓ ./stitch-sync/sync.sh
stitch-sync/ (local structured data)
    ├── design-tokens.json    → drives Tailwind @theme colors
    ├── design-system.md      → design rules & component guidelines
    ├── screen-manifest.json  → screen index for change detection
    ├── html/                 → reference HTML per screen
    └── screenshots/          → visual reference PNGs
```

Design changes are tracked via `git diff stitch-sync/` after re-syncing.

## Data Model (IndexedDB)
```
ArcadeProject {id, title, createdAt, updatedAt, thumbnail?, privacy}
ArcadeStep {id, projectId, order, type, screenshot: Blob, videoClip?: Blob,
            clickTarget?: {x, y, selector, label}, annotation?, duration, transition}
```

Improvement over excaliframe's approach: separate tables with indexes, native Blob storage (not base64), Dexie wrapper instead of raw IDB.

## Component Hierarchy
```
<App>
  <TopNav />                    — shared across all pages
  <LandingPage>                 — marketing: hero, features, CTA
  <DashboardPage>
    <SideNav />                 — workspace sidebar
    <ArcadeGrid>                — card grid of demos
  <EditorPage>
    <SideNav />
    <EditorCanvas>              — screenshot + hotspot overlays
    <Timeline />                — step segments + playhead
    <ToolSidebar />             — annotations, timing, interactivity
```
