/* eslint-env jest */

import React from 'react'
import { Provider } from 'react-redux'
import { shallow, mount } from 'enzyme'
import toJson from 'enzyme-to-json'

import createStore from '../../store'
import SignOut, { SignOut as SignOutComp } from './SignOut'

describe('<SignOut />', () => {
  test('Calls action signoutUser before mount', () => {
    const props = {
      signoutUser: jest.fn(),
    }
    mount(
      <Provider store={createStore()}>
        <SignOut {...props} />
      </Provider>,
    )
    expect(props.signoutUser.mock.calls.length).toBe(1)
  })

  test('Renders a message', () => {
    const wrapper = shallow(<SignOutComp signoutUser={jest.fn()} />)
    expect(toJson(wrapper)).toMatchSnapshot()
  })
})
