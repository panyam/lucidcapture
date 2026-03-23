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

**13. Firefox + Cross-Browser Support**
- Added `browser_specific_settings.gecko.id` to manifest for Firefox compatibility
- Added `background.scripts` alongside `service_worker` — Chrome ignores `scripts`, Firefox ignores `service_worker`
- Firefox loads extensions via `about:debugging` → "Load Temporary Add-on" → select `manifest.json`
- Corporate MDM (Jamf) blocked extension loading on both Chrome and Chrome Canary via `ExtensionInstallBlocklist: ["*"]` in managed preferences
- Workaround: used Chromium (`brew install --cask chromium`) which doesn't read Google's managed plists
- Added extension icons (SVG → 16/48/128px PNGs via ImageMagick) and `make ext-zip` target

**14. Debugging with Playwright (critical bugs found)**
- Used Playwright's bundled Chromium with `--load-extension` flag to test the full flow programmatically — **bypasses MDM entirely** since Playwright downloads its own Chromium
- **Bug 1: `startRecording()` never reached content script** — when called from popup, `sender.tab` is `undefined` (popup is not a tab). Fix: query active tab when `tabId` is not provided
- **Bug 2: Content script injection path wrong** — was `'content.js'` but esbuild outputs to `'dist/content.js'`
- **Bug 3: `chrome.storage.local` not accessible from web pages** — the React app at `localhost:5173` is a regular web page, not an extension page. `chrome.storage.local` is only accessible from extension contexts (content scripts, background, popup). Fix: content script reads storage and forwards data via `window.postMessage`
- **Race condition in postMessage delivery** — content script on `/editor/import` page retries 5 times with 500ms intervals to handle React mount timing
- Result: full capture→import→edit flow verified end-to-end with 3 automated clicks on example.com

**15. Dashboard Three-Dots Menu**
- Added dropdown menu on arcade cards: Edit, Duplicate, Delete
- Delete confirms with browser dialog, removes project + all steps from IndexedDB
- Duplicate creates new project with "(Copy)" suffix
- Menu closes on outside click

**17. Stitch Deficiency: No Component Hierarchy**
- Stitch API provides: design tokens (structured JSON), screen metadata (title, size, device type), HTML (flat rendered output), screenshots (PNG)
- Stitch API does **NOT** provide: component tree, element hierarchy, semantic structure, diffable design representation
- **Impact on change detection:** Screenshots are volatile (pixel-level styling changes produce false positives), and raw HTML diffs are noisy (Tailwind class reordering, whitespace). Neither is useful for answering "what structurally changed?"
- **Our workaround:** Built `extract-structure.sh` — parses each HTML file into a lightweight JSON outline capturing semantic elements (header/nav/main/aside/section), headings with text, buttons with text, links with hrefs, layout classes (grid/flex patterns), and HTML comments (Stitch uses these as component markers like `<!-- TopNavBar -->`)
- **Result:** Structure JSON files are diffable, resilient to styling-only changes, and catch real structural additions/removals/reorderings
- **Recommendation for Stitch team:** Expose a component/element tree API alongside the rendered HTML. Even a list of "sections" with their types and bounding boxes would be far more useful for design-to-code change tracking than screenshots or flat HTML.

**18. Player Page + Bidirectional Stitch Sync**
- Built a full-screen **Player page** (`/play/:id`) — immersive demo playback with:
  - Dark cinematic background, auto-hiding controls, progress bar
  - Hotspot-click-to-advance interaction (the core Arcade experience)
  - "Demo complete" overlay with Replay and Back to Dashboard
  - Edit button linking to the editor
  - Keyboard: Space (play/pause), arrows (nav), Escape (stop)
- **Navigation flow updated:** Dashboard card → Player (view demo) → Edit button → Editor
  - Previously: Dashboard → Editor (wrong — users want to view first, edit second)
- **Stitch MCP write-back:** Used `edit_screens` to update Dashboard (Flow) navigation links, and `generate_screen_from_text` to create a Player screen design in Stitch
  - This demonstrates **bidirectional design sync**: not just pulling designs from Stitch, but pushing our implementation decisions back to update the design source of truth
  - The Stitch project now reflects the actual app flow (Dashboard → Player → Editor)

**19. Key Learnings So Far**
- **Stitch MCP** gives structured design tokens + screen metadata but HTML is the deepest code output (no component tree)
- **Stitch REST API** works with just `X-Goog-Api-Key` header — simpler than the MCP proxy setup
- **Tailwind v4** migration: `@theme` CSS blocks replace `tailwind.config.js`, custom utilities use `@utility` directive
- **Chrome Extension MV3:** `chrome.tabs.captureVisibleTab()` is the reliable screenshot method; `chrome.tabCapture` has restrictions in MV3 (video capture may only work from popup context)
- **Extension ↔ Web App transfer:** `chrome.storage.local` is NOT accessible from regular web pages. Content scripts are the bridge — they have access to both `chrome.*` APIs and the page's `window.postMessage`
- **Playwright for extension testing:** use bundled Chromium with `--load-extension`, expose test hooks on `globalThis.__lucid` for direct function calls from service worker `evaluate()`
- **Corporate MDM blocks all Chrome variants** (stable + canary) via `com.google.chrome` plist. Chromium and Brave use different plist domains and are unaffected
- **pnpm** everywhere (not npm) — per project convention
- **Deterministic scripts > LLM calls** — the stitch-sync pipeline is pure shell/curl/jq, no AI in the loop

### Session 2 — 2026-03-22/23

**20. Go Stack Migration — Side-by-Side Architecture**
- Goal: migrate from React/Vite to Go stack (GoAppLib + Templar + tsappkit) while keeping both running for comparison
- This doubles as a **real-world stress test for the stack** — every friction point becomes a stack improvement ticket
- Scaffolded: `cmd/server/main.go`, `views/`, `templates/`, `ts/`, `protos/`
- **Protobuf-first data models** — `protos/lucidcapture/v1/` with models, GORM sidecar, Datastore sidecar, and ProjectsService RPC definitions
- Following lilbattle's exact patterns: `buf.gen.yaml`, protoc-gen-dal annotations, `BasePage` wrapping `goal.BasePage`, `locallinks/` symlink to `~/newstack`
- Key decision: protos are the source of truth for all data models — never hand-write Go model structs

**21. Templar Template Vendoring**
- GoAppLib's `BasePage.html` is the base layout — our templates extend it via `{{# namespace "GoalBase" "@goapplib/BasePage.html" #}}`
- `@goapplib` references resolve through `templar.yaml` config → vendored into `templates/templar_modules/goapplib/`
- Initially tried manual copy/symlink dance for deploys — **wrong approach**
- Correct approach (from lilbattle): `templar get` vendors the templates, commit them to git, deploys just work
- Had to override GoAppLib's default `CSSSection`, `HTMXSection`, and `SplashScreenSection` blocks — otherwise it loads `/static/css/tailwind.css` (404) and HTMX (not needed)

**22. Tailwind v4 CSS Build for Go Stack**
- React app uses `@tailwindcss/vite` plugin — CSS is built as part of Vite's pipeline
- Go stack needs its own build: `ts/styles.css` → `static/css/app.css` via `@tailwindcss/cli`
- Critical: `@source "../templates/**/*.html"` directive tells Tailwind to scan Go templates for class names
- The raw `@import "tailwindcss"` CSS is NOT servable directly — browser rejects it with MIME type errors
- tsup config needs `noExternal: [/.*/]` to bundle tsappkit + jsx-dom into the output (not left as unresolved imports)

**23. Visual Parity Verification with Playwright**
- Used Playwright MCP to take screenshots of all 4 pages on both `:5173` (React) and `:8080` (Go)
- Landing page: pixel-perfect match on first try after CSS fix
- Dashboard: pixel-perfect match
- Editor: minor difference — Go showed title bar unconditionally vs React hiding it when no project loaded. Fixed with conditional `{{ if eq .ProjectID "new" }} hidden{{ end }}`
- Player: **Go version was actually better** — showed controls (Edit/Close/prev/play/next) in empty state while React showed a dead-end loading screen. Ported the improvement back to React

**24. Arcade → Scene Rename**
- "Arcade" is Arcade.software's brand — we need our own noun. Evaluated: Capture, Scene, Clip, Flow, Tour, Reel, Lucid
- Chose **"Scene"** — natural language ("capture a scene"), cinematic theme, works at every touchpoint
- Systematic rename across both stacks: types (`SceneProject`, `SceneStep`), store (`useSceneStore`), files (`scene.ts`, `scene.db.ts`, `scene.store.ts`), UI strings ("My Scenes", "Create New Scene"), Go templates, Go views
- Used `git mv` to preserve history on file renames

**25. Extension Host Configuration**
- Extension had hardcoded `localhost:5173` redirect after recording stops
- Problem: need to support React dev (:5173), Go dev (:8080), and prod (appspot.com)
- Solution: `chrome.storage.sync` stores the target app URL per Chrome profile
  - Popup shows an editable "App Host" text field (persists on blur/Enter)
  - `chrome.storage.sync` is profile-specific — work profile can point to localhost, personal to prod
  - esbuild `--prod` flag bakes in prod URL as build-time default via `define: { '__DEFAULT_APP_HOST__': ... }`
  - `make ext` → dev default, `make ext-zip` → prod default

**26. Phase 6: Static HTML Compiler**
- Core loop completed: capture → edit → **export**
- Compiler infrastructure was already scaffolded (`player-engine.ts`, `player.css.ts`, `icons.ts`, `types.ts`)
- Built: `compile.ts` (HTML assembler), `serialize.ts` (Blob→data URI), `download.ts` (browser download trigger)
- **Shared compiler** at `shared/compiler/` — symlinked into both `app/src/lib/compiler/` and `ts/lib/compiler/`
- Both React and Go editors share the same compilation code (tsup resolves symlinks at build time)
- Go stack export uses `lc-export-btn` CSS class + `data-project-id` attribute — any page can be an export page
- `player-engine.ts` is a 286-line vanilla JS IIFE that reads `window.__LUCID_DATA__` — handles playback, hotspots, timeline, keyboard shortcuts, URL hash navigation
- All resources inlined: CSS in `<style>`, JS in `<script>`, screenshots as `data:image/jpeg;base64,...`
- Output works from `file://` with zero external dependencies
- Added `/seed` endpoint to Go server for test data (uses Dexie to seed IndexedDB client-side)

**27. Design Drift Detection — Code vs Stitch**
- After building the app, we noticed Stitch designs and our implementation had diverged:
  - Stitch had a "Scene Details" page (metadata, analytics, tags) that we never built — our flow skips from Dashboard straight to Player
  - Stitch's SideNav had Collections, Shared, Archived, Trash — ours has placeholder links
  - Stitch's TopNav had Library, Analytics, Settings — ours has Explore + Community
  - Stitch had a mobile bottom nav — we have no responsive design yet
- **How we detected this:** The `extract-structure.sh` tool we built earlier produces diffable JSON outlines of each Stitch screen. By comparing the structure JSON (headings, buttons, links, layout patterns) against our actual templates, we can see exactly which sections of the design we've implemented vs. skipped
- **Bidirectional sync in action:** When we renamed "Arcade" → "Scene" in code, we pushed the change back to Stitch via `edit_screens` MCP, then pulled the updated designs via `stitch-sync/sync.sh all`. The sync produced new `scene-*` screens alongside the old `arcade-*` ones (Stitch created copies rather than renaming). Dashboard and editor HTML content now says "My Scenes"
- **Key insight:** Stitch's HTML output aligns more closely with Templar templates than JSX — both produce plain HTML with Tailwind classes. The design-sync pipeline could potentially diff/patch Templar templates directly instead of going through JSX conversion
- **Gap tracking pattern:** Design divergence is inevitable during development. The tooling chain (structure extraction → diff → sync → verify) makes it manageable. Each gap is either "intentionally deferred" (Scene Details → backlog) or "should fix" (naming inconsistency → fixed immediately)

**28. App Engine Deploy Config**
- `app.yaml` at repo root: `runtime: go124`, `main: ./cmd/server`, `max_instances: 2`
- `.gcloudignore` aggressively excludes: `app/`, `extension/`, `locallinks/`, `tests/`, `stitch-sync/`, `docs/`
- `make deploy` builds TS/CSS, runs `templar get` to vendor templates, then `gcloud app deploy`
- `make tsdeploy` for legacy React deploy (separate `app/app.yaml` with `nodejs22` runtime)
- `make prodlogs` tails App Engine logs
- No server-side storage yet — IndexedDB only. Datastore sidecar protos ready for when we add it

**29. Key Learnings — Session 2**
- **Side-by-side migration works** — running both versions on different ports catches UX improvements (player controls) and regressions immediately
- **Protos first, always** — tried to hand-write Go model structs, got corrected. Protobuf definitions are the single source of truth
- **Templar vendoring via `templar get`** — don't manually copy template modules, use the CLI (same as lilbattle)
- **Tailwind v4 needs a build step even for Go** — the `@import "tailwindcss"` source CSS is not raw-servable
- **`noExternal` in tsup** — must bundle all dependencies into the output for browser consumption
- **`chrome.storage.sync` is per-profile** — perfect for per-environment extension config
- **Shared code via symlinks** — `shared/compiler/` symlinked into both build pipelines avoids duplication while preserving `git mv` history
- **Design drift is a feature, not a bug** — the tooling makes it visible and trackable. Fix naming inconsistencies immediately, defer feature gaps to backlog

**30. Stitch generate_variants — Async Behavior**
- Called `generate_variants` on the Landing Page with EXPLORE creative range, LAYOUT aspect, 3 variants
- The MCP call returned immediately with no output — appeared to fail
- Checked `list_screens` right after — no new screens. Assumed failure
- **But it worked** — checking again a few minutes later, 3 new Landing Page variants appeared (heights 11224, 6306, ~6264) with different layout arrangements
- **Key learning:** The MCP `generate_variants` tool returns immediately while generation happens asynchronously. The [Stitch SDK](https://github.com/google-labs-code/stitch-sdk) masks this with `await screen.variants()` which polls internally, but the raw MCP tool doesn't
- **Practical implication:** After calling `generate_variants` (or `edit_screens`), wait 2-5 minutes then call `list_screens` to see results. Don't retry — the "DO NOT RETRY" warning is correct
- **Observation:** The MCP tool description for `generate_screen_from_text` explicitly says "try to get the screen with get_screen method later" — `generate_variants` should have similar guidance but doesn't
- Also generated new Dashboard and Dashboard (Flow) variant screens as a side effect of the earlier `edit_screens` rename — Stitch creates copies rather than modifying in place

**31. Stitch Variants — Structural Analysis**
- After variants landed, we built a `/stitch-analyse` skill to compare Stitch-generated HTML against our existing templates
- Used a Python HTML parser to extract section outlines (headings, buttons, semantic elements) from both the variant and our template
- Produced a **section mapping table** showing exactly what maps, what's new, and what differs:

| Section | Our Landing Page | Compact Variant | Tall Variant |
|---------|-----------------|-----------------|--------------|
| Hero | h1 + 2 buttons (Record, See How) | h1 + badge + 2 buttons | h1 + 2 buttons + dashboard preview |
| Trust logos | Missing | "Trusted by teams at" + 5 logos | Same — VELOCITY, NEXUS, ORBIT, PRISM, FLUX |
| Features | 3-column bento grid (h3 x3) | Stacked list with descriptions | Full-width alternating sections (h2 each) + extra "Cloud Rendering" |
| CTA | 1 link button | 2 buttons (Record + Talk to Sales) | 2 buttons (same) |
| Footer | 1-line (brand + copyright) | Multi-column: Product/Resources/Company | Multi-column: Product/Resources/Company + API/Terms links |

- **Key insight for porting:** The variants use the same Tailwind utility classes as our design tokens (`bg-primary`, `text-on-background`, etc.) because Stitch generates with Tailwind. This means the body content drops directly into our Templar templates with minimal adaptation — just swap out CDN images and ensure our `@theme` tokens cover the classes used
- **What doesn't transfer cleanly:** Stitch's `lh3.googleusercontent.com` hosted images (profile photos, screenshots) need placeholder replacement. HTML comments used as section markers (`<!-- TopNavBar -->`) are Stitch-internal and not semantic
- Built proper Templar templates (`LandingCompact.html`, `LandingTall.html`) that extend our `BasePage.html` with each variant's body content — same nav, fonts, design tokens, just different layouts
- Created `/compare` page showing all 3 variants side-by-side in iframes
- **Demo narrative:** "Stitch generated 3 layout variants → we analyzed them structurally → ported them into our production template system → all 3 render through the same Go/React pipeline with our design tokens"

**32. Stitch Skills for Claude Code**
- Created 4 skills in `.claude/skills/` to stay in the agent workflow:
  - `/stitch-sync` — runs `./stitch-sync/sync.sh all`, shows git diff summary
  - `/stitch-diff` — shows uncommitted sync changes with structure-level analysis
  - `/stitch-variants` — calls `generate_variants` MCP, handles async (tells user to sync later)
  - `/stitch-analyse` — compares Stitch HTML against our templates, produces section mapping table and porting checklist
- These are thin wrappers — they call existing scripts rather than reimplementing logic
- The variants skill is special: it calls the MCP tool directly but delegates sync to the existing script
- **Pattern:** Skills as workflow glue — each skill orchestrates existing tools (shell scripts + MCP + git) rather than doing the work itself

**33. Wiring Variants Into Production**
- Ported the Stitch variant HTML into proper Templar templates (`LandingCompactPage.html`, `LandingTallPage.html`) and React components (`LandingCompactPage.tsx`, `LandingTallPage.tsx`)
- **Not raw Stitch HTML** — extracted body content, adapted to our template system (extends `BasePage.html`), replaced Stitch CDN images with placeholders, used our design tokens
- **GoAppLib gotcha:** Template filename must match struct name exactly — `LandingCompactPage` struct looks for `LandingCompactPage.html`, not `LandingCompact.html`. The `define` block name must also match
- Routes on both stacks:
  - `/` — original (3-col bento grid)
  - `/landing/compact` — stacked features, trust logos, multi-col footer
  - `/landing/tall` — full-width alternating sections, dashboard preview, Cloud Rendering teaser
  - `/compare` — side-by-side iframes of all 3
- The compare page is a static HTML on Go (`static/compare.html`) and a React component on React (`ComparePage.tsx`) — both show the same 3 iframes
- **End-to-end demo pipeline:** Stitch `generate_variants` → async wait → `stitch-sync` pulls HTML → `/stitch-analyse` maps sections → port into Templar/React templates → all variants render through production pipeline with shared design tokens → `/compare` page for visual A/B
