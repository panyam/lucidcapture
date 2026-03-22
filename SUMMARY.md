# Lucid Capture

An Arcade.software clone that creates interactive product demos from screen recordings. Built with React + Vite + Tailwind, a Chrome extension for capture, and a static HTML compiler for export.

## Current State
- **Phases 1, 3, 4 complete:** App scaffolded, IndexedDB storage working, Chrome extension captures clicks with screenshots
- **Full capture→edit flow working:** Extension records clicks on any site → imports steps into editor via content script bridge → displays screenshots with hotspot overlays and step navigation
- **Cross-browser:** Extension works in Chrome, Chromium, Firefox (Manifest V3 with both `service_worker` and `scripts` background)
- **Stitch sync pipeline:** Deterministic shell scripts pull designs from Google Stitch REST API
- **Chrome Web Store:** Listing materials, privacy policy, and icons ready. Privacy policy deployed via GitHub Pages

## Key Decisions
- No backend — IndexedDB for storage, static HTML for export
- Chrome extension required for 3P site capture (same-origin policy)
- Slyds-pattern static HTML export (single self-contained file)
- Deterministic scripts over LLM calls for design sync
- Dexie.js over raw IDB (learned from excaliframe's verbose patterns)
- TypeScript + esbuild for extension (not plain JS — better debugging)
- Content script as bridge between extension storage and web app (postMessage)
- pnpm as package manager
