// @flow

import {
  createStore as createReduxStore,
  applyMiddleware,
  combineReducers
} from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import { jsReadyReducer } from './reducers/js-ready';
import { curUserReducer } from './reducers/cur-user';
import { gamesReducer } from './reducers/games';
import { curGameReducer } from './reducers/cur-game';
import { backfillsReducer } from './reducers/backfills';
import { statsReducer } from './reducers/stats';

import type { Store } from 'redux'; // eslint-disable-line import/named
import type { State } from './types/state';
import type { Action } from './types/actions';

const rootReducer = combineReducers({
  jsReady: jsReadyReducer,
  curUser: curUserReducer,
  games: gamesReducer,
  curGame: curGameReducer,
  backfills: backfillsReducer,
  stats: statsReducer
});

export function createStore(initialState: State): Store<State, Action> {
  return createReduxStore(
    rootReducer,
    initialState,
    composeWithDevTools(applyMiddleware(thunk))
  );
}
