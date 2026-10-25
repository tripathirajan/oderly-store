---
name: Build and Configuration
description: Use when changing app-builder, esbuild, TypeScript, lint/format settings, Git hooks, Docker, or CI configuration.
applyTo:
  ['scripts/**', 'config/**', 'Dockerfile', '.dockerignore', '.github/workflows/**', 'package.json']
---

# Build and Configuration

- Keep environment-independent esbuild targets in `config/esbuild/esbuild.config.mjs` and dynamically load `esbuild.dev.mjs` or `esbuild.prod.mjs` for mode-specific options.
- Preserve the split output layout: server bundle under `build/server/`, client bundles and served static assets under `build/static/`.
- `scripts/app-builder.mjs` and `scripts/clean.mjs` must remain cross-platform Node.js scripts; do not use shell-specific file deletion or environment assignment syntax.
- Keep static asset serving rooted at `build/static/`; never serve the server bundle.
- Preserve Node.js 24+ as the minimum runtime and production builds as minified builds without source maps.
- Keep configuration files in `config/`, and update npm scripts, Git hooks, Docker, CI, and docs together when paths or commands change.
- Validate with `npm run verify`; validate Docker changes with a local `docker build` when Docker is available.
