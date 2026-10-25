import type { EnvironmentFactory } from '../types';

const qa: EnvironmentFactory = (env) => ({
  common: {
    cors: {
      origins:
        env.CORS_ORIGINS?.split(',')
          .map((origin) => origin.trim())
          .filter(Boolean) ?? [],
      methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['content-type', 'authorization'],
      credentials: false,
    },
    helmet: {
      contentSecurityPolicy:
        env.CONTENT_SECURITY_POLICY ??
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'",
      referrerPolicy: 'strict-origin-when-cross-origin',
      crossOriginResourcePolicy: 'cross-origin',
    },
  },
  server: {
    app: {
      host: env.APP_HOST ?? '0.0.0.0',
      port: Number(env.APP_PORT ?? env.PORT ?? 3000),
      assetBaseUrl: env.ASSET_BASE_URL ?? '',
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
      apiEndpoint: env.SERVER_API_ENDPOINT ?? env.API_ENDPOINT ?? '/api',
    },
    csr: { apiEndpoint: env.API_ENDPOINT ?? '/api' },
  },
});

export default qa;
