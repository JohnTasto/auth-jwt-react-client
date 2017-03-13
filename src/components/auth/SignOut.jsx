import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as actions from '../../ducks/auth'

export class SignOut extends Component {
  componentWillMount() {
    this.props.signoutUser()
  }

  render() {
    return <div>Sorry to see you go...</div>
  }
}

const mergeProps = (...props) =>
  Object.assign({}, ...props)

export default connect(null, actions, mergeProps)(SignOut)
