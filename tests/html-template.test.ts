import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildHtmlDocument } from '../src/server/html-template.ts';

test('builds a document shell with SSR markup and hydration assets', () => {
  const html = buildHtmlDocument({
    language: 'en',
    appHtml: '<main>Rendered storefront</main>',
    initialState: JSON.stringify([['count', 3]]),
  });

  assert.match(html, /<html lang="en">/);
  assert.match(html, /<div id="root"><main>Rendered storefront<\/main><\/div>/);
  const serializedScriptValue = html.match(/window\.__INITIAL_STATE__ = ("(?:\\.|[^"\\])*")/)?.[1];
  assert.ok(serializedScriptValue);
  assert.deepEqual(JSON.parse(JSON.parse(serializedScriptValue)), [['count', 3]]);
  assert.match(html, /window\.__LANGUAGE__ = "en"/);
  assert.match(html, /\/assets\/oderly-browser\.js/);
  assert.match(html, /\/assets\/oderly-legacy-browser\.js/);
});

test('escapes untrusted values in attributes and inline hydration JSON', () => {
  const html = buildHtmlDocument({
    language: 'en"><script>alert(1)</script>',
    appHtml: '<main>Store</main>',
    initialState: JSON.stringify([['value', '</script><script>alert(1)</script>']]),
  });

  assert.match(html, /lang="en&quot;&gt;&lt;script&gt;alert\(1\)&lt;\/script&gt;"/);
  assert.ok(html.includes('\\u003c/script\\u003e\\u003cscript\\u003ealert'));
  assert.doesNotMatch(html, /window\.__INITIAL_STATE__ = <\/script>/);
});
