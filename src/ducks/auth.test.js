/* eslint-env jest */

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import nock from 'nock'
import httpAdapter from 'axios/lib/adapters/http'
import axios from 'axios'

import { browserHistory } from 'react-router'

import '../../tools/setTestApiRoot'
import * as auth from './auth'


const mockStore = configureMockStore([thunk])

const API_ROOT = process.env.API_ROOT

// magic incantation that lets axios work with nock
// an alternitive to mock would be moxios, but it only mocks axios, which would
// make it harder to swap axios out with something like fetch in the future
axios.defaults.host = API_ROOT
axios.defaults.adapter = httpAdapter


describe('auth actions', () => {
  beforeEach(() => {
    window.localStorage = {
      setItem: jest.fn(),
    }
    browserHistory.push = jest.fn()
    nock.disableNetConnect()
  })

  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })

  describe('signinUser()', () => {
    const user = {
      email: 'email',
      password: 'password',
    }
    const token = '12345'

    test('on sucessful login: creates AUTH_USER, sets token in localStorage, and redirects', () => {
      const scope = nock(API_ROOT)
        .post('/signin', user)
        .reply(200, { token })
      const expectedActions = [{
        type: auth.AUTH_USER,
      }]
      const store = mockStore()

      return store.dispatch(auth.signinUser(user))
        .then(() => {
          expect(scope.isDone()).toBe(true)
          expect(store.getActions()).toEqual(expectedActions)
          expect(window.localStorage.setItem.mock.calls[0]).toEqual(['token', token])
          expect(browserHistory.push.mock.calls.length).toBe(1)
        })
    })

    test('on unsucessful login: creates AUTH_ERROR - Invalid credentials', () => {
      const scope = nock(API_ROOT)
        .post('/signin', user)
        .reply(401, { token })
      const expectedActions = [{
        type: auth.AUTH_ERROR,
        payload: 'Invalid credentials',
      }]
      const store = mockStore()

      return store.dispatch(auth.signinUser(user))
        .then(() => {
          expect(scope.isDone()).toBe(true)
          expect(store.getActions()).toEqual(expectedActions)
        })
    })

    test('on any other error: creates AUTH_ERROR - Network error', () => {
      const expectedActions = [{
        type: auth.AUTH_ERROR,
        payload: 'Network error',
      }]
      const store = mockStore()

      return store.dispatch(auth.signinUser(user))
        .then(() => {
          expect(store.getActions()).toEqual(expectedActions)
        })
    })
  })
})
