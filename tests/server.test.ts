import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import type { FastifyInstance } from 'fastify';
import { createServer } from '../src/server/app';
import { createCdnServer } from '../src/server/cdn';
import { createServer as createBaseServer } from '../src/server/create-server';
import { serverConfiguration } from '../src/server/config';
import { createMetricsServer } from '../src/server/metrics';

async function withTestServer(run: (app: FastifyInstance) => Promise<void>) {
  const staticDirectory = await mkdtemp(join(tmpdir(), 'oderly-static-'));
  await writeFile(join(staticDirectory, 'styles.css'), 'body { color: black; }');
  const app = createServer(staticDirectory);

  try {
    await app.ready();
    await run(app);
  } finally {
    await app.close();
    await rm(staticDirectory, { recursive: true, force: true });
  }
}

test('health endpoint returns an OK status', async () => {
  await withTestServer(async (app) => {
    const response = await app.inject({ method: 'GET', url: '/health' });

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), { status: 'ok' });
  });
});

test('SSR selects Spanish and references client bundles', async () => {
  await withTestServer(async (app) => {
    const response = await app.inject({
      method: 'GET',
      url: '/',
      headers: { 'accept-language': 'es-MX,es;q=0.9' },
    });

    assert.equal(response.statusCode, 200);
    assert.match(response.body, /<html lang="es">/);
    assert.match(response.body, /Plantilla de Fastify \+ React SSR/);
    assert.match(response.body, /\/assets\/oderly-browser\.js/);
    assert.match(response.body, /\/assets\/oderly-legacy-browser\.js/);
    assert.match(response.body, /http:\/\/localhost:3001\/assets\/oderly-browser\.js/);
  });
});

test('Fastify serves assets from its configured static directory', async () => {
  await withTestServer(async (app) => {
    const response = await app.inject({
      method: 'GET',
      url: '/assets/styles.css',
    });

    assert.equal(response.statusCode, 200);
    assert.match(response.body, /color: black/);
  });
});

test('CDN server serves built assets and includes shared security headers', async () => {
  const staticDirectory = await mkdtemp(join(tmpdir(), 'oderly-cdn-'));
  await writeFile(join(staticDirectory, 'bundle.js'), 'window.ready = true;');
  const app = createCdnServer(staticDirectory);

  try {
    await app.ready();
    const response = await app.inject({
      method: 'GET',
      url: '/assets/bundle.js',
      headers: { origin: 'http://localhost:3000' },
    });

    assert.equal(response.statusCode, 200);
    assert.match(response.body, /window\.ready/);
    assert.equal(response.headers['access-control-allow-origin'], 'http://localhost:3000');
    assert.equal(response.headers['x-content-type-options'], 'nosniff');
    const contentSecurityPolicy = response.headers['content-security-policy'];
    assert.ok(contentSecurityPolicy);
    assert.match(contentSecurityPolicy, /default-src 'self'/);
  } finally {
    await app.close();
    await rm(staticDirectory, { recursive: true, force: true });
  }
});

test('metrics server exports Prometheus process metrics', async () => {
  const app = createMetricsServer();

  try {
    await app.ready();
    const response = await app.inject({ method: 'GET', url: '/metrics' });

    assert.equal(response.statusCode, 200);
    const contentType = response.headers['content-type'];
    assert.ok(contentType);
    assert.match(contentType, /^text\/plain/);
    assert.match(response.body, /process_uptime_seconds/);
    assert.match(response.body, /process_resident_memory_bytes/);
  } finally {
    await app.close();
  }
});

test('shared server factory handles CORS preflight and rejects unconfigured origins', async () => {
  const app = createBaseServer({
    cors: serverConfiguration.common.cors,
    helmet: serverConfiguration.common.helmet,
  });

  try {
    await app.ready();
    const allowedResponse = await app.inject({
      method: 'OPTIONS',
      url: '/api',
      headers: {
        origin: 'http://localhost:3000',
        'access-control-request-method': 'GET',
      },
    });
    const deniedResponse = await app.inject({
      method: 'OPTIONS',
      url: '/api',
      headers: { origin: 'https://untrusted.example' },
    });

    assert.equal(allowedResponse.statusCode, 204);
    assert.equal(allowedResponse.headers['access-control-allow-origin'], 'http://localhost:3000');
    assert.equal(deniedResponse.statusCode, 204);
    assert.equal(deniedResponse.headers['access-control-allow-origin'], undefined);
  } finally {
    await app.close();
  }
});
