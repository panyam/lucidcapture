# Arcade Clone — Design-to-Code Journey Log

## Goal
Evaluate Google's Vibe-Stitch as an AI design tool, then build a working prototype from Stitch designs — and establish a workflow for tracking design changes back to code.

## Timeline

### Session 1 — 2026-03-21

**1. Research Phase**
- Explored Google Stitch (aka "Vibe-Stitch") capabilities
- Found it supports: text/voice/image-to-UI, HTML/CSS export, interactive prototyping, DESIGN.md export, and MCP server integration
- Key limitation: HTML/CSS only — no React/Vue export yet (React on roadmap)

**2. MCP Integration Setup**
- Installed `@_davideast/stitch-mcp` as MCP server for Claude Code
- Configured `.mcp.json` with `STITCH_USE_SYSTEM_GCLOUD=1`
- Ran `stitch-mcp doctor` — required Google OAuth flow
- Hit 403 on initial GCP project (`weewar`) — switched to `vibestitch` project
- Set quota project, re-ran doctor — all checks passed
- Restarted Claude Code — Stitch MCP tools now available

**3. Design Discovery**
- Connected to Stitch project: `projects/9522660877005191774` ("Share Modal" project title)
- Design System: **"The Lucid Capture Framework"** — premium indigo-themed, glassmorphic, editorial typography
- Key design principles: No-Line Rule (no 1px borders), Tonal Depth, Intentional Asymmetry, Ghost Borders

**Screens identified (5):**

| Screen | ID | Type | Dimensions |
|--------|-----|------|------------|
| Landing Page | `60a853b8...` | Desktop | 2560x9896 |
| Share Modal | `0aee0fd5...` | Desktop | 2560x2048 |
| Editor (Desktop) | `6f3360ae...` | Desktop | 2560x2048 |
| Editor (Mobile) | `beed1bd8...` | Mobile | 390x884 |
| Dashboard | `dcc5a7cd...` | Desktop | 2560x2192 |

**4. MCP Endpoint Switch**
- Switched from `@_davideast/stitch-mcp` (local proxy) to official remote MCP at `https://stitch.googleapis.com/mcp`
- Moved MCP config to user scope (`~/.claude.json`) to avoid committing API key
- Verified full tool access: `get_project`, `list_screens`, `get_screen`, `generate_screen_from_text`, `edit_screens`, `generate_variants`

**5. Sync Infrastructure (key decision)**
- User pushed back on raw HTML downloads via curl — wanted structured, diffable data
- Discovered: Stitch API's deepest code output IS HTML (no component tree/AST), but metadata is structured
- Built deterministic sync scripts (`stitch-api.sh` + `sync.sh`) instead of relying on LLM calls
- **Design principle:** separate change detection layer (tokens + manifest) from code generation input (HTML)

**Sync output structure:**
```
stitch-sync/
  stitch-api.sh          # Reusable API wrapper functions
  sync.sh                # Deterministic sync: manifest | screens | screenshots | all
  design-tokens.json     # Structured color/font/spacing tokens (diffable)
  design-system.md       # "The Lucid Capture Framework" spec
  screen-manifest.json   # Screen index: IDs, titles, sizes, download URLs
  html/                  # 5 screen HTML files
  screenshots/           # 4 screen PNGs
```

**6. Design Review**
The app is **"Lucid Capture"** — an Arcade.software clone for creating cinematic product demos:
- **Landing Page:** Marketing hero, feature sections (One-Click Recording, Seamless Sharing, Interactive Annotations), CTA
- **Dashboard:** "My Arcades" grid with demo thumbnails, sidebar nav, "Create New Arcade"
- **Editor:** Video preview with glassmorphic playback controls, timeline, annotation/transition tools
- **Share Modal:** Privacy settings, shareable link, embed code, export formats (MP4/GIF/High-res)

**7. Architecture Decisions**
- **React + Vite** (over Solid — ecosystem maturity wins for demo timeline)
- **No backend** — IndexedDB for storage, static HTML export (slyds pattern)
- **Chrome Extension** (Manifest V3) required for 3P site capture (same-origin policy)
- **Three pieces:** React app (UI), Chrome extension (capture), Static HTML compiler (export)
- Referenced user's `slyds` project for the single-file HTML export pattern (templar includes → asset inlining → self-contained file)
- User preference: deterministic scripts over LLM calls, structured API data over raw downloads

**8. Implementation Plan Created**
- 10-phase plan saved to `PLAN.md`
- Phases 1-8 are active, Phases 9-10 are backlog
- Key dependencies: Phase 1 → Phases 2+3 (parallel) → Phases 4+5+6 → Phase 7
- Phase 8 (design token pipeline) is independent after Phase 1

**9. Phase 1 Complete — Foundation**
- Scaffolded Vite + React + TypeScript + Tailwind v4 app
- Tailwind v4 gotcha: uses CSS `@theme` blocks, not JS config — Stitch HTML uses CDN Tailwind v3, so class names match but config format differs
- 48 named colors from `design-tokens.json` wired into `@theme` block in `index.css`
- Custom `@utility` directives for `glass-panel` and `ghost-border`
- Material Symbols Outlined loaded via Google Fonts CDN
- Shared components: `TopNav`, `SideNav`, `MaterialIcon`
- React Router v7 with routes: `/`, `/dashboard`, `/editor/:id`
- Three page shells: Landing (hero + features + CTA), Dashboard (arcade card grid), Editor (canvas + timeline + tool sidebar)
- Key command: `cd app && pnpm run dev` → http://localhost:5173

**10. Phase 3 Complete — Data Layer**
- **Dexie.js** chosen over raw IndexedDB (learned from excaliframe's verbose Promise wrapping)
- Two tables: `projects` (indexed on `updatedAt`, `title`) and `steps` (compound index `[projectId+order]`)
- Screenshots stored as native **Blobs** in IDB (not base64 strings — avoids 33% size overhead)
- Zustand store wraps all CRUD with optimistic UI updates
- Dashboard now shows real projects from IndexedDB, "Create New Arcade" creates a project and navigates to editor

**11. Phase 4 Complete — Chrome Extension**
- Resequenced phases: moved extension before page polish so capture→edit loop works ASAP
- **TypeScript + esbuild** for the extension (not plain JS — better debugging, type safety)
  - `extension/build.mjs` — esbuild config with 3 entry points, sourcemaps, iife format
  - `pnpm run watch` for live rebuild during development
- **Manifest V3** architecture:
  - `content.ts` — injected into target pages, listens for clicks in capture phase, records viewport-ratio coordinates + CSS selector + element label
  - `background.ts` — service worker, orchestrates recording session, calls `chrome.tabs.captureVisibleTab()` for JPEG screenshots at 70% quality
  - `popup/` — minimal UI: start/stop button, step counter, recording indicator with pulsing red dot
- **Capture→Edit flow:**
  1. User clicks "Start Recording" in popup → content script begins intercepting clicks
  2. Each click: content script sends step data → background takes screenshot → stores in memory
  3. User clicks "Stop Recording" → background writes all steps to `chrome.storage.local` → opens `localhost:5173/editor/import`
  4. React app detects `pendingSession` in chrome.storage → creates new project → converts base64 screenshots to Blobs → stores in IndexedDB → redirects to editor
- **Extension icons:** SVG source → ImageMagick converts to 16/48/128px PNGs (indigo gradient + play/record icon)
- **Makefile targets:** `make ext` (build), `make ext-watch` (dev), `make ext-zip` (zip for Chrome Web Store upload)

**12. Chrome Web Store Publishing (researched)**
- $5 one-time developer registration fee
- **First publish must be manual** — API can create an item but you must complete metadata in the dashboard
- **Subsequent updates can be automated** via Chrome Web Store API:
  - Setup: enable API in GCP project, configure OAuth consent screen, get refresh token
  - CLI tool: `npx cws-publish $client_id $client_secret $refresh_token lucid-capture-extension.zip $extension_id`
  - Can also use GitHub Actions: `nicolo-ribaudo/chrom-ext-deploy` action
  - Service accounts supported for CI/CD pipelines
- **Key limitation:** Chrome Web Store API V1 deprecated, sunset October 2026
- Trader vs non-trader: pick **non-trader** for demo/side projects (avoids EU DSA business obligations)

**13. Key Learnings So Far**
- **Stitch MCP** gives structured design tokens + screen metadata but HTML is the deepest code output (no component tree)
- **Stitch REST API** works with just `X-Goog-Api-Key` header — simpler than the MCP proxy setup
- **Tailwind v4** migration: `@theme` CSS blocks replace `tailwind.config.js`, custom utilities use `@utility` directive
- **Chrome Extension MV3:** `chrome.tabs.captureVisibleTab()` is the reliable screenshot method; `chrome.tabCapture` has restrictions in MV3 (video capture may only work from popup context)
- **Extension ↔ App transfer:** `chrome.storage.local` as shared buffer works well, need `unlimitedStorage` permission for large recordings
- **pnpm** everywhere (not npm) — per project convention
- **Deterministic scripts > LLM calls** — the stitch-sync pipeline is pure shell/curl/jq, no AI in the loop
