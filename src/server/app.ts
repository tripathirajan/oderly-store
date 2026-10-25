import fastifyStatic from '@fastify/static';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import { join } from 'node:path';
import { App } from '../client/App';
import { createI18n, resolveLanguage } from '../shared/i18n';
import { createAppStore } from '../shared/store';
import { buildHtmlDocument } from './html-template';
import { serializeClientInitialState } from './serialize-client-state';
import { serverConfiguration } from './config';
import { createServer as createServerInstance } from './create-server';

export function createAppServer(
  staticDirectory = join(process.cwd(), 'build', 'static'),
  configuration = serverConfiguration,
) {
  const app = createServerInstance({
    cors: configuration.common.cors,
    helmet: configuration.common.helmet,
  });

  app.register(fastifyStatic, { root: staticDirectory, prefix: '/assets/' });

  app.get('/health', async (_request, reply) => reply.send({ status: 'ok' }));

  app.get('/', async (request, reply) => {
    const language = resolveLanguage(request.headers['accept-language']);
    const i18n = await createI18n(language);
    const store = createAppStore();
    const appHtml = renderToString(
      createElement(
        I18nextProvider,
        { i18n },
        createElement(Provider, { store, children: createElement(App) }),
      ),
    );
    const initialState = serializeClientInitialState(store.getState(), request);

    return reply.type('text/html').send(
      buildHtmlDocument({
        language,
        appHtml,
        initialState,
        assetBaseUrl: configuration.app.assetBaseUrl,
      }),
    );
  });

  return app;
}

export const createServer = createAppServer;
