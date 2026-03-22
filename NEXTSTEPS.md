# Next Steps

## Up Next
- [ ] Cross-tab/window recording — background service worker as controller (tab switches, URL changes, window focus changes all tracked without relying on content script persistence)
- [ ] Phase 6: Static HTML Compiler — Export arcade as single self-contained HTML (slyds pattern)
- [ ] Phase 7: Share Modal + Export — Download, copy link, embed code

## Done
- [x] Phase 1: Foundation — Vite + React + Tailwind + design tokens + routing + shared components
- [x] Phase 3: Data Layer — Dexie IndexedDB schema + Zustand stores + dashboard CRUD
- [x] Phase 4: Chrome Extension — Capture clicks on 3P sites, screenshot capture, content script bridge, visual recording feedback
- [x] Phase 5: Editor Interactivity — Split components (EditorCanvas, PlaybackControls, Timeline, ToolSidebar), play/pause, annotations, timing, drag-to-reposition hotspots, edit/view mode toggle, timeline thumbnails
- [x] Player page — Full-screen immersive playback at /play/:id with hotspot-click-to-advance, auto-hiding controls, progress bar, "Demo complete" overlay
- [x] Navigation flow — Dashboard → Player → Edit → Editor → Preview → Player
- [x] Hybrid capture — periodic screenshots (2s), scroll-settle, navigation events + click capture
- [x] Aspect ratio fix — canvas matches screenshot dimensions, no black bars, hotspots aligned
- [x] Content script injection guard — __lucidCaptureInjected flag prevents duplicate listeners
- [x] Duration calculation — totalDuration computed from step durations, shown on dashboard cards
- [x] Editor layout — left-aligned canvas, constrained timeline scroll
- [x] Bidirectional Stitch sync — Used MCP edit_screens + generate_screen_from_text to push flow changes back to Stitch design
- [x] Design sync skill — /design-sync audits uncommitted sync changes with structure diffing
- [x] HTML structure extraction — extract-structure.sh parses HTML into diffable JSON outlines
- [x] Extension→App data transfer — content script reads chrome.storage.local, forwards via postMessage
- [x] Firefox compatibility — background.scripts + gecko settings in manifest
- [x] Dashboard three-dots menu — Edit, Duplicate, Delete actions
- [x] Chrome Web Store prep — listing, privacy policy, icons, gh-pages deployment
- [x] Stitch sync infrastructure — stitch-api.sh, sync.sh, design-tokens.json, screen-manifest.json

## Backlog
- [ ] Extension hot-reload during development
- [ ] Editor Grid View (from Stitch design) — project picker mode in editor
- [ ] Arcade Details page (from Stitch design) — metadata, analytics, download
- [ ] Phase 2: Static Pages — Polish all screens to match Stitch screenshots exactly
- [ ] Phase 8: Design Token Pipeline — Automated Stitch → Tailwind config generation scripts
- [ ] Phase 9: Testing — pytest + Playwright e2e tests (framework set up, needs formal test suite)
- [ ] Phase 10: Polish — Mobile editor, responsive, a11y, dark mode
- [ ] Clean up redundant Stitch screens (delete duplicates via Stitch UI)
