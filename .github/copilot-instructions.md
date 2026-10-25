# Oderly Store — AI Contribution Guide

## Project boundaries

- `src/server/` owns Fastify routes, HTTP behavior, and React server rendering.
- `src/client/` owns React UI and browser hydration.
- `src/shared/` owns code used by both sides, including Redux, localization, shared types, and locale JSON.
- Keep browser-only APIs out of server/shared modules; keep server-only APIs out of client/shared modules.
- Serve only generated browser assets from `build/static/`; do not expose `build/server/`.

## Checks and workflow

- Read the relevant module and tests before editing; preserve existing user changes.
- Add or update tests for behavior changes. Run `npm test` and `npm run verify` when practical.
- Use `npm run build` for development output and `npm run build:prod` for production output.
- The cross-platform build interface is `scripts/app-builder.mjs`; keep output paths and environment configuration consistent with `config/esbuild/`.
- Put shared tool configuration under `config/`. Keep separate dev/prod files only where behavior actually differs.
- Use Conventional Commit messages. Avoid shell-specific commands in scripts; the project supports Windows, macOS, and Linux.
- Do not add product catalog, pricing, checkout, or other business behavior without requirements; this repository currently contains the storefront shell and demo only.
