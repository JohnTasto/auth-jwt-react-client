import axios from 'axios'
import jwt from 'jwt-simple'
import { SubmissionError } from 'redux-form'


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

const handleTokens = dispatch => response => {
  const { refreshToken, accessToken } = response.data
  if (refreshToken) {
    dispatch({
      type: types.AUTH,
      payload: { refreshToken },
    })
  }
  dispatch({
    type: types.REFRESH,
    payload: { accessToken },
  })
}

const handleErrors = error => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Response:')  // eslint-disable-line no-console
    console.dir(error.response)  // eslint-disable-line no-console
    if (error.response) {
      console.log('Status code:')  // eslint-disable-line no-console
      console.log(error.response.status)  // eslint-disable-line no-console
      console.log('Response data:')  // eslint-disable-line no-console
      console.dir(error.response.data)  // eslint-disable-line no-console
    }
  }
  let message = 'Network error'
  if (error.response) {
    if (error.response.status === 401 || error.response.status === 422) {
      message = error.response.data
    }
  }
  throw new SubmissionError({ _error: message })
}

const decode = token => token.replace(/~/g, '.')

const exp = token => jwt.decode(token, null, true).exp


// ACTIONS

export const actions = {

  setRedirect: location => ({
    type: types.SET_REDIRECT,
    payload: location,
  }),

  signUp: ({ email, password }) => () =>
    axios({
      method: 'post',
      url: `${API_ROOT}/signup`,
      data: { email, password },
    })
      .catch(handleErrors),

  signIn: ({ email, password }) => dispatch =>
    axios({
      method: 'patch',
      url: `${API_ROOT}/signin`,
      data: { email, password },
    })
      .then(handleTokens(dispatch))
      .catch(handleErrors),

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
      .then(handleTokens(dispatch))
      .catch(handleErrors),

  fetchMessage: () => (dispatch, getState) =>
    axios({
      method: 'get',
      url: `${API_ROOT}/feature`,
      headers: { authorization: `Bearer ${getState().auth.access.token}` },
    })
      .then(response => {
        dispatch({
          type: types.FETCH_MESSAGE,
          payload: response.data.message,
        })
      })
      .catch(error => {
        if (process.env.NODE_ENV === 'development') console.dir(error)  // eslint-disable-line no-console
        if (error.response && error.response.status === 401) {
          return dispatch(actions.signOut())
        }
      }),
}

// REDUCER

export default (state = {}, { type, payload }) => {
  switch (type) {  // eslint-disable-line default-case
    case types.AUTH:
      return {
        ...state,
        authenticated: true,
        refresh: {
          token: payload.refreshToken,
          exp: exp(payload.refreshToken),
        },
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
        access: {
          token: payload.accessToken,
          exp: exp(payload.accessToken),
        },
      }
    case types.SET_REDIRECT:
      return { ...state, redirectLocation: payload }
    case types.FETCH_MESSAGE:
      return { ...state, message: payload }
  }
  return state
}
