export interface RuntimeConfiguration {
  common: {
    cors: {
      origins: string[];
      methods: string[];
      allowedHeaders: string[];
      credentials: boolean;
    };
    helmet: {
      contentSecurityPolicy: string;
      referrerPolicy: string;
      crossOriginResourcePolicy: string;
    };
  };
  server: {
    app: { host: string; port: number; assetBaseUrl: string };
    cdn: { host: string; port: number };
    metrics: { host: string; port: number };
  };
  client: { apiEndpoint: string };
}

export function getRuntimeConfig(mode: string): RuntimeConfiguration;
