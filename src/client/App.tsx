import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import type { AppDispatch, AppState } from '../shared/store';
import { increment, incrementLater } from '../shared/store';

export function App() {
  const count = useSelector((state: AppState) => {
    const value = state.get('count');
    return typeof value === 'number' ? value : 0;
  });
  const dispatch = useDispatch<AppDispatch>();
  const { t, i18n } = useTranslation();
  const [pending, setPending] = useState(false);

  const incrementAfterDelay = () => {
    setPending(true);
    dispatch(incrementLater());
    globalThis.setTimeout(() => setPending(false), 300);
  };

  return (
    <main className="card">
      <div className="eyebrow">NODE 24 · FASTIFY 5 · REACT 19</div>
      <h1>{t('title')}</h1>
      <p className="description">{t('description')}</p>
      <section className="counter" aria-live="polite">
        <span className="count-label">{t('count', { count })}</span>
        <div className="actions">
          <button onClick={() => dispatch(increment())}>{t('increment')}</button>
          <button className="secondary" onClick={incrementAfterDelay} disabled={pending}>
            {pending ? '…' : t('incrementLater')}
          </button>
        </div>
      </section>
      <label className="language-picker">
        {t('language')}
        <select
          value={i18n.resolvedLanguage ?? 'en'}
          onChange={(event) => void i18n.changeLanguage(event.target.value)}
          aria-label={t('language')}
        >
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
      </label>
    </main>
  );
}
