# Design System Document: The Intellectual Noir

## 1. Overview & Creative North Star
**Creative North Star: The Scholarly Atelier**

This design system moves away from the sterile, "dashboard-as-a-spreadsheet" approach common in academic tools. Instead, it treats student data like a high-end editorial publication. We are building a digital "Atelier"—a focused, premium space where information feels curated rather than just displayed.

To break the "template" look, we utilize **intentional asymmetry** (e.g., wide margins on one side of a data table balanced by a dense action sidebar) and **tonal depth**. The UI does not sit on a flat plane; it exists as a series of nested, luminous surfaces that guide the eye through complex academic hierarchies with effortless sophistication.

---

## 2. Colors & Surface Philosophy
The palette is anchored in a deep, nocturnal foundation (`#0b1326`), utilizing vibrant neon accents to categorize the intellectual journey.

### The "No-Line" Rule
**Borders are a failure of hierarchy.** In this system, 1px solid borders are prohibited for sectioning. Boundaries must be defined solely through background color shifts. If two sections need separation, transition from `surface-container-low` to `surface-container-high`. This creates a seamless, "molded" look rather than a fragmented one.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of glass.
*   **Base Level:** `surface` (#0b1326) – The deep canvas.
*   **Sub-sections:** `surface-container-low` (#131b2e) – Subtle grouping for background tasks.
*   **Main Content Cards:** `surface-container-highest` (#2d3449) – The "Active" layer that sits closest to the user.

### The "Glass & Gradient" Rule
To inject "soul" into the academic experience:
*   **Primary CTAs:** Use a subtle linear gradient from `primary` (#adc6ff) to `primary_container` (#0f69dc) at a 135-degree angle.
*   **Floating Navigation:** Use **Glassmorphism**. Apply `surface_variant` at 60% opacity with a `24px` backdrop-blur. This ensures the vibrant accent colors of the background bleed through softly.

---

## 3. Typography: Editorial Authority
We pair **Manrope** (Display/Headlines) for a geometric, modern authority with **Inter** (Body/Labels) for its surgical legibility in dense data.

*   **Display-LG (Manrope, 3.5rem):** Reserved for high-level statistics (e.g., a 4.0 GPA) to create a "hero" moment for academic achievement.
*   **Headline-MD (Manrope, 1.75rem):** Used for subject titles. It should feel like a magazine header.
*   **Body-MD (Inter, 0.875rem):** The workhorse for course descriptions. Increased line-height (1.6) is mandatory to prevent academic burnout.
*   **Label-MD (Inter, 0.75rem):** Used for metadata (dates, credits). Always use `on_surface_variant` (#c3c6d7) to de-emphasize secondary info.

---

## 4. Elevation & Depth
Depth is achieved through **Tonal Layering**, not structural lines.

*   **The Layering Principle:** Place a `surface_container_lowest` (#060e20) element inside a `surface_container_high` (#222a3d) area to create an "inset" look for input fields or code blocks.
*   **Ambient Shadows:** For "floating" elements like Modals or Popovers, use an extra-diffused shadow: `0px 24px 48px rgba(0, 0, 0, 0.4)`. The shadow color is never pure black; it is a tinted version of the background to maintain the "nocturnal" atmosphere.
*   **The Ghost Border Fallback:** If accessibility requires a stroke, use `outline_variant` (#434655) at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### Cards & Lists (The Academic Record)
*   **Rule:** Forbid divider lines. Separate list items using `8px` of vertical white space or a subtle hover shift to `surface_bright`.
*   **Layout:** Data tables should use a "Fixed-Header/Floating-Body" approach where the table body sits on a slightly elevated `surface_container`.

### Buttons
*   **Primary:** Gradient fill (`primary` to `primary_container`). `8px` (DEFAULT) roundedness. No shadow; use a subtle `primary` outer glow on hover.
*   **Secondary:** Ghost style. No fill, `outline` stroke at 20% opacity. Text in `primary_fixed_dim`.

### Chips (Subject Categorization)
*   **Science/Logic:** `secondary` (#4edea3) with `on_secondary_container` text.
*   **Arts/Humanities:** `tertiary` (#ddb7ff) with `on_tertiary_container` text.
*   **Urgent/Deadlines:** `error` (#ffb4ab) containers.

### Input Fields
*   **Style:** Filled, not outlined. Use `surface_container_highest`. Upon focus, the bottom edge glows with a 2px `primary` underline—never a full-box stroke.

### Specialized Component: The Progress Radial
Instead of flat progress bars, use high-stroke weight radials using the `secondary` accent. This breaks the horizontal grid and provides an "organic" visual counterpoint to the text-heavy academic data.

---

## 6. Do’s and Don'ts

### Do:
*   **Do** use extreme whitespace (32px+) between major course modules to reduce cognitive load.
*   **Do** use `surface_bright` to highlight a "Currently Reading" or "Active Task" item.
*   **Do** lean into the "Manrope" scale for numbers; let the data be the star.

### Don't:
*   **Don't** use 100% white text (#FFFFFF) for long-form body copy. Use `on_surface_variant` (#c3c6d7) to prevent eye strain in dark mode.
*   **Don't** use standard "drop shadows" on cards. Rely on background color steps (`low` to `high`).
*   **Don't** use harsh, 90-degree corners. Everything must feel approachable through the `0.5rem` to `1rem` corner radius scale.