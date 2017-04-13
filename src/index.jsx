import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { BrowserRouter as Router } from 'react-router-dom'
// import { ConnectedRouter as Router } from 'react-router-redux'

import createStore/* , { history } */from './store'
import App from './components/App'

import { AUTH } from './ducks/auth'

import './style/style.css'

require('./favicon.ico')

const store = createStore()

const token = localStorage.getItem('token')
if (token) store.dispatch({ type: AUTH })

ReactDOM.render(
  <Provider store={store}>
    {/* <Router history={history}> */}
    <Router>
      <App />
    </Router>
  </Provider>
  , document.querySelector('.container'))
