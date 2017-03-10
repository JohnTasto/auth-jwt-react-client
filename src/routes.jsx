import React from 'react'
import { Route, IndexRoute } from 'react-router'

import App from './components/App'
import Signin from './components/auth/SignIn'
import Signout from './components/auth/SignOut'
import Signup from './components/auth/SignUp'
import Feature from './components/Feature'
import RequireAuth from './components/auth/requireAuth'
import Welcome from './components/Welcome'

export default (
  <Route path="/" component={App}>
    <IndexRoute component={Welcome} />
    <Route path="signin" component={Signin} />
    <Route path="signout" component={Signout} />
    <Route path="signup" component={Signup} />
    <Route path="feature" component={RequireAuth('/signin')(Feature)} />
  </Route>
)
