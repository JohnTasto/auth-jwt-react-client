import React, { Component } from 'react'
import { reduxForm } from 'redux-form'
import { v4 } from 'uuid'
import * as actions from '../../actions'

const emailID = v4()
const passwordID = v4()

class Signin extends Component {
  constructor(...args) {
    super(...args)

    this.handleFormSubmit = this.handleFormSubmit.bind(this)
  }

  handleFormSubmit({ email, password }) {
    // Need to do something to log user in
    this.props.signinUser({ email, password })
  }

  renderAlert() {
    if (this.props.errorMessage) {
      return (
        <div className="alert alert-danger">
          <strong>Oops!</strong> {this.props.errorMessage}
        </div>
      )
    }
    return <div />
  }

  render() {
    const { handleSubmit, fields: { email, password } } = this.props

    return (
      <form onSubmit={handleSubmit(this.handleFormSubmit)}>
        <fieldset className="form-group">
          <label htmlFor={emailID}>Email:</label>
          <input id={emailID} {...email} className="form-control" />
        </fieldset>
        <fieldset className="form-group">
          <label htmlFor={passwordID}>Password:</label>
          <input id={passwordID} {...password} type="password" className="form-control" />
        </fieldset>
        {this.renderAlert()}
        <button action="submit" className="btn btn-primary">Sign in</button>
      </form>
    )
  }
}

function mapStateToProps(state) {
  return { errorMessage: state.auth.error }
}

export default reduxForm({
  form: 'signin',
  fields: ['email', 'password'],
}, mapStateToProps, actions)(Signin)
