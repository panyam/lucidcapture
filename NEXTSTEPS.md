# Next Steps

## In Progress
- [ ] Phase 3: Data Layer — Dexie IndexedDB schema + Zustand stores
- [ ] Phase 4: Chrome Extension — Capture clicks/scrolls on 3P sites

## Up Next
- [ ] Phase 5: Editor Interactivity — Render captured steps, hotspot placement, timeline
- [ ] Phase 6: Static HTML Compiler — Export arcade as single self-contained HTML
- [ ] Phase 7: Share Modal + Export — Download, copy link, embed code

## Done
- [x] Phase 1: Foundation — Vite + React + Tailwind + design tokens + routing + shared components
- [x] Stitch sync infrastructure — `stitch-api.sh`, `sync.sh`, design-tokens.json, screen-manifest.json
- [x] Stitch MCP integration — remote endpoint at stitch.googleapis.com/mcp

## Backlog
- [ ] Phase 2: Static Pages — Polish all screens to match Stitch screenshots exactly
- [ ] Phase 8: Design Token Pipeline — Automated Stitch → Tailwind config generation scripts
- [ ] Phase 9: Testing — pytest + Playwright e2e tests
- [ ] Phase 10: Polish — Mobile editor, responsive, a11y, dark mode

## Notes
- Phase order was resequenced: Chrome extension moved earlier (Phase 4) so core capture→edit→export loop works before visual polish
- excaliframe patterns reviewed for IndexedDB: using Dexie instead of raw IDB, separate tables with indexes, native Blob storage
