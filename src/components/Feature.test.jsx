/* eslint-env jest */

import React from 'react'
import { mount } from 'enzyme'
import { Feature } from './Feature'

describe('<Feature />', () => {
  const props = {
    fetchMessage: jest.fn(),
    message: 'hello',
  }

  test('Calls action fetchMessage before mount', () => {
    mount(<Feature {...props} />)
    expect(props.fetchMessage.mock.calls.length).toBe(1)
  })

  test('Renders a message', () => {
    const wrapper = mount(<Feature {...props} />)
    expect(wrapper.text()).toEqual('hello')
  })
})
