---
paths:
  - "src/**/*.test.{ts,tsx}"
  - "api/**/*.test.ts"
---
# Test Rules

- Tests FIRST for business logic, API routes, utils, terminal commands, parsers. Tests-after allowed only for CRT visuals/animations/layout — but written before the request is done.
- Terminal parity tests are required for every station action: each GUI action must have a test proving the matching terminal command exists and behaves identically.
- Stack: Vitest + React Testing Library (components), Playwright (e2e). Setup in `src/test-setup.ts`.
- Test external-data parsing defensively: Claude fence-stripping, Gmail/Calendar response shapes, `{ data, error, meta }` envelope on every route.
- No request is complete without tests; `scripts/validate.sh` must pass (same script as CI).
