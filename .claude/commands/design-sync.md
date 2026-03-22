Audit uncommitted Stitch sync changes against the last commit. Assumes `make sync` was already run.

## Prerequisites
The user has already run `make sync` which overwrote `stitch-sync/` with latest from Stitch API (including `structure/` JSON outlines). This skill diffs those uncommitted changes against git HEAD to produce an actionable report.

## Steps

1. **Check if there's anything to diff**: Run `git diff --stat -- stitch-sync/`. If empty, report "no changes since last commit" and stop.

2. **Diff design tokens**: Compare `stitch-sync/design-tokens.json` against git HEAD
   ```bash
   git show HEAD:stitch-sync/design-tokens.json | jq -S '.namedColors' > /tmp/old_colors.json
   jq -S '.namedColors' stitch-sync/design-tokens.json > /tmp/new_colors.json
   diff /tmp/old_colors.json /tmp/new_colors.json
   ```
   - Also check `fonts`, `roundness`, `spacingScale`, `overrides` for value changes
   - If any color values changed: list them and identify which `--color-*` vars in `app/src/index.css` need updating

3. **Diff screen manifest**: Compare screen lists
   ```bash
   git show HEAD:stitch-sync/screen-manifest.json | jq -r '.screens[] | "\(.id) \(.title)"' | sort > /tmp/old_screens.txt
   jq -r '.screens[] | "\(.id) \(.title)"' stitch-sync/screen-manifest.json | sort > /tmp/new_screens.txt
   comm -23 /tmp/old_screens.txt /tmp/new_screens.txt  # REMOVED
   comm -13 /tmp/old_screens.txt /tmp/new_screens.txt  # ADDED
   ```
   - For each new screen: read its screenshot (PNG) to understand what it shows
   - Check for renamed screens (same ID prefix, different title)
   - Check for resized screens (same ID, different width/height)

4. **Diff structure outlines** (primary change detection — preferred over screenshot pixel comparison):
   ```bash
   for f in stitch-sync/structure/*.json; do
     name=$(basename "$f")
     if git show "HEAD:stitch-sync/structure/$name" >/dev/null 2>&1; then
       git show "HEAD:stitch-sync/structure/$name" > /tmp/old_struct.json
       changes=$(diff /tmp/old_struct.json "$f" | grep "^[<>]" | wc -l)
       [ "$changes" -gt 0 ] && echo "CHANGED ($changes lines): $name"
     else
       echo "NEW: $name"
     fi
   done
   ```
   - Structure files capture semantic elements, headings, buttons, layout classes, and HTML comments
   - They are resilient to pixel/styling changes but catch structural additions/removals
   - For changed structures: diff the old vs new JSON to identify what was added/removed/moved
   - Flag structural changes that need code updates (new components, changed layouts, new buttons/links)

5. **For new screens only**: Read their screenshots (PNG) to understand visual intent, since there's no old structure to diff against.

6. **Produce change report**:

   ### No Action Needed
   Changes that are cosmetic (key reordering, whitespace, pixel-only styling) or already handled.

   ### Code Changes Required
   For each actionable change:
   - What changed in the design (from structure diff)
   - Which file(s) in `app/src/` need updating
   - What the update would look like (brief, not full code)

   ### New Screens to Implement
   For each new screen:
   - What it shows (from screenshot + structure outline)
   - Suggested route and component name
   - Whether it's a variant of an existing screen or entirely new

7. **Update NEXTSTEPS.md**: Append new items to backlog section. Don't reorder existing items.

## Rules
- Do NOT make code changes — audit only
- Do NOT commit — just report
- Do NOT run `make sync` — assume it was already run
- Use `jq -S` for JSON comparison (Stitch API shuffles key order)
- Prefer structure diffs (`stitch-sync/structure/`) over screenshot pixel diffs for change detection
- Only read screenshots for NEW screens (no old structure to compare against)
- Compare against `git show HEAD:path` — this is the committed baseline
- Note: Stitch API does not provide component hierarchy — the structure extraction (`extract-structure.sh`) is our workaround, parsing semantic elements from the HTML
