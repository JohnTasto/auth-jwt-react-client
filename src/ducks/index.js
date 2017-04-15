import { combineReducers } from 'redux'
import { reducer as form } from 'redux-form'
import { routerReducer as router } from 'react-router-redux'

import error from './error'
import auth from './auth'

export default combineReducers({
  form,
  router,
  error,
  auth,
})
