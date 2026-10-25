import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createAppStore, increment, incrementLater } from '../src/shared/store.ts';

test('store starts with a zero count and handles increment actions', () => {
  const store = createAppStore();

  assert.equal(store.getState().get('count'), 0);
  store.dispatch(increment());
  assert.equal(store.getState().get('count'), 1);
});

test('thunk increments the count asynchronously', async () => {
  const store = createAppStore();
  store.dispatch(incrementLater());

  await new Promise((resolve) => globalThis.setTimeout(resolve, 300));

  assert.equal(store.getState().get('count'), 1);
});
