/* eslint-env jest */

import React from 'react'
import { Provider } from 'react-redux'
import { shallow, mount } from 'enzyme'
import toJson from 'enzyme-to-json'

import createStore from '../../store'
import SignIn, { SignIn as SignInComp } from './SignIn'


describe('<SignOut />', () => {
  test('Renders correctly', () => {
    const wrapper = shallow(<SignInComp handleSubmit={jest.fn()} />)
    expect(toJson(wrapper)).toMatchSnapshot()
  })

  describe('Integration', () => {
    let wrapper
    let props

    beforeEach(() => {
      props = {
        signinUser: jest.fn(),
      }
      wrapper = mount(
        <Provider store={createStore()}>
          <SignIn {...props} />
        </Provider>,
      )
    })


    test('Calls action signinUser with specified email and password', () => {
      const user = {
        email: 'e@m.ail',
        password: 'password',
      }
      const emailError = 'input[name="email"] ~ .error'
      const passwordError = 'input[name="password"] ~ .error'
      const submitButton = wrapper.find('[action="submit"]')

      // should have no errors
      expect(wrapper.find(emailError).length).toBe(0)
      expect(wrapper.find(passwordError).length).toBe(0)
      expect(submitButton.props().disabled).toBe(true)

      // simulate valid form fill
      wrapper.find('[name="email"]').simulate('change', { target: { value: user.email } })
      wrapper.find('[name="password"]').simulate('change', { target: { value: user.password } })

      // should still have no errors
      expect(wrapper.find(emailError).length).toBe(0)
      expect(wrapper.find(passwordError).length).toBe(0)
      expect(submitButton.props().disabled).toBe(false)

      // simulate form submit
      wrapper.find('form').simulate('submit')

      // verify result
      expect(props.signinUser.mock.calls[0][0]).toEqual(user)
    })


    test('Displays error and disables submit button on empty input', () => {
      const emailError = 'input[name="email"] ~ .error'
      const passwordError = 'input[name="password"] ~ .error'

      // should have no errors
      expect(wrapper.find(emailError).length).toBe(0)
      expect(wrapper.find(passwordError).length).toBe(0)
      expect(wrapper.find('[action="submit"]').props().disabled).toBe(true)

      // simulate empty form fill
      wrapper.find('input[name="email"]').simulate('blur')
      wrapper.find('input[name="password"]').simulate('blur')

      // should now have errors
      expect(wrapper.find(emailError).length).toBe(1)
      expect(wrapper.find(passwordError).length).toBe(1)
      expect(wrapper.find('[action="submit"]').props().disabled).toBe(true)
    })


    test('Displays error on malformed email', () => {
      const emailError = 'input[name="email"] ~ .error'

      // should have no error
      expect(wrapper.find(emailError).length).toBe(0)

      // simulate entering malformed email
      wrapper.find('input[name="email"]')
        .simulate('change', { target: { value: 'email' } })
        .simulate('blur')

      // should now have error
      expect(wrapper.find(emailError).length).toBe(1)
    })
  })
})
