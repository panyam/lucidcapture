# Lucid Capture

An Arcade.software clone that creates interactive product demos from screen recordings. Built with React + Vite + Tailwind, a Chrome extension for capture, and a static HTML compiler for export.

## Current State
- **Core capture→play loop working:** Extension records clicks on any site → imports into editor → plays back in full-screen Player
- **Editor:** Split component architecture with play/pause, annotations, timing controls, drag-to-reposition hotspots, edit/view mode toggle, timeline with screenshot thumbnails
- **Player:** Full-screen immersive playback with hotspot-click-to-advance, auto-hiding controls, progress bar, replay
- **Cross-browser:** Extension works in Chrome, Chromium, Firefox
- **Bidirectional design sync:** Pull designs from Stitch + push flow changes back via MCP
- **Navigation flow:** Dashboard → Player (view) → Edit → Editor (modify) → Preview → Player

## Key Decisions
- No backend — IndexedDB for storage, static HTML for export
- Chrome extension required for 3P site capture (same-origin policy)
- Slyds-pattern static HTML export (single self-contained file) — planned
- Deterministic scripts over LLM calls for design sync
- Dexie.js over raw IDB (learned from excaliframe's verbose patterns)
- TypeScript + esbuild for extension (not plain JS — better debugging)
- Content script as bridge between extension storage and web app (postMessage)
- Edit/view mode toggle to prevent accidental hotspot moves
- pnpm as package manager
