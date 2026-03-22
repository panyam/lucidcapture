Sync designs from Stitch and audit what changed. Produce an actionable change report.

## Steps

1. **Run sync**: Execute `make sync` to pull latest from Stitch API

2. **Diff tokens**: Compare `stitch-sync/design-tokens.json` against git HEAD
   - Extract just `namedColors` from both old and new, sort keys, and diff VALUES (ignore key reordering)
   - Check `fonts`, `roundness`, `spacingScale`, `overrides` for actual value changes
   - If any color values changed: list them and identify which Tailwind `@theme` vars in `app/src/index.css` need updating

3. **Diff screen manifest**: Compare `stitch-sync/screen-manifest.json` against git HEAD
   - List ADDED screens (new IDs not in old manifest)
   - List REMOVED screens (old IDs not in new manifest)
   - List RENAMED screens (same ID, different title)
   - List RESIZED screens (same ID, different dimensions)
   - For each new screen, read its screenshot to understand what it is

4. **Diff HTML**: For screens that existed before, diff the HTML files
   - Ignore whitespace-only changes
   - Summarize structural changes (new elements, removed elements, changed classes)
   - Flag any new `{{DATA:SCREEN:SCREEN_N}}` navigation links (Flow variants)

5. **Produce change report** with three sections:

   ### No Action Needed
   List changes that are cosmetic (key reordering, whitespace) or already handled in our code.

   ### Code Changes Required
   For each actionable change, specify:
   - What changed in the design
   - Which file(s) in `app/src/` need updating
   - What the update would look like (brief description, not full code)

   ### New Screens to Implement
   For each new screen, describe:
   - What it shows (from screenshot analysis)
   - Suggested route and component name
   - Whether it's a variant of an existing screen or entirely new

6. **Update NEXTSTEPS.md** with any new items from the change report (append to backlog, don't reorder existing items)

## Rules
- Do NOT make code changes — this skill is audit-only
- Do NOT commit — just report. The user will decide what to act on
- Use `jq` for JSON diffing, not eyeballing raw diffs
- Always check actual VALUES, not just key ordering (Stitch API returns keys in random order)
- Read screenshots of new screens to understand intent before suggesting implementation
