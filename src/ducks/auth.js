import axios from 'axios'
import { SubmissionError } from 'redux-form'


const API_ROOT = process.env.API_ROOT


export const AUTH = 'auth'
export const UNAUTH = 'unauth'
export const SET_AUTH_REDIRECT = 'set auth redirect'

export const FETCH_MESSAGE = 'fetch message'


export const setAuthRedirect = location => ({
  type: SET_AUTH_REDIRECT,
  payload: location,
})

export const signUp = ({ email, password }) => dispatch =>
  axios.post(`${API_ROOT}/signup`, { email, password })
    .then(response => {
      localStorage.setItem('token', response.data.token)
      dispatch({ type: AUTH })
    })
    .catch(error => {
      if (process.env.NODE_ENV === 'development') console.dir(error)  // eslint-disable-line no-console
      const message = error.response && error.response.status === 422
        ? error.response.data.error || error.response.data.errorMessage
        : 'Network error'
      throw new SubmissionError({ _error: message })
    })

export const signIn = ({ email, password }) => dispatch =>
  axios.post(`${API_ROOT}/signin`, { email, password })
    .then(response => {
      localStorage.setItem('token', response.data.token)
      dispatch({ type: AUTH })
    })
    .catch(error => {
      if (process.env.NODE_ENV === 'development') console.dir(error)  // eslint-disable-line no-console
      const message = error.response && error.response.status === 401
        ? 'Invalid credentials'
        : 'Network error'
      throw new SubmissionError({ _error: message })
    })

export const signOut = () => {
  localStorage.removeItem('token')
  return { type: UNAUTH }
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
        dispatch(signOut())
      }
    })


export default (state = {}, { type, payload }) => {
  switch (type) {  // eslint-disable-line default-case
    case AUTH:
      return { ...state, authenticated: true }
    case UNAUTH:
      return { ...state, authenticated: false }
    case SET_AUTH_REDIRECT:
      return { ...state, redirectLocation: payload }
    case FETCH_MESSAGE:
      return { ...state, message: payload }
  }
  return state
}
