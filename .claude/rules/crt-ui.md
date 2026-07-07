---
paths:
  - "src/**/*.{tsx,css}"
---
# CRT UI Rules

- ALL UI labels, headings, buttons, status messages: UPPERCASE. Body/detail text (email subjects, bookmark titles) may be mixed case.
- Color palette strictly: `#33ff33` (primary), `#22aa22` (secondary), `#1a661a` (tertiary), `#0a1a0a` (background), `#ff5555` (danger), `#ffaa00` (warning). No other colors.
- Typography: Courier New / monospace only. No exceptions.
- Borders: 1-2px solid, `border-radius: 0` everywhere. No rounded corners.
- Every station component renders inside the shared Shell chrome (header + footer).
- Every station GUI action must have a matching Terminal command 1:1 (enforced by parity tests). Adding a button means adding a command.
- Password/security data: React state only. NEVER persisted to Supabase, localStorage, or cookies. Cleared on component unmount.
- Functional components only; props interfaces named `[Component]Props`; event handlers named `handle[Event]`.
- See `references/crt-design-system.md` for full component specs.
