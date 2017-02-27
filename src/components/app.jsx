import React from 'react'

import Header from './header'

export default function App({ children }) {
  return (
    <div>
      <Header />
      {children}
    </div>
  )
}
