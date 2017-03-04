import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { Router, browserHistory } from 'react-router'

import createStore from './store'
import routes from './routes'

import { AUTH_USER } from './ducks/auth'

import './style/style.css'

const store = createStore()

const token = localStorage.getItem('token')
if (token) store.dispatch({ type: AUTH_USER })

ReactDOM.render(
  <Provider store={store}>
    <Router history={browserHistory} routes={routes} />
  </Provider>
  , document.querySelector('.container'))
