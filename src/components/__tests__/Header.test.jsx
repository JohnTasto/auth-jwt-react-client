/* eslint-env jest */

import React from 'react'
import { shallow } from 'enzyme'
import toJson from 'enzyme-to-json'
import { Header } from '../Header'

describe('<Header />', () => {
  test('Renders signin/signup links if not authenticated', () => {
    const wrapper = shallow(<Header />)
    expect(toJson(wrapper)).toMatchSnapshot()
  })

  test('Renders signout link if authenticated', () => {
    const wrapper = shallow(<Header authenticated />)
    expect(toJson(wrapper)).toMatchSnapshot()
  })
})
