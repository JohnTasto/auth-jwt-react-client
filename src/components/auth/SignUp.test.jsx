/* eslint-env jest */

import React from 'react'
import { Provider } from 'react-redux'
import { shallow, mount } from 'enzyme'
import toJson from 'enzyme-to-json'

import createStore from '../../store'
import SignUp, { SignUp as SignUpComp } from './SignUp'


describe('<SignUp />', () => {
  test('Renders correctly', () => {
    const wrapper = shallow(<SignUpComp handleSubmit={jest.fn()} />)
    expect(toJson(wrapper)).toMatchSnapshot()
  })

  describe('Integration', () => {
    const emailError = 'input[name="email"] ~ .error'
    const passwordError = 'input[name="password"] ~ .error'
    const passwordConfirmError = 'input[name="passwordConfirm"] ~ .error'

    let wrapper
    let props
    let submitButton

    beforeEach(() => {
      props = {
        signupUser: jest.fn(),
      }
      wrapper = mount(
        <Provider store={createStore()}>
          <SignUp {...props} />
        </Provider>,
      )
      submitButton = wrapper.find('[action="submit"]')
    })


    test('Calls action signupUser with specified email and password', () => {
      const user = {
        email: 'e@m.ail',
        password: 'Password1',
        passwordConfirm: 'Password1',
      }

      // should have no errors, submit button disabled
      expect(wrapper.find(emailError).length).toBe(0)
      expect(wrapper.find(passwordError).length).toBe(0)
      expect(wrapper.find(passwordConfirmError).length).toBe(0)
      expect(submitButton.props().disabled).toBe(true)

      // simulate valid form fill
      wrapper.find('[name="email"]').simulate('change', { target: { value: user.email } })
      wrapper.find('[name="password"]').simulate('change', { target: { value: user.password } })
      wrapper.find('[name="passwordConfirm"]').simulate('change', { target: { value: user.passwordConfirm } })

      // should still have no errors, submit button enabled
      expect(wrapper.find(emailError).length).toBe(0)
      expect(wrapper.find(passwordError).length).toBe(0)
      expect(wrapper.find(passwordConfirmError).length).toBe(0)
      expect(submitButton.props().disabled).toBe(false)

      // simulate form submit
      wrapper.find('form').simulate('submit')

      // verify result
      expect(props.signupUser.mock.calls[0][0]).toEqual(user)
    })


    test('Displays error and disables submit button on empty input', () => {

      // should have no errors
      expect(wrapper.find(emailError).length).toBe(0)
      expect(wrapper.find(passwordError).length).toBe(0)
      expect(wrapper.find(passwordConfirmError).length).toBe(0)
      expect(submitButton.props().disabled).toBe(true)

      // simulate empty form fill
      wrapper.find('input[name="email"]').simulate('blur')
      wrapper.find('input[name="password"]').simulate('blur')
      wrapper.find('input[name="passwordConfirm"]').simulate('blur')

      // should now have errors
      expect(wrapper.find(emailError).length).toBe(1)
      expect(wrapper.find(passwordError).length).toBe(1)
      expect(wrapper.find(passwordConfirmError).length).toBe(1)
      expect(submitButton.props().disabled).toBe(true)
    })


    test('Displays error on malformed email', () => {

      // should have no error
      expect(wrapper.find(emailError).length).toBe(0)
      expect(submitButton.props().disabled).toBe(true)

      // simulate entering malformed email
      wrapper.find('input[name="email"]')
        .simulate('change', { target: { value: 'email' } })
        .simulate('blur')

      // should now have error
      expect(wrapper.find(emailError).length).toBe(1)
      expect(submitButton.props().disabled).toBe(true)
    })


    test('Displays error on malformed password', () => {

      // should have no error
      expect(wrapper.find(passwordError).length).toBe(0)
      expect(submitButton.props().disabled).toBe(true)

      // simulate entering malformed password
      wrapper.find('input[name="password"]')
        .simulate('change', { target: { value: 'password' } })
        .simulate('blur')

      // should now have error
      expect(wrapper.find(passwordError).length).toBe(1)
      expect(submitButton.props().disabled).toBe(true)
    })


    test('Displays error if passwords do not match', () => {

      // should have no error
      expect(wrapper.find(passwordConfirmError).length).toBe(0)
      expect(submitButton.props().disabled).toBe(true)

      // simulate entering valid, but non-matching passwords
      wrapper.find('input[name="password"]')
        .simulate('change', { target: { value: 'Password1' } })
        .simulate('blur')
      wrapper.find('input[name="passwordConfirm"]')
        .simulate('change', { target: { value: 'Password2' } })
        .simulate('blur')

      // should now have error
      expect(wrapper.find(passwordConfirmError).length).toBe(1)
      expect(submitButton.props().disabled).toBe(true)
    })
  })
})
