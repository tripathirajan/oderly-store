import { Map } from 'immutable';
import type { FastifyRequest } from 'fastify';
import type { AppState } from '../shared/store';

function serializeMap(state: AppState): string {
  const serialized = JSON.stringify(state.toArray());
  if (serialized === undefined) {
    throw new TypeError('Client state did not serialize to JSON.');
  }
  return serialized;
}

export function serializeClientInitialState(
  clientInitialState: AppState,
  request: FastifyRequest,
): string {
  try {
    return serializeMap(clientInitialState);
  } catch (error) {
    request.log.error(
      { err: error },
      'Unable to serialize full client initial state; using fallback.',
    );
  }

  try {
    const fallbackState = Map<string, number>([['count', clientInitialState.get('count', 0)]]);
    return serializeMap(fallbackState);
  } catch (error) {
    request.log.error({ err: error }, 'Unable to serialize the minimum client initial state.');
    throw error;
  }
}
