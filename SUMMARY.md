# Lucid Capture

An Arcade.software clone that creates interactive product demos from screen recordings. Built with React + Vite + Tailwind, a Chrome extension for capture, and a static HTML compiler for export.

## Current State
- **Phase 1 complete:** Vite app scaffolded with full Stitch design system, routing, shared components, 3 page shells (landing, dashboard, editor)
- **Stitch sync pipeline:** Deterministic shell scripts pull designs from Google Stitch REST API
- **Design source of truth:** `stitch-sync/` contains tokens, design system spec, screen HTML, and screenshots

## Key Decisions
- No backend — IndexedDB for storage, static HTML for export
- Chrome extension required for 3P site capture (same-origin policy)
- Slyds-pattern static HTML export (single self-contained file)
- Deterministic scripts over LLM calls for design sync
- Dexie.js over raw IDB (learned from excaliframe's verbose patterns)
- pnpm as package manager
