import React, { Component } from 'react'
import { connect } from 'react-redux'
import { actions as errorActions } from '../ducks/error'


export class Alert extends Component {
  render() {
    if (this.props.error) {
      return (
        <div className="alert alert-danger alert-dismissible" role="alert">
          <button type="button" className="close" aria-label="Close" onClick={this.props.clear}>
            <span aria-hidden="true">&times;</span>
          </button>
          <strong>Error:</strong> <span>{this.props.error}</span>
        </div>
      )
    }
    return null
  }
}

export default connect(
  state => ({
    error: state.error,
  }),
  errorActions,
  (...props) =>
    Object.assign({}, ...props),
)(Alert)
