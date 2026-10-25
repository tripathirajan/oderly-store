import assert from 'node:assert/strict';
import process from 'node:process';
import { test } from 'node:test';
import { Map } from 'immutable';
import { createRuntimeConfig } from '../config/runtime/factory.ts';
import { parseServerConfiguration, getServerAddress } from '../src/server/config';
import { getBrowserClientConfiguration, getNodeClientConfiguration } from '../src/client/config';

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
  'SERVER_API_ENDPOINT',
  'API_ENDPOINT',
  'CONTENT_SECURITY_POLICY',
];

function withEnvironment(overrides: NodeJS.ProcessEnv, run: () => void) {
  const previous = Map(environmentKeys.map((key) => [key, process.env[key]]));
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
    const dev = createRuntimeConfig('dev', process.env);
    const qa = createRuntimeConfig('qa', process.env);
    const prod = createRuntimeConfig('prod', process.env);

    assert.equal(dev.server.app.port, 3000);
    assert.equal(dev.clientModule.ssr.apiEndpoint, 'http://localhost:3000/api');
    assert.equal(dev.clientModule.csr.apiEndpoint, 'http://localhost:3000/api');
    assert.deepEqual(dev.common.cors.origins, ['http://localhost:3000', 'http://localhost:3001']);
    assert.deepEqual(qa.common.cors.origins, []);
    assert.equal(qa.clientModule.csr.apiEndpoint, '/api');
    assert.equal(prod.clientModule.csr.apiEndpoint, '/api');
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
      SERVER_API_ENDPOINT: 'http://api.internal/v2',
    },
    () => {
      const config = createRuntimeConfig('prod', process.env);
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
      assert.equal(config.clientModule.ssr.apiEndpoint, 'http://api.internal/v2');
      assert.equal(config.clientModule.csr.apiEndpoint, 'https://api.example/v2');
    },
  );
});

test('runtime config rejects unsupported modes and invalid ports', () => {
  withEnvironment({ APP_PORT: '65536' }, () => {
    assert.throws(
      () => createRuntimeConfig('qa', process.env),
      /Unsupported runtime configuration mode/,
    );
    assert.throws(() => createRuntimeConfig('dev', process.env), /APP_PORT must be an integer/);
  });
});

test('server config accepts valid JSON, rejects missing, malformed, and incomplete config', () => {
  assert.throws(() => parseServerConfiguration(undefined), /is required/);
  const runtimeConfig = createRuntimeConfig('dev', process.env);
  const validConfiguration = {
    common: runtimeConfig.common,
    ...runtimeConfig.server,
    clientModule: runtimeConfig.clientModule,
  };
  assert.deepEqual(
    parseServerConfiguration(JSON.stringify(validConfiguration)),
    validConfiguration,
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

test('Node client uses server config while browser client reads config from Redux state', () => {
  assert.deepEqual(getNodeClientConfiguration('{"apiEndpoint":"http://api.internal"}'), {
    apiEndpoint: 'http://api.internal',
  });
  assert.throws(() => getNodeClientConfiguration(undefined), /is required/);
  assert.deepEqual(
    getBrowserClientConfiguration(Map([['config', { apiEndpoint: 'https://api.public' }]])),
    { apiEndpoint: 'https://api.public' },
  );
  assert.throws(
    () => getBrowserClientConfiguration(Map<string, unknown>()),
    /must contain a client config/,
  );
});
