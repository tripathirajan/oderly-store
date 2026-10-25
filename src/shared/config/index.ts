export interface ClientConfiguration {
  apiEndpoint: string;
}

export function parseClientConfiguration(
  serializedConfiguration: string | undefined,
): ClientConfiguration {
  if (!serializedConfiguration) {
    throw new Error('ODERLY_CLIENT_CONFIG is required. Build with scripts/app-builder.mjs.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(serializedConfiguration);
  } catch (error) {
    throw new Error('ODERLY_CLIENT_CONFIG must contain valid JSON.', {
      cause: error,
    });
  }

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !('apiEndpoint' in parsed) ||
    typeof parsed.apiEndpoint !== 'string'
  ) {
    throw new Error('ODERLY_CLIENT_CONFIG must include a string apiEndpoint.');
  }

  return { apiEndpoint: parsed.apiEndpoint };
}

export const clientConfiguration = parseClientConfiguration(process.env.ODERLY_CLIENT_CONFIG);
