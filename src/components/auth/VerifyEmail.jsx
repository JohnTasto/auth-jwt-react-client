import React, { Component } from 'react'
import { connect } from 'react-redux'
import { actions as authActions } from '../../ducks/auth'


export class VerifyEmail extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentWillMount() {
    const { verifyEmail, match, authenticated, redirectLocation, setRedirect } = this.props
    if (!redirectLocation) {
      setRedirect({ pathname: '/' })
    }
    if (authenticated) {
      this.setState({ preauthed: true })
    } else {
      verifyEmail(match.params.token)
        .catch(error => this.setState({ error: error.errors._error }))  // eslint-disable-line no-underscore-dangle, max-len
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timeoutId)
  }

  redirect = () => {
    const { history, redirectLocation, setRedirect } = this.props
    history.push(redirectLocation)
    setRedirect(undefined)
  }

  render() {
    const { authenticated } = this.props
    const { preauthed, error } = this.state

    if (preauthed) {
      return (
        <div>
          <p>Your email has already been verified.</p>
        </div>
      )
    }

    if (authenticated) {
      this.timeoutId = setTimeout(this.redirect, 5000)
      return (
        <div>
          <p>Success! Redirecting in five....</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="alert alert-danger">
          <strong>Error:&nbsp;</strong>
          <span>{error}</span>
        </div>
      )
    }

    return (
      <div>
        <p>Verifying your email....</p>
      </div>
    )
  }
}

export default connect(
  state => ({
    authenticated: state.auth.authenticated,
    redirectLocation: state.auth.redirectLocation,
  }),
  authActions,
  (...props) =>
    Object.assign({}, ...props),
)(VerifyEmail)
