/* eslint-env jest */
/* eslint-disable comma-dangle */

import React from 'react'
import { StaticRouter, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { shallow, mount } from 'enzyme'
import toJson from 'enzyme-to-json'

import createStore from '../../../store'
import SignIn, { SignIn as SignInComp } from '../SignIn'


describe('<SignIn />', () => {

  test('Renders form if not authenticated', () => {
    const wrapper = shallow(
      <SignInComp
        handleSubmit={jest.fn()}
        setRedirect={jest.fn()}
        location={{}}
      />
    )
    expect(toJson(wrapper)).toMatchSnapshot()
  })

  test('Renders sign out button if authenticated', () => {
    const wrapper = shallow(
      <SignInComp
        authenticated
        handleSubmit={jest.fn()}
        setRedirect={jest.fn()}
        location={{}}
      />
    )
    expect(toJson(wrapper)).toMatchSnapshot()
  })


  describe('Integration', () => {
    const emailError = 'input[name="email"] ~ .error'
    const passwordError = 'input[name="password"] ~ .error'

    let wrapper
    let props
    let submitButton

    beforeEach(() => {
      props = {
        signIn: jest.fn(),
      }
      wrapper = mount(
        <Provider store={createStore()}>
          <StaticRouter location="/signin" context={{}} >
            <Route
              path="/signin"
              render={routeProps => (<SignIn {...routeProps} {...props} />)}
            />
          </StaticRouter>
        </Provider>,
      )
      submitButton = wrapper.find('[action="submit"]')
    })


    test('Calls action signIn with specified email and password', () => {
      const user = {
        email: 'e@m.ail',
        password: 'password',
      }

      // should have no errors, submit button disabled
      expect(wrapper.find(emailError).length).toBe(0)
      expect(wrapper.find(passwordError).length).toBe(0)
      expect(submitButton.props().disabled).toBe(true)

      // simulate valid form fill
      wrapper.find('[name="email"]').simulate('change', { target: { value: user.email } })
      wrapper.find('[name="password"]').simulate('change', { target: { value: user.password } })

      // should still have no errors, submit button enabled
      expect(wrapper.find(emailError).length).toBe(0)
      expect(wrapper.find(passwordError).length).toBe(0)
      expect(submitButton.props().disabled).toBe(false)

      // simulate form submit
      wrapper.find('form').simulate('submit')

      // verify result
      expect(props.signIn.mock.calls[0][0]).toEqual(user)
    })


    test('Displays error and disables submit button on empty input', () => {

      // should have no errors
      expect(wrapper.find(emailError).length).toBe(0)
      expect(wrapper.find(passwordError).length).toBe(0)
      expect(submitButton.props().disabled).toBe(true)

      // simulate empty form fill
      wrapper.find('input[name="email"]').simulate('blur')
      wrapper.find('input[name="password"]').simulate('blur')

      // should now have errors
      expect(wrapper.find(emailError).length).toBe(1)
      expect(wrapper.find(passwordError).length).toBe(1)
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
  })
})
