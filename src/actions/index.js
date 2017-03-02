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
    // Submit email/password to the server
    axios.post(`${ROOT_URL}/signin`, { email, password })
      .then(response => {
        // If request is good...
        // - Update state to indicate user is authenticated
        dispatch({ type: AUTH_USER })
        // - Save the JWT token
        localStorage.setItem('token', response.data.token)
        // - redirect to the route '/feature'
        browserHistory.push('/feature')
      })
      .catch(error => {
        console.dir(error)
        dispatch(authError(error.data ? error.data.message : error.message))
      })
  }
}

export function signupUser({ email, password }) {
  return function signupUserThunk(dispatch) {
    axios.post(`${ROOT_URL}/signup`, { email, password })
      .then(response => {
        dispatch({ type: AUTH_USER })
        localStorage.setItem('token', response.data.token)
        browserHistory.push('/feature')
      })
      .catch(error => {
        console.dir(error)
        dispatch(authError(error.data ? error.data.message : error.message))
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
  }
}
