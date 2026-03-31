# CON-CORE CRT Design System

Single source of truth for the retro CRT terminal aesthetic. Every UI component must conform to these specifications. No exceptions for "modern" touches — the terminal look is the product.

---

## Color Tokens

Define as CSS custom properties on `:root`:

```css
:root {
  --crt-primary:   #33ff33;   /* Active text, borders, buttons, primary UI elements */
  --crt-secondary: #22aa22;   /* Secondary text, hover states, less prominent elements */
  --crt-tertiary:  #1a661a;   /* Disabled states, inactive elements, dimmed text */
  --crt-bg:        #0a1a0a;   /* Background color for all surfaces */
  --crt-bg-light:  #0d220d;   /* Subtle surface variation, input field backgrounds */
  --crt-danger:    #ff5555;   /* Dead links, threat indicators, destructive action buttons */
  --crt-warning:   #ffaa00;   /* Duplicate indicators, caution states, attention-needed */
}
```

**Usage rules:**
- Default text color is `--crt-primary`
- Backgrounds are always `--crt-bg` or `--crt-bg-light` — never white, never gray
- The only non-green colors allowed are `--crt-danger` and `--crt-warning`
- No opacity tricks to create additional shades — use the defined tokens only
- Selected/highlighted items use inverted colors: `--crt-primary` background with `--crt-bg` text

---

## Typography

```css
* {
  font-family: 'Courier New', Courier, monospace;
}
```

**Rules:**
- The font stack is `'Courier New', Courier, monospace` — no other fonts, no sans-serif fallbacks, no Google Fonts
- All labels, headings, buttons, station names, nav items, and section titles: `text-transform: uppercase`
- Body text, detail text (email subjects, bookmark titles, URLs): mixed case is allowed
- Base font size: `14px`
- Line height: `1.4`
- No bold or italic for emphasis — use color (primary vs secondary vs tertiary) or uppercase to create hierarchy
- Letter spacing: `0.05em` on uppercase text for readability

**Phosphor glow effect** — applied to primary text elements (headings, active items, focused inputs):

```css
.glow {
  text-shadow: 0 0 5px #33ff33, 0 0 10px rgba(34, 170, 34, 0.4);
}
```

Apply the glow to:
- Station name in header
- Focused input text
- Active/selected nav items
- Important status messages

Do NOT apply glow to:
- Body text in lists (too noisy)
- Disabled/tertiary elements
- Large blocks of paragraph text

---

## Borders

- All borders: `1px solid var(--crt-primary)` or `2px solid var(--crt-primary)` — use 1px for dividers, 2px for component outlines
- `border-radius: 0` on everything — no rounded corners anywhere in the application
- No `box-shadow` except for a subtle phosphor glow on focused elements:

```css
.focused-glow {
  box-shadow: 0 0 5px rgba(51, 255, 51, 0.3);
}
```

- No gradients of any kind — not on backgrounds, not on borders, not on buttons
- Dividers between list items: `1px solid var(--crt-primary)` with `opacity: 0.3` allowed for subtlety

---

## Scanline Overlay

A CRT scanline effect overlays the entire application. Applied via `::after` pseudo-element on the root container:

```css
#root::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.15) 2px,
    rgba(0, 0, 0, 0.15) 4px
  );
  pointer-events: none;
  z-index: 9999;
}
```

**Requirements:**
- `pointer-events: none` so it does not block clicks
- `position: fixed` so it stays in place during scrolling
- `z-index: 9999` (or higher) so it overlays all content including modals
- The 2px/4px values create a subtle scan line pattern — do not make lines thicker

---

## Animation Patterns

### Boot Sequence
When the app first loads, display a boot sequence before showing the main UI:
- Lines appear sequentially with 50-100ms delays between each line
- Each line uses a typing effect (characters appear left-to-right)
- Include system-style messages: `INITIALIZING CON-CORE v0.1.0...`, `LOADING MODULES...`, `SYSTEM READY.`
- After boot completes, transition instantly to the main shell (no fade)

### Loading States
Use ASCII progress bars instead of spinners:

```
PROCESSING... [████████░░░░░░░░░░░░] 40%
```

- Fill character: `█` (U+2588)
- Empty character: `░` (U+2591)
- Bar width: 20 characters
- Update in discrete jumps, not smooth animation
- Show percentage as integer

### Text Appear Effect
For important messages (briefings, dossier summaries, status updates):
- Characters appear one at a time, left-to-right
- Speed: 20-30ms per character
- Full words can appear at once for longer texts (word-by-word mode)
- Provide a way to skip the animation (click or keypress fills all text instantly)

### Cursor
- Block cursor character: `▌` (U+258C) or `█` (U+2588)
- Blink interval: 530ms (on 530ms, off 530ms)
- Shown in input fields and at the end of typing animations
- Implemented via CSS animation:

```css
@keyframes blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}

.cursor {
  animation: blink 1.06s step-end infinite;
}
```

### Transitions
- No smooth CSS transitions anywhere — elements appear/disappear/change instantly
- No fade-in, no slide-in, no ease-in-out
- State changes are immediate (snap, not glide)
- The only animation allowed is the typing effect and cursor blink
- Loading progress bar updates in discrete steps, not smooth fills

---

## Component Guidelines

### Shell (Header + Footer)

The shell wraps every screen and provides consistent navigation.

**Header:**
- Height: 48px, vertically centered content
- `1px solid var(--crt-primary)` bottom border
- Station name left-aligned, uppercase, with phosphor glow (e.g., `CON-CORE TERMINAL v0.1.0`)
- `ESC HOME` button right-aligned — navigates to the main station select screen
- Background: `var(--crt-bg)`
- Padding: `0 32px`

**Footer (StatusBar):**
- Fixed to bottom of viewport
- `1px solid var(--crt-primary)` top border
- Height: 32px, vertically centered content
- Monospace status text left-aligned (e.g., `READY` or `PROCESSING 42 ITEMS...`)
- Background: `var(--crt-bg)`
- Padding: `0 32px`
- Additional info right-aligned (e.g., timestamp, connection status)

### RetroButton

Standard button component used throughout the app.

```css
.retro-button {
  background: transparent;
  color: var(--crt-primary);
  border: 2px solid var(--crt-primary);
  padding: 8px 16px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  min-height: 40px;
  border-radius: 0;
}

.retro-button:hover {
  color: #33ff33;
  text-shadow: 0 0 5px #33ff33, 0 0 10px rgba(34, 170, 34, 0.4);
  border-color: #33ff33;
}

.retro-button:active,
.retro-button.active {
  background: var(--crt-primary);
  color: var(--crt-bg);
  text-shadow: none;
}

.retro-button:disabled {
  color: var(--crt-tertiary);
  border-color: var(--crt-tertiary);
  cursor: not-allowed;
  text-shadow: none;
}

.retro-button--danger {
  color: var(--crt-danger);
  border-color: var(--crt-danger);
}

.retro-button--danger:hover {
  text-shadow: 0 0 5px #ff5555;
  border-color: #ff5555;
}

.retro-button--danger:active {
  background: var(--crt-danger);
  color: var(--crt-bg);
}
```

### Rolodex

Scrollable list component for browsing items (senders, bookmarks, contacts, etc.).

- Search input at top: full-width, `1px solid var(--crt-primary)` border, `var(--crt-bg-light)` background, block cursor blinking inside
- List area below search: scrollable, max-height set per context (typically `calc(100vh - 250px)`)
- Each list item: padding `12px 16px`, `1px solid var(--crt-primary)` bottom border with `opacity: 0.3`
- Selected item: inverted colors — `var(--crt-primary)` background, `var(--crt-bg)` text
- Hover state: text brightens to full `var(--crt-primary)`, subtle glow
- Navigation: chunky `UP` and `DOWN` buttons (RetroButton style) below the list, or keyboard arrow key support
- Item count displayed above or below list: `SHOWING 42 OF 237 SENDERS`
- Scrollbar: styled to match theme (thin, green track on dark background) or hidden with custom scroll implementation

### PieChart

SVG donut chart for category breakdowns.

- Shape: donut (ring) chart — not a filled pie
- Inner radius: ~60% of outer radius
- Colors: green palette only, using variations of the token colors:
  - Slice 1: `#33ff33` (primary)
  - Slice 2: `#22aa22` (secondary)
  - Slice 3: `#1a661a` (tertiary)
  - Slice 4: `#2dcc2d`
  - Slice 5: `#178817`
  - Slice 6+: Continue darkening
- Stroke between slices: `2px` of `var(--crt-bg)` to create separation
- Clickable slices: on hover, slice expands outward slightly (2-3px translate) and glows
- Center text: category name and percentage of currently hovered/selected slice
- Legend: listed below the chart, each with a color swatch and label, uppercase text

### ActionButtons

Grid layout of large action buttons for station operations.

- Layout: CSS Grid, minimum column width `120px`, `auto-fill` for responsiveness
- Gap: `8px` between buttons
- Each button: RetroButton style, but taller — `min-height: 64px`
- Button content: icon-like ASCII character on top (e.g., `[X]` for delete, `[>]` for archive), label below
- All labels uppercase
- Destructive actions use `--danger` variant

### HorizontalNav

Category strip for filtering content (e.g., email categories, bookmark categories).

- Layout: horizontal row of category labels
- `◀` button on left, `▶` button on right (RetroButton style, square, `40px x 40px`)
- Categories displayed between arrows, horizontally scrollable if overflow
- Selected category: inverted colors (green background, dark text)
- Unselected categories: `var(--crt-secondary)` text, no background
- Separator between categories: `|` character or `1px` border
- Uppercase text for all category labels
- Keyboard: left/right arrow keys cycle through categories

### StatusBar

See Footer section under Shell above. Additional notes:
- Can display contextual messages that auto-clear after 3 seconds
- Error messages shown in `--crt-danger` color
- Processing messages shown in `--crt-warning` color
- Success/ready messages in `--crt-primary`

---

## Spacing

All spacing derives from an 8px base unit:

| Token | Value | Usage |
|---|---|---|
| `--space-1` | `8px` | Tight spacing: between inline elements, icon-to-label |
| `--space-2` | `16px` | Component internal padding: buttons, list items, inputs |
| `--space-3` | `24px` | Section gaps: between major content blocks |
| `--space-4` | `32px` | Screen padding: outer margin of the main content area |

```css
:root {
  --space-1: 8px;
  --space-2: 16px;
  --space-3: 24px;
  --space-4: 32px;
}
```

**Application:**
- Button padding: `var(--space-1) var(--space-2)` (8px top/bottom, 16px left/right)
- List item padding: `12px var(--space-2)` (12px is acceptable as 1.5 units)
- Gap between action buttons: `var(--space-1)`
- Gap between content sections: `var(--space-3)`
- Page-level padding (left/right of main content): `var(--space-4)`
- Header/footer horizontal padding: `var(--space-4)`

---

## Forbidden Patterns

The following are explicitly banned from the CON-CORE UI:

- Rounded corners (`border-radius` > 0)
- Box shadows (except the defined phosphor glow)
- Gradients (linear, radial, or conic) on any element
- Sans-serif or serif fonts
- Smooth CSS transitions or animations (except cursor blink and typing effect)
- Colors outside the defined token palette
- White or light-colored backgrounds
- Opacity values for creating "new" colors (use defined tokens instead)
- Loading spinners (use ASCII progress bars)
- Tooltips with rounded bubbles (use status bar messages instead)
- Modal overlays with blur/frosted-glass effects (use solid dark overlay if modals are needed)
- Emojis in the UI (use ASCII characters and uppercase labels)
