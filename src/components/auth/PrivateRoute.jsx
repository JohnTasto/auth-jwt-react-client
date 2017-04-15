/* eslint-disable indent, react/jsx-first-prop-new-line, react/jsx-closing-bracket-location */

import React from 'react'
import { connect } from 'react-redux'
import { Route, Redirect, withRouter } from 'react-router-dom'


export const PrivateRoute = ({ component: Component, signInPath, authenticated, ...rest }) => (
  <Route
    {...rest}
    render={props => (
      authenticated
        ? (<Component {...props} />)
        : (<Redirect to={{
            pathname: signInPath,
            state: { from: props.location },
          }} />)
    )}
  />
)

function mapStateToProps(state) {
  return {
    authenticated: state.auth.authenticated,
  }
}

export default withRouter(connect(mapStateToProps)(PrivateRoute))
