/* eslint-env jest */
/* eslint-disable comma-dangle */

import React from 'react'
import { StaticRouter, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { shallow, mount } from 'enzyme'
import toJson from 'enzyme-to-json'

import createStore from '../../../store'
import SignUp, { SignUp as SignUpComp } from '../SignUp'


describe('<SignUp />', () => {

  test('Renders form if not authenticated', () => {
    const wrapper = shallow(
      <SignUpComp
        handleSubmit={jest.fn()}
        setAuthRedirect={jest.fn()}
        location={{}}
      />
    )
    expect(toJson(wrapper)).toMatchSnapshot()
  })

  test('Renders sign out button if authenticated', () => {
    const wrapper = shallow(
      <SignUpComp
        authenticated
        handleSubmit={jest.fn()}
        setAuthRedirect={jest.fn()}
        location={{}}
      />
    )
    expect(toJson(wrapper)).toMatchSnapshot()
  })

  test('Renders success message if submit succeeded', () => {
    const wrapper = shallow(
      <SignUpComp
        submitSucceeded
        handleSubmit={jest.fn()}
        setAuthRedirect={jest.fn()}
        location={{}}
      />
    )
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
        signUp: jest.fn(),
      }
      wrapper = mount(
        <Provider store={createStore()}>
          <StaticRouter location="/signup" context={{}} >
            <Route
              path="/signup"
              render={routeProps => (<SignUp {...routeProps} {...props} />)}
            />
          </StaticRouter>
        </Provider>
      )
      submitButton = wrapper.find('[action="submit"]')
    })


    test('Calls action signUp with specified email and password', () => {
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
      expect(props.signUp.mock.calls[0][0]).toEqual(user)
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
