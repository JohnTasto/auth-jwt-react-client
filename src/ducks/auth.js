import axios from 'axios'
import { browserHistory } from 'react-router'

export const AUTH_USER = 'auth_user'
export const UNAUTH_USER = 'unauth_user'
export const AUTH_ERROR = 'auth_error'
export const FETCH_MESSAGE = 'fetch_message'

const API_ROOT = process.env.API_ROOT

export function authError(error) {
  return {
    type: AUTH_ERROR,
    payload: error,
  }
}

export function signInUser({ email, password }) {
  return function signInUserThunk(dispatch) {
    return axios.post(`${API_ROOT}/signin`, { email, password })
      .then(response => {
        dispatch({ type: AUTH_USER })
        localStorage.setItem('token', response.data.token)
        browserHistory.push('/feature')
      })
      .catch(error => {
        if (process.env.NODE_ENV === 'development') console.dir(error)  // eslint-disable-line no-console
        const message = error.response && error.response.status === 401
          ? 'Invalid credentials'
          : 'Network error'
        dispatch(authError(message))
      })
  }
}

export function signUpUser({ email, password }) {
  return function signUpUserThunk(dispatch) {
    return axios.post(`${API_ROOT}/signup`, { email, password })
      .then(response => {
        dispatch({ type: AUTH_USER })
        localStorage.setItem('token', response.data.token)
        browserHistory.push('/feature')
      })
      .catch(error => {
        if (process.env.NODE_ENV === 'development') console.dir(error)  // eslint-disable-line no-console
        const message = error.response && error.response.status === 422
          ? error.response.data.error
          : 'Network error'
        dispatch(authError(message))
      })
  }
}

export function signOutUser() {
  localStorage.removeItem('token')
  return { type: UNAUTH_USER }
}

export function fetchMessage() {
  return function fetchMessageThunk(dispatch) {
    return axios.get(API_ROOT, {
      headers: { authorization: localStorage.getItem('token') },
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
  }
}


export default function (state = {}, action) {
  switch (action.type) {  // eslint-disable-line default-case
    case AUTH_USER:
      return { ...state, error: '', authenticated: true }
    case UNAUTH_USER:
      return { ...state, authenticated: false }
    case AUTH_ERROR:
      return { ...state, error: action.payload }
    case FETCH_MESSAGE:
      return { ...state, message: action.payload }
  }

  return state
}
