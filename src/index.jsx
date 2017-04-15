import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter as Router } from 'react-router-redux'
import throttle from 'lodash/throttle'

import createStore, { saveState, loadState, history } from './store'
import App from './components/App'

import './style/style.css'

require('./favicon.ico')


const store = createStore(loadState())

store.subscribe(throttle(() => {
  saveState({
    auth: store.getState().auth,
  })
}, 1000))


ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <App />
    </Router>
  </Provider>
  , document.querySelector('.container'))
