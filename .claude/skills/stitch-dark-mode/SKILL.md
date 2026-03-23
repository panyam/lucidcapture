# Stitch Dark Mode

Generate a dark mode variant of a screen via Stitch, sync, analyse, and implement — end to end.

## Arguments
- `<component_or_page>`: What to dark-mode (e.g., "header", "landing", "dashboard", "editor", "player")
- Optional: which Stitch screen to use as source (defaults to matching screen title)

## Steps

1. **Generate**: Call `generate_variants` on the matching Stitch screen with `COLOR_SCHEME` aspect, `EXPLORE` creative range, 1 variant, prompt: "Generate a dark mode color scheme variant. Use dark backgrounds, light text, and adjust accent colors to work on dark surfaces."

2. **Wait + Sync**: If the response includes screenshots, proceed. Otherwise tell the user to wait 2-5 minutes and run `/stitch-sync`.

3. **Analyse**: Compare the dark variant's HTML against our current component/template. Extract:
   - Background colors (what changed from light to dark)
   - Text colors (what changed from dark to light)
   - Accent/primary color adjustments
   - Border/outline color changes
   - Produce a mapping: `light_class → dark:dark_class`

4. **Implement**:
   - If dark `@theme` block doesn't exist yet in `app/src/index.css` / `ts/styles.css`, create it with the extracted dark tokens
   - Add `dark:` Tailwind variants to the relevant component files (both React .tsx and Go .html template)
   - If this is the header (#7), also add the theme toggle button

5. **Verify**: List the files changed and the dark: classes added. Remind user to test by toggling dark mode.

## Notes
- The header (#7) must be done first — it contains the theme toggle
- Player page may already be dark-themed (check before generating)
- Both React and Go templates need updating for each component
- Use the same dark tokens across all components for consistency
