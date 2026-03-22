# Lucid Capture — Developer Guide

## Quick Start
```bash
cd app && pnpm install && pnpm run dev   # http://localhost:5173
./stitch-sync/sync.sh all                # Pull latest designs from Stitch
```

## Project Structure
- `app/` — React + Vite + Tailwind (pnpm, not npm)
- `extension/` — Chrome Extension (Manifest V3, TypeScript + esbuild)
- `stitch-sync/` — Design sync infrastructure (shell scripts, no LLM)
- `tests/` — pytest + Playwright e2e tests
- `docs/` — GitHub Pages (privacy policy)

## Key Commands
| Command | What |
|---------|------|
| `cd app && pnpm run dev` | Start dev server |
| `cd app && pnpm run build` | Production build |
| `./stitch-sync/sync.sh all` | Sync designs from Stitch API |
| `./stitch-sync/sync.sh manifest` | Sync just tokens + screen list |
| `cd extension && pnpm run build` | Build Chrome extension → `dist/` |
| `cd extension && pnpm run watch` | Watch mode for extension dev |
| `make ext` | Build extension (shortcut) |
| `make ext-zip` | Build + zip for Chrome Web Store upload |
| `make gh-pages` | Deploy docs/ to GitHub Pages |
| `make install` | Install all dependencies (app + extension) |

## Design System
- Source of truth: `stitch-sync/design-tokens.json` and `stitch-sync/design-system.md`
- Colors are defined in `app/src/index.css` via Tailwind v4 `@theme` block
- **No-Line Rule**: Never use `border` utilities for layout separation — use background color shifts between surface tiers
- Custom utilities: `glass-panel` (frosted glass), `ghost-border` (subtle outline)
- Fonts: Inter (body), Balig Script (decorative annotations)
- Icons: Material Symbols Outlined (loaded via Google Fonts CDN)

## Env Vars
| Var | Purpose |
|-----|---------|
| `VIBESTITCH_API_KEY` | Stitch REST API key (required for sync scripts) |

## Gotchas
- Tailwind v4 uses CSS `@theme` blocks, not `tailwind.config.js` — the Stitch HTML uses CDN Tailwind v3, so class names match but config format differs
- Stitch MCP is configured in user scope (`~/.claude.json`), not in the repo
- `.mcp.json` is gitignored (contains API key when set at project scope)
- Use `pnpm`, not `npm`
- **Extension ↔ Web App data transfer**: `chrome.storage.local` is NOT accessible from regular web pages (only from extension contexts). The content script bridges this — it reads from `chrome.storage.local` and forwards via `window.postMessage`
- **Extension `startRecording()`**: when called from popup, `sender.tab` is `undefined` — must query active tab explicitly
- **Extension content script injection**: esbuild outputs to `dist/`, so scripting.executeScript must reference `'dist/content.js'`, not `'content.js'`
- **Corporate MDM (Jamf)**: blocks Chrome + Canary extension loading via `com.google.chrome` plist. Use Chromium or Brave instead — they use different plist domains
- **Playwright extension testing**: use Playwright's bundled Chromium with `--load-extension` flag (bypasses MDM). Expose test hooks on `globalThis.__lucid` for service worker evaluate()
- **Extension context invalidation**: when the extension is reloaded, old content scripts in open tabs throw "Extension context invalidated". Content script checks `chrome.runtime?.id` before every message and self-destructs if invalid
- **Content script double-injection**: guard with `window.__lucidCaptureInjected` flag. Reset to `false` on `stopCapture()` so re-injection works for new sessions
- **Cross-tab recording requires `host_permissions`**: `activeTab` only grants access on user click of extension icon. `"host_permissions": ["<all_urls>"]` is needed for `scripting.executeScript` on tabs the user switches to during recording
- **Background is the recording controller**: periodic timer, tab/window lifecycle, screenshots all owned by the service worker. Content scripts are dumb event reporters (clicks, scrolls) — they die on page navigation and get re-injected
- **Hotspot animation**: 2.5s `cubic-bezier(0.25, 0.1, 0.25, 1)` transition on `left`/`top` for smooth gliding between steps. Disabled during drag in edit mode

## Architecture
See [ARCHITECTURE.md](ARCHITECTURE.md) for design decisions and component hierarchy.
See [PLAN.md](PLAN.md) for implementation phases and build sequence.
See [JOURNEY.md](JOURNEY.md) for session-by-session progress log (demo slides).
