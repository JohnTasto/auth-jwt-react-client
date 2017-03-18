import React from 'react'
import { Route } from 'react-router-dom'

import Header from './Header'
import Signin from './auth/SignIn'
import Signout from './auth/SignOut'
import Signup from './auth/SignUp'
import Feature from './Feature'
import RequireAuth from './auth/requireAuth'
import Welcome from './Welcome'

export default function App() {
  return (
    <div>
      <Header />
      <Route path="/" exact component={Welcome} />
      <Route path="/signin" component={Signin} />
      <Route path="/signout" component={Signout} />
      <Route path="/signup" component={Signup} />
      <Route path="/feature" component={RequireAuth('/signin')(Feature)} />
    </div>
  )
}
