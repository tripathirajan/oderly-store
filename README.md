# Oderly Store

Oderly Store is the customer-facing shopping experience for Oderly. This is where customers will discover the Oderly product range and shop online.

[Repository](https://github.com/tripathirajan/oderly-store) · [Report an issue](https://github.com/tripathirajan/oderly-store/issues)

## Project status

The repository currently contains the initial application shell and a small interactive demo. The product catalog and customer shopping flows are not implemented yet; this project is the foundation for building them.

The app shell already includes English and Spanish language support, so customer-facing content can be localized as the storefront grows.

## Requirements

- Node.js 24 LTS or newer
- npm

The `.nvmrc` file selects Node.js 24 for users of nvm.

## Getting started

```sh
npm install
npm run dev
```

Open <http://localhost:3000> to view the current app shell. Development also starts the CDN server at <http://localhost:3001> for client assets and the metrics endpoint at <http://localhost:9090/metrics>. Stop the servers with Ctrl+C.

## Build and run

```sh
# Development build (the default build command)
npm run build

# Production build
npm run build:prod
npm start
```

The server listens on port `3000` by default. Set the `PORT` environment variable to override it.

## Tests

Run the Node.js built-in test runner through the cross-platform `tsx` wrapper, or collect V8 coverage with c8:

```sh
npm test
npm run test:coverage
```

The suite covers shared Redux actions and thunks, locale resolution, server-rendered responses, the health route, and static asset serving. Coverage creates text, LCOV, and HTML reports in `coverage/` and enforces minimum thresholds. Tests and coverage are included in `npm run verify` and the pull-request CI workflow.

## Docker image

The multi-stage `Dockerfile` builds the production bundles and installs only runtime dependencies in the final non-root image. The image exposes port `3000` and includes a health check for `/health`.

```sh
docker build -t oderly-store .
docker run --rm -p 3000:3000 -e PORT=3000 oderly-store
```

Open <http://localhost:3000>. The Docker image build is also checked in CI for pull requests and pushes to `main`.

### `app-builder`

The cross-platform builder detects the Node.js version, operating system, and CI environment, then creates the requested targets. Its defaults are development mode, all targets, and a clean output for one-off builds. Watching defaults to keeping existing output.

```sh
node scripts/app-builder.mjs --help
node scripts/app-builder.mjs --mode dev --target server
node scripts/app-builder.mjs --env prod --target client
node scripts/app-builder.mjs --mode dev --watch --no-clean
```

Use `--mode` or `--env` with `dev` or `prod`; `--target` accepts `all`, `server`, `cdn`, `metrics`, or `client`. `server` builds the app server; `all` builds the app, CDN, metrics, and client targets. `--watch`, `--clean`, and `--no-clean` control watch and cleanup behavior. The npm shortcuts `npm run build:server`, `npm run build:cdn`, `npm run build:metrics`, and `npm run build:client` build targets independently; target-specific cleanup preserves other outputs.

### Runtime configuration and server modules

`config/runtime.config.mjs` keeps environment settings separated into shared server middleware settings, server instances, and browser client settings. Supported modes are `dev`, `staging`, and `prod`. The esbuild builder injects only the selected server configuration into server bundles and the selected client configuration into browser/Node client bundles. The client configuration exports `clientConfiguration.apiEndpoint` from `src/shared/config.ts`; server code reads `serverConfiguration` from `src/server/config.ts`.

The reusable `createServer` factory in `src/server/create-server.ts` applies shared CORS and security headers. The app, CDN, and metrics modules use it independently. The CDN serves `build/static/` under `/assets/`; the app server keeps its own static route as a same-origin fallback. The metrics server exposes Prometheus text-format process uptime and memory metrics at `/metrics`.

Environment variables can override the app/CDN/metrics hosts and ports with `APP_HOST`, `APP_PORT`, `CDN_HOST`, `CDN_PORT`, `METRICS_HOST`, and `METRICS_PORT`. The app also accepts the existing `PORT` variable. `ASSET_BASE_URL`, `API_ENDPOINT`, and comma-separated `CORS_ORIGINS` override the build-time asset URL, API endpoint, and allowed origins. Host and port overrides are also read at server startup.

## Project setup notes

The application uses Fastify 5 and React 19 with server rendering, and supports Node.js 24 LTS or newer. Redux manages app state, with thunk for asynchronous actions. Locale content is stored in JSON files under `src/shared/locales/`.

### Configuration files

Project tooling configuration is kept together in `config/`. esbuild settings are grouped in `config/esbuild/`: shared targets are in `esbuild.config.mjs`, while `esbuild.dev.mjs` and `esbuild.prod.mjs` hold environment-specific options that `app-builder` dynamically loads. ESLint, Prettier, commitlint, and TypeScript use shared configs because their settings do not currently vary by environment. npm scripts and Git hooks point to these files directly.

### Build outputs

| Target         | Output                                  | Details                                     |
| -------------- | --------------------------------------- | ------------------------------------------- |
| Server         | `build/server/index.js`                 | Node 24 Fastify server bundle               |
| CDN server     | `build/server/cdn.js`                   | Static client assets under `/assets/`       |
| Metrics server | `build/server/metrics.js`               | Prometheus process metrics                  |
| Node client    | `build/static/oderly-node.js`           | Node 24 client bundle                       |
| Modern browser | `build/static/oderly-browser.js`        | ES2020 bundle                               |
| Legacy browser | `build/static/oderly-legacy-browser.js` | ES2015 syntax bundle, loaded via `nomodule` |
| Styles         | `build/static/styles.css`               | Static stylesheet served by Fastify         |

Build artifacts are split into two areas: server output lives under `build/server/`, while all client bundles and the compiled stylesheet live under `build/static/`. Fastify serves only `build/static/`, keeping server code out of public asset URLs. The source stylesheet remains at `static/assets/styles.css`. The legacy browser bundle targets ES2015 syntax; it does not include polyfills or provide IE11 support. Generated output is removed before each build while source files are preserved. Build scripts use Node.js filesystem APIs rather than shell-specific deletion commands.

### Localization

Translation catalogs are in `src/shared/locales/<language>/translation.json`. To add a language, create a catalog with the existing translation keys and register it in `src/shared/i18n.ts`. Catalogs are bundled for server rendering and browser hydration. The initial language is selected from the request's `Accept-Language` header, with English as the fallback.

## Quality checks

```sh
npm run typecheck
npm test
npm run lint
npm run format:check
```

Use `npm run format` to apply Prettier formatting. `npm run clean` removes generated build output without deleting source styles.

## Commit and pull request checks

Git hooks are installed through the npm `prepare` script:

- Before commit: ESLint fixes and Prettier formatting are applied to staged files.
- Commit messages: Conventional Commit format is enforced (for example, `feat: add product listing`).
- Before push: type checking, lint, formatting validation, and a production build must pass.

GitHub Actions runs `npm run verify` on pull requests targeting `main` and on pushes to `main`. Branch protection can require the **Quality checks** status before merging.

## AI contribution guidance

Project-wide Copilot guidance is in `.github/copilot-instructions.md`. Scoped instructions cover source architecture, tests, and build/configuration work under `.github/instructions/`. The **Storefront Engineer** and **Quality Engineer** custom agents provide focused workflows for UI/features and test/build/CI tasks.

The `release-readiness` skill in `.github/skills/` provides a reusable pre-release verification workflow, including production checks and optional local Docker validation without publishing or deploying.

## Project layout

```text
src/
  server/        Fastify server, SSR entrypoint, and HTML template builder
  client/        React UI and browser hydration entrypoint
  shared/        Redux store, localization, catalogs, and shared types
build/
  server/        Generated Fastify server bundle
  static/        Generated Node/browser bundles and stylesheet
static/assets/   Source stylesheet
scripts/         Cross-platform build utilities
config/          TypeScript, ESLint, esbuild, Prettier, and commitlint settings
tests/           Unit and server integration tests
.github/
  agents/        Storefront and quality custom agents
  instructions/  Scoped coding guidance for source, tests, and build config
```

## Contributing

Issues and pull requests are welcome. Before submitting changes, run the quality checks above and ensure both `npm run build` and `npm run build:prod` succeed.
