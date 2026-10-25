export interface HtmlTemplateOptions {
  language: string;
  appHtml: string;
  initialState: string;
  assetBaseUrl?: string;
}

function escapeHtmlAttribute(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function serializeForInlineScript(value: unknown): string {
  return JSON.stringify(value)
    .replaceAll('<', '\\u003c')
    .replaceAll('>', '\\u003e')
    .replaceAll('&', '\\u0026')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029');
}

export function buildHtmlDocument({
  language,
  appHtml,
  initialState,
  assetBaseUrl = '',
}: HtmlTemplateOptions): string {
  const safeLanguage = escapeHtmlAttribute(language);
  const assetPrefix = escapeHtmlAttribute(`${assetBaseUrl.replace(/\/+$/, '')}/assets`);
  const serializedState = serializeForInlineScript(initialState);

  return `<!doctype html>
<html lang="${safeLanguage}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#f4f6fb" />
    <title>Oderly</title>
    <link rel="stylesheet" href="${assetPrefix}/styles.css" />
  </head>
  <body>
    <div id="root">${appHtml}</div>
    <script>window.__INITIAL_STATE__ = ${serializedState}; window.__LANGUAGE__ = ${JSON.stringify(language)};</script>
    <script src="${assetPrefix}/oderly-browser.js" defer></script>
    <script src="${assetPrefix}/oderly-legacy-browser.js" nomodule defer></script>
  </body>
</html>`;
}
