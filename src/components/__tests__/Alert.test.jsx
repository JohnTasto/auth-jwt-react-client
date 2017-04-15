/* eslint-env jest */

import React from 'react'
import { shallow } from 'enzyme'
import toJson from 'enzyme-to-json'

import { Alert } from '../Alert'


describe('<Alert />', () => {
  test('Renders alert if there is an error', () => {
    const wrapper = shallow(<Alert error="ERROR!" />)
    expect(toJson(wrapper)).toMatchSnapshot()
  })

  test('Renders nothing if there is no error', () => {
    const wrapper = shallow(<Alert />)
    expect(toJson(wrapper)).toMatchSnapshot()
  })

  test('Calls action error.clear when close button is clicked', () => {
    const props = {
      error: 'ERROR!',
      clear: jest.fn(),
    }
    const wrapper = shallow(<Alert {...props} />)

    wrapper.find('button').simulate('click')

    expect(props.clear).toHaveBeenCalled()
  })
})
