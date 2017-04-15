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

      await store.dispatch(auth.actions.signUp(user))

      expect(scope.isDone()).toBe(true)
      expect(store.getActions()).toEqual([])
    })

    test('on authentication error: throws SubmissionError("<server message>")', async () => {
      const errorMessage = 'ERROR!'
      const scope = nock(API_ROOT)
        .post('/signup', user)
        .reply(422, errorMessage)
      const store = mockStore()

      const signUpPromise = store.dispatch(auth.actions.signUp(user))

      // TODO: replace with expect().rejects in Jest 20+
      await signUpPromise.catch(error => {
        expect(error).toBeInstanceOf(SubmissionError)
        expect(error.errors._error).toEqual(errorMessage)
      })
      expect(scope.isDone()).toBe(true)
      expect(store.getActions()).toEqual([])
    })

    test('on any other error: creates action with error', async () => {
      const expectedActions = [
        { type: null, error: 'Network error' },
      ]
      const store = mockStore()

      await store.dispatch(auth.actions.signUp(user))

      expect(store.getActions()).toEqual(expectedActions)
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
      const expectedActions = [
        { type: auth.types.AUTH, refreshToken },
        { type: auth.types.REFRESH, accessToken },
      ]
      const store = mockStore()

      await store.dispatch(auth.actions.signIn(user))

      expect(scope.isDone()).toBe(true)
      expect(store.getActions()).toEqual(expectedActions)
    })

    test('on authentication error: throws SubmissionError("<server message>")', async () => {
      const errorMessage = 'ERROR!'
      const scope = nock(API_ROOT)
        .patch('/signin', user)
        .reply(401, errorMessage)
      const store = mockStore()

      const signInPromise = store.dispatch(auth.actions.signIn(user))

      // TODO: replace with expect().rejects in Jest 20+
      await signInPromise.catch(error => {
        expect(error).toBeInstanceOf(SubmissionError)
        expect(error.errors._error).toEqual(errorMessage)
      })
      expect(scope.isDone()).toBe(true)
      expect(store.getActions()).toEqual([])
    })

    test('on any other error: creates action with error', async () => {
      const expectedActions = [
        { type: null, error: 'Network error' },
      ]
      const store = mockStore()

      await store.dispatch(auth.actions.signIn(user))

      expect(store.getActions()).toEqual(expectedActions)
    })
  })


  describe('signOut()', () => {
    test('on signOut: creates UNAUTH', async () => {
      const token = '1337'
      const scope = nock(API_ROOT, {
        reqheaders: { authorization: `Bearer ${token}` },
      })
        .patch('/signout')
        .reply(200)
      const expectedActions = [{
        type: auth.types.UNAUTH,
      }]
      const store = mockStore({ auth: { refresh: { token } } })

      await store.dispatch(auth.actions.signOut())

      expect(scope.isDone()).toBe(true)
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
      const expectedActions = [
        { type: auth.types.AUTH, refreshToken },
        { type: auth.types.REFRESH, accessToken },
      ]
      const store = mockStore()

      await store.dispatch(auth.actions.verifyEmail(emailToken))

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

      const signInPromise = store.dispatch(auth.actions.verifyEmail(emailToken))

      // TODO: replace with expect().rejects in Jest 20+
      await signInPromise.catch(error => {
        expect(error).toBeInstanceOf(SubmissionError)
        expect(error.errors._error).toEqual(errorMessage)
      })
      expect(scope.isDone()).toBe(true)
      expect(store.getActions()).toEqual([])
    })

    test('on any other error: creates action with error', async () => {
      const expectedActions = [
        { type: null, error: 'Network error' },
      ]
      const store = mockStore()

      await store.dispatch(auth.actions.verifyEmail(emailToken))

      expect(store.getActions()).toEqual(expectedActions)
    })
  })


  describe('fetchMessage()', () => {
    test('on sucess: creates FETCH_MESSAGE', async () => {
      const token = '1337'
      const message = 'Hey'
      const scope = nock(API_ROOT, {
        reqheaders: { authorization: `Bearer ${token}` },
      })
        .get('/feature')
        .reply(200, { message })
      const expectedActions = [
        { type: auth.types.FETCH_MESSAGE, message },
      ]
      const store = mockStore({ auth: { access: { token } } })

      await store.dispatch(auth.actions.fetchMessage())

      expect(scope.isDone()).toBe(true)
      expect(store.getActions()).toEqual(expectedActions)
    })

    test('on authentication error: creates UNAUTH', async () => {
      const token = '1337'
      const scopeFeature = nock(API_ROOT)
        .get('/feature')
        .reply(401)
      const scopeSignOut = nock(API_ROOT, {
        reqheaders: { authorization: `Bearer ${token}` },
      })
        .patch('/signout')
        .reply(200)
      const expectedActions = [{
        type: auth.types.UNAUTH,
      }]
      const store = mockStore({ auth: { access: { token }, refresh: { token } } })

      await store.dispatch(auth.actions.fetchMessage())

      expect(scopeFeature.isDone()).toBe(true)
      expect(scopeSignOut.isDone()).toBe(true)
      expect(store.getActions()).toEqual(expectedActions)
    })
  })
})
