# Lucid Capture — Implementation Plan

## Context

We're building **Lucid Capture**, an Arcade.software clone that creates interactive product demos from screen recordings. Designs are done in Google Stitch (5 screens synced locally via `stitch-sync/`). No backend — IndexedDB for storage, static HTML files for export (slyds pattern).

## Three Pieces

1. **React App** (Vite + Tailwind) — dashboard, editor, share UI, landing page
2. **Chrome Extension** (Manifest V3) — captures interactive steps on 3P sites
3. **Static HTML Compiler** — exports self-contained interactive demos (single `.html` file, works from `file://`)

## Phases

| # | Phase | Depends On | Status |
|---|-------|------------|--------|
| 1 | **Foundation** — Vite + React + Tailwind + design tokens + routing + shared components | — | Not started |
| 2 | **Static Pages** — Convert all 5 Stitch screens to React components | Phase 1 | Not started |
| 3 | **Data Layer** — IndexedDB (Dexie) + Zustand stores + CRUD | Phase 1 | Not started |
| 4 | **Chrome Extension** — Capture clicks/scrolls/inputs on 3P sites, transfer to app | Phase 3 | Not started |
| 5 | **Editor Interactivity** — Hotspot placement, timeline, tool sidebar, play/pause | Phases 2+3 | Not started |
| 6 | **Static HTML Compiler** — Arcade → single self-contained HTML file | Phase 3 | Not started |
| 7 | **Share Modal + Export** — Download HTML, copy link, embed code | Phases 5+6 | Not started |
| 8 | **Design Token Pipeline** — Automated Stitch → Tailwind config sync | Phase 1 | Not started |
| 9 | **Testing** — pytest + Playwright e2e tests | Phases 2-7 | Backlog |
| 10 | **Polish** — Mobile editor, responsive, a11y, dark mode | All | Backlog |

## Key Decisions

- **React + Vite** over Solid (ecosystem maturity, faster for demo)
- **No backend** — IndexedDB + localStorage, export as static HTML
- **Chrome Extension required** for 3P site capture (same-origin policy)
- **Slyds pattern** for static HTML export (inline all assets as base64, single file)
- **Zustand** for state, **Dexie.js** for IndexedDB, **React Router v7**
- **Transfer mechanism:** Extension → `chrome.storage.local` → React app imports on mount
- **System fonts** in compiled output (skip Inter embedding to avoid bloat)
- **pytest + Playwright** (Python) for e2e testing

## Build Sequence

```
Phase 1 (Foundation)
  ├── Phase 2 (Static Pages)     ← parallel with Phase 3
  ├── Phase 3 (Data Layer)       ← parallel with Phase 2
  │     ├── Phase 4 (Chrome Extension)
  │     ├── Phase 5 (Editor)     ← also needs Phase 2
  │     └── Phase 6 (Compiler)
  │           └── Phase 7 (Share + Export)
  └── Phase 8 (Token Pipeline)   ← independent
Phases 9-10: backlog
```

## Risks

| Risk | Mitigation |
|------|------------|
| `chrome.tabCapture` MV3 restrictions | Screenshot-only capture for MVP (skip video) |
| Large base64 HTML files (50MB+) | JPEG 60% quality, WebP, quality slider in export |
| `chrome.storage.local` 10MB limit | `unlimitedStorage` permission in manifest |
