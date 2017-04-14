/* eslint-env jest */

import React from 'react'
import { shallow } from 'enzyme'
import toJson from 'enzyme-to-json'

import { SignOut as SignOutComp } from '../SignOut'

describe('<SignOut />', () => {
  test('Calls action signOut before mount', () => {
    const props = {
      signOut: jest.fn(),
    }
    shallow(<SignOutComp {...props} />)
    expect(props.signOut.mock.calls.length).toBe(1)
  })

  test('Renders a message', () => {
    const wrapper = shallow(<SignOutComp signOut={jest.fn()} />)
    expect(toJson(wrapper)).toMatchSnapshot()
  })
})
