/* eslint-env jest */

import React from 'react'
import { Provider } from 'react-redux'
import { shallow, mount } from 'enzyme'
import toJson from 'enzyme-to-json'

import createStore from '../../../store'
import SignOut, { SignOut as SignOutComp } from '../SignOut'

describe('<SignOut />', () => {
  test('Calls action signOut before mount', () => {
    const props = {
      signOut: jest.fn(),
    }
    mount(
      <Provider store={createStore()}>
        <SignOut {...props} />
      </Provider>,
    )
    expect(props.signOut.mock.calls.length).toBe(1)
  })

  test('Renders a message', () => {
    const wrapper = shallow(<SignOutComp signOut={jest.fn()} />)
    expect(toJson(wrapper)).toMatchSnapshot()
  })
})
