# Stackfile — Lucid Capture

| Component | Module | Version | Updated |
|-----------|--------|---------|---------|
| GoAppLib | github.com/panyam/goapplib | v0.0.34 | 2026-03-22 |
| tsappkit | @panyam/tsappkit | 0.0.5 | 2026-03-22 |
| Templar | github.com/panyam/templar | v0.0.29 | 2026-03-22 |
| protoc-gen-dal | github.com/panyam/protoc-gen-dal | v0.0.13 | 2026-03-22 |
| goutils | github.com/panyam/goutils | v0.1.13 | 2026-03-22 |
| devloop | github.com/panyam/devloop | v0.0.73 | 2026-03-22 |

## Third-party (kept)

| Package | Why |
|---------|-----|
| jsx-dom | JSX → real DOM (no React runtime) |
| tailwindcss | CSS utilities (works with Go templates) |
| @tailwindcss/cli | Builds ts/styles.css → static/css/app.css |

## Planned (not yet wired)

| Package | Why |
|---------|-----|
| gorm + sqlite | Local dev database (when server-side persistence is added) |
| protoc-gen-dal-datastore | App Engine Datastore (prod persistence) |
