import assert from 'node:assert/strict';
import { Map } from 'immutable';
import { test } from 'node:test';
import type { FastifyRequest } from 'fastify';
import type { AppState } from '../src/shared/store.ts';
import { serializeClientInitialState } from '../src/server/serialize-client-state.ts';

function createRequestLogger() {
  const errors: Array<[unknown, string]> = [];
  return {
    errors,
    request: {
      log: {
        error: (error: unknown, message: string) => errors.push([error, message]),
      },
    } as unknown as FastifyRequest,
  };
}

test('serializes the full Immutable Map as entry tuples', () => {
  const { request, errors } = createRequestLogger();
  const serialized = serializeClientInitialState(Map({ count: 4 }), request);

  assert.deepEqual(JSON.parse(serialized), [['count', 4]]);
  assert.equal(errors.length, 0);
});

test('logs full-state serialization failure and falls back to the minimum state', () => {
  const { request, errors } = createRequestLogger();
  const circular: Record<string, unknown> = {};
  circular.self = circular;
  const state = Map<string, unknown>([
    ['count', 5],
    ['unsupported', circular],
  ]);

  const serialized = serializeClientInitialState(state as unknown as AppState, request);

  assert.deepEqual(JSON.parse(serialized), [['count', 5]]);
  assert.equal(errors.length, 1);
  assert.match(errors[0][1], /full client initial state/);
});

test('logs and throws when even the minimum state cannot be serialized', () => {
  const { request, errors } = createRequestLogger();
  const circular: Record<string, unknown> = {};
  circular.self = circular;

  const state = Map<string, unknown>([['count', circular]]) as unknown as AppState;
  assert.throws(() => serializeClientInitialState(state, request));
  assert.equal(errors.length, 2);
  assert.match(errors[1][1], /minimum client initial state/);
});
