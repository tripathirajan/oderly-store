---
name: release-readiness
description: 'Use when preparing Oderly Store for a release, deployment, production rollout, or release candidate. Guides tests, production builds, Docker image validation, and reporting without publishing or deploying anything.'
argument-hint: 'Optional release scope or target environment'
---

# Oderly Store Release Readiness

Use this workflow to assess whether the current working tree is ready to package for release. It validates code and the production container but does not tag, publish, push, or deploy artifacts.

## Procedure

1. Inspect the current changes and working tree. Preserve existing user work; do not assume uncommitted changes are release-approved.
2. Confirm the supported runtime is Node.js 24 or newer and that required project configuration is present.
3. Run `npm run verify`. This covers type checking, tests, lint, formatting, and the production build.
4. If Docker packaging is in scope and Docker is available, build the image using the repository's `Dockerfile`. Do not push the image to a registry.
5. If asked to smoke-test the image, run it locally and verify `/health` plus the storefront route, then stop and remove the test container. Do not expose it publicly.
6. Review build outputs: server code must remain under `build/server/`; only `build/static/` is served as public assets.
7. Report each check as passed, failed, or not run. Include failures with their relevant command/output and never claim deployment or publication occurred.

## Project-specific release constraints

- Do not add or infer catalog, pricing, checkout, payment, or other business behavior.
- Keep generated build artifacts out of source control.
- Keep project scripts and checks cross-platform; avoid shell-specific cleanup or environment syntax.
- Never expose server bundles, credentials, or environment secrets in static output or client bundles.
