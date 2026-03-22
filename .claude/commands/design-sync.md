Audit uncommitted Stitch sync changes against the last commit. Assumes `make sync` was already run.

## Prerequisites
The user has already run `make sync` which overwrote `stitch-sync/` with latest from Stitch API. This skill diffs those uncommitted changes against git HEAD to produce an actionable report.

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

4. **Diff screenshots**: Compare file hashes to detect visual changes
   ```bash
   for f in stitch-sync/screenshots/*.png; do
     name=$(basename "$f")
     old_hash=$(git show "HEAD:stitch-sync/screenshots/$name" 2>/dev/null | md5 -q || echo "NEW")
     new_hash=$(md5 -q "$f")
     [ "$old_hash" != "$new_hash" ] && echo "CHANGED: $name"
   done
   ```
   - For changed screenshots: read the new PNG to see what visually changed

5. **Diff HTML**: For existing screens, diff their HTML files
   ```bash
   for f in stitch-sync/html/*.html; do
     name=$(basename "$f")
     git show "HEAD:stitch-sync/html/$name" 2>/dev/null | diff - "$f"
   done
   ```
   - Ignore whitespace-only changes
   - Summarize structural changes (new elements, removed elements, changed classes/styles)
   - Flag any new `{{DATA:SCREEN:SCREEN_N}}` navigation links

6. **Produce change report**:

   ### No Action Needed
   Changes that are cosmetic (key reordering, whitespace) or already handled.

   ### Code Changes Required
   For each actionable change:
   - What changed in the design
   - Which file(s) in `app/src/` need updating
   - What the update would look like (brief, not full code)

   ### New Screens to Implement
   For each new screen:
   - What it shows (from screenshot)
   - Suggested route and component name
   - Whether it's a variant of an existing screen or entirely new

   ### Screenshots Changed
   For each visually changed screenshot, describe what's different.

7. **Update NEXTSTEPS.md**: Append new items to backlog section. Don't reorder existing items.

## Rules
- Do NOT make code changes — audit only
- Do NOT commit — just report
- Do NOT run `make sync` — assume it was already run
- Use `jq -S` for JSON comparison (Stitch API shuffles key order)
- Use `md5 -q` for binary file comparison
- Always read new/changed screenshots to understand visual intent
- Compare against `git show HEAD:path` — this is the committed baseline
