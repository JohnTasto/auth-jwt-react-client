/* eslint-env jest */
/* eslint-disable comma-dangle */

import React from 'react'
import { shallow } from 'enzyme'
import toJson from 'enzyme-to-json'

import { VerifyEmail as VerifyEmailComp } from '../VerifyEmail'


describe('<VerifyEmail />', () => {

  test('Renders message indicating email verification is in progress', () => {
    const props = {
      setRedirect: jest.fn(),
      verifyEmail: jest.fn(() => Promise.resolve()),
      match: { params: { token: '42' } }
    }
    const wrapper = shallow(<VerifyEmailComp {...props} />)
    expect(toJson(wrapper)).toMatchSnapshot()
  })

  test('Calls action auth.verifyEmail with token on mount', () => {
    const props = {
      setRedirect: jest.fn(),
      verifyEmail: jest.fn(() => Promise.resolve()),
      match: { params: { token: '42' } }
    }
    shallow(<VerifyEmailComp {...props} />)
    expect(props.verifyEmail).toHaveBeenCalledWith(props.match.params.token)
  })

  test('Renders redirect message if authentication state changes to true', () => {
    const props = {
      setRedirect: jest.fn(),
      verifyEmail: jest.fn(() => Promise.resolve()),
      match: { params: { token: '42' } }
    }
    const wrapper = shallow(<VerifyEmailComp {...props} />)
    wrapper.setProps({ authenticated: true })
    expect(toJson(wrapper)).toMatchSnapshot()
  })

  test('Renders message indicating email has already been verified if authenticated', () => {
    const wrapper = shallow(
      <VerifyEmailComp
        authenticated
        setRedirect={jest.fn()}
      />
    )
    expect(toJson(wrapper)).toMatchSnapshot()
  })

  test('Calls action auth.setRedirect if no location has been set', () => {
    const props = {
      authenticated: true,
      setRedirect: jest.fn(),
    }
    shallow(<VerifyEmailComp {...props} />)
    expect(props.setRedirect).toHaveBeenCalled()
  })

  // it would be better to have verifyEmail: jest.fn(() => Promise.reject(...)
  // but I couldn't figure out how to get enzyme to wait for the promise
  test('Renders error on error', () => {
    const props = {
      setRedirect: jest.fn(),
      verifyEmail: jest.fn(() => Promise.resolve()),
      match: { params: { token: '42' } }
    }
    const wrapper = shallow(<VerifyEmailComp {...props} />)
    wrapper.setState({ error: 'ERROR!' })
    expect(toJson(wrapper)).toMatchSnapshot()
  })
})
