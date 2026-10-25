import assert from 'node:assert/strict';
import { Map } from 'immutable';
import { test } from 'node:test';
import { serializeClientInitialState } from '../src/server/serialize-client-state.ts';

function createRequestLogger() {
  const errors = [];
  return {
    errors,
    request: { log: { error: (...args) => errors.push(args) } },
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
  const circular = {};
  circular.self = circular;
  const state = Map([
    ['count', 5],
    ['unsupported', circular],
  ]);

  const serialized = serializeClientInitialState(state, request);

  assert.deepEqual(JSON.parse(serialized), [['count', 5]]);
  assert.equal(errors.length, 1);
  assert.match(errors[0][1], /full client initial state/);
});

test('logs and throws when even the minimum state cannot be serialized', () => {
  const { request, errors } = createRequestLogger();
  const circular = {};
  circular.self = circular;

  assert.throws(() => serializeClientInitialState(Map([['count', circular]]), request));
  assert.equal(errors.length, 2);
  assert.match(errors[1][1], /minimum client initial state/);
});
