import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form'
import { v4 } from 'uuid'
import { actions as authActions } from '../../ducks/auth'
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
    const { location, redirectLocation, setRedirect } = this.props
    if (!redirectLocation) {
      if (location.state && location.state.from) {
        setRedirect(location.state.from)
      } else {
        setRedirect({ pathname: '/' })
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    const { authenticated, submitSucceeded, history, redirectLocation } = nextProps
    if (submitSucceeded && authenticated && redirectLocation) {
      history.replace(redirectLocation)
      this.props.setRedirect(undefined)
    }
  }

  renderAlert() {
    if (this.props.error) {
      return (
        <div className="alert alert-danger">
          <strong>Error:</strong> {this.props.error}
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
          <button onClick={this.props.signOut}>Sign Out</button>
        </div>
      )
    }

    return (
      <form onSubmit={handleSubmit(this.props.signIn)}>
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
  authActions,
  (...props) =>
    Object.assign({}, ...props),
)(reduxForm({
  form: 'signIn',
})(SignIn))
