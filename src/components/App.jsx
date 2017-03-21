import React from 'react'
import { Route } from 'react-router-dom'

import Header from './Header'
import Signin from './auth/SignIn'
import Signout from './auth/SignOut'
import Signup from './auth/SignUp'
import Feature from './Feature'
import PrivateRoute from './auth/PrivateRoute'
import Welcome from './Welcome'

export default function App() {
  return (
    <div>
      <Header />
      <Route path="/" exact component={Welcome} />
      <Route path="/signin" component={Signin} />
      <Route path="/signout" component={Signout} />
      <Route path="/signup" component={Signup} />
      <PrivateRoute path="/feature" component={Feature} signInPath="/signin" />
    </div>
  )
}
