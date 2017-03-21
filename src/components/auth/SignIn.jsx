import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form'
import { v4 } from 'uuid'
import * as actions from '../../ducks/auth'
import { requiredValidator, emailValidator } from '../../helpers/validators'

const renderField = ({ input, label, type, meta: { touched, error } }) => {
  const id = v4()
  return (
    <fieldset className="form-group">
      <label htmlFor={id}>{label}</label>
      <div>
        <input id={id} {...input} placeholder={label} type={type} className="form-control" />
        {touched && error && <span className="error">{error}</span>}
      </div>
    </fieldset>
  )
}

export class SignIn extends Component {
  componentWillMount() {
    const { location, redirectLocation, setAuthRedirect } = this.props
    if (!redirectLocation) {
      if (location.state && location.state.from) {
        setAuthRedirect(location.state.from)
      } else {
        setAuthRedirect({ pathname: '/' })
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    const { authenticated, submitSucceeded, history, redirectLocation } = nextProps
    if (submitSucceeded && authenticated && redirectLocation) {
      history.push(redirectLocation)
      this.props.setAuthRedirect(undefined)
    }
  }

  renderAlert() {
    if (this.props.errorMessage) {
      return (
        <div className="alert alert-danger">
          <strong>Error:</strong> {this.props.errorMessage}
        </div>
      )
    }
    return ''
  }

  render() {
    const { authenticated, handleSubmit, invalid, submitting } = this.props

    if (authenticated) {
      return (
        <div>
          <p>You are already signed in.</p>
          <button onClick={this.props.signOutUser}>Sign Out</button>
        </div>
      )
    }

    return (
      <form onSubmit={handleSubmit(this.props.signInUser)}>
        <Field
          name="email"
          type="email"
          component={renderField}
          label="Email"
          validate={[requiredValidator, emailValidator]}
        />
        <Field
          name="password"
          type="password"
          component={renderField}
          label="Password"
          validate={requiredValidator}
        />
        {this.renderAlert()}
        <button action="submit" className="btn btn-primary" disabled={invalid || submitting}>
          Sign in
        </button>
      </form>
    )
  }
}

export default connect(
  state => ({
    authenticated: state.auth.authenticated,
    errorMessage: state.auth.error,
    redirectLocation: state.auth.redirectLocation,
  }),
  actions,
  (...props) =>
    Object.assign({}, ...props),
)(reduxForm({
  form: 'signIn',
})(SignIn))
