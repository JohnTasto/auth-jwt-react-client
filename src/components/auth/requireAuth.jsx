import React, { Component } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'

export function requireAuth(path) {
  return ComposedComponent =>

    class extends Component {

      componentWillMount() {
        if (!this.props.authenticated) this.props.push(path)
      }

      componentWillUpdate(nextProps) {
        if (!nextProps.authenticated) this.props.push(path)
      }

      render() {
        return <ComposedComponent {...this.props} />
      }
    }
}


export default path => ComposedComponent => {
  function mapStateToProps(state) {
    return { authenticated: state.auth.authenticated }
  }

  return connect(mapStateToProps, push)(requireAuth(path)(ComposedComponent))
}
