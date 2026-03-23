# Stitch Diff

Show uncommitted Stitch sync changes — what's different between the last commit and the current sync state.

## Steps

1. Run `git diff --stat stitch-sync/` to show changed files
2. If no changes, report "Stitch sync is up to date with the last commit"
3. If there are changes:
   - Summarize screenshot changes (new/modified PNGs)
   - Diff structure JSON files (`git diff stitch-sync/structure/`) and summarize: new elements, removed elements, text changes
   - Diff HTML files and note significant content changes (ignore whitespace/class reordering)
   - Diff design-tokens.json for color/font/spacing changes
