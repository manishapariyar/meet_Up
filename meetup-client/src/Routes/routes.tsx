
import { Route, Routes } from 'react-router-dom'
import Home from '../Pages/Home/Home'
import SignUp from '../Pages/Login/SignUp'

const RoutesApp = () => {
  return (
    <Routes>
      <Route path="/" element=
        {<Home />} />
      <Route path="/sign-up" element=
        {<SignUp />} />
    </Routes>
  )
}

export default RoutesApp