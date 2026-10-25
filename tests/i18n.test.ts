import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createI18n, resolveLanguage } from '../src/shared/i18n.ts';

test('resolves English and Spanish Accept-Language values', () => {
  assert.equal(resolveLanguage('es-MX,es;q=0.9'), 'es');
  assert.equal(resolveLanguage('en-US,en;q=0.9'), 'en');
  assert.equal(resolveLanguage(undefined), 'en');
});

test('loads the requested locale with a fallback', async () => {
  const spanish = await createI18n('es');
  const fallback = await createI18n('fr');

  assert.equal(spanish.t('title'), 'Plantilla de Fastify + React SSR');
  assert.equal(fallback.t('title'), 'Fastify + React SSR starter');
});
