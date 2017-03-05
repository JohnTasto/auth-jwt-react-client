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
        {touched && error && <span>{error}</span>}
      </div>
    </fieldset>
  )
}

class SignIn extends Component {
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
    const { handleSubmit, invalid, submitting } = this.props

    return (
      <form onSubmit={handleSubmit(this.props.signinUser)}>
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
    errorMessage: state.auth.error,
  }),
  actions,
)(reduxForm({
  form: 'signin',
})(SignIn))
