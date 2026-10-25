export interface CorsConfiguration {
  origins: string[];
  methods: string[];
  allowedHeaders: string[];
  credentials: boolean;
}

export interface HelmetConfiguration {
  contentSecurityPolicy: string;
  referrerPolicy: string;
  crossOriginResourcePolicy: string;
}

export interface ServerConfiguration {
  common: {
    cors: CorsConfiguration;
    helmet: HelmetConfiguration;
  };
  app: {
    host: string;
    port: number;
    assetBaseUrl: string;
  };
  cdn: { host: string; port: number };
  metrics: { host: string; port: number };
}

const developmentConfiguration: ServerConfiguration = {
  common: {
    cors: {
      origins: ['http://localhost:3000', 'http://localhost:3001'],
      methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['content-type', 'authorization'],
      credentials: false,
    },
    helmet: {
      contentSecurityPolicy:
        "default-src 'self'; script-src 'self' 'unsafe-inline' http://localhost:3001; style-src 'self' 'unsafe-inline' http://localhost:3001; img-src 'self' data: https:; connect-src 'self' http://localhost:3000 http://localhost:3001",
      referrerPolicy: 'strict-origin-when-cross-origin',
      crossOriginResourcePolicy: 'cross-origin',
    },
  },
  app: { host: '0.0.0.0', port: 3000, assetBaseUrl: 'http://localhost:3001' },
  cdn: { host: '0.0.0.0', port: 3001 },
  metrics: { host: '127.0.0.1', port: 9090 },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isServerConfiguration(value: unknown): value is ServerConfiguration {
  if (!isRecord(value)) return false;

  const common = value.common;
  const app = value.app;
  const cdn = value.cdn;
  const metrics = value.metrics;
  if (!isRecord(common) || !isRecord(app) || !isRecord(cdn) || !isRecord(metrics)) {
    return false;
  }

  const cors = common.cors;
  const helmet = common.helmet;
  return (
    isRecord(cors) &&
    Array.isArray(cors.origins) &&
    cors.origins.every((origin) => typeof origin === 'string') &&
    Array.isArray(cors.methods) &&
    cors.methods.every((method) => typeof method === 'string') &&
    Array.isArray(cors.allowedHeaders) &&
    cors.allowedHeaders.every((header) => typeof header === 'string') &&
    typeof cors.credentials === 'boolean' &&
    isRecord(helmet) &&
    typeof helmet.contentSecurityPolicy === 'string' &&
    typeof helmet.referrerPolicy === 'string' &&
    typeof helmet.crossOriginResourcePolicy === 'string' &&
    typeof app.host === 'string' &&
    typeof app.port === 'number' &&
    typeof app.assetBaseUrl === 'string' &&
    typeof cdn.host === 'string' &&
    typeof cdn.port === 'number' &&
    typeof metrics.host === 'string' &&
    typeof metrics.port === 'number'
  );
}

export function parseServerConfiguration(
  serializedConfiguration: string | undefined,
): ServerConfiguration {
  if (!serializedConfiguration) return developmentConfiguration;

  let parsed: unknown;
  try {
    parsed = JSON.parse(serializedConfiguration);
  } catch (error) {
    throw new Error('ODERLY_SERVER_CONFIG must contain valid JSON.', {
      cause: error,
    });
  }

  if (!isServerConfiguration(parsed)) {
    throw new Error('ODERLY_SERVER_CONFIG has an invalid or incomplete server configuration.');
  }

  return parsed;
}

export const serverConfiguration = parseServerConfiguration(process.env.ODERLY_SERVER_CONFIG);

export function getServerAddress(service: 'app' | 'cdn' | 'metrics') {
  const environmentPrefix = service.toUpperCase();
  const configuredAddress = serverConfiguration[service];
  const configuredPort =
    process.env[`${environmentPrefix}_PORT`] ?? (service === 'app' ? process.env.PORT : undefined);
  const port = configuredPort === undefined ? configuredAddress.port : Number(configuredPort);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${environmentPrefix}_PORT must be an integer between 1 and 65535.`);
  }

  return {
    host: process.env[`${environmentPrefix}_HOST`] ?? configuredAddress.host,
    port,
  };
}
