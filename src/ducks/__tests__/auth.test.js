/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import 'babel-polyfill'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import nock from 'nock'
import httpAdapter from 'axios/lib/adapters/http'
import axios from 'axios'
import { SubmissionError } from 'redux-form'

import '../../../tools/setTestApiRoot'
import * as auth from '../auth'


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
      removeItem: jest.fn(),
    }
    nock.disableNetConnect()
  })

  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })


  describe('signUp()', () => {
    const user = {
      email: 'email',
      password: 'password',
    }

    test('on sucessful signUp: creates AUTH, sets token in localStorage', async () => {
      const token = '12345'
      const scope = nock(API_ROOT)
        .post('/signup', user)
        .reply(200, { token })
      const expectedActions = [{
        type: auth.AUTH,
      }]
      const store = mockStore()

      await store.dispatch(auth.signUp(user))

      expect(scope.isDone()).toBe(true)
      expect(store.getActions()).toEqual(expectedActions)
      expect(window.localStorage.setItem.mock.calls[0]).toEqual(['token', token])
    })

    test('on unsucessful signUp: throws SubmissionError("<server message>")', async () => {
      const errorMessage = 'ERROR!'
      const scope = nock(API_ROOT)
        .post('/signup', user)
        .reply(422, { errorMessage })
      const store = mockStore()

      const signUpPromise = store.dispatch(auth.signUp(user))

      // TODO: replace with expect().rejects in Jest 20+
      await signUpPromise.catch(error => {
        expect(error).toBeInstanceOf(SubmissionError)
        expect(error.errors._error).toEqual(errorMessage)
      })
      expect(scope.isDone()).toBe(true)
      expect(store.getActions()).toEqual([])
    })

    test('on any other error: throws SubmissionError("Network error")', async () => {
      const store = mockStore()

      const signUpPromise = store.dispatch(auth.signUp(user))

      // TODO: replace with expect().rejects in Jest 20+
      await signUpPromise.catch(error => {
        expect(error).toBeInstanceOf(SubmissionError)
        expect(error.errors._error).toEqual('Network error')
      })
      expect(store.getActions()).toEqual([])
    })
  })


  describe('signIn()', () => {
    const user = {
      email: 'email',
      password: 'password',
    }

    test('on sucessful signIn: creates AUTH, sets token in localStorage', async () => {
      const token = '12345'
      const scope = nock(API_ROOT)
        .post('/signin', user)
        .reply(200, { token })
      const expectedActions = [{
        type: auth.AUTH,
      }]
      const store = mockStore()

      await store.dispatch(auth.signIn(user))

      expect(scope.isDone()).toBe(true)
      expect(store.getActions()).toEqual(expectedActions)
      expect(window.localStorage.setItem.mock.calls[0]).toEqual(['token', token])
    })

    test('on unsucessful signIn: throws SubmissionError("Invalid credentials")', async () => {
      const scope = nock(API_ROOT)
        .post('/signin', user)
        .reply(401)
      const store = mockStore()

      const signInPromise = store.dispatch(auth.signIn(user))

      // TODO: replace with expect().rejects in Jest 20+
      await signInPromise.catch(error => {
        expect(error).toBeInstanceOf(SubmissionError)
        expect(error.errors._error).toEqual('Invalid credentials')
      })
      expect(scope.isDone()).toBe(true)
      expect(store.getActions()).toEqual([])
    })

    test('on any other error: throws SubmissionError("Network error")', async () => {
      const store = mockStore()

      const signInPromise = store.dispatch(auth.signIn(user))

      // TODO: replace with expect().rejects in Jest 20+
      await signInPromise.catch(error => {
        expect(error).toBeInstanceOf(SubmissionError)
        expect(error.errors._error).toEqual('Network error')
      })
      expect(store.getActions()).toEqual([])
    })
  })


  describe('signOut()', () => {
    test('on signOut: creates UNAUTH, removes token from localStorage', () => {
      const expectedActions = [{
        type: auth.UNAUTH,
      }]
      const store = mockStore()

      store.dispatch(auth.signOut())

      expect(store.getActions()).toEqual(expectedActions)
      expect(window.localStorage.removeItem.mock.calls[0]).toEqual(['token'])
    })
  })


  describe('fetchMessage()', () => {
    test('on sucessful fetch: creates FETCH_MESSAGE, gets token in localStorage', async () => {
      const token = '12345'
      const message = 'Hey'
      window.localStorage.getItem = jest.fn(() => token)
      const scope = nock(API_ROOT, {
        reqheaders: { authorization: `Bearer ${token}` },
      })
        .get('/feature')
        .reply(200, { message })
      const expectedActions = [{
        type: auth.FETCH_MESSAGE,
        payload: message,
      }]
      const store = mockStore()

      await store.dispatch(auth.fetchMessage())

      expect(scope.isDone()).toBe(true)
      expect(store.getActions()).toEqual(expectedActions)
      expect(window.localStorage.getItem.mock.calls[0]).toEqual(['token'])
    })

    test('on unsucessful fetch: creates UNAUTH, removes token from localStorage', async () => {
      window.localStorage.getItem = jest.fn(() => '12345')
      const scope = nock(API_ROOT)
        .get('/feature')
        .reply(401)
      const expectedActions = [{
        type: auth.UNAUTH,
      }]
      const store = mockStore()

      await store.dispatch(auth.fetchMessage())

      expect(scope.isDone()).toBe(true)
      expect(store.getActions()).toEqual(expectedActions)
      expect(window.localStorage.getItem.mock.calls[0]).toEqual(['token'])
      expect(window.localStorage.removeItem.mock.calls[0]).toEqual(['token'])
    })
  })
})
