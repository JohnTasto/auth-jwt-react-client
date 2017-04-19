import axios from 'axios'
import jwt from 'jwt-simple'
import moment from 'moment'
import { SubmissionError } from 'redux-form'

import { AuthenticationError, NetworkError } from '../helpers/error'


const API_ROOT = process.env.API_ROOT


// TYPES

export const types = {
  AUTH: 'auth auth',
  UNAUTH: 'auth unauth',
  REFRESH: 'auth refresh',
  SET_REDIRECT: 'auth set redirect',

  FETCH_MESSAGE: 'auth fetch message',
}


// HELPERS

const decode = token => token.replace(/~/g, '.')

const exp = token => jwt.decode(token, null, true).exp

const now = () => moment().unix()

const logError = error => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Error:')  // eslint-disable-line no-console
    console.dir(error)  // eslint-disable-line no-console
    if (error.response) {
      console.log('Response:')  // eslint-disable-line no-console
      console.dir(error.response)  // eslint-disable-line no-console
      console.log('Status code:')  // eslint-disable-line no-console
      console.log(error.response.status)  // eslint-disable-line no-console
      console.log('Response data:')  // eslint-disable-line no-console
      console.dir(error.response.data)  // eslint-disable-line no-console
    }
  }
}


// HANDLERS

export const handle = {
  tokens: dispatch => response => {
    const { refreshToken, accessToken, time } = response.data
    if (refreshToken) {
      dispatch({
        type: types.AUTH,
        refreshToken,
        accessToken,
        time,
      })
    } else {
      dispatch({
        type: types.REFRESH,
        accessToken,
        time,
      })
    }
  },

  submissionErrors: dispatch => error => {
    logError(error)
    if (error.response) {
      if (error.response.status === 401 || error.response.status === 422) {
        throw new SubmissionError({ _error: error.response.data })
      }
    }
    dispatch({ type: null, error: 'Network error' })
  },

  authenticationErrors: dispatch => error => {
    logError(error)
    if ((error instanceof AuthenticationError)
      || (error.response && error.response.status === 401)) {
      dispatch(actions.signOut())  // eslint-disable-line no-use-before-define
    } else {
      dispatch({ type: null, error: 'Network error' })
    }
  },
}


// ACTIONS

export const actions = {

  setRedirect: redirectLocation => ({
    type: types.SET_REDIRECT,
    redirectLocation,
  }),

  signUp: ({ email, password }) => dispatch =>
    axios({
      method: 'post',
      url: `${API_ROOT}/signup`,
      data: { email, password },
    })
      .catch(handle.submissionErrors(dispatch)),

  signIn: ({ email, password }) => dispatch =>
    axios({
      method: 'patch',
      url: `${API_ROOT}/signin`,
      data: { email, password },
    })
      .then(handle.tokens(dispatch))
      .catch(handle.submissionErrors(dispatch)),

  signOut: () => (dispatch, getState) =>
    axios({
      method: 'patch',
      url: `${API_ROOT}/signout`,
      headers: { authorization: `Bearer ${getState().auth.refresh.token}` },
    })
      .then(() => dispatch({ type: types.UNAUTH }))
      .catch(() => dispatch({ type: types.UNAUTH })),

  verifyEmail: token => dispatch =>
    axios({
      method: 'patch',
      url: `${API_ROOT}/verifyemail`,
      headers: { authorization: `Bearer ${decode(token)}` },
    })
      .then(handle.tokens(dispatch))
      .catch(handle.submissionErrors(dispatch)),

  // may reject!
  refresh: () => (dispatch, getState) =>
    axios({
      method: 'get',
      url: `${API_ROOT}/refresh`,
      headers: { authorization: `Bearer ${getState().auth.refresh.token}` },
    })
      .then(handle.tokens(dispatch))
      .catch(error => {
        if (process.env.NODE_ENV === 'development') console.dir(error)  // eslint-disable-line no-console
        if (error.response && error.response.status === 401) {
          throw new AuthenticationError()
        }
        throw new NetworkError()
      }),

  // may reject!
  verifyTokens: () => (dispatch, getState) => {
    const {
      auth: {
        timeOffset,
        refresh: { exp: refreshExp },
        access: { exp: accessExp },
      },
    } = getState()
    const serverNow = now() + timeOffset
    if (serverNow <= accessExp - 300) {
      return Promise.resolve()
    } else if (serverNow <= refreshExp - 300) {
      return dispatch(actions.refresh())
    } else {  // eslint-disable-line no-else-return
      return Promise.reject(new AuthenticationError())
    }
  },

  fetchMessage: () => (dispatch, getState) =>
    dispatch(actions.verifyTokens())
      .then(() => axios({
        method: 'get',
        url: `${API_ROOT}/feature`,
        headers: { authorization: `Bearer ${getState().auth.access.token}` },
      }))
      .then(response => {
        dispatch({
          type: types.FETCH_MESSAGE,
          message: response.data.message,
        })
      })
      .catch(handle.authenticationErrors(dispatch)),
}


// REDUCER

export default (state = {}, action) => {
  const {
    type,
    refreshToken,
    accessToken,
    time,
    redirectLocation,
    message,
  } = action

  switch (type) {  // eslint-disable-line default-case
    case types.AUTH:
      return {
        ...state,
        authenticated: true,
        refresh: { token: refreshToken, exp: exp(refreshToken) },
        access: { token: accessToken, exp: exp(accessToken) },
        timeOffset: time - now(),
      }
    case types.UNAUTH:
      return {
        ...state,
        authenticated: false,
        refresh: undefined,
        access: undefined,
      }
    case types.REFRESH:
      return {
        ...state,
        access: { token: accessToken, exp: exp(accessToken) },
        timeOffset: time - now(),
      }
    case types.SET_REDIRECT:
      return { ...state, redirectLocation }
    case types.FETCH_MESSAGE:
      return { ...state, message }
  }
  return state
}
