import { Map } from 'immutable';
import { applyMiddleware, createStore } from 'redux';
import { thunk, type ThunkAction } from 'redux-thunk';

const INCREMENT = 'counter/increment';

export type AppState = Map<string, unknown>;
type IncrementAction = { type: typeof INCREMENT };

const initialState: AppState = Map({
  count: 0,
  config: { apiEndpoint: '/api' },
});

function rootReducer(state = initialState, action: IncrementAction): AppState {
  if (action.type === INCREMENT) {
    const count = state.get('count');
    return state.set('count', (typeof count === 'number' ? count : 0) + 1);
  }

  return state;
}

export function increment(): IncrementAction {
  return { type: INCREMENT };
}

export function incrementLater(): ThunkAction<void, AppState, undefined, IncrementAction> {
  return (dispatch) => {
    setTimeout(() => dispatch(increment()), 250);
  };
}

export function createAppStore(preloadedState: AppState = initialState) {
  return createStore(rootReducer, preloadedState, applyMiddleware(thunk));
}

export type AppDispatch = ReturnType<typeof createAppStore>['dispatch'];
