---
name: Tests and Verification
description: Use when creating or changing tests, fixing CI failures, or validating application behavior. Covers the Node test runner, Fastify injection, and project verification commands.
applyTo: 'tests/**'
---

# Tests and Verification

- Use Node.js built-in `node:test` and `node:assert/strict`; execute the suite with `npm test`.
- Prefer Fastify `app.inject()` for route and SSR tests instead of opening network ports.
- Create temporary static asset roots for tests that exercise static serving, and clean them up in `finally` blocks.
- Cover both success and meaningful failure/fallback cases, including locale fallback when relevant.
- Keep tests deterministic: avoid external services, shared mutable state, and unnecessary waits.
- Run `npm test`; before completing broader changes, run `npm run verify`.
