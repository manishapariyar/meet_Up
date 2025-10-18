import React from 'react'
import { Route, Routes } from 'react-router-dom'
import SignUp from '../Pages/Login/SignUp'

const RoutesApp = () => {
  return (
    <Routes>
      <Route path="/" element=
        {<SignUp />} />
    </Routes>
  )
}

export default RoutesApp