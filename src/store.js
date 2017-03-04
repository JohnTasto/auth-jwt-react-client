import { createStore, compose, applyMiddleware } from 'redux'
import reduxImmutableStateInvariant from 'redux-immutable-state-invariant'  // eslint-disable-line import/no-extraneous-dependencies
import thunk from 'redux-thunk'
import rootReducer from './ducks'


function storeProd(initialState) {
  const middlewares = [
    thunk,
  ]

  return createStore(rootReducer, initialState, compose(
    applyMiddleware(...middlewares),
  ))
}


function storeDev(initialState) {
  const middlewares = [

    // Throw error when you mutate state inside a dispatch or between dispatches
    reduxImmutableStateInvariant(),

    thunk,
  ]

  // add support for Redux dev tools
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose  // eslint-disable-line no-underscore-dangle, max-len
  return createStore(rootReducer, initialState, composeEnhancers(
    applyMiddleware(...middlewares),
  ))
}


const store = process.env.NODE_ENV === 'production' ? storeProd : storeDev

export default store
