---
name: Adaptiva AI
description: A credible, human AI-adoption brand shaped by an adaptive navy-and-gold current.
colors:
  canvas: "#ffffff"
  canvas-soft: "#eef2f7"
  canvas-alt: "#f8f8f7"
  adaptive-navy: "#081b3a"
  midnight-ink: "#0d1b2a"
  body-ink: "#22344d"
  muted-ink: "#5f7087"
  current-blue: "#345983"
  mist-blue: "#b7c4d8"
  elevated-gold: "#d4af6a"
  elevated-gold-deep: "#c99a4b"
  contact-panel: "#f1f1f2"
  contact-control: "#f6f6f7"
  contact-border: "#d7d9de"
  contact-placeholder: "#7c818a"
  contact-gold: "#be9b4a"
  contact-gold-hover: "#ac8b3e"
typography:
  display:
    fontFamily: "Cormorant Garamond, Times New Roman, serif"
    fontSize: "clamp(1.92rem, 4.8vw, 3.36rem)"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Cormorant Garamond, Times New Roman, serif"
    fontSize: "clamp(1.6rem, 3.36vw, 2.4rem)"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Cormorant Garamond, Times New Roman, serif"
    fontSize: "clamp(1.12rem, 2.4vw, 1.52rem)"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Montserrat, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Montserrat, Arial, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.06em"
rounded:
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  pill: "999px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  section: "clamp(4rem, 6vw, 5.5rem)"
components:
  button-primary:
    backgroundColor: "{colors.elevated-gold}"
    textColor: "{colors.midnight-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.8rem 1.3rem"
    height: "3rem"
  button-primary-hover:
    backgroundColor: "{colors.elevated-gold-deep}"
    textColor: "{colors.midnight-ink}"
  button-nav:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.elevated-gold-deep}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.8rem 1.3rem"
    height: "3rem"
  card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.body-ink}"
    rounded: "{rounded.lg}"
    padding: "1.5rem"
  input:
    backgroundColor: "{colors.contact-control}"
    textColor: "{colors.midnight-ink}"
    rounded: "{rounded.sm}"
    padding: "0.9rem 1.1rem"
    height: "4rem"
---

# Design System: Adaptiva AI

## Overview

**Creative North Star: "The Adaptive Current"**

Adaptiva AI should feel like a calm, assured current: complex technology made directional, useful, and human. The shipped site expresses this through generous white space, deep navy, restrained gold, blue-grey atmosphere, editorial serif headlines, and practical sans-serif copy. The system is polished rather than futuristic and confident without becoming cold.

The attached original homepage PNG mockup supplied in July 2026 is a primary art-direction reference, not incidental inspiration. Its defining composition is the Adaptiva AI logo and airy navigation above a cinematic, full-width wave: luminous network lines rise from layered navy ribbons, one gold contour creates focus, and the left side remains quiet enough for a large two-line headline and two distinct actions. The shipped hero preserves the source artwork in `assets/images/adaptiva-wave-bg-1.png`, but future homepage and campaign refinements should recover more of the mockup's visual conviction: a taller first viewport, a larger editorial headline, stronger navy-and-gold contrast, more visible wave depth, deliberate gold rules, and squarer high-emphasis calls to action.

The design must remain credible, human, and empowering. It explicitly rejects the generic AI-startup look: no neon technology spectacle, interchangeable SaaS composition, or abstract futurism detached from real people and work. Use the original mockup's cinematic energy selectively, then ground subsequent sections in specific services, evidence, and human outcomes.

**Key Characteristics:**

- Navy-and-gold adaptive wave imagery as the signature brand asset.
- Cormorant Garamond display type paired with Montserrat for practical reading.
- Bright, calm content surfaces contrasted with committed navy brand moments.
- Gold used as a directional highlight, rule, contour, or action color.
- Generous composition, clear journeys, and visible human relevance.
- Maximum content width of 1120px with fluid section spacing.

## Colors

The palette moves from near-black navy through misted blue-grey to white, with warm metallic gold used sparingly to signal elevation and action.

### Primary

- **Adaptive Navy** (`#081b3a`): The deepest brand field for the wave artwork, footer, video, and immersive calls to action.
- **Midnight Ink** (`#0d1b2a`): Headings, navigation, and high-contrast text on light surfaces.
- **Elevated Gold** (`#d4af6a`): Primary actions, headline emphasis, dividers, active details, and the wave's signature contour.
- **Elevated Gold Deep** (`#c99a4b`): Gold hover states and text where the lighter gold needs more contrast.

### Secondary

- **Current Blue** (`#345983`): Links, selected navigation, and the transition between pale content and deep brand fields.
- **Mist Blue** (`#b7c4d8`): Atmospheric layers and subtle cool-blue support.

### Neutral

- **Canvas** (`#ffffff`): Primary page and card background.
- **Soft Canvas** (`#eef2f7`): Section washes, dropdown interiors, and quiet differentiation.
- **Alternate Canvas** (`#f8f8f7`): Near-white neutral surface.
- **Body Ink** (`#22344d`): Default readable copy.
- **Muted Ink** (`#5f7087`): Supporting notes and non-critical copy only.
- **Contact Panel / Control** (`#f1f1f2` / `#f6f6f7`): Form-specific tonal hierarchy.

### Named Rules

**The Gold Contour Rule.** Gold identifies a meaningful edge, word, action, or transition. It is not a general background wash and should not decorate every component.

**The Mockup Contrast Rule.** On first-view brand moments, let navy occupy meaningful visual area and let gold cut through it decisively. Do not fade the wave artwork until it becomes a pale, generic technology texture.

## Typography

**Display Font:** Cormorant Garamond (with Times New Roman and serif fallbacks)  
**Body Font:** Montserrat (with Arial and sans-serif fallbacks)

**Character:** The high-contrast serif gives Adaptiva AI an assured, advisory voice; the geometric sans keeps navigation, explanations, and actions direct. This contrast is central to the identity already visible in the original mockup.

### Hierarchy

- **Display** (600, `clamp(1.92rem, 4.8vw, 3.36rem)`, 1.12): Current H1 baseline. Homepage refinements may increase scale toward the original mockup when line wrapping and mobile fit are verified.
- **Headline** (600, `clamp(1.6rem, 3.36vw, 2.4rem)`, 1.12): Section and dialog headings.
- **Title** (600, `clamp(1.12rem, 2.4vw, 1.52rem)`, 1.12): Card and local headings.
- **Body** (400, `1rem`, 1.65): Explanatory copy, generally capped around 65-75 characters per line.
- **Lede** (400, `1.125rem`, 1.65): Introductory and decision-support copy, capped at 43rem.
- **Label** (700, `0.78rem`, `0.06em`): Tags and occasional short labels. Navigation uses a calmer `0.01em` tracking.

### Named Rules

**The Two-Line Promise Rule.** The homepage H1 should read as one clear promise over no more than two intentional lines at desktop sizes, with a single gold phrase for emphasis as demonstrated by the original mockup.

**The Plain-Language Counterweight.** Serif display copy may feel elevated; supporting Montserrat copy must stay practical, concise, and free of inflated AI language.

## Elevation

The current system is softly layered: white or tonal surfaces sit over pale backgrounds with ambient navy shadows. The original mockup itself is flatter and relies on image depth, strong contours, and overlap rather than floating cards; use that approach for expressive brand sections and reserve shadows for functional separation.

### Shadow Vocabulary

- **Ambient Panel** (`0 18px 48px rgba(13, 27, 42, 0.08)`): Large panels, dropdowns, and image-led containers.
- **Ambient Card** (`0 12px 30px rgba(13, 27, 42, 0.07)`): Repeated content surfaces.
- **Interactive Lift** (`0 10px 24px rgba(13, 27, 42, 0.12)`): Button hover only, paired with a 1px upward translation.
- **Modal Depth** (`0 26px 70px rgba(8, 27, 58, 0.34)`): Dialogs over a darkened backdrop only.

### Named Rules

**The Image-First Depth Rule.** In hero and campaign moments, create depth with the layered wave artwork and tonal contrast before adding a container or shadow.

## Components

### Buttons

- **Shape:** Current shared buttons are full pills (`999px`) at a minimum height of `3rem`; contact actions use a firmer `0.72rem` radius.
- **Primary:** Elevated Gold background with Midnight Ink text, `0.8rem 1.3rem` padding, and bold Montserrat copy.
- **Hover / Focus:** Shift to Elevated Gold Deep and translate up by `1px`; maintain a clearly visible keyboard focus state.
- **Secondary / Ghost:** Secondary buttons use a bright translucent fill; ghost buttons use a quiet border and transparent background.
- **Mockup direction:** For homepage hero and major campaign actions, prefer the original mockup's more architectural rectangular silhouette (`0.25rem` to `0.5rem` radius) and arrow/play icon pairing. Do not apply this selectively within one button group; the group must feel designed as a set.

### Chips

- **Style:** Full-pill tags use a translucent gold background with Midnight Ink text. They are metadata, not primary actions.

### Cards / Containers

- **Corner Style:** Large content surfaces use `1.5rem`; small internal elements use `0.75rem` to `1rem`.
- **Background:** Predominantly Canvas or near-opaque white over cool tonal sections.
- **Shadow Strategy:** Use Ambient Card or Ambient Panel, never both stacked through nested containers.
- **Border:** One subtle navy-alpha border where separation is needed.
- **Internal Padding:** `1.5rem` standard, `2rem` for tall panels.
- **Mockup direction:** Brand-led sections should be unframed, full-width compositions where the wave or another real image carries the section. Do not turn the mockup's layered scene into a card.

### Inputs / Fields

- **Style:** Controls sit inside a `#f6f6f7` wrapper with a `#d7d9de` stroke, `0.72rem` radius, leading icon, and divider.
- **Focus:** The wrapper should gain a visible navy or gold focus treatment through `:focus-within`; never rely on the inner control's removed outline alone.
- **Error / Disabled:** Preserve contrast and communicate status with text as well as color when these states are introduced.

### Navigation

- The desktop header uses an airy horizontal row, Montserrat labels, a gold-outlined consultation action, and a subtle active state. The original mockup's gold underline is the preferred active-page signal for future refinement.
- The shipped header is sticky with a translucent white surface and `18px` backdrop blur. Keep this functional treatment restrained so the logo and page content remain dominant.
- At `920px` and below, navigation becomes a full-width stacked menu controlled by a circular icon button. Dropdown links become an always-visible nested list.

### Adaptive Wave Hero

- Use `assets/images/adaptiva-wave-bg-1.png` as the current source asset derived from the attached original mockup.
- Preserve quiet negative space on the left for the promise and actions; preserve the brightest network detail and gold contour on the right and lower edge.
- Use directional overlays only to guarantee text readability. Stop the veil before it erases the image's navy lower layers or luminous depth.
- Keep the hero responsive by changing overlay direction on smaller screens rather than squeezing the desktop composition.
- Treat the wave as a branded scene, not a generic decorative background. It should be visibly recognizable in the first viewport.

## Do's and Don'ts

### Do:

- **Do** use the attached original homepage PNG mockup as the primary composition reference for homepage and campaign hero work.
- **Do** retain the wave's navy depth, luminous network, and decisive gold contour while protecting readable negative space.
- **Do** make people and organisational outcomes visible immediately after expressive technology imagery.
- **Do** use Elevated Gold (`#d4af6a`) for meaningful emphasis and Deep Gold (`#c99a4b`) when text contrast requires it.
- **Do** cap body copy near 65-75 characters per line and verify all headline wraps across desktop and mobile.
- **Do** maintain semantic structure, keyboard access, visible focus states, readable contrast, responsive layouts, descriptive alternatives, and reduced-motion support.
- **Do** use specific services, evidence, examples, and clear next steps to make expertise tangible.

### Don't:

- **Don't** resemble a generic AI startup.
- **Don't** use neon technology spectacle, interchangeable SaaS layouts, abstract futurism without substance, or claims that make AI feel detached from real people or work.
- **Don't** wash the signature wave into a faint blue-grey texture; the original mockup's contrast and depth are part of the brand.
- **Don't** use gold as a broad decorative wash, gradient text, or an accent on every component.
- **Don't** repeat tiny uppercase tracked eyebrows above every section heading; reserve labels for real metadata or occasional orientation.
- **Don't** add new card grids when an unframed narrative, image, or structured list would communicate more clearly.
- **Don't** add colored side-stripe borders to cards or callouts; existing instances are migration debt, not a reusable pattern.
- **Don't** pair a decorative 1px border with a wide soft shadow on the same new component.
- **Don't** place cards inside cards or enclose the Adaptive Wave Hero in a decorative frame.