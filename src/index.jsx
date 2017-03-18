import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'react-router-redux'

import createStore, { history } from './store'
import App from './components/App'

import { AUTH_USER } from './ducks/auth'

import './style/style.css'

require('./favicon.ico')

const store = createStore()

const token = localStorage.getItem('token')
if (token) store.dispatch({ type: AUTH_USER })

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <App />
    </ConnectedRouter>
  </Provider>
  , document.querySelector('.container'))
