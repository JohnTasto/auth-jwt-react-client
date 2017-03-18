import { createStore, compose, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import reduxImmutableStateInvariant from 'redux-immutable-state-invariant'  // eslint-disable-line import/no-extraneous-dependencies
import { routerMiddleware } from 'react-router-redux'
import createHistory from 'history/createBrowserHistory'
import rootReducer from './ducks'


export const history = createHistory()


function createStoreProd(initialState) {
  const middlewares = [
    routerMiddleware(history),
    thunk,
  ]

  return createStore(rootReducer, initialState, compose(
    applyMiddleware(...middlewares),
  ))
}


function createStoreDev(initialState) {
  const middlewares = [

    // throw error when you mutate state inside a dispatch or between dispatches
    reduxImmutableStateInvariant(),

    // dispatch navigation actions from anywhere
    // store.dispatch(push('/foo'))
    routerMiddleware(history),

    thunk,
  ]

  // add support for Redux dev tools
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose  // eslint-disable-line no-underscore-dangle, max-len
  return createStore(rootReducer, initialState, composeEnhancers(
    applyMiddleware(...middlewares),
  ))
}


export default process.env.NODE_ENV === 'production'
  ? createStoreProd
  : createStoreDev
