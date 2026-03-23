# Stitch Variants

Generate design variants for a screen using Google Stitch, then sync the results.

## Arguments
- `<screen_title>`: Which screen to generate variants for (e.g., "Landing Page", "Dashboard", "Editor")
- Optional: aspect to vary (layout, color, images, fonts, content). Defaults to layout.
- Optional: creative range (refine, explore, reimagine). Defaults to explore.
- Optional: count (1-5). Defaults to 3.

## Steps

1. Run `./stitch-sync/sync.sh manifest` to get the current screen manifest
2. Read `stitch-sync/screen-manifest.json` and find the screen ID matching the given title
3. If no match found, list available screen titles and ask user to pick one
4. Call the `mcp__stitch__generate_variants` tool with:
   - `projectId`: `9522660877005191774`
   - `selectedScreenIds`: the matched screen ID
   - `prompt`: "Generate {aspect} variants of this screen"
   - `variantOptions`: `{ variantCount: count, creativeRange: range, aspects: [aspect] }`
   - `deviceType`: DESKTOP
5. **Important:** The MCP call returns immediately — generation takes 2-5 minutes async
6. Tell the user: "Variants requested. Generation takes 2-5 minutes. Run `/stitch-sync` when ready to pull results."
7. Do NOT automatically wait or poll — let the user decide when to sync
