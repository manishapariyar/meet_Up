
import { Route, Routes } from 'react-router-dom'
import Home from '../Pages/Home/Home'
import SignUp from '../Pages/Login/SignUp'
import { useAuthContext } from '../context/AuthContext';
import Dashboard from '../Pages/Dashboard/Dashboard';

const RoutesApp = () => {
  const { isSignIn, user, setIsSignIn } = useAuthContext();

  return (
    <Routes>
      <Route path="/" element=
        {<Home />} />
      <Route path="/sign-up" element=
        {<SignUp />} />
      {user ? <Route path="/dashboard" element={<Dashboard />} /> : null}
    </Routes>
  )
}

export default RoutesApp