# Lucid Capture — Developer Guide

## Quick Start
```bash
cd app && pnpm install && pnpm run dev   # http://localhost:5173
./stitch-sync/sync.sh all                # Pull latest designs from Stitch
```

## Project Structure
- `app/` — React + Vite + Tailwind (pnpm, not npm)
- `extension/` — Chrome Extension (Manifest V3) — not yet built
- `stitch-sync/` — Design sync infrastructure (shell scripts, no LLM)
- `tests/` — pytest + Playwright e2e tests — not yet built

## Key Commands
| Command | What |
|---------|------|
| `cd app && pnpm run dev` | Start dev server |
| `cd app && pnpm run build` | Production build |
| `./stitch-sync/sync.sh all` | Sync designs from Stitch API |
| `./stitch-sync/sync.sh manifest` | Sync just tokens + screen list |

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

## Architecture
See [ARCHITECTURE.md](ARCHITECTURE.md) for design decisions and component hierarchy.
See [PLAN.md](PLAN.md) for implementation phases and build sequence.
See [JOURNEY.md](JOURNEY.md) for session-by-session progress log (demo slides).
