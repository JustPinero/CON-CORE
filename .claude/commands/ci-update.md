---
description: "Update CI GitHub Action versions to latest"
---

Check and update GitHub Action versions in CI workflow.

Usage: /ci-update

1. Read `.github/workflows/ci.yml`
2. Search web for latest stable versions of all referenced GitHub Actions
3. Compare current versions against latest
4. Update any outdated versions
5. Run `scripts/validate.sh` to verify CI config is still valid
6. Report changes made
