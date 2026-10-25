import { Map } from 'immutable';
import { applyMiddleware, createStore } from 'redux';
import { thunk, type ThunkAction } from 'redux-thunk';

const INCREMENT = 'counter/increment';

export type AppState = Map<string, number>;
type IncrementAction = { type: typeof INCREMENT };

const initialState: AppState = Map({ count: 0 });

function rootReducer(state = initialState, action: IncrementAction): AppState {
  if (action.type === INCREMENT) {
    return state.update('count', (count = 0) => count + 1);
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
