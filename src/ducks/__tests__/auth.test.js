/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import 'babel-polyfill'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import nock from 'nock'
import httpAdapter from 'axios/lib/adapters/http'
import axios from 'axios'
import moment from 'moment'
import { SubmissionError } from 'redux-form'

import '../../../tools/setTestApiRoot'
import * as auth from '../auth'
import { AuthenticationError, NetworkError } from '../../helpers/error'


const mockStore = configureMockStore([thunk])

const API_ROOT = process.env.API_ROOT

// magic incantation that lets axios work with nock
// an alternitive to mock would be moxios, but it only mocks axios, which would
// make it harder to swap axios out with something like fetch in the future
axios.defaults.host = API_ROOT
axios.defaults.adapter = httpAdapter


const now = () => moment().unix()

const refreshToken = '42'
const accessToken = '1337'
const emailToken = '5555'
const time = 880
const errorMessage = 'ERROR!'
const successMessage = 'SUCCESS!'
const functionOutput = 'OUTPUT!'


describe('auth handlers', () => {

  const mockAction = (handler, data) => dispatch =>
    Promise.resolve().then(() => handler(dispatch)(data))

  describe('handle.tokens()', () => {
    let store

    beforeEach(() => {
      store = mockStore({})
    })

    test('if refreshToken: create AUTH', async () => {
      await store.dispatch(mockAction(
        auth.handle.tokens,
        { data: { refreshToken, accessToken, time } },
      ))

      expect(store.getActions()).toEqual([
        { type: auth.types.AUTH, refreshToken, accessToken, time },
      ])
    })

    test('if not refreshToken: create REFRESH', async () => {
      await store.dispatch(mockAction(
        auth.handle.tokens,
        { data: { accessToken, time } },
      ))

      expect(store.getActions()).toEqual([
        { type: auth.types.REFRESH, accessToken, time },
      ])
    })
  })

  describe('handle.submissionErrors()', () => {
    const message = 'MESSAGE!'
    let store

    beforeEach(() => {
      store = mockStore({})
    })

    test('on 401: throw SubmissionError', async () => {
      await store.dispatch(mockAction(
        auth.handle.submissionErrors,
        { response: { status: 401, data: message } },
      )).catch(error => {
        expect(error).toBeInstanceOf(SubmissionError)
        expect(error.errors._error).toBe(message)
      })
      expect(store.getActions()).toEqual([])
    })

    test('on 422: throw SubmissionError', async () => {
      await store.dispatch(mockAction(
        auth.handle.submissionErrors,
        { response: { status: 401, data: message } },
      )).catch(error => {
        expect(error).toBeInstanceOf(SubmissionError)
        expect(error.errors._error).toBe(message)
      })
      expect(store.getActions()).toEqual([])
    })

    test('on any other error: create action with error', async () => {
      await store.dispatch(mockAction(
        auth.handle.submissionErrors,
        {},
      ))

      expect(store.getActions()).toEqual([
        { type: null, error: 'Network error' },
      ])
    })
  })

  describe('handle.authenticationErrors()', () => {
    let unmockedSignOut
    let store

    beforeEach(() => {
      unmockedSignOut = auth.actions.signOut
      auth.actions.signOut = jest.fn(() => () => 0)
      store = mockStore({})
    })

    afterEach(() => {
      auth.actions.signOut = unmockedSignOut
    })

    test('on AuthenticationError: dispatch signout()', async () => {
      await store.dispatch(mockAction(
        auth.handle.authenticationErrors,
        new AuthenticationError(),
      ))

      expect(auth.actions.signOut).toHaveBeenCalled()
      expect(store.getActions()).toEqual([])
    })

    test('on 401: dispatch signout()', async () => {
      await store.dispatch(mockAction(
        auth.handle.authenticationErrors,
        { response: { status: 401 } },
      ))

      expect(auth.actions.signOut).toHaveBeenCalled()
      expect(store.getActions()).toEqual([])
    })

    test('on any other input: creates action with error', async () => {
      await store.dispatch(mockAction(
        auth.handle.authenticationErrors,
        {},
      ))

      expect(auth.actions.signOut).not.toHaveBeenCalled()
      expect(store.getActions()).toEqual([
        { type: null, error: 'Network error' },
      ])
    })
  })
})


describe('auth actions', () => {
  const user = {
    email: 'email',
    password: 'password',
  }

  let unmockedHandleTokens
  let unmockedHandleSubmissionErrors
  let unmockedHandleAuthenticationErrors

  let innerHandler

  beforeEach(() => {
    nock.disableNetConnect()

    unmockedHandleTokens = auth.handle.tokens
    unmockedHandleSubmissionErrors = auth.handle.submissionErrors
    unmockedHandleAuthenticationErrors = auth.handle.authenticationErrors

    innerHandler = jest.fn(() => functionOutput)
  })

  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()

    auth.handle.tokens = unmockedHandleTokens
    auth.handle.submissionErrors = unmockedHandleSubmissionErrors
    auth.handle.authenticationErrors = unmockedHandleAuthenticationErrors
  })


  describe('signUp()', () => {
    let store

    beforeEach(() => {
      store = mockStore()
    })

    test('on sucess: returns resolved promise', async () => {
      const scope = nock(API_ROOT)
        .post('/signup', user)
        .reply(201)

      await store.dispatch(auth.actions.signUp(user))

      expect(scope.isDone()).toBe(true)
      expect(store.getActions()).toEqual([])
    })

    test('on error: calls handle.submissionErrors() with error', async () => {
      auth.handle.submissionErrors = () => innerHandler
      const scope = nock(API_ROOT)
        .post('/signup', user)
        .reply(422, errorMessage)

      // TODO: replace with expect().rejects in Jest 20+
      await store.dispatch(auth.actions.signUp(user)).then(result => {
        expect(result).toBe(functionOutput)
      })
      expect(innerHandler.mock.calls[0][0].response.data).toBe(errorMessage)
      expect(scope.isDone()).toBe(true)
      expect(store.getActions()).toEqual([])
    })
  })


  describe('signIn()', () => {
    let store

    beforeEach(() => {
      store = mockStore()
    })

    test('on success: calls handle.tokens() with tokens', async () => {
      auth.handle.tokens = () => innerHandler
      const scope = nock(API_ROOT)
        .patch('/signin', user)
        .reply(200, successMessage)

      // TODO: replace with expect().rejects in Jest 20+
      await store.dispatch(auth.actions.signIn(user)).then(result => {
        expect(result).toBe(functionOutput)
      })
      expect(innerHandler.mock.calls[0][0].data).toBe(successMessage)
      expect(scope.isDone()).toBe(true)
      expect(store.getActions()).toEqual([])
    })

    test('on error: calls handle.submissionErrors() with error', async () => {
      auth.handle.submissionErrors = () => innerHandler
      const scope = nock(API_ROOT)
        .patch('/signin', user)
        .reply(401, errorMessage)

      // TODO: replace with expect().rejects in Jest 20+
      await store.dispatch(auth.actions.signIn(user)).then(result => {
        expect(result).toBe(functionOutput)
      })
      expect(innerHandler.mock.calls[0][0].response.data).toBe(errorMessage)
      expect(scope.isDone()).toBe(true)
      expect(store.getActions()).toEqual([])
    })
  })


  describe('signOut()', () => {
    test('on signOut: creates UNAUTH', async () => {
      const store = mockStore({ auth: { refresh: { token: refreshToken } } })
      const scope = nock(API_ROOT, {
        reqheaders: { authorization: `Bearer ${refreshToken}` },
      })
        .patch('/signout')
        .reply(200)

      await store.dispatch(auth.actions.signOut())

      expect(scope.isDone()).toBe(true)
      expect(store.getActions()).toEqual([
        { type: auth.types.UNAUTH },
      ])
    })
  })


  describe('verifyEmail()', () => {
    let store

    beforeEach(() => {
      store = mockStore()
    })

    test('on success: calls handle.tokens() with tokens', async () => {
      auth.handle.tokens = () => innerHandler
      const scope = nock(API_ROOT, {
        reqheaders: { authorization: `Bearer ${emailToken}` },
      })
        .patch('/verifyemail')
        .reply(200, successMessage)

      // TODO: replace with expect().rejects in Jest 20+
      await store.dispatch(auth.actions.verifyEmail(emailToken)).then(result => {
        expect(result).toBe(functionOutput)
      })
      expect(innerHandler.mock.calls[0][0].data).toBe(successMessage)
      expect(scope.isDone()).toBe(true)
      expect(store.getActions()).toEqual([])
    })

    test('on error: calls handle.submissionErrors() with error', async () => {
      auth.handle.submissionErrors = () => innerHandler
      const scope = nock(API_ROOT)
        .patch('/verifyemail')
        .reply(401, errorMessage)

      // TODO: replace with expect().rejects in Jest 20+
      await store.dispatch(auth.actions.verifyEmail(emailToken)).then(result => {
        expect(result).toBe(functionOutput)
      })
      expect(innerHandler.mock.calls[0][0].response.data).toBe(errorMessage)
      expect(scope.isDone()).toBe(true)
      expect(store.getActions()).toEqual([])
    })
  })


  describe('refresh()', () => {
    test('on success: calls handle.tokens() with tokens', async () => {
      auth.handle.tokens = () => innerHandler
      const store = mockStore({ auth: { refresh: { token: refreshToken } } })
      const scope = nock(API_ROOT, {
        reqheaders: { authorization: `Bearer ${refreshToken}` },
      })
        .get('/refresh')
        .reply(200, successMessage)

      // TODO: replace with expect().rejects in Jest 20+
      await store.dispatch(auth.actions.refresh()).then(result => {
        expect(result).toBe(functionOutput)
      })
      expect(innerHandler.mock.calls[0][0].data).toBe(successMessage)
      expect(scope.isDone()).toBe(true)
      expect(store.getActions()).toEqual([])
    })

    test('on authentication error: throws AuthenticationError', async () => {
      const store = mockStore({ auth: { refresh: { refreshToken } } })
      const scope = nock(API_ROOT)
        .get('/refresh')
        .reply(401)

      // TODO: replace with expect().rejects in Jest 20+
      await store.dispatch(auth.actions.refresh()).catch(error => {
        expect(error).toBeInstanceOf(AuthenticationError)
      })
      expect(scope.isDone()).toBe(true)
      expect(store.getActions()).toEqual([])
    })

    test('on any other error: throws NetworkError', async () => {
      const store = mockStore({ auth: { refresh: { refreshToken } } })

      // TODO: replace with expect().rejects in Jest 20+
      await store.dispatch(auth.actions.refresh()).catch(error => {
        expect(error).toBeInstanceOf(NetworkError)
      })
      expect(store.getActions()).toEqual([])
    })
  })


  describe('verifyTokens()', () => {
    test('on unexpired access token: returns resolved promise', async () => {
      const store = mockStore({
        auth: {
          timeOffset: 0,
          refresh: { exp: 0 },
          access: { exp: now() + 600 },
        },
      })

      await store.dispatch(auth.actions.verifyTokens())
    })

    test('on expired access unexpired refresh token: dispatches and returns refresh()', async () => {
      const unmockedRefresh = auth.actions.refresh

      auth.actions.refresh = jest.fn(() => () => Promise.resolve(functionOutput))
      const store = mockStore({
        auth: {
          timeOffset: 0,
          refresh: { exp: now() + 600 },
          access: { exp: now() - 600 },
        },
      })

      // TODO: replace with expect().rejects in Jest 20+
      await store.dispatch(auth.actions.verifyTokens()).then(result => {
        expect(result).toBe(functionOutput)
      })
      expect(auth.actions.refresh).toHaveBeenCalled()
      expect(store.getActions()).toEqual([])

      auth.actions.refresh = unmockedRefresh
    })

    test('on expired access token and expired refresh token: rejects AuthenticationError', async () => {
      const store = mockStore({
        timeOffset: 0,
        auth: {
          refresh: { exp: now() - 600 },
          access: { exp: now() - 600 },
        },
      })

      // TODO: replace with expect().rejects in Jest 20+
      await store.dispatch(auth.actions.verifyTokens()).catch(error => {
        expect(error).toBeInstanceOf(AuthenticationError)
      })
      expect(store.getActions()).toEqual([])
    })
  })


  describe('fetchMessage()', () => {
    let unmockedVerifyTokens
    let store

    beforeEach(() => {
      unmockedVerifyTokens = auth.actions.verifyTokens
      auth.actions.verifyTokens = jest.fn(() => () => Promise.resolve())
      store = mockStore({ auth: { access: { token: accessToken } } })
    })

    afterEach(() => {
      auth.actions.verifyTokens = unmockedVerifyTokens
    })

    test('on sucess: creates FETCH_MESSAGE', async () => {
      const scope = nock(API_ROOT, {
        reqheaders: { authorization: `Bearer ${accessToken}` },
      })
        .get('/feature')
        .reply(200, { message: successMessage })

      await store.dispatch(auth.actions.fetchMessage())

      expect(scope.isDone()).toBe(true)
      expect(store.getActions()).toEqual([
        { type: auth.types.FETCH_MESSAGE, message: successMessage },
      ])
    })

    test('on error: calls handle.authenticationErrors() with error', async () => {
      auth.handle.authenticationErrors = () => innerHandler
      const scope = nock(API_ROOT)
        .get('/feature')
        .reply(401, errorMessage)

      // TODO: replace with expect().rejects in Jest 20+
      await store.dispatch(auth.actions.fetchMessage()).then(result => {
        expect(result).toBe(functionOutput)
      })
      expect(innerHandler.mock.calls[0][0].response.data).toBe(errorMessage)
      expect(scope.isDone()).toBe(true)
      expect(store.getActions()).toEqual([])
    })
  })
})
