import axios from 'axios'
import { browserHistory } from 'react-router'
import {
  AUTH_USER,
  UNAUTH_USER,
  AUTH_ERROR,
  FETCH_MESSAGE,
} from './types'

const ROOT_URL = 'http://localhost:3090'

export function authError(error) {
  return {
    type: AUTH_ERROR,
    payload: error,
  }
}

export function signinUser({ email, password }) {
  return function signinUserThunk(dispatch) {
    return axios.post(`${ROOT_URL}/signin`, { email, password })
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

export function signupUser({ email, password }) {
  return function signupUserThunk(dispatch) {
    return axios.post(`${ROOT_URL}/signup`, { email, password })
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

export function signoutUser() {
  localStorage.removeItem('token')
  return { type: UNAUTH_USER }
}

export function fetchMessage() {
  return function fetchMessageThunk(dispatch) {
    axios.get(ROOT_URL, {
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
          dispatch(signoutUser())
          browserHistory.push('/signin')
        }
      })
  }
}
