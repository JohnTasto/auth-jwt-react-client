import React, { Component } from 'react'
import { connect } from 'react-redux'
import { actions as authActions } from '../../ducks/auth'

export class SignOut extends Component {
  componentWillMount() {
    this.props.signOut()
  }

  render() {
    return <div>Sorry to see you go...</div>
  }
}

const mergeProps = (...props) =>
  Object.assign({}, ...props)

export default connect(null, authActions, mergeProps)(SignOut)
