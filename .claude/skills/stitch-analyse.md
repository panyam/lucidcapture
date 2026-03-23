# Stitch Analyse

Analyse a Stitch screen's HTML and compare it structurally to our existing implementation. Useful for porting Stitch designs into our template system.

## Arguments
- `<stitch_html_path>`: Path to the Stitch HTML file (e.g., `stitch-sync/html/landing-variant-compact.html`)
- `<our_template_path>`: Path to our existing template or React component to compare against (e.g., `templates/LandingPage.html` or `app/src/pages/LandingPage.tsx`)

## Steps

1. Run `./stitch-sync/extract-structure.sh` on the Stitch HTML to get its structural outline (if a structure JSON doesn't already exist)
2. Read the structural outline — identify the major sections (by HTML comments like `<!-- TopNavBar -->`, headings, semantic elements)
3. Read our existing template/component
4. Produce a **section mapping table**:
   - Which sections in the Stitch design map to sections in our template
   - Which sections are new (in Stitch but not in our code)
   - Which sections are missing (in our code but not in Stitch)
   - Which sections differ structurally (same purpose, different layout)
5. For each section, note:
   - Tailwind classes that match our design tokens vs. classes that use Stitch's CDN Tailwind
   - Image URLs (Stitch uses `lh3.googleusercontent.com` hosted images — these need replacing)
   - Text content differences
6. Produce a **porting checklist**: ordered list of what to copy, what to adapt, and what to skip
7. Flag any Stitch HTML patterns that won't work in our template system (e.g., inline styles, CDN-only Tailwind classes, external images)
