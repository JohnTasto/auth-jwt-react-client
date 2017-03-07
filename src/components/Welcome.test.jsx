/* eslint-env jest */

import React from 'react'
import renderer from 'react-test-renderer'  // eslint-disable-line import/no-extraneous-dependencies
import Welcome from './Welcome'

describe('<Welcome />', () => {
  test('Renders correctly', () => {
    const tree = renderer.create(<Welcome />).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
