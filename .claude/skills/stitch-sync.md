# Stitch Sync

Pull latest designs from Google Stitch and show what changed.

## Steps

1. Run `./stitch-sync/sync.sh all`
2. Run `git diff --stat stitch-sync/` to show what changed
3. If there are structure changes, run `git diff stitch-sync/structure/` and summarize the structural differences (new sections, removed elements, renamed content)
4. Report: new screens, modified screens, unchanged screens
