import React, { Component } from 'react'
import { connect } from 'react-redux'
import { actions as authActions } from '../ducks/auth'

export class Feature extends Component {
  componentWillMount() {
    this.props.fetchMessage()
  }

  render() {
    return (
      <div>{this.props.message}</div>
    )
  }
}

function mapStateToProps(state) {
  return { message: state.auth.message }
}

export default connect(mapStateToProps, authActions)(Feature)
