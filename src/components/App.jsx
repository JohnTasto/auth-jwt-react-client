import React from 'react'
import { Route } from 'react-router-dom'

import Header from './Header'
import SignUp from './auth/SignUp'
import SignIn from './auth/SignIn'
import SignOut from './auth/SignOut'
import VerifyEmail from './auth/VerifyEmail'
import Feature from './Feature'
import PrivateRoute from './auth/PrivateRoute'
import Welcome from './Welcome'

export default function App() {
  return (
    <div>
      <Header />
      <Route path="/" exact component={Welcome} />
      <Route path="/signin" component={SignIn} />
      <Route path="/signout" component={SignOut} />
      <Route path="/signup" component={SignUp} />
      <Route path="/verifyemail/:token" component={VerifyEmail} />
      <PrivateRoute path="/feature" component={Feature} signInPath="/signin" />
    </div>
  )
}
