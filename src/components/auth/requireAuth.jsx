import React, { Component } from 'react'
import { browserHistory as history } from 'react-router'
import { connect } from 'react-redux'

export function requireAuth(path) {
  return ComposedComponent =>

    class extends Component {

      componentWillMount() {
        if (!this.props.authenticated) history.push(path)
      }

      componentWillUpdate(nextProps) {
        if (!nextProps.authenticated) history.push(path)
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

  return connect(mapStateToProps)(requireAuth(path)(ComposedComponent))
}
