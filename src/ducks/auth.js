import axios from 'axios'
import { SubmissionError } from 'redux-form'


const API_ROOT = process.env.API_ROOT


export const AUTH_USER = 'auth_user'
export const UNAUTH_USER = 'unauth_user'
export const AUTH_ERROR = 'auth_error'
export const AUTH_CLEAR_ERROR = 'auth_clear_error'
export const SET_AUTH_REDIRECT = 'set_auth_redirect'
export const FETCH_MESSAGE = 'fetch_message'


export const setAuthRedirect = location => ({
  type: SET_AUTH_REDIRECT,
  payload: location,
})

export const signUpUser = ({ email, password }) => dispatch =>
  axios.post(`${API_ROOT}/signup`, { email, password })
    .then(response => {
      localStorage.setItem('token', response.data.token)
      dispatch({ type: AUTH_USER })
    })
    .catch(error => {
      if (process.env.NODE_ENV === 'development') console.dir(error)  // eslint-disable-line no-console
      const message = error.response && error.response.status === 422
        ? error.response.data.error || error.response.data.errorMessage
        : 'Network error'
      throw new SubmissionError({ _error: message })
    })

export const signInUser = ({ email, password }) => dispatch =>
  axios.post(`${API_ROOT}/signin`, { email, password })
    .then(response => {
      localStorage.setItem('token', response.data.token)
      dispatch({ type: AUTH_USER })
    })
    .catch(error => {
      if (process.env.NODE_ENV === 'development') console.dir(error)  // eslint-disable-line no-console
      const message = error.response && error.response.status === 401
        ? 'Invalid credentials'
        : 'Network error'
      throw new SubmissionError({ _error: message })
    })

export const signOutUser = () => {
  localStorage.removeItem('token')
  return { type: UNAUTH_USER }
}

export const fetchMessage = () => dispatch =>
  axios.get(`${API_ROOT}/feature`, {
    headers: { authorization: `Bearer ${localStorage.getItem('token')}` },
  })
    .then(response => {
      dispatch({
        type: FETCH_MESSAGE,
        payload: response.data.message,
      })
    })
    .catch(error => {
      if (process.env.NODE_ENV === 'development') console.dir(error)  // eslint-disable-line no-console
      if (error.response && error.response.status === 401) {
        dispatch(signOutUser())
      }
    })


export default (state = {}, { type, payload }) => {
  switch (type) {  // eslint-disable-line default-case
    case AUTH_USER:
      return { ...state, authenticated: true }
    case UNAUTH_USER:
      return { ...state, authenticated: false }
    case SET_AUTH_REDIRECT:
      return { ...state, redirectLocation: payload }
    case FETCH_MESSAGE:
      return { ...state, message: payload }
  }
  return state
}
