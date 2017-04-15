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
      refreshToken,
    })
  }
  dispatch({
    type: types.REFRESH,
    accessToken,
  })
}

const handleErrors = dispatch => error => {
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
  if (error.response) {
    if (error.response.status === 401 || error.response.status === 422) {
      throw new SubmissionError({ _error: error.response.data })
    }
  }
  dispatch({ type: null, error: 'Network error' })
}

const decode = token => token.replace(/~/g, '.')

const exp = token => jwt.decode(token, null, true).exp


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
      .catch(handleErrors(dispatch)),

  signIn: ({ email, password }) => dispatch =>
    axios({
      method: 'patch',
      url: `${API_ROOT}/signin`,
      data: { email, password },
    })
      .then(handleTokens(dispatch))
      .catch(handleErrors(dispatch)),

  signOut: () => (dispatch, getState) =>
    axios({
      method: 'patch',
      url: `${API_ROOT}/signout`,
      headers: { authorization: `Bearer ${getState().auth.refresh.token}` },
    })
      .then(() => dispatch({ type: types.UNAUTH }))
      .catch(() => dispatch({ type: types.UNAUTH })),

  // refresh: () => (dispatch, getState) =>
  //   axios({
  //     method: 'get',
  //     url: `${API_ROOT}/refresh`,
  //     headers: { authorization: `Bearer ${getState().auth.refresh.token}` },
  //   })
  //     .then(handleTokens(dispatch))
  //     .catch(error => {
  //       if (process.env.NODE_ENV === 'development') console.dir(error)  // eslint-disable-line no-console
  //       if (error.response && error.response.status === 401) {
  //         return dispatch(signOut())
  //       } else {

  //       }
  //     }),

  verifyEmail: token => dispatch =>
    axios({
      method: 'patch',
      url: `${API_ROOT}/verifyemail`,
      headers: { authorization: `Bearer ${decode(token)}` },
    })
      .then(handleTokens(dispatch))
      .catch(handleErrors(dispatch)),

  fetchMessage: () => (dispatch, getState) =>
    axios({
      method: 'get',
      url: `${API_ROOT}/feature`,
      headers: { authorization: `Bearer ${getState().auth.access.token}` },
    })
      .then(response => {
        dispatch({
          type: types.FETCH_MESSAGE,
          message: response.data.message,
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

export default (state = {}, action) => {
  const {
    type,
    refreshToken,
    accessToken,
    redirectLocation,
    message,
  } = action

  switch (type) {  // eslint-disable-line default-case
    case types.AUTH:
      return {
        ...state,
        authenticated: true,
        refresh: {
          token: refreshToken,
          exp: exp(refreshToken),
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
          token: accessToken,
          exp: exp(accessToken),
        },
      }
    case types.SET_REDIRECT:
      return { ...state, redirectLocation }
    case types.FETCH_MESSAGE:
      return { ...state, message }
  }
  return state
}
