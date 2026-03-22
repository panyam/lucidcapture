# Next Steps

## Up Next
- [ ] Phase 6: Static HTML Compiler — Export arcade as single self-contained HTML (slyds pattern)
- [ ] Phase 7: Share Modal + Export — Download, copy link, embed code

## Done
- [x] Phase 1: Foundation — Vite + React + Tailwind + design tokens + routing + shared components
- [x] Phase 3: Data Layer — Dexie IndexedDB schema + Zustand stores + dashboard CRUD
- [x] Phase 4: Chrome Extension — Capture clicks on 3P sites, screenshot capture, content script bridge, visual recording feedback
- [x] Phase 5: Editor Interactivity — Split components, play/pause, annotations, timing, drag hotspots, edit/view mode, timeline thumbnails
- [x] Player page — Full-screen immersive playback with hotspot-click-to-advance, thumbnail timeline, auto-hiding controls
- [x] Hybrid capture — background-driven periodic screenshots (2s) + scroll-settle + navigation events + click capture
- [x] Cross-tab/window recording — background as controller, onActivated/onFocusChanged/onUpdated/onCreated listeners, auto re-inject content scripts
- [x] Extension context safety — graceful self-destruct on context invalidation, double-injection guard
- [x] Hotspot animation — 2.5s smooth glide between click points on step change
- [x] Aspect ratio fix — canvas matches screenshot dimensions, object-fill, hotspots aligned
- [x] Duration calculation — totalDuration computed from step durations, shown on dashboard
- [x] Editor layout — left-aligned canvas, timeline pinned to bottom
- [x] Navigation flow — Dashboard → Player → Edit → Editor → Preview → Player
- [x] Bidirectional Stitch sync — MCP edit_screens + generate_screen_from_text
- [x] Design sync skill — /design-sync audits uncommitted sync changes with structure diffing
- [x] HTML structure extraction — extract-structure.sh for diffable design change detection
- [x] Chrome Web Store prep — listing, privacy policy, icons, gh-pages deployment
- [x] Stitch sync infrastructure — stitch-api.sh, sync.sh, design-tokens.json, screen-manifest.json

## Backlog
- [ ] Extension hot-reload during development
- [ ] Step reordering (drag in timeline)
- [ ] Undo/redo in editor
- [ ] Bulk step select/delete
- [ ] Editor Grid View (from Stitch design) — project picker mode
- [ ] Arcade Details page (from Stitch design) — metadata, analytics, download
- [ ] Phase 2: Static Pages — Polish all screens to match Stitch screenshots
- [ ] Phase 8: Design Token Pipeline — Automated Stitch → Tailwind config generation
- [ ] Phase 9: Testing — pytest + Playwright e2e tests
- [ ] Phase 10: Polish — Mobile editor, responsive, a11y, dark mode
- [ ] Clean up redundant Stitch screens (delete duplicates via Stitch UI)
