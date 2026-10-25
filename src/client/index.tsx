import { hydrateRoot } from 'react-dom/client';
import { createElement } from 'react';
import { Map } from 'immutable';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import { App } from './App';
import { clientConfiguration } from '../shared/config';
import { createI18n } from '../shared/i18n';
import { createAppStore } from '../shared/store';

async function hydrate() {
  window.__API_ENDPOINT__ = clientConfiguration.apiEndpoint;
  const i18n = await createI18n(window.__LANGUAGE__);
  const initialState = JSON.parse(window.__INITIAL_STATE__) as Array<[string, number]>;
  const store = createAppStore(Map<string, number>(initialState));
  const root = document.getElementById('root');

  if (root) {
    hydrateRoot(
      root,
      createElement(
        I18nextProvider,
        { i18n },
        createElement(Provider, { store, children: createElement(App) }),
      ),
    );
  }
}

void hydrate();
