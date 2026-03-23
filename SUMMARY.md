# Lucid Capture

Creates interactive product demos ("Scenes") from screen recordings. Built with a dual-stack architecture: React + Vite (original) and Go + GoAppLib + tsappkit (migration target), running side-by-side for comparison.

## Current State
- **Full capture→edit→play→export loop working** across tabs and windows
- **Static HTML export:** single self-contained file with embedded player, CSS, screenshots — works from file://
- **Dual-stack:** React app on :5173, Go stack on :8080 — both render all 4 pages at visual parity
- **Hybrid capture:** periodic screenshots (2s) + click/scroll/navigation events, background service worker as controller
- **Editor:** Split components, play/pause, annotations, timing, drag hotspots, edit/view toggle, thumbnail timeline pinned to bottom
- **Player:** Full-screen immersive playback with hotspot-click-to-advance, thumbnail timeline, smooth 2.5s hotspot animation between steps
- **Cross-browser/cross-tab:** Extension works in Chrome, Chromium, Firefox. Records across tab switches, window focus changes, and page navigations
- **Configurable extension:** App host URL stored per Chrome profile, prod default baked into store builds
- **Bidirectional design sync:** Pull designs from Stitch + push flow changes back via MCP
- **Navigation flow:** Dashboard → Player (view) → Edit → Editor (modify) → Preview → Player

## Key Decisions
- **"Scene"** is the noun for individual demos (not "Arcade")
- No server-side storage yet — IndexedDB for storage, static HTML for export
- Go stack migration doubles as a stress test for GoAppLib/tsappkit/Templar/protoc-gen-dal
- Protobuf definitions are the source of truth for all data models
- Chrome extension required for 3P site capture (same-origin policy)
- Background service worker owns all recording state — content scripts are dumb event reporters
- Slyds-pattern static HTML export (single self-contained file) — planned
- Deterministic scripts over LLM calls for design sync
- Dexie.js over raw IDB (learned from excaliframe's verbose patterns)
- TypeScript + esbuild for extension
- `host_permissions: ["<all_urls>"]` for cross-tab script injection
- Edit/view mode toggle to prevent accidental hotspot moves
- pnpm as package manager
