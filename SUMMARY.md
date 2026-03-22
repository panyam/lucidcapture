# Lucid Capture

An Arcade.software clone that creates interactive product demos from screen recordings. Built with React + Vite + Tailwind, a Chrome extension for capture, and a static HTML compiler for export.

## Current State
- **Full capture→edit→play loop working** across tabs and windows
- **Hybrid capture:** periodic screenshots (2s) + click/scroll/navigation events, background service worker as controller
- **Editor:** Split components, play/pause, annotations, timing, drag hotspots, edit/view toggle, thumbnail timeline pinned to bottom
- **Player:** Full-screen immersive playback with hotspot-click-to-advance, thumbnail timeline, smooth 2.5s hotspot animation between steps
- **Cross-browser/cross-tab:** Extension works in Chrome, Chromium, Firefox. Records across tab switches, window focus changes, and page navigations
- **Bidirectional design sync:** Pull designs from Stitch + push flow changes back via MCP
- **Navigation flow:** Dashboard → Player (view) → Edit → Editor (modify) → Preview → Player

## Key Decisions
- No backend — IndexedDB for storage, static HTML for export
- Chrome extension required for 3P site capture (same-origin policy)
- Background service worker owns all recording state — content scripts are dumb event reporters
- Slyds-pattern static HTML export (single self-contained file) — planned
- Deterministic scripts over LLM calls for design sync
- Dexie.js over raw IDB (learned from excaliframe's verbose patterns)
- TypeScript + esbuild for extension
- `host_permissions: ["<all_urls>"]` for cross-tab script injection
- Edit/view mode toggle to prevent accidental hotspot moves
- pnpm as package manager
