import assert from 'node:assert/strict';
import process from 'node:process';
import { test } from 'node:test';
import { getRuntimeConfig } from '../config/runtime.config.mjs';
import { parseServerConfiguration, getServerAddress } from '../src/server/config.ts';
import { parseClientConfiguration } from '../src/shared/config.ts';

const environmentKeys = [
  'CORS_ORIGINS',
  'APP_HOST',
  'APP_PORT',
  'PORT',
  'ASSET_BASE_URL',
  'CDN_HOST',
  'CDN_PORT',
  'METRICS_HOST',
  'METRICS_PORT',
];

function withEnvironment(overrides: NodeJS.ProcessEnv, run: () => void) {
  const previous = new Map(environmentKeys.map((key) => [key, process.env[key]]));
  for (const key of environmentKeys) delete process.env[key];
  Object.assign(process.env, overrides);

  try {
    return run();
  } finally {
    for (const key of environmentKeys) {
      const value = previous.get(key);
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test('runtime config selects environment defaults', () => {
  withEnvironment({}, () => {
    const dev = getRuntimeConfig('dev');
    const staging = getRuntimeConfig('staging');
    const prod = getRuntimeConfig('prod');

    assert.equal(dev.server.app.port, 3000);
    assert.equal(dev.client.apiEndpoint, 'http://localhost:3000/api');
    assert.deepEqual(dev.common.cors.origins, ['http://localhost:3000', 'http://localhost:3001']);
    assert.deepEqual(staging.common.cors.origins, []);
    assert.equal(staging.client.apiEndpoint, '/api');
    assert.equal(prod.client.apiEndpoint, '/api');
    assert.match(dev.common.helmet.contentSecurityPolicy, /localhost:3001/);
    assert.doesNotMatch(prod.common.helmet.contentSecurityPolicy, /localhost/);
  });
});

test('runtime config applies environment overrides', () => {
  withEnvironment(
    {
      CORS_ORIGINS: 'https://store.example, https://cdn.example',
      APP_HOST: '127.0.0.1',
      APP_PORT: '4100',
      ASSET_BASE_URL: 'https://cdn.example/assets',
      CDN_HOST: '127.0.0.2',
      CDN_PORT: '4200',
      METRICS_HOST: '127.0.0.3',
      METRICS_PORT: '4300',
      API_ENDPOINT: 'https://api.example/v2',
    },
    () => {
      const config = getRuntimeConfig('prod');
      assert.deepEqual(config.common.cors.origins, [
        'https://store.example',
        'https://cdn.example',
      ]);
      assert.deepEqual(config.server.app, {
        host: '127.0.0.1',
        port: 4100,
        assetBaseUrl: 'https://cdn.example/assets',
      });
      assert.deepEqual(config.server.cdn, { host: '127.0.0.2', port: 4200 });
      assert.deepEqual(config.server.metrics, {
        host: '127.0.0.3',
        port: 4300,
      });
      assert.equal(config.client.apiEndpoint, 'https://api.example/v2');
    },
  );
});

test('runtime config rejects unsupported modes and invalid ports', () => {
  withEnvironment({ APP_PORT: '65536' }, () => {
    assert.throws(() => getRuntimeConfig('qa'), /Unsupported runtime configuration mode/);
    assert.throws(() => getRuntimeConfig('dev'), /APP_PORT must be an integer/);
  });
});

test('server config accepts defaults and valid JSON, rejects invalid JSON and shapes', () => {
  assert.equal(parseServerConfiguration(undefined).app.port, 3000);
  const validConfiguration = getRuntimeConfig('dev');
  assert.deepEqual(
    parseServerConfiguration(
      JSON.stringify({
        common: validConfiguration.common,
        ...validConfiguration.server,
      }),
    ),
    { common: validConfiguration.common, ...validConfiguration.server },
  );
  assert.throws(() => parseServerConfiguration('{invalid'), /must contain valid JSON/);
  assert.throws(() => parseServerConfiguration('{"app":{}}'), /invalid or incomplete/);
});

test('server address resolution honors overrides, legacy PORT, and validates ports', () => {
  withEnvironment(
    {
      APP_HOST: '127.0.0.1',
      PORT: '3100',
      CDN_PORT: '3101',
      METRICS_HOST: '0.0.0.0',
    },
    () => {
      assert.deepEqual(getServerAddress('app'), {
        host: '127.0.0.1',
        port: 3100,
      });
      assert.deepEqual(getServerAddress('cdn'), {
        host: '0.0.0.0',
        port: 3101,
      });
      assert.deepEqual(getServerAddress('metrics'), {
        host: '0.0.0.0',
        port: 9090,
      });
    },
  );

  withEnvironment({ CDN_PORT: '0' }, () => {
    assert.throws(() => getServerAddress('cdn'), /CDN_PORT must be an integer/);
  });
});

test('client config accepts defaults and valid JSON, rejects malformed config', () => {
  assert.deepEqual(parseClientConfiguration(undefined), {
    apiEndpoint: 'http://localhost:3000/api',
  });
  assert.deepEqual(parseClientConfiguration('{"apiEndpoint":"/api"}'), {
    apiEndpoint: '/api',
  });
  assert.throws(() => parseClientConfiguration('{invalid'), /must contain valid JSON/);
  assert.throws(() => parseClientConfiguration('{}'), /must include a string apiEndpoint/);
  assert.throws(
    () => parseClientConfiguration('{"apiEndpoint":42}'),
    /must include a string apiEndpoint/,
  );
});
