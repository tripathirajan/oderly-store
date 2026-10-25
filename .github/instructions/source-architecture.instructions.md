---
name: Source Architecture
description: Use when editing application code under src/. Covers Oderly's server, client, and shared module boundaries, SSR, localization, and state ownership.
applyTo: 'src/**'
---

# Source Architecture

- Keep Fastify routes, request/response logic, and server rendering in `src/server/`.
- Keep the static HTML document shell, hydration bootstrap, and generated asset references in `src/server/html-template.ts`; route handlers should pass rendered markup and initial data to that builder.
- Keep React UI and browser hydration code in `src/client/`.
- Put modules shared by both runtimes in `src/shared/`; avoid browser globals and server-only imports there.
- Server-render the client UI using the same shared store and locale configuration used during hydration to avoid mismatches.
- Add customer-visible strings to JSON catalogs in `src/shared/locales/<locale>/translation.json`; register new locales in `src/shared/i18n.ts`.
- Keep browser state serializable at the SSR boundary. Serialize Immutable Map state as JSON entry tuples with a minimal-state fallback and reconstruct the Map during hydration; escape serialized state before embedding it in HTML.
- When changing a public page or route, preserve the Fastify health route and static asset isolation.
- Add or update automated tests for observable behavior changes.
