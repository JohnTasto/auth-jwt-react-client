import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { actions as authActions } from '../ducks/auth'


export class Header extends Component {
  renderLinks() {
    if (this.props.authenticated) {
      return (
        <li className="nav-item">
          <Link className="nav-link" to="/" onClick={this.props.signOut}>Sign Out</Link>
        </li>
      )
    } else {  // eslint-disable-line no-else-return
      return ([
        <li className="nav-item" key={1}>
          <Link className="nav-link" to="/signin">Sign In</Link>
        </li>,
        <li className="nav-item" key={2}>
          <Link className="nav-link" to="/signup">Sign Up</Link>
        </li>,
      ])
    }
  }

  render() {
    return (
      <nav className="navbar navbar-light">
        <Link to="/" className="navbar-brand">Redux Auth</Link>
        <ul className="nav navbar-nav">
          <li className="nav-item">
            <Link className="nav-link" to="/feature">Feature</Link>
          </li>
          {this.renderLinks()}
        </ul>
      </nav>
    )
  }
}

export default connect(
  state => ({
    authenticated: state.auth.authenticated,
  }),
  authActions,
  (...props) =>
    Object.assign({}, ...props),
)(Header)
