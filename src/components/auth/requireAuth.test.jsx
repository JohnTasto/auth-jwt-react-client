/* eslint-env jest */

import React from 'react'
import { shallow } from 'enzyme'

import { requireAuth } from './requireAuth'


describe('HOC requireAuth()', () => {
  const path = 'path'
  const text = 'text'
  const RequireAuth = requireAuth(path)(() => <div>{text}</div>)

  let push

  beforeEach(() => {
    push = jest.fn()
  })

  test('Redirects if not authenticated', () => {
    shallow(<RequireAuth push={push} />)
    expect(push.mock.calls[0][0]).toEqual(path)
  })

  test('Renders component if authenticated', () => {
    const wrapper = shallow(<RequireAuth authenticated push={push} />)
    expect(push.mock.calls.length).toBe(0)
    expect(wrapper.dive().text()).toEqual(text)
  })
})
