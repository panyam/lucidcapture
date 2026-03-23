# Next Steps

## Up Next
- [ ] Phase 7: Share Modal + Export — Download, copy link, embed code (blocked: needs server-side storage for shareable links/embed)

## Demo Prep
- Two demos planned: (1) Stitch evaluation (pros/cons/tooling), (2) Lucid Capture product demo
- JOURNEY.md captures learnings for both — the Stitch story arc is: design → code → drift detection → bidirectional sync
- Stitch demo narrative: what works (tokens, MCP, generation), what's missing (component tree, diffable output), what we built to compensate (extract-structure.sh, sync pipeline)

## Go Stack Migration (in parallel)
- [ ] Generate proto code: `cd protos && make setupdev && make buf`
- [ ] Wire generated DAL into `views/api.go`
- [ ] Build tsappkit components (DashboardGrid, EditorCanvas, Timeline, PlaybackControls, ToolSidebar, PlayerView)
- [ ] Wire EventBus for cross-component state
- [ ] Port keyboard shortcuts to tsappkit KeyboardShortcutManager
- [ ] Rewire extension import to POST to Go backend (eliminate postMessage bridge)
- [ ] Wire OneAuth for login/signup
- [ ] Feature parity verification → delete `app/`

See [GitHub Issue #1](https://github.com/panyam/lucidcapture/issues/1) for full migration plan with phases.

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
- [x] Go stack scaffold — GoAppLib + Templar + tsappkit + protobuf definitions + devloop
- [x] Visual parity — all 4 pages render identically on both :5173 and :8080
- [x] Extension host config — configurable app host per Chrome profile (chrome.storage.sync)
- [x] Arcade → Scene rename — types, stores, files, UI strings, templates
- [x] App Engine Go deploy config — app.yaml, .gcloudignore, make deploy
- [x] Phase 6: Static HTML Compiler — shared compiler in shared/compiler/, Export button on both React + Go editors, /seed endpoint for test data

## Backlog
- [ ] Extension hot-reload during development
- [ ] Step reordering (drag in timeline)
- [ ] Undo/redo in editor
- [ ] Bulk step select/delete
- [ ] Editor Grid View (from Stitch design) — project picker mode
- [ ] Scene Details page (#5) — project overview between Dashboard and Editor (from Stitch design)
- [ ] Phase 2: Static Pages — Polish all screens to match Stitch screenshots
- [ ] Phase 8: Design Token Pipeline — Automated Stitch → Tailwind config generation
- [ ] Phase 9: Testing — pytest + Playwright e2e tests
- [ ] Phase 10: Polish — Mobile editor, responsive, a11y, dark mode
- [ ] Clean up redundant Stitch screens (delete duplicates via Stitch UI)
