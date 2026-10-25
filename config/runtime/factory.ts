import dev from './environments/dev';
import qa from './environments/qa';
import prod from './environments/prod';
import type { EnvironmentConfig, EnvironmentFactory, RuntimeMode } from './types';

const environments: Record<RuntimeMode, EnvironmentFactory> = {
  dev,
  qa,
  prod,
};

function validatePorts(configuration: EnvironmentConfig): void {
  for (const [name, server] of Object.entries(configuration.server)) {
    if (!Number.isInteger(server.port) || server.port < 1 || server.port > 65535) {
      throw new Error(`${name.toUpperCase()}_PORT must be an integer between 1 and 65535.`);
    }
  }
}

export function createRuntimeConfig(
  mode: string,
  env: NodeJS.ProcessEnv = process.env,
): EnvironmentConfig {
  if (!(mode in environments)) {
    throw new Error(`Unsupported runtime configuration mode: ${mode}`);
  }

  const config = environments[mode as RuntimeMode](env);
  validatePorts(config);
  return config;
}
