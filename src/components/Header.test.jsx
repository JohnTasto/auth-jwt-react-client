/* eslint-env jest */

import React from 'react'
import renderer from 'react-test-renderer'  // eslint-disable-line import/no-extraneous-dependencies
import { Header } from './Header'

describe('<Header />', () => {
  test('Renders signin/signup links if not authenticated', () => {
    const tree = renderer.create(<Header />).toJSON()
    expect(tree).toMatchSnapshot()
  })

  test('Renders signout link if authenticated', () => {
    const tree = renderer.create(<Header authenticated />).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
