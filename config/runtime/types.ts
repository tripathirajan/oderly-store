export type RuntimeMode = 'dev' | 'qa' | 'prod';

export interface ServerOptions {
  host: string;
  port: number;
}

export interface CorsOptions {
  origins: string[];
  methods: string[];
  allowedHeaders: string[];
  credentials: boolean;
}

export interface HelmetOptions {
  contentSecurityPolicy: string;
  referrerPolicy: string;
  crossOriginResourcePolicy: string;
}

export interface EnvironmentConfig {
  common: {
    cors: CorsOptions;
    helmet: HelmetOptions;
  };
  server: {
    app: ServerOptions & { assetBaseUrl: string };
    cdn: ServerOptions;
    metrics: ServerOptions;
  };
  clientModule: {
    ssr: { apiEndpoint: string };
    csr: { apiEndpoint: string };
  };
}

export type EnvironmentFactory = (env: NodeJS.ProcessEnv) => EnvironmentConfig;
