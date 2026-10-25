import type { Map } from 'immutable';

export interface ClientModuleConfiguration {
  apiEndpoint: string;
}

function parseConfiguration(
  serializedConfiguration: string | undefined,
): ClientModuleConfiguration {
  if (!serializedConfiguration) {
    throw new Error('ODERLY_CLIENT_SERVER_CONFIG is required for the Node client build.');
  }

  const configuration: unknown = JSON.parse(serializedConfiguration);
  if (
    typeof configuration !== 'object' ||
    configuration === null ||
    !('apiEndpoint' in configuration) ||
    typeof configuration.apiEndpoint !== 'string'
  ) {
    throw new Error('ODERLY_CLIENT_SERVER_CONFIG must include a string apiEndpoint.');
  }

  return { apiEndpoint: configuration.apiEndpoint };
}

export function getNodeClientConfiguration(
  serializedConfiguration = process.env.ODERLY_CLIENT_SERVER_CONFIG,
): ClientModuleConfiguration {
  return parseConfiguration(serializedConfiguration);
}

export function getBrowserClientConfiguration(
  state: Map<string, unknown>,
): ClientModuleConfiguration {
  const configuration = state.get('config');
  if (
    typeof configuration !== 'object' ||
    configuration === null ||
    !('apiEndpoint' in configuration) ||
    typeof configuration.apiEndpoint !== 'string'
  ) {
    throw new Error('The Redux store must contain a client config apiEndpoint string.');
  }

  return { apiEndpoint: configuration.apiEndpoint };
}
