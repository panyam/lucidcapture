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

**9. Building Phase 1 (in progress)**
- Scaffolding Vite + React + Tailwind
- Generating tailwind.config.ts from design-tokens.json
- Building shared components from Stitch HTML
