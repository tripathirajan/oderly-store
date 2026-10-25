import type { EnvironmentFactory } from '../types';

const development: EnvironmentFactory = (env) => ({
  common: {
    cors: {
      origins: env.CORS_ORIGINS?.split(',')
        .map((origin) => origin.trim())
        .filter(Boolean) ?? ['http://localhost:3000', 'http://localhost:3001'],
      methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['content-type', 'authorization'],
      credentials: false,
    },
    helmet: {
      contentSecurityPolicy:
        env.CONTENT_SECURITY_POLICY ??
        "default-src 'self'; script-src 'self' 'unsafe-inline' http://localhost:3001; style-src 'self' 'unsafe-inline' http://localhost:3001; img-src 'self' data: https:; connect-src 'self' http://localhost:3000 http://localhost:3001",
      referrerPolicy: 'strict-origin-when-cross-origin',
      crossOriginResourcePolicy: 'cross-origin',
    },
  },
  server: {
    app: {
      host: env.APP_HOST ?? '0.0.0.0',
      port: Number(env.APP_PORT ?? env.PORT ?? 3000),
      assetBaseUrl: env.ASSET_BASE_URL ?? 'http://localhost:3001',
    },
    cdn: {
      host: env.CDN_HOST ?? '0.0.0.0',
      port: Number(env.CDN_PORT ?? 3001),
    },
    metrics: {
      host: env.METRICS_HOST ?? '127.0.0.1',
      port: Number(env.METRICS_PORT ?? 9090),
    },
  },
  clientModule: {
    ssr: {
      apiEndpoint: env.SERVER_API_ENDPOINT ?? 'http://localhost:3000/api',
    },
    csr: { apiEndpoint: env.API_ENDPOINT ?? 'http://localhost:3000/api' },
  },
});

export default development;
