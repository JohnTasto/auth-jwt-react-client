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

    test('on sucess: return resolved promise', async () => {
      const scope = nock(API_ROOT)
        .post('/signup', user)
        .reply(201)
      const store = mockStore()

      await store.dispatch(auth.signUp(user))

      expect(scope.isDone()).toBe(true)
      expect(store.getActions()).toEqual([])
    })

    test('on authentication error: throws SubmissionError("<server message>")', async () => {
      const errorMessage = 'ERROR!'
      const scope = nock(API_ROOT)
        .post('/signup', user)
        .reply(422, errorMessage)
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

    test('on sucess: creates AUTH', async () => {
      const refreshToken = '42'
      const accessToken = '1337'
      const scope = nock(API_ROOT)
        .patch('/signin', user)
        .reply(200, { refreshToken, accessToken })
      const expectedActions = [{
        type: auth.AUTH,
        payload: { refreshToken, accessToken },
      }]
      const store = mockStore()

      await store.dispatch(auth.signIn(user))

      expect(scope.isDone()).toBe(true)
      expect(store.getActions()).toEqual(expectedActions)
    })

    test('on authentication error: throws SubmissionError("<server message>")', async () => {
      const errorMessage = 'ERROR!'
      const scope = nock(API_ROOT)
        .patch('/signin', user)
        .reply(401, errorMessage)
      const store = mockStore()

      const signInPromise = store.dispatch(auth.signIn(user))

      // TODO: replace with expect().rejects in Jest 20+
      await signInPromise.catch(error => {
        expect(error).toBeInstanceOf(SubmissionError)
        expect(error.errors._error).toEqual(errorMessage)
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
    test('on signOut: creates UNAUTH', () => {
      const expectedActions = [{
        type: auth.UNAUTH,
      }]
      const store = mockStore()

      store.dispatch(auth.signOut())

      expect(store.getActions()).toEqual(expectedActions)
    })
  })


  describe('verifyEmail()', () => {
    const emailToken = '5555'

    test('on sucess: creates AUTH', async () => {
      const refreshToken = '42'
      const accessToken = '1337'
      const scope = nock(API_ROOT, {
        reqheaders: { authorization: `Bearer ${emailToken}` },
      })
        .patch('/verifyemail')
        .reply(200, { refreshToken, accessToken })
      const expectedActions = [{
        type: auth.AUTH,
        payload: { refreshToken, accessToken },
      }]
      const store = mockStore()

      await store.dispatch(auth.verifyEmail(emailToken))

      expect(scope.isDone()).toBe(true)
      expect(store.getActions()).toEqual(expectedActions)
    })

    test('on authentication error: throws SubmissionError("<server message>")', async () => {
      const errorMessage = 'ERROR!'
      const scope = nock(API_ROOT, {
        reqheaders: { authorization: `Bearer ${emailToken}` },
      })
        .patch('/verifyemail')
        .reply(401, errorMessage)
      const store = mockStore()

      const signInPromise = store.dispatch(auth.verifyEmail(emailToken))

      // TODO: replace with expect().rejects in Jest 20+
      await signInPromise.catch(error => {
        expect(error).toBeInstanceOf(SubmissionError)
        expect(error.errors._error).toEqual(errorMessage)
      })
      expect(scope.isDone()).toBe(true)
      expect(store.getActions()).toEqual([])
    })

    test('on any other error: throws SubmissionError("Network error")', async () => {
      const store = mockStore()

      const signInPromise = store.dispatch(auth.verifyEmail(emailToken))

      // TODO: replace with expect().rejects in Jest 20+
      await signInPromise.catch(error => {
        expect(error).toBeInstanceOf(SubmissionError)
        expect(error.errors._error).toEqual('Network error')
      })
      expect(store.getActions()).toEqual([])
    })
  })


  describe('fetchMessage()', () => {
    test('on sucess: creates FETCH_MESSAGE', async () => {
      const accessToken = '1337'
      const message = 'Hey'
      const scope = nock(API_ROOT, {
        reqheaders: { authorization: `Bearer ${accessToken}` },
      })
        .get('/feature')
        .reply(200, { message })
      const expectedActions = [{
        type: auth.FETCH_MESSAGE,
        payload: message,
      }]
      const store = mockStore({ auth: { accessToken } })

      await store.dispatch(auth.fetchMessage())

      expect(scope.isDone()).toBe(true)
      expect(store.getActions()).toEqual(expectedActions)
    })

    test('on authentication error: creates UNAUTH', async () => {
      const accessToken = '1337'
      const scope = nock(API_ROOT)
        .get('/feature')
        .reply(401)
      const expectedActions = [{
        type: auth.UNAUTH,
      }]
      const store = mockStore({ auth: { accessToken } })

      await store.dispatch(auth.fetchMessage())

      expect(scope.isDone()).toBe(true)
      expect(store.getActions()).toEqual(expectedActions)
    })
  })
})
