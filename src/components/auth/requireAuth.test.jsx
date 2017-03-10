/* eslint-env jest */

import React from 'react'
import { shallow } from 'enzyme'

import { browserHistory as history } from 'react-router'

import { requireAuth } from './requireAuth'


describe('HOC requireAuth()', () => {
  const RequireAuth = requireAuth('path')(() => <div>hello</div>)

  beforeEach(() => {
    history.push = jest.fn()
  })

  test('Redirects if not authenticated', () => {
    shallow(<RequireAuth />)
    expect(history.push.mock.calls.length).toBe(1)
  })

  test('Renders component if authenticated', () => {
    const wrapper = shallow(<RequireAuth authenticated />)
    expect(history.push.mock.calls.length).toBe(0)
    expect(wrapper.dive().text()).toEqual('hello')
  })
})
