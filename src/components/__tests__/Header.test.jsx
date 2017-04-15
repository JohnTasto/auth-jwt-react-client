/* eslint-env jest */
/* eslint-disable comma-dangle */

import React from 'react'
import { StaticRouter, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { shallow, mount } from 'enzyme'
import toJson from 'enzyme-to-json'

import createStore from '../../store'
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

  describe('Integration', () => {
    let wrapper
    let props

    beforeEach(() => {
      props = {
        authenticated: true,
        signOut: jest.fn(),
      }
      wrapper = mount(
        <Provider store={createStore()}>
          <StaticRouter location="/" context={{}} >
            <Route
              path="/"
              render={routeProps => (<Header {...routeProps} {...props} />)}
            />
          </StaticRouter>
        </Provider>
      )
    })

    test('Calls action signOut when signout link is clicked', () => {
      wrapper.find('li a[href="/"]').simulate('click')

      expect(props.signOut).toHaveBeenCalled()
    })
  })
})
