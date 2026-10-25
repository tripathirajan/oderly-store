const defaultOrigins = {
  dev: ['http://localhost:3000', 'http://localhost:3001'],
  staging: [],
  prod: [],
};

const defaultConfigurations = {
  dev: {
    server: {
      app: {
        host: '0.0.0.0',
        port: 3000,
        assetBaseUrl: 'http://localhost:3001',
      },
      cdn: { host: '0.0.0.0', port: 3001 },
      metrics: { host: '127.0.0.1', port: 9090 },
    },
    client: { apiEndpoint: 'http://localhost:3000/api' },
  },
  staging: {
    server: {
      app: { host: '0.0.0.0', port: 3000, assetBaseUrl: '' },
      cdn: { host: '0.0.0.0', port: 3001 },
      metrics: { host: '127.0.0.1', port: 9090 },
    },
    client: { apiEndpoint: '/api' },
  },
  prod: {
    server: {
      app: { host: '0.0.0.0', port: 3000, assetBaseUrl: '' },
      cdn: { host: '0.0.0.0', port: 3001 },
      metrics: { host: '127.0.0.1', port: 9090 },
    },
    client: { apiEndpoint: '/api' },
  },
};

function readPort(name, fallback, legacyName) {
  const value = process.env[name] ?? (legacyName ? process.env[legacyName] : undefined);
  if (value === undefined) return fallback;

  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${name} must be an integer between 1 and 65535.`);
  }
  return port;
}

function readHost(name, fallback) {
  return process.env[name] ?? fallback;
}

export function getRuntimeConfig(mode) {
  const defaults = defaultConfigurations[mode];
  if (!defaults) throw new Error(`Unsupported runtime configuration mode: ${mode}`);

  return {
    common: {
      cors: {
        origins: process.env.CORS_ORIGINS
          ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
          : defaultOrigins[mode],
        methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['content-type', 'authorization'],
        credentials: false,
      },
      helmet: {
        contentSecurityPolicy:
          mode === 'dev'
            ? "default-src 'self'; script-src 'self' 'unsafe-inline' http://localhost:3001; style-src 'self' 'unsafe-inline' http://localhost:3001; img-src 'self' data: https:; connect-src 'self' http://localhost:3000 http://localhost:3001"
            : "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'",
        referrerPolicy: 'strict-origin-when-cross-origin',
        crossOriginResourcePolicy: 'cross-origin',
      },
    },
    server: {
      ...defaults.server,
      app: {
        ...defaults.server.app,
        host: readHost('APP_HOST', defaults.server.app.host),
        port: readPort('APP_PORT', defaults.server.app.port, 'PORT'),
        assetBaseUrl: process.env.ASSET_BASE_URL ?? defaults.server.app.assetBaseUrl,
      },
      cdn: {
        ...defaults.server.cdn,
        host: readHost('CDN_HOST', defaults.server.cdn.host),
        port: readPort('CDN_PORT', defaults.server.cdn.port),
      },
      metrics: {
        ...defaults.server.metrics,
        host: readHost('METRICS_HOST', defaults.server.metrics.host),
        port: readPort('METRICS_PORT', defaults.server.metrics.port),
      },
    },
    client: {
      ...defaults.client,
      apiEndpoint: process.env.API_ENDPOINT ?? defaults.client.apiEndpoint,
    },
  };
}
