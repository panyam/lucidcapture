
# Design System Specification: The Lucid Capture Framework

## 1. Overview & Creative North Star: "The Digital Curator"
This design system is built to transform product demonstrations from static recordings into curated, high-end cinematic experiences. Our Creative North Star is **"The Digital Curator"**—a philosophy that treats the software interface not as a utility, but as a gallery space.

To move beyond the "SaaS-in-a-box" look, this system rejects the rigid constraints of traditional grids and 1px borders. Instead, we utilize **Intentional Asymmetry** and **Tonal Depth**. By overlapping high-fidelity surfaces and utilizing extreme typographic scale contrasts, we create an interface that feels bespoke, editorial, and authoritative. The goal is "Invisible Precision": the UI should disappear, leaving only the user's content as the hero, supported by a sophisticated, indigo-tinted atmosphere.

---

## 2. Color Philosophy & The "No-Line" Rule
Our palette is rooted in a deep, vibrant indigo-blue spectrum, balanced by a sophisticated range of neutral "cool-greys" that prevent the interface from feeling sterile.

### The Palette (Material Design Convention)
- **Primary & Action:** `primary` (#0029C0) and `secondary` (#2D4BD9). Use `primary_container` (#2142E7) for high-impact moments.
- **Surfaces:** `surface` (#F9F9FF) for the canvas, stepping up to `surface_container_highest` (#DCE2F7) for nested UI.
- **Accents:** `tertiary` (#00475F) and `on_tertiary_container` (#91D9FF) for secondary data visualizations or subtle highlights.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define sections or cards. 
Boundaries must be defined exclusively through **Background Color Shifts**. For example:
- A `surface_container_low` sidebar sitting against a `surface` background.
- A `surface_container_lowest` card floating over a `surface_container_high` workspace.
This creates a "molded" look rather than a "sketched" look, elevating the professional polish.

### Signature Textures & Glassmorphism
To inject "soul" into the UI, main CTAs and hero backgrounds should utilize a **Linear Gradient** from `primary` (#0029C0) to `primary_container` (#2142E7) at a 135-degree angle. Floating panels (like recording controllers) must use **Glassmorphism**: 
- **Fill:** `surface` at 70% opacity.
- **Effect:** 20px - 40px Backdrop Blur.
- **Edge:** A "Ghost Border" (see Section 4).

---

## 3. Typography: Editorial Authority
We use **Inter** for 99% of the experience to ensure maximum legibility at high resolutions. The remaining 1% uses **Balig Script** for "Human Touches"—small annotations or decorative highlights that break the digital perfection.

- **Display Scale:** Use `display-lg` (3.5rem) with tight letter-spacing (-0.02em) for hero headlines. The massive scale creates an editorial feel.
- **Hierarchy:** Contrast `headline-sm` (1.5rem) for section titles with `label-sm` (0.6875rem) in all-caps for metadata. This "Big-Small" contrast is the hallmark of premium design.
- **Body:** `body-md` (0.875rem) is our workhorse. Ensure a line height of 1.5x for effortless readability during long editing sessions.

---

## 4. Elevation & Depth: Tonal Layering
In this design system, depth is a function of light and material, not lines.

### The Layering Principle
Stacking surface-container tiers creates natural hierarchy:
1. **Level 0 (Base):** `surface` (#F9F9FF)
2. **Level 1 (Sub-navigation/Sidebar):** `surface_container_low` (#F1F3FF)
3. **Level 2 (Cards/Main Editor):** `surface_container_lowest` (#FFFFFF)

### Ambient Shadows
When an object must "float" (e.g., a modal or a floating action menu), use **Ambient Shadows**:
- **Blur:** 32px to 64px.
- **Spread:** -4px.
- **Color:** `on_surface` (#141B2B) at **4% to 8% opacity**.
This mimics natural light dispersal, avoiding the "dirty" look of traditional dark grey shadows.

### The "Ghost Border" Fallback
If accessibility requires a container edge, use a **Ghost Border**: 
- `outline_variant` (#C5C5D9) at **15% opacity**. It should be felt, not seen.

---

## 5. Component Guidelines

### Buttons (The Interaction Core)
- **Primary:** Gradient fill (`primary` to `primary_container`), `full` roundedness (9999px), `title-sm` typography.
- **Secondary:** `surface_container_highest` background with `on_primary_fixed_variant` text. No border.
- **States:** On hover, increase the shadow spread rather than darkening the color to maintain the "light-filled" aesthetic.

### Cards & Lists (The Curator Layout)
- **Forbidden:** Horizontal dividers (`<hr>`).
- **Separation:** Use `spacing.8` (2rem) of white space or a subtle shift from `surface_container` to `surface_container_low`.
- **Corner Radius:** Use `lg` (1rem) for main containers and `md` (0.75rem) for internal nested elements.

### The "Timeline" Component (Product Specific)
For recording apps, the timeline is crucial.
- Use `surface_container_high` for the track background.
- Active segments should use `secondary` (#2D4BD9) with a subtle inner glow.
- Playhead should be a 2px `tertiary_fixed_dim` line with a glassmorphic tooltip showing the timestamp.

### Input Fields
- Avoid the "box" look. Use a `surface_container_low` background with a bottom-only 2px focus state in `primary`.
- **Labels:** Always use `label-md` placed 4px above the input, never placeholder-only.

---

## 6. Do’s and Don’ts

### Do
- **Do** use generous white space. If you think there is enough space, add `spacing.4` (1rem) more.
- **Do** use `Balig Script` for one-word annotations or "pro-tips" to add personality.
- **Do** use `surface_bright` to highlight the most important interactive area on a cluttered screen.

### Don't
- **Don't** use pure black (#000000) for text. Use `on_background` (#141B2B) to keep the indigo-tonal consistency.
- **Don't** use `none` or `sm` roundedness except for microscopic UI elements (like checkboxes).
- **Don't** use high-contrast borders. If the background shift isn't visible enough, your choice of `surface_container` tier is too close to the base.

---

## 7. Spacing & Rhythm
All layouts must adhere to the 4px/8px stepping scale.
- **Internal Padding:** `spacing.4` (1rem) or `spacing.6` (1.5rem).
- **Section Gaps:** `spacing.16` (4rem) or `spacing.20` (5rem) to allow the design to breathe.
- **Precision Spacing:** Use `spacing.1.5` (0.375rem) for tight groupings like Icons + Text.

This system is designed to feel like a high-end physical object—weightless yet structured, minimal yet deeply intentional.
