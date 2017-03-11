/* eslint-env jest */

import React from 'react'
import { Provider } from 'react-redux'
import { shallow, mount } from 'enzyme'
import toJson from 'enzyme-to-json'

import createStore from '../../store'
import * as actions from '../../ducks/auth'
import SignOut, { SignOut as SignOutComp } from './SignOut'

describe('<SignOut />', () => {
  test('Calls action signoutUser before mount', () => {
    actions.signoutUser = jest.fn(() => ({ type: '' }))
    mount(
      <Provider store={createStore()}>
        <SignOut />
      </Provider>,
    )
    expect(actions.signoutUser.mock.calls.length).toBe(1)
  })

  test('Renders a message', () => {
    const wrapper = shallow(<SignOutComp signoutUser={jest.fn()} />)
    expect(toJson(wrapper)).toMatchSnapshot()
  })
})
